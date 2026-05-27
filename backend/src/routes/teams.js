import express from 'express';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';
import { sendTeamInviteEmail } from '../services/email.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', async (req, res) => {
  try {
    const teams = await Team.findByUser(req.user.id);
    const teamsWithMembers = await Promise.all(
      teams.map(async (team) => {
        const members = await Team.getMembers(team.id);
        return { ...team, members };
      })
    );
    res.json(teamsWithMembers);
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Team name is required' });
    const team = await Team.create(name, description, req.user.id);
    const members = await Team.getMembers(team.id);
    res.status(201).json({ ...team, members });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const team = await Team.delete(req.params.id, req.user.id);
    if (!team) return res.status(404).json({ error: 'Team not found or unauthorized' });
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send invitation email — replaces direct add-member
router.post('/:id/members', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const inviter = await User.findById(req.user.id);
    const invitation = await Team.createInvitation(req.params.id, email, req.user.id);

    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const acceptUrl = `${appUrl}/invite/${invitation.token}`;

    await sendTeamInviteEmail({
      to: email,
      inviterName: inviter.name,
      teamName: invitation.team.name,
      acceptUrl,
    });

    res.json({ message: `Invitation sent to ${email}` });
  } catch (error) {
    const status = error.message === 'Unauthorized' ? 403
      : error.message === 'Team not found' ? 404
      : 500;
    console.error('Invite member error:', error);
    res.status(status).json({ error: error.message });
  }
});

router.delete('/:id/members/:userId', async (req, res) => {
  try {
    const message = await Team.removeMember(req.params.id, req.params.userId, req.user.id);
    res.json({ message });
  } catch (error) {
    const status = error.message === 'Unauthorized' ? 403
      : error.message === 'Team not found' ? 404
      : error.message === 'Cannot remove the team owner' ? 400
      : 500;
    console.error('Remove member error:', error);
    res.status(status).json({ error: error.message });
  }
});

export default router;
