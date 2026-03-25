/**
 * VOD Chat Content Script
 * Handles chat filtering and collection for VOD playback
 */
import '../chat.css';
import {
  storageManager,
  filterVodChat,
  extractVodChatUserInfo,
  updateBadgeClasses,
  updateChatDisplayMode,
  createResizeHandle,
  createBatchedObserver,
  domCache,
  LAYOUT,
  DEFAULTS,
  CSS_CLASSES,
} from './core';
import {
  injectVodCaptureButton,
  injectVodCollectorSwapButton,
  setupResizeHandlers,
  divideContainer,
  restoreContainer,
  invalidateStorageCache,
} from './ui';

// VOD specific DOM IDs
const VOD_DOM_IDS = {
  CHATBOX_HEIGHT: 'chatbox_height',
  CHAT_AREA: 'chatArea',
  CHATTING_AREA: 'chatting_area',
};

// State
let filterArea: HTMLDivElement | null = null;
let isUserScrolling = false;
let isCollectorInitialized = false;

/**
 * Create filter area lazily
 */
function createFilterArea(chatArea: HTMLElement): HTMLDivElement {
  const area = chatArea.cloneNode() as HTMLDivElement;
  area.id = 'filterChatArea';
  area.classList.add(CSS_CLASSES.FILTER_AREA);
  area.style.display = 'none';
  area.style.height = `${DEFAULTS.CONTAINER_RATIO}%`;
  area.style.top = '0px';
  area.style.position = 'relative';

  return area;
}

/**
 * Initialize collector container (lazy)
 */
function initCollectorContainer(): void {
  if (isCollectorInitialized) return;

  const chatBox = document.getElementById(VOD_DOM_IDS.CHATBOX_HEIGHT);
  const areaHeader = document.querySelector('.area_header') as HTMLElement;
  const chatArea = document.getElementById(VOD_DOM_IDS.CHAT_AREA);

  if (!chatBox || !chatArea || !areaHeader) return;

  // Create filter area
  filterArea = createFilterArea(chatArea);

  // Calculate height
  const height = chatBox.clientHeight - areaHeader.clientHeight - LAYOUT.AREA_HEADER_OFFSET;

  // Create container
  const container = document.createElement('div');
  container.id = 'afreeca-chat-list-container';
  container.style.width = '100%';
  container.style.height = `${height}px`;
  container.style.willChange = 'scroll-position';

  // Add live-area class
  chatArea.classList.add(CSS_CLASSES.LIVE_AREA);

  // Create resize handle
  const handleContainer = createResizeHandle();
  handleContainer.style.position = 'relative';
  setupResizeHandlers(handleContainer, filterArea);

  // Assemble
  const parentChat = chatArea.parentNode as Element;
  container.appendChild(filterArea);
  container.appendChild(handleContainer);
  container.appendChild(chatArea);
  parentChat.appendChild(container);

  // Update cache
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

  // Initialize if needed
  if (collector.isUse && !isCollectorInitialized) {
    initCollectorContainer();
  }

  // Update display mode
  if (isCollectorInitialized) {
    updateChatDisplayMode(chatSetting.isUse, chatTwoLine.isUse);
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
 * Create resize observer for chatting area
 */
function createChattingAreaResizeObserver(): ResizeObserver {
  let previousHeight: number | null = null;

  return new ResizeObserver((entries) => {
    for (const entry of entries) {
      const currentHeight = entry.contentRect.height;
      const areaHeader = document.querySelector('.area_header') as HTMLElement;

      if (!areaHeader) return;

      const containerHeight = currentHeight - areaHeader.clientHeight - LAYOUT.AREA_HEADER_OFFSET;

      if (previousHeight === containerHeight) return;
      previousHeight = containerHeight;

      const container = domCache.container;
      const filterAreaEl = domCache.filterArea;
      const liveArea = domCache.liveArea;

      if (!container || !filterAreaEl || !liveArea) return;

      container.style.height = `${containerHeight}px`;

      const collector = storageManager.getCollector();
      if (collector?.isUse && filterArea) {
        divideContainer(filterArea);
        const heightNum = parseFloat(filterAreaEl.style.height) || DEFAULTS.CONTAINER_RATIO;
        liveArea.style.height = `${100 - heightNum}%`;
      } else {
        restoreContainer();
      }
    }
  });
}

/**
 * Main initialization (delayed for VOD page load)
 */
setTimeout(async () => {
  const chatArea = document.getElementById(VOD_DOM_IDS.CHAT_AREA);
  if (!chatArea) return;

  // Initialize storage manager
  await storageManager.initialize();

  // Initialize DOM cache
  domCache.init();

  // Check if collector is enabled
  const collector = storageManager.getCollector();

  if (collector.isUse) {
    initCollectorContainer();
  }

  // Apply initial settings
  await updateSettings();

  // Inject UI elements
  injectVodCaptureButton();
  injectVodCollectorSwapButton();

  // Create mutation observer
  if (isCollectorInitialized && filterArea) {
    const observer = createBatchedObserver({
      filterArea,
      filterFn: filterVodChat,
      extractUserInfo: extractVodChatUserInfo,
      isUserScrolling: () => isUserScrolling,
    });

    observer.observe(chatArea, { childList: true, subtree: true });
  }

  // Setup resize observer
  const chattingArea = document.getElementById(VOD_DOM_IDS.CHATTING_AREA);
  if (chattingArea) {
    createChattingAreaResizeObserver().observe(chattingArea);
  }
}, 600);

// Listen for storage changes
chrome.storage.local.onChanged.addListener(async (changes) => {
  if (changes.containerRatio || changes.position) {
    invalidateStorageCache();
  }

  // 토글 변경 시 즉시 반영 (async 없이 동기적으로)
  if (changes.toggle?.newValue) {
    storageManager.setToggle(changes.toggle.newValue);
  }

  // 나머지 설정 업데이트
  await updateSettings();

  const newCollectorState = changes.collector?.newValue?.isUse;

  if (newCollectorState && !isCollectorInitialized) {
    initCollectorContainer();

    const chatArea = document.getElementById(VOD_DOM_IDS.CHAT_AREA);
    if (filterArea && chatArea) {
      const observer = createBatchedObserver({
        filterArea,
        filterFn: filterVodChat,
        extractUserInfo: extractVodChatUserInfo,
        isUserScrolling: () => isUserScrolling,
      });
      observer.observe(chatArea, { childList: true, subtree: true });
    }
  }
});
