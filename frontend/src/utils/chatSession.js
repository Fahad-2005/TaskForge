const CHAT_STORAGE_PREFIX = 'taskforge-ai-chat:';

function getUserId() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return String(user?.id || user?._id || 'anon');
  } catch {
    return 'anon';
  }
}

export function getChatStorageKey(userId = getUserId()) {
  return `${CHAT_STORAGE_PREFIX}${userId}`;
}

export function loadSessionChatMessages(userId = getUserId()) {
  try {
    const raw = sessionStorage.getItem(getChatStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSessionChatMessages(messages, userId = getUserId()) {
  try {
    sessionStorage.setItem(getChatStorageKey(userId), JSON.stringify(messages || []));
  } catch {
    // Ignore quota / private mode failures
  }
}

export function clearSessionChatMessages(userId = getUserId()) {
  try {
    sessionStorage.removeItem(getChatStorageKey(userId));
    // Also clear anon bucket if present
    sessionStorage.removeItem(getChatStorageKey('anon'));
  } catch {
    // ignore
  }
}

export function clearAllSessionChatMessages() {
  try {
    const keys = [];
    for (let i = 0; i < sessionStorage.length; i += 1) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(CHAT_STORAGE_PREFIX)) keys.push(key);
    }
    keys.forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // ignore
  }
}
