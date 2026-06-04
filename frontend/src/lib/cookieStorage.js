/**
 * Centralized, secure cookie storage utility.
 *
 * Security attributes applied:
 *   - SameSite=Strict  (auth) / SameSite=Lax (preferences)
 *     → blocks cross-site request forgery for sensitive cookies
 *   - Secure (production only)
 *     → token is only transmitted over HTTPS in prod; works on plain HTTP in dev
 *
 * Note: HttpOnly cannot be set via JavaScript — that attribute must be applied
 * server-side. For full token security, consider moving token issuance to
 * an HttpOnly cookie set by the backend.
 */

const IS_PROD = import.meta.env.PROD;

const MAX_AGE = Object.freeze({
  AUTH: 7  * 24 * 60 * 60,    // 7 days  — auth token + user session
  PREF: 365 * 24 * 60 * 60,   // 1 year  — UI preferences (theme, etc.)
});

/**
 * Cookie option presets.
 *
 * auth → strict security, 7-day lifetime
 * pref → relaxed for non-sensitive UI prefs, 1-year lifetime
 */
export const CookieOptions = Object.freeze({
  auth: { maxAge: MAX_AGE.AUTH, sameSite: 'Strict', secure: IS_PROD },
  pref: { maxAge: MAX_AGE.PREF, sameSite: 'Lax',    secure: false   },
});

function serialize(key, value, options = {}) {
  const {
    maxAge   = MAX_AGE.AUTH,
    sameSite = 'Strict',
    path     = '/',
    secure   = IS_PROD,
  } = options;

  let cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  cookie += `; path=${path}`;
  cookie += `; SameSite=${sameSite}`;
  if (maxAge != null) cookie += `; Max-Age=${maxAge}`;
  if (secure) cookie += '; Secure';
  return cookie;
}

export const cookieStorage = {
  /**
   * Read a cookie by key. Returns null if not found.
   */
  get(key) {
    const prefix = `${encodeURIComponent(key)}=`;
    for (const part of document.cookie.split(';')) {
      const trimmed = part.trimStart();
      if (trimmed.startsWith(prefix)) {
        return decodeURIComponent(trimmed.slice(prefix.length));
      }
    }
    return null;
  },

  /**
   * Write a cookie.
   * @param {string}  key
   * @param {string}  value
   * @param {object}  options  — see CookieOptions presets above
   */
  set(key, value, options = CookieOptions.auth) {
    document.cookie = serialize(key, value, options);
  },

  /**
   * Delete a cookie by setting Max-Age=0.
   */
  remove(key) {
    document.cookie = `${encodeURIComponent(key)}=; path=/; Max-Age=0`;
  },
};
