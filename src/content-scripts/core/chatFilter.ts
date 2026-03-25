import { storageManager } from './storageManager';

/**
 * Check if a chat message should be filtered (collected)
 * Used for live chat
 */
export function filterLiveChat(nickname: string, rawUserId: string, grade: string): boolean {
  const lastIndex = rawUserId.indexOf('(');
  const userId = lastIndex === -1 ? rawUserId : rawUserId.substring(0, lastIndex);

  const nicksMap = storageManager.getNicksMap();
  const idsSet = storageManager.getIdsSet();
  const toggle = storageManager.getToggle();

  if (nicksMap.has(nickname) && nicksMap.get(nickname)) return true;
  if (idsSet.has(userId)) return true;
  if (grade === 'bj' && toggle.streamer) return true;
  if (grade === 'manager' && toggle.manager) return true;
  if (grade === 'topfan' && toggle.topfan) return true;
  if (grade === 'gudok' && toggle.gudok) return true;
  if (grade === 'fan' && toggle.fan) return true;
  if (grade === 'user' && toggle.user) return true;
  return false;
}

/**
 * Check if a chat message should be filtered (collected)
 * Used for VOD chat (different userType mapping)
 */
export function filterVodChat(nickname: string, rawUserId: string, userType: string): boolean {
  const lastIndex = rawUserId.indexOf('(');
  const userId = lastIndex === -1 ? rawUserId : rawUserId.substring(0, lastIndex);

  const nicks = storageManager.getNicks();
  const ids = storageManager.getIds();
  const toggle = storageManager.getToggle();

  // Check nicknames
  for (const user of nicks) {
    if (user.isNickname && user.user === nickname) {
      return true;
    }
  }

  // Check ids
  for (const user of ids) {
    if (!user.isNickname && user.user === userId) {
      return true;
    }
  }

  // Check toggle settings (VOD uses different userType format)
  if (userType === 'streamer' && toggle.streamer) return true;
  if (userType === 'manager' && toggle.manager) return true;
  if (userType === 'vip' && toggle.topfan) return true;
  if (userType === 'subscribe' && toggle.gudok) return true;
  if (userType === 'fan' && toggle.fan) return true;
  if (userType === '' && toggle.user) return true;

  return false;
}

/**
 * Extract user info from a chat message element (live chat)
 */
export function extractLiveChatUserInfo(node: HTMLElement): {
  nickname: string;
  rawUserId: string;
  grade: string;
} | null {
  const container = node.querySelector('.message-container');
  if (!container) return null;

  const userButton = container.querySelector('.username button');
  if (!userButton) return null;

  const rawUserId = userButton.getAttribute('user_id');
  const nickname = userButton.getAttribute('user_nick');
  const grade = userButton.getAttribute('grade');

  if (!rawUserId || !nickname || !grade) return null;

  return { nickname, rawUserId, grade };
}

/**
 * Extract user info from a chat message element (VOD chat)
 */
export function extractVodChatUserInfo(node: HTMLElement): {
  nickname: string;
  rawUserId: string;
  userType: string;
} | null {
  const container = node.querySelector('.message-container');
  if (!container) return null;

  const userButton = container.querySelector('.username button');
  if (!userButton) return null;

  const lastChild = userButton.lastElementChild as HTMLElement;
  if (!lastChild) return null;

  const parentEl = container.parentElement as HTMLElement;
  if (!parentEl) return null;

  const rawUserId = lastChild.getAttribute('user_id');
  const nickname = lastChild.getAttribute('user_nick');
  const userType = parentEl.getAttribute('user-type');

  if (!rawUserId || !nickname || userType === null) return null;

  return { nickname, rawUserId, userType };
}

/**
 * Apply divider to author element
 */
export function applyDivider(node: HTMLElement, shouldApply: boolean): void {
  const author = node.querySelector('.author') as HTMLElement;
  if (!author) return;

  const text = author.innerText;
  if (shouldApply) {
    if (!text.includes(' : ')) {
      author.innerText = text + ' : ';
    }
  } else {
    const index = text.indexOf(' : ');
    if (index !== -1) {
      author.innerText = text.substring(0, index);
    }
  }
}
