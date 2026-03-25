/**
 * Base interface for boolean feature flags
 */
export interface BooleanSetting {
  isUse: boolean;
}

/**
 * Chat display settings
 */
export interface ChatSettings {
  divider: boolean;
  chatSetting: boolean;
  chatTwoLine: boolean;
  subscribeBadge: boolean;
  topFanBadge: boolean;
  fanBadge: boolean;
  supportBadge: boolean;
}

/**
 * Default values for chat settings
 */
export const defaultChatSettings: ChatSettings = {
  divider: false,
  chatSetting: false,
  chatTwoLine: false,
  subscribeBadge: false,
  topFanBadge: false,
  fanBadge: false,
  supportBadge: false,
};

/**
 * Filter types for collector (user grade filters)
 */
export interface FilterTypes {
  streamer: boolean;
  manager: boolean;
  topfan: boolean;
  gudok: boolean;
  fan: boolean;
  user: boolean;
}

/**
 * Default values for filter types
 */
export const defaultFilterTypes: FilterTypes = {
  streamer: true,
  manager: true,
  topfan: false,
  gudok: false,
  fan: false,
  user: false,
};

/**
 * Collector settings
 */
export interface CollectorSettings {
  isEnabled: boolean;
  highlight: boolean;
  filters: FilterTypes;
}

/**
 * Default values for collector settings
 */
export const defaultCollectorSettings: CollectorSettings = {
  isEnabled: false,
  highlight: true,
  filters: defaultFilterTypes,
};
