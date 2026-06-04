/**
 * Single source of truth for all client-side storage key names.
 *
 * Auth tokens are NO LONGER stored here — the access token lives in JS memory
 * (see api.js) and the refresh token is an HttpOnly cookie set by the server.
 */
export const StorageKeys = Object.freeze({
  THEME: 'bm_theme', // UI theme preference ('light' | 'dark')
});
