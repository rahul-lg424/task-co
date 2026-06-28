import type { User } from '../types';

// Single source of truth for the localStorage keys, so the api-client,
// ProtectedRoute, and auth pages never drift on the string.
export const TOKEN_STORAGE_KEY = 'taskco_token';
export const USER_STORAGE_KEY = 'taskco_user';

export const getToken = (): string | null => localStorage.getItem(TOKEN_STORAGE_KEY);

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const getUser = (): User | null => {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

export const setUser = (user: User): void => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const clearAuth = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
};
