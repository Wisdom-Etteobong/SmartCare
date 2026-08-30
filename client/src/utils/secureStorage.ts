/**
 * Secure Token & Storage Manager
 * 
 * Security enhancements for healthcare data protection:
 * 1. Restricts authentication token persistence to sessionStorage to prevent lingering
 *    credentials on shared hospital / public computers after browser sessions end.
 * 2. Strictly forbids storing Personally Identifiable Information (PII), medical data,
 *    and user profiles in browser storage (localStorage). User info resides solely
 *    in secure in-memory application state and is verified via /api/auth/me.
 * 3. Proactively clears legacy localStorage artifacts on load.
 */

const TOKEN_KEY = 'smartcare_session_token';
const LEGACY_STORAGE_KEYS = ['smartcare_token', 'smartcare_user'];

// Purge any lingering legacy localStorage artifacts to eliminate stored PII
export const purgeLegacyInsecureStorage = (): void => {
  try {
    for (const key of LEGACY_STORAGE_KEYS) {
      if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // Storage access might be restricted in some sandbox environments
  }
};

// Immediately execute cleanup
purgeLegacyInsecureStorage();

export const getAuthToken = (): string | null => {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setAuthToken = (token: string): void => {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
  } catch {
    // sessionStorage quota or security restriction fallback
  }
};

export const removeAuthToken = (): void => {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // fallback
  }
  purgeLegacyInsecureStorage();
};
