export { useChatStore, useHasHydratedChat } from './useChatStore';
export { useCollectorStore, useHasHydratedCollector } from './useCollectorStore';
export { useFilterStore, useHasHydratedFilter, useNicknames, useIds } from './useFilterStore';

// Hydrate all stores from chrome.storage
export async function hydrateAllStores(): Promise<void> {
  const { useChatStore } = await import('./useChatStore');
  const { useCollectorStore } = await import('./useCollectorStore');
  const { useFilterStore } = await import('./useFilterStore');

  await Promise.all([
    useChatStore.getState().hydrate(),
    useCollectorStore.getState().hydrate(),
    useFilterStore.getState().hydrate(),
  ]);
}
