import express from 'express';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/v1/invitations/:token
// Public — validate token, return team/invite info so the frontend can render the accept form
router.get('/:token', async (req, res) => {
  try {
    const inv = await Team.getInvitation(req.params.token);

    if (!inv) {
      return res.status(404).json({ error: 'Invitation not found' });
    }
    if (inv.status !== 'pending') {
      return res.status(410).json({ error: 'This invitation has already been used' });
    }
    if (new Date(inv.expires_at) < new Date()) {
      return res.status(410).json({ error: 'This invitation has expired' });
    }

    // Check if the invited email already has an account
    const existingUser = await User.findByEmail(inv.email);

    res.json({
      teamName:    inv.team_name,
      inviterName: inv.inviter_name,
      email:       inv.email,
      isNewUser:   !existingUser,
      expiresAt:   inv.expires_at,
    });
  } catch (error) {
    console.error('Get invitation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/invitations/:token/accept
// Public — create account (if new) + join team + return JWT
router.post('/:token/accept', async (req, res) => {
  try {
    const inv = await Team.getInvitation(req.params.token);

    if (!inv) return res.status(404).json({ error: 'Invitation not found' });
    if (inv.status !== 'pending') return res.status(410).json({ error: 'Invitation already used' });
    if (new Date(inv.expires_at) < new Date()) return res.status(410).json({ error: 'Invitation expired' });

    const { name, password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password is required' });

    let user = await User.findByEmail(inv.email);

    if (!user) {
      // New user — create account
      if (!name || name.trim().length < 2) {
        return res.status(400).json({ error: 'Name is required (at least 2 characters)' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      user = await User.create(inv.email, password, name.trim());
    } else {
      // Existing user — validate their password
      const valid = await User.validatePassword(password, user.password);
      if (!valid) return res.status(401).json({ error: 'Incorrect password' });
    }

    // Accept the invitation (adds to team + marks accepted)
    await Team.acceptInvitation(req.params.token, user.id);

    const token = generateToken(user.id);
    res.json({
      message: `You've joined the team!`,
      user: { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url },
      token,
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
