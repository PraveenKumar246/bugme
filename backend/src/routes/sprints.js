import express from 'express';
import Sprint from '../models/Sprint.js';
import Issue from '../models/Issue.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.get('/', verifyToken, async (req, res) => {
  try {
    const sprints = await Sprint.findByProjectId(req.params.projectId);
    res.json(sprints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, goal, start_date, end_date } = req.body;
    if (!name) return res.status(400).json({ error: 'Sprint name is required' });
    const sprint = await Sprint.create(req.params.projectId, { name, goal, start_date, end_date }, req.user.id);
    res.status(201).json({ message: 'Sprint created successfully', sprint });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:sprintId', verifyToken, async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.sprintId);
    if (!sprint) return res.status(404).json({ error: 'Sprint not found' });
    const updated = await Sprint.update(req.params.sprintId, req.body);
    res.json({ message: 'Sprint updated', sprint: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:sprintId', verifyToken, async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.sprintId);
    if (!sprint) return res.status(404).json({ error: 'Sprint not found' });
    await Sprint.delete(req.params.sprintId);
    res.json({ message: 'Sprint deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:sprintId/issues', verifyToken, async (req, res) => {
  try {
    const { issue_id } = req.body;
    if (!issue_id) return res.status(400).json({ error: 'issue_id is required' });
    await Sprint.addIssue(req.params.sprintId, issue_id);
    res.json({ message: 'Issue added to sprint' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:sprintId/issues/:issueId', verifyToken, async (req, res) => {
  try {
    await Sprint.removeIssue(req.params.issueId);
    res.json({ message: 'Issue removed from sprint' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
