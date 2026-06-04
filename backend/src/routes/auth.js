import express from 'express';
import User from '../models/User.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
  REFRESH_COOKIE,
} from '../middleware/auth.js';
import { sendPasswordResetEmail } from '../services/email.js';

const router = express.Router();

/** Shared helper — build the public user shape returned in every auth response. */
const publicUser = (user) => ({
  id:         user.id,
  email:      user.email,
  name:       user.name,
  avatar_url: user.avatar_url ?? null,
});

// ─── Signup ───────────────────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (await User.findByEmail(email)) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const user         = await User.create(email, password, name);
    const accessToken  = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      message:     'User created successfully',
      user:        publicUser(user),
      accessToken,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── Login ────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findByEmail(email);
    if (!user || !(await User.validatePassword(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken  = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    setRefreshCookie(res, refreshToken);

    res.json({
      message:     'Login successful',
      user:        publicUser(user),
      accessToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── Refresh ──────────────────────────────────────────────────────────────────
// Reads the HttpOnly refresh cookie, validates it, and issues a new access token.
// The refresh cookie is rotated on every call (refresh token rotation).
router.post('/refresh', async (req, res) => {
  const token = req.cookies[REFRESH_COOKIE];
  if (!token) {
    return res.status(401).json({ error: 'No refresh token' });
  }

  try {
    const decoded = verifyRefreshToken(token);
    const user    = await User.findById(decoded.id);
    if (!user) {
      clearRefreshCookie(res);
      return res.status(401).json({ error: 'User not found' });
    }

    const accessToken     = generateAccessToken(user.id, user.email);
    const newRefreshToken = generateRefreshToken(user.id, user.email);

    setRefreshCookie(res, newRefreshToken); // rotate

    res.json({
      accessToken,
      user: publicUser(user),
    });
  } catch {
    clearRefreshCookie(res);
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

// ─── Logout ───────────────────────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  clearRefreshCookie(res);
  res.json({ message: 'Logged out successfully' });
});

// ─── Get profile ──────────────────────────────────────────────────────────────
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── Update profile ───────────────────────────────────────────────────────────
router.patch('/profile', verifyToken, async (req, res) => {
  try {
    const { name, avatar_url } = req.body;
    const user = await User.updateProfile(req.user.id, { name, avatar_url });
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── Change password ──────────────────────────────────────────────────────────
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'current_password and new_password are required' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user  = await User.findByEmail(req.user.email);
    const valid = await User.validatePassword(current_password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    await User.updatePassword(req.user.id, new_password);
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── Forgot password ──────────────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        error: 'No account found with this email. Please sign up to create an account.',
      });
    }

    const token    = await User.createPasswordResetToken(user.id);
    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl });

    res.json({ message: 'Password reset link has been sent to your email.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── Reset password ───────────────────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      return res.status(400).json({ error: 'token and new_password are required' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const record = await User.findPasswordResetToken(token);
    if (!record) {
      return res.status(400).json({ error: 'Reset link is invalid or has expired' });
    }

    await User.updatePassword(record.user_id, new_password);
    await User.markResetTokenUsed(token);

    res.json({ message: 'Password reset successfully. You can now sign in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
