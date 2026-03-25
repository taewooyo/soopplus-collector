import { domCache } from './domCache';
import { CSS_CLASSES } from './constants';

/**
 * Trim children from an element using Range API for better performance
 */
export function trimChildren(el: Element, maxCount: number): void {
  const overflow = el.children.length - maxCount;
  if (overflow > 0) {
    const range = document.createRange();
    range.setStartBefore(el.children[0]);
    range.setEndAfter(el.children[overflow - 1]);
    range.deleteContents();
  }
}

/**
 * Update badge visibility classes on chat areas
 */
export function updateBadgeClasses(
  subscribeBadge: boolean,
  topFanBadge: boolean,
  fanBadge: boolean,
  supportBadge: boolean
): void {
  // Use cached elements
  const areas = [domCache.liveArea, domCache.filterArea];

  areas.forEach((area) => {
    if (!area) return;
    area.classList.toggle('hide-subscribe', subscribeBadge);
    area.classList.toggle('hide-topfan', topFanBadge);
    area.classList.toggle('hide-fan', fanBadge);
    area.classList.toggle('hide-support', supportBadge);
  });
}

/**
 * Update chat display mode attribute on areas
 */
export function updateChatDisplayMode(
  chatSetting: boolean,
  chatTwoLine: boolean
): void {
  // Use cached elements or fallback to direct query for chat_area
  const filterArea = domCache.filterArea;
  const liveArea = domCache.liveArea;
  const chatArea = domCache.chatArea || document.getElementById('chat_area');

  // 적용할 영역들 (존재하는 것만)
  const areas: HTMLElement[] = [];
  if (liveArea) areas.push(liveArea);
  if (filterArea) areas.push(filterArea);
  // 콜렉터 미초기화 시 원본 chat_area에 직접 적용
  if (!liveArea && chatArea) areas.push(chatArea);

  for (const area of areas) {
    if (chatTwoLine) {
      area.setAttribute('data-mngr', 'chat_two_line');
    } else if (chatSetting) {
      area.setAttribute('data-mngr', 'chat_sort');
    } else {
      area.removeAttribute('data-mngr');
    }
  }
}

/**
 * Create a resize handle element with grip dots
 */
export function createResizeHandle(): HTMLDivElement {
  const handleContainer = document.createElement('div');
  const resizeHandle = document.createElement('div');

  resizeHandle.id = 'tbc-resize-handle';
  handleContainer.id = 'handle-container';
  handleContainer.appendChild(resizeHandle);
  handleContainer.style.display = 'none';

  // Create grip dots
  const gripDots = document.createElement('div');
  gripDots.className = CSS_CLASSES.GRIP_DOTS;
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('div');
    dot.className = CSS_CLASSES.GRIP_DOT;
    gripDots.appendChild(dot);
  }
  resizeHandle.appendChild(gripDots);

  return handleContainer;
}

/**
 * Scroll to bottom of element if not user scrolling
 */
export function scrollToBottomIfNeeded(
  element: Element,
  isUserScrolling: boolean
): void {
  if (!isUserScrolling && element.lastElementChild) {
    element.lastElementChild.scrollIntoView({
      block: 'end',
      behavior: 'instant',
    });
  }
}
