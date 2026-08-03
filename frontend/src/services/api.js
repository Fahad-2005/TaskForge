const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export const API_BASE = `${API_ORIGIN}/api`;
export const SOCKET_URL = API_ORIGIN;
export const CHAT_API_URL = `${API_ORIGIN}/api/chat`;

export function getToken() {
  return localStorage.getItem('token');
}

export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || `Request failed (${response.status})`);
  }
  return data;
}
