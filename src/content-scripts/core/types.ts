/**
 * Legacy User type for content scripts (backward compatible with chrome.storage)
 */
export interface User {
  isNickname: boolean;
  user: string;
}

/**
 * Toggle data for filter settings
 */
export interface ToggleData {
  streamer: boolean;
  manager: boolean;
  topfan: boolean;
  gudok: boolean;
  fan: boolean;
  user: boolean;
}

/**
 * Boolean setting wrapper
 */
export interface BooleanSetting {
  isUse: boolean;
}

/**
 * Badge visibility settings
 */
export interface BadgeSettings {
  subscribeBadge: BooleanSetting;
  topFanBadge: BooleanSetting;
  fanBadge: BooleanSetting;
  supportBadge: BooleanSetting;
}

/**
 * Chat display settings
 */
export interface ChatDisplaySettings {
  chatSetting: BooleanSetting;
  chatTwoLine: BooleanSetting;
  divider: BooleanSetting;
}

/**
 * Collector settings
 */
export interface CollectorSettings {
  collector: BooleanSetting;
  highlight: BooleanSetting;
}

/**
 * Content script configuration
 */
export interface ContentScriptConfig {
  observerConfig: MutationObserverInit;
  flushInterval: number;
  maxFilteredChats: number;
}

export const defaultContentScriptConfig: ContentScriptConfig = {
  observerConfig: { childList: true, subtree: true },
  flushInterval: 200,
  maxFilteredChats: 300,
};
