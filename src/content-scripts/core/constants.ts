/**
 * Content script constants
 */

// Layout offsets (SOOP site specific)
export const LAYOUT = {
  AREA_HEADER_OFFSET: 20,
  DRAG_TOP_OFFSET: 77,
  DRAG_BOTTOM_OFFSET: 62,
} as const;

// Default values (10만 동접 대응)
export const DEFAULTS = {
  CONTAINER_RATIO: 30,
  POSITION: 'up',
  MAX_FILTERED_CHATS: 200, // 메모리 절약 (300 → 200)
  FLUSH_INTERVAL: 300, // DOM 업데이트 간격 증가 (200ms → 300ms)
  SCROLL_THRESHOLD: 100,
} as const;

// DOM IDs
export const DOM_IDS = {
  CHAT_CONTAINER: 'afreeca-chat-list-container',
  HANDLE_CONTAINER: 'handle-container',
  RESIZE_HANDLE: 'tbc-resize-handle',
  CHATBOX: 'chatbox',
  CHAT_AREA: 'chat_area',
  ACTION_BOX: 'actionbox',
  LIVE_PLAYER: 'livePlayer',
} as const;

// CSS Classes
export const CSS_CLASSES = {
  LIVE_AREA: 'live-area',
  FILTER_AREA: 'filter-area',
  HIGHLIGHT: 'tbc-highlight',
  FREEZE: 'freeze',
  DRAGGING: 'dragging',
  IS_DRAGGING: 'is-dragging',
  SNAPPED_HIDDEN: 'snapped-hidden',
  GRIP_DOTS: 'grip-dots',
  GRIP_DOT: 'grip-dot',
} as const;
