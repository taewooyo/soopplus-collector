/**
 * Live Chat Content Script
 * Handles chat filtering and collection for live streams
 */
import '../chat.css';
import {
  storageManager,
  filterLiveChat,
  extractLiveChatUserInfo,
  updateBadgeClasses,
  updateChatDisplayMode,
  createResizeHandle,
  createBatchedObserver,
  domCache,
  LAYOUT,
  DEFAULTS,
  CSS_CLASSES,
  DOM_IDS,
} from './core';
import {
  injectLiveCaptureButton,
  injectLiveCollectorSwapButton,
  setupResizeHandlers,
  divideContainer,
  restoreContainer,
  invalidateStorageCache,
} from './ui';

// State
let filterArea: HTMLDivElement | null = null;
let isUserScrolling = false;
let isCollectorInitialized = false;
let chatObserver: MutationObserver | null = null;

/**
 * Create filter area lazily (only when collector is enabled)
 */
function createFilterArea(chatArea: HTMLElement): HTMLDivElement {
  const area = chatArea.cloneNode() as HTMLDivElement;
  area.removeAttribute('id'); // 중복 id 방지
  area.classList.add(CSS_CLASSES.FILTER_AREA);
  area.style.display = 'none';
  area.style.height = `${DEFAULTS.CONTAINER_RATIO}%`;
  area.style.top = '0px';
  area.style.position = 'relative';

  // Setup scroll handler
  area.addEventListener('scroll', () => {
    isUserScrolling = true;
    if (area.scrollHeight - area.scrollTop - area.clientHeight < DEFAULTS.SCROLL_THRESHOLD) {
      isUserScrolling = false;
    }
  });

  return area;
}

/**
 * Initialize collector container (lazy - only when needed)
 */
function initCollectorContainer(): void {
  if (isCollectorInitialized) return;

  const chatArea = domCache.chatArea;
  const chatBox = domCache.chatbox;
  const actionbox = domCache.actionbox;
  const areaHeader = domCache.areaHeader;

  if (!chatArea || !chatBox || !actionbox || !areaHeader) return;

  // Create filter area
  filterArea = createFilterArea(chatArea);

  // Calculate height
  const height = chatBox.clientHeight - actionbox.clientHeight - areaHeader.clientHeight - LAYOUT.AREA_HEADER_OFFSET;

  // Create container
  const container = document.createElement('div');
  container.id = DOM_IDS.CHAT_CONTAINER;
  container.style.width = '100%';
  container.style.height = `${height}px`;
  container.style.willChange = 'scroll-position';

  // Add live-area class to original chat area
  chatArea.classList.add(CSS_CLASSES.LIVE_AREA);

  // Create resize handle
  const handleContainer = createResizeHandle();
  setupResizeHandlers(handleContainer, filterArea);

  // Get parent and assemble
  const parentChat = chatArea.parentNode as Element;
  container.appendChild(filterArea);
  container.appendChild(handleContainer);
  container.appendChild(chatArea);
  parentChat.appendChild(container);

  // Update cache with new elements
  domCache.refresh();

  isCollectorInitialized = true;
}

/**
 * Update settings and apply visual changes
 */
async function updateSettings(): Promise<void> {
  await storageManager.updateAll();

  const chatSetting = storageManager.getChatSetting();
  const chatTwoLine = storageManager.getChatTwoLine();
  const subscribeBadge = storageManager.getSubscribeBadge();
  const topFanBadge = storageManager.getTopFanBadge();
  const fanBadge = storageManager.getFanBadge();
  const supportBadge = storageManager.getSupportBadge();
  const collector = storageManager.getCollector();

  // Initialize collector container if needed (lazy)
  if (collector.isUse && !isCollectorInitialized) {
    initCollectorContainer();
  }

  // Update display mode (콜렉터 여부와 관계없이 적용)
  updateChatDisplayMode(chatSetting.isUse, chatTwoLine.isUse);

  // Update badge classes (only if initialized)
  if (isCollectorInitialized) {
    updateBadgeClasses(
      subscribeBadge.isUse,
      topFanBadge.isUse,
      fanBadge.isUse,
      supportBadge.isUse
    );
  }

  // Update collector visibility
  if (collector.isUse && filterArea) {
    await divideContainer(filterArea);
  } else if (isCollectorInitialized) {
    restoreContainer();
  }
}

/**
 * Unified resize observer for chatbox and actionbox
 */
