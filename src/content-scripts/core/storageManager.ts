import { User, ToggleData, BooleanSetting } from './types';

/**
 * Storage manager for content scripts
 * Handles all chrome.storage.local operations
 */
export class StorageManager {
  private nicks: User[] = [];
  private ids: User[] = [];
  private nicksMap: Map<string, boolean> = new Map();
  private idsSet: Set<string> = new Set();
  private toggle: ToggleData = {
    streamer: false,
    manager: false,
    topfan: false,
    gudok: false,
    fan: false,
    user: false,
  };
  private collector: BooleanSetting = { isUse: false };
  private chatSetting: BooleanSetting = { isUse: false };
  private chatTwoLine: BooleanSetting = { isUse: false };
  private subscribeBadge: BooleanSetting = { isUse: false };
  private topFanBadge: BooleanSetting = { isUse: false };
  private fanBadge: BooleanSetting = { isUse: false };
  private supportBadge: BooleanSetting = { isUse: false };
  private divider: BooleanSetting = { isUse: false };
  private highlight: BooleanSetting = { isUse: true };

  async initialize(): Promise<void> {
    await Promise.all([
      this.updateNickname(),
      this.updateId(),
      this.updateToggle(),
      this.updateCollector(),
      this.updateChatSetting(),
      this.updateChatTwoLine(),
      this.updateBadges(),
      this.updateDivider(),
      this.updateHighlight(),
    ]);
  }

  async updateNickname(): Promise<void> {
    const res = await chrome.storage.local.get('nicks');
    if (res.nicks) {
      this.nicks = res.nicks;
      this.nicksMap = new Map(this.nicks.map(user => [user.user, user.isNickname]));
    } else {
      this.nicks = [];
      this.nicksMap = new Map();
    }
  }

  async updateId(): Promise<void> {
    const res = await chrome.storage.local.get('ids');
    if (res.ids) {
      this.ids = res.ids;
      this.idsSet = new Set(this.ids.filter(user => !user.isNickname).map(user => user.user));
    } else {
      this.ids = [];
      this.idsSet = new Set();
    }
  }

  async updateToggle(): Promise<void> {
    const res = await chrome.storage.local.get('toggle');
    if (res.toggle) {
      this.toggle = res.toggle;
    }
  }

  // 직접 토글 설정 (storage change에서 사용)
  setToggle(toggle: ToggleData): void {
    this.toggle = toggle;
  }

  async updateCollector(): Promise<void> {
    const res = await chrome.storage.local.get('collector');
    if (res.collector) {
      this.collector = res.collector;
    }
  }

  async updateChatSetting(): Promise<void> {
    const res = await chrome.storage.local.get('chatSetting');
    if (res.chatSetting) {
      this.chatSetting = res.chatSetting;
    }
  }

  async updateChatTwoLine(): Promise<void> {
    const res = await chrome.storage.local.get('chatTwoLine');
    if (res.chatTwoLine) {
      this.chatTwoLine = res.chatTwoLine;
    }
  }

  async updateBadges(): Promise<void> {
    const res = await chrome.storage.local.get([
      'subscribeBadge',
      'topFanBadge',
      'fanBadge',
      'supportBadge',
    ]);
    if (res.subscribeBadge) this.subscribeBadge = res.subscribeBadge;
    if (res.topFanBadge) this.topFanBadge = res.topFanBadge;
    if (res.fanBadge) this.fanBadge = res.fanBadge;
    if (res.supportBadge) this.supportBadge = res.supportBadge;
  }

  async updateDivider(): Promise<void> {
    const res = await chrome.storage.local.get('divider');
    if (res.divider) {
      this.divider = res.divider;
    }
  }

  async updateHighlight(): Promise<void> {
    const res = await chrome.storage.local.get('highlight');
    if (res.highlight) {
      this.highlight = res.highlight;
    }
  }

  async updateAll(): Promise<void> {
    await this.initialize();
  }

  // Getters
  getNicks(): User[] {
    return this.nicks;
  }

  getIds(): User[] {
    return this.ids;
  }

  getNicksMap(): Map<string, boolean> {
    return this.nicksMap;
  }

  getIdsSet(): Set<string> {
    return this.idsSet;
  }

  getToggle(): ToggleData {
    return this.toggle;
  }

  getCollector(): BooleanSetting {
    return this.collector;
  }

  getChatSetting(): BooleanSetting {
    return this.chatSetting;
  }

  getChatTwoLine(): BooleanSetting {
    return this.chatTwoLine;
  }

  getSubscribeBadge(): BooleanSetting {
    return this.subscribeBadge;
  }

  getTopFanBadge(): BooleanSetting {
    return this.topFanBadge;
  }

  getFanBadge(): BooleanSetting {
    return this.fanBadge;
  }

  getSupportBadge(): BooleanSetting {
    return this.supportBadge;
  }

  getDivider(): BooleanSetting {
    return this.divider;
  }

  getHighlight(): BooleanSetting {
    return this.highlight;
  }
}

export const storageManager = new StorageManager();
