import { create } from 'zustand';
import { FilterTypes, defaultFilterTypes } from '../interfaces/setting';

interface CollectorState {
  // State
  isEnabled: boolean;
  highlight: boolean;
  filters: FilterTypes;

  // Hydration state
  _hasHydrated: boolean;

  // Actions
  toggleCollector: () => void;
  toggleHighlight: () => void;
  toggleFilter: (key: keyof FilterTypes) => void;

  // Hydration
  hydrate: () => Promise<void>;
}

export const useCollectorStore = create<CollectorState>()((set, get) => ({
  // Initial state
  isEnabled: false,
  highlight: true,
  filters: { ...defaultFilterTypes },
  _hasHydrated: false,

  // Actions - 기존 형식 그대로 저장
  toggleCollector: () => {
    const newValue = !get().isEnabled;
    chrome.storage.local.set({ collector: { isUse: newValue } });
    set({ isEnabled: newValue });
  },

  toggleHighlight: () => {
    const newValue = !get().highlight;
    chrome.storage.local.set({ highlight: { isUse: newValue } });
    set({ highlight: newValue });
  },

  toggleFilter: (key) => {
    const newFilters = { ...get().filters, [key]: !get().filters[key] };
    chrome.storage.local.set({ toggle: newFilters });
    set({ filters: newFilters });
  },

  // 기존 chrome.storage에서 데이터 로드
  hydrate: async () => {
    const result = await chrome.storage.local.get([
      'collector',
      'highlight',
      'toggle',
    ]);

    set({
      isEnabled: result.collector?.isUse ?? false,
      highlight: result.highlight?.isUse ?? true,
      filters: result.toggle ?? { ...defaultFilterTypes },
      _hasHydrated: true,
    });
  },
}));

// Selector for hydration state
export const useHasHydratedCollector = () => useCollectorStore((state) => state._hasHydrated);
