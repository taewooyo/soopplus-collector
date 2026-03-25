import { create } from 'zustand';

// 기존 User 타입 (레거시 형식 유지)
interface LegacyUser {
  isNickname: boolean;
  user: string;
}

interface FilterState {
  // State - 기존 형식 그대로 유지
  nicks: LegacyUser[];
  ids: LegacyUser[];

  // Hydration state
  _hasHydrated: boolean;

  // Actions
  addNick: (nickname: string) => void;
  addId: (id: string) => void;
  removeNick: (nickname: string) => void;
  removeId: (id: string) => void;
  clearAll: () => void;

  // Hydration
  hydrate: () => Promise<void>;
}

export const useFilterStore = create<FilterState>()((set, get) => ({
  // Initial state
  nicks: [],
  ids: [],
  _hasHydrated: false,

  // Actions - 기존 형식 그대로 저장
  addNick: (nickname) => {
    const trimmed = nickname.trim();
    if (!trimmed) return;

    const exists = get().nicks.some((u) => u.user === trimmed);
    if (exists) return;

    const newNicks = [...get().nicks, { isNickname: true, user: trimmed }];
    chrome.storage.local.set({ nicks: newNicks });
    set({ nicks: newNicks });
  },

  addId: (id) => {
    const trimmed = id.trim();
    if (!trimmed) return;

    const exists = get().ids.some((u) => u.user === trimmed);
    if (exists) return;

    const newIds = [...get().ids, { isNickname: false, user: trimmed }];
    chrome.storage.local.set({ ids: newIds });
    set({ ids: newIds });
  },

  removeNick: (nickname) => {
    const newNicks = get().nicks.filter((u) => u.user !== nickname);
    chrome.storage.local.set({ nicks: newNicks });
    set({ nicks: newNicks });
  },

  removeId: (id) => {
    const newIds = get().ids.filter((u) => u.user !== id);
    chrome.storage.local.set({ ids: newIds });
    set({ ids: newIds });
  },

  clearAll: () => {
    chrome.storage.local.set({ nicks: [], ids: [] });
    set({ nicks: [], ids: [] });
  },

  // 기존 chrome.storage에서 데이터 로드
  hydrate: async () => {
    const result = await chrome.storage.local.get(['nicks', 'ids']);

    set({
      nicks: result.nicks ?? [],
      ids: result.ids ?? [],
      _hasHydrated: true,
    });
  },
}));

// Selectors
export const useHasHydratedFilter = () => useFilterStore((state) => state._hasHydrated);
export const useNicknames = () => useFilterStore((state) => state.nicks);
export const useIds = () => useFilterStore((state) => state.ids);
