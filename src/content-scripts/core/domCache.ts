/**
 * DOM element cache to avoid repeated querySelector calls
 */
import { DOM_IDS, CSS_CLASSES } from './constants';

class DOMCache {
  private cache: Map<string, HTMLElement | null> = new Map();
  private initialized = false;

  /**
   * Initialize cache with commonly used elements
   */
  init(): void {
    if (this.initialized) return;
    this.refresh();
    this.initialized = true;
  }

  /**
   * Refresh all cached elements
   */
  refresh(): void {
    this.cache.set('chatbox', document.getElementById(DOM_IDS.CHATBOX));
    this.cache.set('chatArea', document.getElementById(DOM_IDS.CHAT_AREA));
    this.cache.set('actionbox', document.getElementById(DOM_IDS.ACTION_BOX));
    this.cache.set('areaHeader', document.querySelector('.area_header') as HTMLElement);
    this.cache.set('container', document.getElementById(DOM_IDS.CHAT_CONTAINER));
    this.cache.set('handleContainer', document.getElementById(DOM_IDS.HANDLE_CONTAINER));
    this.cache.set('liveArea', document.querySelector(`.${CSS_CLASSES.LIVE_AREA}`) as HTMLElement);
    this.cache.set('filterArea', document.querySelector(`.${CSS_CLASSES.FILTER_AREA}`) as HTMLElement);
  }

  /**
   * Get cached element
   */
  get(key: string): HTMLElement | null {
    return this.cache.get(key) ?? null;
  }

  /**
   * Set cached element
   */
  set(key: string, element: HTMLElement | null): void {
    this.cache.set(key, element);
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
    this.initialized = false;
  }

  // Convenience getters
  get chatbox(): HTMLElement | null {
    return this.cache.get('chatbox') ?? null;
  }

  get chatArea(): HTMLElement | null {
    return this.cache.get('chatArea') ?? null;
  }

  get actionbox(): HTMLElement | null {
    return this.cache.get('actionbox') ?? null;
  }

  get areaHeader(): HTMLElement | null {
    return this.cache.get('areaHeader') ?? null;
  }

  get container(): HTMLElement | null {
    return this.cache.get('container') ?? null;
  }

  get handleContainer(): HTMLElement | null {
    return this.cache.get('handleContainer') ?? null;
  }

  get liveArea(): HTMLElement | null {
    return this.cache.get('liveArea') ?? null;
  }

  get filterArea(): HTMLElement | null {
    return this.cache.get('filterArea') ?? null;
  }
}

export const domCache = new DOMCache();
