import { getCollectorChangeFlag } from './collectorSwap';
import { domCache } from '../core/domCache';
import { LAYOUT, DEFAULTS, CSS_CLASSES } from '../core/constants';

// State
let containerRatio = DEFAULTS.CONTAINER_RATIO;
let position: string = DEFAULTS.POSITION;
let rafId: number | null = null;

// Cached storage values (to avoid repeated reads)
let cachedRatio: number | null = null;
let cachedPosition: string | null = null;

/**
 * Get container ratio
 */
export function getContainerRatio(): number {
  return containerRatio;
}

/**
 * Get position
 */
export function getPosition(): string {
  return position;
}

/**
 * Load ratio and position from storage (single read)
 */
async function loadStoredValues(): Promise<{ ratio: number; position: string }> {
  if (cachedRatio !== null && cachedPosition !== null) {
    return { ratio: cachedRatio, position: cachedPosition };
  }

  const result = await chrome.storage.local.get(['containerRatio', 'position']);
  cachedRatio = result.containerRatio ?? DEFAULTS.CONTAINER_RATIO;
  cachedPosition = result.position ?? DEFAULTS.POSITION;

  return { ratio: cachedRatio, position: cachedPosition };
}

/**
 * Invalidate cache when storage changes
 */
export function invalidateStorageCache(): void {
  cachedRatio = null;
  cachedPosition = null;
}

/**
 * Setup resize handlers on a handle container
 */
export function setupResizeHandlers(
  handleContainer: HTMLElement,
  filterArea: HTMLDivElement
): void {
  const startDragHandler = (e: MouseEvent | TouchEvent) => startDrag(e, filterArea);

  handleContainer.addEventListener('mousedown', startDragHandler);
  handleContainer.addEventListener('touchstart', startDragHandler, { passive: false });

  // Double-click to reset to default ratio
  handleContainer.addEventListener('dblclick', () => {
    containerRatio = DEFAULTS.CONTAINER_RATIO;
    position = DEFAULTS.POSITION;
    cachedRatio = containerRatio;
    cachedPosition = position;
    updateContainerRatio(containerRatio, position);
    chrome.storage.local.set({ containerRatio, position });
  });
}

/**
 * Get position from container style
 */
function getPositionFromStyle(container: HTMLElement): string {
  return container.style.order === '1' ? 'up' : 'down';
}

/**
 * Start drag operation
 */
function startDrag(e: MouseEvent | TouchEvent, filterArea: HTMLDivElement): void {
  e.preventDefault();

  if (!filterArea) return;

  const liveArea = domCache.liveArea;
  const handle = domCache.handleContainer;

  // Disable transition during drag
  if (filterArea) filterArea.style.transition = 'none';
  if (liveArea) liveArea.style.transition = 'none';

  // Visual feedback for dragging
  handle?.classList.add(CSS_CLASSES.IS_DRAGGING);
  document.body.classList.add(CSS_CLASSES.DRAGGING);

  const collectorChangeFlag = getCollectorChangeFlag();

  if (!collectorChangeFlag) {
    filterArea.classList.add(CSS_CLASSES.FREEZE);
    position = getPositionFromStyle(filterArea);
  } else if (liveArea) {
    liveArea.classList.add(CSS_CLASSES.FREEZE);
    position = getPositionFromStyle(liveArea);
  }

  const doDrag = (e: MouseEvent | TouchEvent) => {
    // Detect if mouseup was missed
    if (e instanceof MouseEvent && e.buttons === 0) {
      endDrag();
      return;
    }

    // Cancel previous RAF if pending
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }

    // Use RAF for smooth rendering
    rafId = requestAnimationFrame(() => {
      const container = domCache.container;
      if (!container) return;

      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const rect = container.getBoundingClientRect();
      const rectHeight = rect.height - LAYOUT.DRAG_TOP_OFFSET - LAYOUT.DRAG_BOTTOM_OFFSET;

      containerRatio = (1 - (clientY - rect.y - LAYOUT.DRAG_TOP_OFFSET) / rectHeight) * 100;
      containerRatio = Math.max(0, Math.min(100, Math.round(containerRatio)));
      updateContainerRatio(containerRatio, position);
    });
  };

  const endDrag = () => {
    // Cancel pending RAF
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    const collectorChangeFlag = getCollectorChangeFlag();
    const liveArea = domCache.liveArea;
    const handle = domCache.handleContainer;

    if (!collectorChangeFlag) {
      filterArea.classList.remove(CSS_CLASSES.FREEZE);
    } else if (liveArea) {
      liveArea.classList.remove(CSS_CLASSES.FREEZE);
    }

    // Remove visual feedback
    handle?.classList.remove(CSS_CLASSES.IS_DRAGGING);
    document.body.classList.remove(CSS_CLASSES.DRAGGING);

    // Restore transition
    if (filterArea) filterArea.style.transition = '';
    if (liveArea) liveArea.style.transition = '';

    // Update cache and save
    cachedRatio = containerRatio;
    cachedPosition = position;
    chrome.storage.local.set({ containerRatio, position });

    window.removeEventListener('mousemove', doDrag);
    window.removeEventListener('touchmove', doDrag);
    window.removeEventListener('mouseup', endDrag, true);
    window.removeEventListener('touchend', endDrag, true);
  };

  window.addEventListener('mousemove', doDrag);
  window.addEventListener('touchmove', doDrag, { passive: false });
  window.addEventListener('mouseup', endDrag, true);
  window.addEventListener('touchend', endDrag, true);
}

