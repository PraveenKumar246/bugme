import jwt from 'jsonwebtoken';

const ACCESS_SECRET  = process.env.JWT_SECRET         || 'change_access_secret_in_production';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'change_refresh_secret_in_production';
const ACCESS_EXPIRE  = process.env.JWT_ACCESS_EXPIRE  || '15m';
const REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '7d';

/** Cookie name for the HttpOnly refresh token */
export const REFRESH_COOKIE = 'bm_refresh';

const IS_PROD = process.env.NODE_ENV === 'production';

// ─────────────────────────────────────────────
// Token generators
// ─────────────────────────────────────────────

export const generateAccessToken = (userId, email) =>
  jwt.sign({ id: userId, email }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRE });

export const generateRefreshToken = (userId, email) =>
  jwt.sign({ id: userId, email }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRE });

/** Keep old name working for any callers that haven't been updated yet. */
export const generateToken = generateAccessToken;

// ─────────────────────────────────────────────
// Refresh-token cookie helpers
// ─────────────────────────────────────────────

/**
 * Set the HttpOnly refresh-token cookie on the response.
 *
 * Security attributes:
 *   httpOnly  — JS cannot read this cookie (XSS protection)
 *   secure    — only sent over HTTPS in production
 *   sameSite  — 'strict' blocks all cross-site requests (CSRF protection)
 *   path      — scoped so the cookie is only sent to /api/v1/auth/* paths
 */
export const setRefreshCookie = (res, token) => {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure:   IS_PROD,
    sameSite: 'strict',
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path:     '/api/v1/auth',
  });
};

/** Expire the refresh-token cookie immediately. */
export const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
};

// ─────────────────────────────────────────────
// Route middleware
// ─────────────────────────────────────────────

/** Protect routes — validates the short-lived access token from the Authorization header. */
export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    req.user = jwt.verify(token, ACCESS_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/** Verify and decode a refresh token (used only in the /refresh endpoint). */
export const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_SECRET);