function createUnifiedResizeObserver(): ResizeObserver {
  let previousHeight: number | null = null;

  return new ResizeObserver(() => {
    const chatbox = domCache.chatbox;
    const actionbox = domCache.actionbox;
    const areaHeader = domCache.areaHeader;
    const container = domCache.container;
    const liveArea = domCache.liveArea;
    const filterAreaEl = domCache.filterArea;

    if (!chatbox || !actionbox || !areaHeader) return;

    const containerHeight = chatbox.clientHeight - actionbox.clientHeight - areaHeader.clientHeight - LAYOUT.AREA_HEADER_OFFSET;

    // Skip if height hasn't changed
    if (previousHeight === containerHeight) return;
    previousHeight = containerHeight;

    if (!container || !liveArea || !filterAreaEl) return;

    container.style.height = `${containerHeight}px`;

    const collector = storageManager.getCollector();
    if (collector?.isUse && filterArea) {
      divideContainer(filterArea);
      const heightStr = filterAreaEl.style.height;
      const heightNum = parseFloat(heightStr) || DEFAULTS.CONTAINER_RATIO;
      liveArea.style.height = `${100 - heightNum}%`;
    } else {
      restoreContainer();
    }
  });
}

/**
 * Main initialization
 */
window.addEventListener('load', async () => {
  const chatArea = document.getElementById(DOM_IDS.CHAT_AREA);
  if (!chatArea) return;

  // Initialize storage manager
  await storageManager.initialize();

  // Initialize DOM cache
  domCache.init();

  // Check if collector is enabled
  const collector = storageManager.getCollector();

  // Only initialize collector container if enabled
  if (collector.isUse) {
    initCollectorContainer();
  }

  // Apply initial settings
  await updateSettings();

  // Inject UI elements
  injectLiveCaptureButton();
  injectLiveCollectorSwapButton();

  // Create mutation observer (only if collector initialized)
  if (isCollectorInitialized && filterArea && !chatObserver) {
    chatObserver = createBatchedObserver({
      filterArea,
      filterFn: filterLiveChat,
      extractUserInfo: extractLiveChatUserInfo,
      isUserScrolling: () => isUserScrolling,
    });

    chatObserver.observe(chatArea, { childList: true, subtree: true });
  }

  // Setup unified resize observer
  const resizeObserver = createUnifiedResizeObserver();
  const chatbox = domCache.chatbox;
  const actionbox = domCache.actionbox;

  if (chatbox) resizeObserver.observe(chatbox);
  if (actionbox) resizeObserver.observe(actionbox);
});

// Listen for storage changes
chrome.storage.local.onChanged.addListener(async (changes) => {
  // Invalidate storage cache if ratio/position changed
  if (changes.containerRatio || changes.position) {
    invalidateStorageCache();
  }

  // 토글 변경 시 즉시 반영 (async 없이 동기적으로)
  if (changes.toggle?.newValue) {
    storageManager.setToggle(changes.toggle.newValue);
  }

  // 나머지 설정 업데이트
  await storageManager.updateAll();

  // 설정 UI 업데이트
  const chatSetting = storageManager.getChatSetting();
  const chatTwoLine = storageManager.getChatTwoLine();
  const subscribeBadge = storageManager.getSubscribeBadge();
  const topFanBadge = storageManager.getTopFanBadge();
  const fanBadge = storageManager.getFanBadge();
  const supportBadge = storageManager.getSupportBadge();
  const collector = storageManager.getCollector();

  // Check if collector was just enabled
  const newCollectorState = changes.collector?.newValue?.isUse;

  if (newCollectorState && !isCollectorInitialized) {
    initCollectorContainer();

    // Setup observer after initialization
    const chatArea = domCache.chatArea;
    if (filterArea && chatArea && !chatObserver) {
      chatObserver = createBatchedObserver({
        filterArea,
        filterFn: filterLiveChat,
        extractUserInfo: extractLiveChatUserInfo,
        isUserScrolling: () => isUserScrolling,
      });
      chatObserver.observe(chatArea, { childList: true, subtree: true });
    }
  }

  // Update display settings (콜렉터 여부와 관계없이 적용)
  updateChatDisplayMode(chatSetting.isUse, chatTwoLine.isUse);

  // Update badge classes (only if initialized)
  if (isCollectorInitialized) {
    updateBadgeClasses(
      subscribeBadge.isUse,
      topFanBadge.isUse,
      fanBadge.isUse,
      supportBadge.isUse
    );
  }

  // Update collector visibility
  if (collector.isUse && filterArea) {
    await divideContainer(filterArea);
  } else if (isCollectorInitialized) {
    restoreContainer();
  }
});