/**
 * Apply height to areas (extracted to avoid duplication)
 */
function applyHeights(
  primary: HTMLElement,
  secondary: HTMLElement,
  primarySize: number,
  secondarySize: number
): void {
  primary.style.height = `${primarySize * 100}%`;
  secondary.style.height = `${secondarySize * 100}%`;

  // Manage snap state classes
  primary.classList.toggle(CSS_CLASSES.SNAPPED_HIDDEN, primarySize === 0);
  secondary.classList.toggle(CSS_CLASSES.SNAPPED_HIDDEN, secondarySize === 0);
}

/**
 * Update container ratio
 */
export function updateContainerRatio(ratio: number, pos: string): void {
  // ratio가 null/undefined일 때만 기본값 적용 (0은 유효한 값)
  if (ratio === null || ratio === undefined) {
    ratio = DEFAULTS.CONTAINER_RATIO;
  }

  let origSize: number;
  let cloneSize: number;

  if (ratio === 0) {
    // 맨 아래: 필터 영역 숨김
    origSize = 1;
    cloneSize = 0;
  } else if (ratio === 100) {
    // 맨 위: 라이브 영역 숨김
    origSize = 0;
    cloneSize = 1;
  } else if (ratio >= 1 && ratio < 100) {
    cloneSize = parseFloat((ratio * 0.01).toFixed(2));
    origSize = parseFloat((1 - cloneSize).toFixed(2));
  } else {
    // 유효하지 않은 값: 기본값 적용
    ratio = DEFAULTS.CONTAINER_RATIO;
    cloneSize = parseFloat((ratio * 0.01).toFixed(2));
    origSize = parseFloat((1 - cloneSize).toFixed(2));
  }

  if (pos === 'down') {
    [origSize, cloneSize] = [cloneSize, origSize];
  }

  const liveArea = domCache.liveArea;
  const filterArea = domCache.filterArea;

  if (!liveArea || !filterArea) return;

  const collectorChangeFlag = getCollectorChangeFlag();

  if (!collectorChangeFlag) {
    applyHeights(liveArea, filterArea, origSize, cloneSize);
  } else {
    applyHeights(filterArea, liveArea, origSize, cloneSize);
  }
}

/**
 * Divide container - show filter area and handle (lazy initialization)
 */
export async function divideContainer(filterArea: HTMLElement): Promise<void> {
  const container = domCache.container;
  const handler = domCache.handleContainer;
  const liveArea = domCache.liveArea;

  if (!container) return;

  container.style.position = 'absolute';
  filterArea.style.removeProperty('display');

  if (handler) {
    handler.style.removeProperty('display');
  }

  if (liveArea) {
    liveArea.style.position = 'relative';
    liveArea.style.top = '0px';
  }

  // Load stored values (uses cache if available)
  const { ratio, position: pos } = await loadStoredValues();
  containerRatio = ratio;
  position = pos;
  updateContainerRatio(ratio, pos);
}

/**
 * Restore container - hide filter area and handle
 */
export function restoreContainer(): void {
  const container = domCache.container;
  const filterArea = domCache.filterArea;
  const handler = domCache.handleContainer;
  const liveArea = domCache.liveArea;

  if (!container) return;

  container.style.removeProperty('position');

  if (filterArea) {
    filterArea.style.display = 'none';
  }

  if (handler) {
    handler.style.display = 'none';
  }

  if (liveArea) {
    liveArea.style.removeProperty('position');
    liveArea.style.removeProperty('height');
    liveArea.style.removeProperty('top');
  }
}
