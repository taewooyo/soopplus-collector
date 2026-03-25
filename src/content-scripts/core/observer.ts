import { storageManager } from './storageManager';
import { applyDivider } from './chatFilter';
import { trimChildren } from './domUtils';
import { defaultContentScriptConfig, DEFAULTS } from './constants';

export type FilterFunction = (nickname: string, rawUserId: string, grade: string) => boolean;
export type ExtractUserInfoFunction = (node: HTMLElement) => {
  nickname: string;
  rawUserId: string;
  grade: string;
} | null;

interface ObserverOptions {
  filterArea: HTMLDivElement;
  filterFn: FilterFunction;
  extractUserInfo: ExtractUserInfoFunction;
  isUserScrolling: () => boolean;
  config?: {
    flushInterval: number;
    maxFilteredChats: number;
  };
}

// 성능 상수 (10만 동접 대응)
const MAX_PENDING_MUTATIONS = 50;
const MAX_CLONES_PER_FLUSH = 30;
const HIGHLIGHT_CLASS = 'tbc-highlight';
const SCROLL_THRESHOLD = 100; // 맨 아래에서 이 픽셀 이내면 auto-scroll

/**
 * 콜렉터 영역이 보이는지 확인
 */
function isFilterAreaVisible(filterArea: HTMLElement): boolean {
  const height = filterArea.style.height;
  return height !== '0%' && height !== '0px' && filterArea.offsetHeight > 0;
}

/**
 * 스크롤이 맨 아래 근처인지 확인 (직접 체크 - 이벤트 의존 X)
 */
function isNearBottom(element: HTMLElement): boolean {
  const { scrollHeight, scrollTop, clientHeight } = element;
  return scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD;
}

/**
 * Create a batched mutation observer for chat filtering
 *
 * 최적화:
 * 1. 단일 타이머로 배치 처리 (중복 타임아웃 방지)
 * 2. 필터 영역 숨김 시 클론 스킵
 * 3. 클론 개수 제한
 * 4. 자연스러운 auto-scroll 유지
 */
export function createBatchedObserver(options: ObserverOptions): MutationObserver {
  const {
    filterArea,
    filterFn,
    extractUserInfo,
    isUserScrolling,
    config = { flushInterval: DEFAULTS.FLUSH_INTERVAL, maxFilteredChats: DEFAULTS.MAX_FILTERED_CHATS },
  } = options;

  // 노드와 사용자 정보만 저장 (shouldFilter는 flush 시점에 재계산)
  interface PendingNode {
    node: HTMLElement;
    userInfo: { nickname: string; rawUserId: string; grade: string };
  }

  let pendingNodes: PendingNode[] = [];
  let flushScheduled = false;

  const flushPendingNodes = () => {
    flushScheduled = false;

    if (pendingNodes.length === 0) return;

    const nodes = pendingNodes;
    pendingNodes = [];

    requestAnimationFrame(() => {
      const collector = storageManager.getCollector();
      const highlight = storageManager.getHighlight();
      const shouldClone = filterArea && isFilterAreaVisible(filterArea) && collector.isUse;
      const nodesToClone: HTMLElement[] = [];

      for (const { node, userInfo } of nodes) {
        if (!node.parentNode) continue;

        // 구분자 적용 (divider 설정에 따라)
        const divider = storageManager.getDivider();
        applyDivider(node, divider.isUse);

        // flush 시점에 필터 재계산 (최신 설정 반영)
        const shouldFilter = filterFn(userInfo.nickname, userInfo.rawUserId, userInfo.grade);

        // 하이라이트 적용
        if (highlight?.isUse && shouldFilter) {
          node.classList.add(HIGHLIGHT_CLASS);
        }

        // 클론 대상 수집 (개수 제한)
        if (shouldFilter && shouldClone && nodesToClone.length < MAX_CLONES_PER_FLUSH) {
          nodesToClone.push(node);
        }
      }

      // DOM 조작 + 스크롤
      if (nodesToClone.length > 0 && filterArea) {
        // 스크롤 전에 현재 위치 체크 (DOM 추가 전에!)
        const shouldAutoScroll = isNearBottom(filterArea);

        const fragment = document.createDocumentFragment();

        for (const node of nodesToClone) {
          const clonedNode = node.cloneNode(true) as HTMLElement;
          clonedNode.classList.remove(HIGHLIGHT_CLASS);
          fragment.appendChild(clonedNode);
        }

        filterArea.appendChild(fragment);
        trimChildren(filterArea, config.maxFilteredChats);

        // 맨 아래 근처였으면 자동 스크롤
        if (shouldAutoScroll) {
          filterArea.scrollTop = filterArea.scrollHeight;
        }
      }
    });
  };

  const scheduleFlush = () => {
    if (!flushScheduled && pendingNodes.length > 0) {
      flushScheduled = true;
      setTimeout(flushPendingNodes, config.flushInterval);
    }
  };

  const callback = (mutationList: MutationRecord[]) => {
    const highlight = storageManager.getHighlight();
    const collector = storageManager.getCollector();

    for (const mutation of mutationList) {
      for (const node of mutation.addedNodes) {
        if (node.nodeName !== 'DIV' || !node.parentNode) continue;

        const element = node as HTMLElement;
        const userInfo = extractUserInfo(element);
        if (!userInfo) continue;

        // 하이라이트는 즉시 적용 (콜렉터와 별개로 동작)
        if (highlight?.isUse) {
          const shouldFilter = filterFn(userInfo.nickname, userInfo.rawUserId, userInfo.grade);
          if (shouldFilter) {
            element.classList.add(HIGHLIGHT_CLASS);
          }
        }

        // 클론은 flush 시점에 최신 설정으로 처리
        pendingNodes.push({ node: element, userInfo });
      }
    }

    // 메모리 제한
    if (pendingNodes.length > MAX_PENDING_MUTATIONS) {
      pendingNodes = pendingNodes.slice(-MAX_PENDING_MUTATIONS);
    }

    // 단일 타이머로 배치 스케줄링
    scheduleFlush();
  };

  return new MutationObserver(callback);
}
