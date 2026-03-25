import { create } from 'zustand';

interface ChatState {
  // State
  divider: boolean;
  chatSetting: boolean;
  chatTwoLine: boolean;
  subscribeBadge: boolean;
  topFanBadge: boolean;
  fanBadge: boolean;
  supportBadge: boolean;

  // Hydration state
  _hasHydrated: boolean;

  // Actions
  toggleDivider: () => void;
  toggleChatSetting: () => void;
  toggleChatTwoLine: () => void;
  toggleSubscribeBadge: () => void;
  toggleTopFanBadge: () => void;
  toggleFanBadge: () => void;
  toggleSupportBadge: () => void;

  // Hydration
  hydrate: () => Promise<void>;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  // Initial state
  divider: false,
  chatSetting: false,
  chatTwoLine: false,
  subscribeBadge: false,
  topFanBadge: false,
  fanBadge: false,
  supportBadge: false,
  _hasHydrated: false,

  // Actions - 기존 형식 그대로 저장 { isUse: boolean }
  toggleDivider: () => {
    const newValue = !get().divider;
    chrome.storage.local.set({ divider: { isUse: newValue } });
    set({ divider: newValue });
  },

  toggleChatSetting: () => {
    const newValue = !get().chatSetting;
    const updates: Partial<ChatState> = { chatSetting: newValue };

    // chatTwoLine과 상호 배타
    if (newValue && get().chatTwoLine) {
      updates.chatTwoLine = false;
      chrome.storage.local.set({
        chatSetting: { isUse: newValue },
        chatTwoLine: { isUse: false }
      });
    } else {
      chrome.storage.local.set({ chatSetting: { isUse: newValue } });
    }
    set(updates);
  },

  toggleChatTwoLine: () => {
    const newValue = !get().chatTwoLine;
    const updates: Partial<ChatState> = { chatTwoLine: newValue };

    // chatSetting과 상호 배타
    if (newValue && get().chatSetting) {
      updates.chatSetting = false;
      chrome.storage.local.set({
        chatTwoLine: { isUse: newValue },
        chatSetting: { isUse: false }
      });
    } else {
      chrome.storage.local.set({ chatTwoLine: { isUse: newValue } });
    }
    set(updates);
  },

  toggleSubscribeBadge: () => {
    const newValue = !get().subscribeBadge;
    chrome.storage.local.set({ subscribeBadge: { isUse: newValue } });
    set({ subscribeBadge: newValue });
  },

  toggleTopFanBadge: () => {
    const newValue = !get().topFanBadge;
    chrome.storage.local.set({ topFanBadge: { isUse: newValue } });
    set({ topFanBadge: newValue });
  },

  toggleFanBadge: () => {
    const newValue = !get().fanBadge;
    chrome.storage.local.set({ fanBadge: { isUse: newValue } });
    set({ fanBadge: newValue });
  },

  toggleSupportBadge: () => {
    const newValue = !get().supportBadge;
    chrome.storage.local.set({ supportBadge: { isUse: newValue } });
    set({ supportBadge: newValue });
  },

  // 기존 chrome.storage에서 데이터 로드
  hydrate: async () => {
    const result = await chrome.storage.local.get([
      'divider',
      'chatSetting',
      'chatTwoLine',
      'subscribeBadge',
      'topFanBadge',
      'fanBadge',
      'supportBadge',
    ]);

    set({
      divider: result.divider?.isUse ?? false,
      chatSetting: result.chatSetting?.isUse ?? false,
      chatTwoLine: result.chatTwoLine?.isUse ?? false,
      subscribeBadge: result.subscribeBadge?.isUse ?? false,
      topFanBadge: result.topFanBadge?.isUse ?? false,
      fanBadge: result.fanBadge?.isUse ?? false,
      supportBadge: result.supportBadge?.isUse ?? false,
      _hasHydrated: true,
    });
  },
}));

// Selector for hydration state
export const useHasHydratedChat = () => useChatStore((state) => state._hasHydrated);
