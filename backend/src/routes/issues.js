import express from 'express';
import Issue from '../models/Issue.js';
import Project from '../models/Project.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.post('/', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, priority, severity, type, tags, sprint_id, assignee_id } = req.body;
    if (!title) return res.status(400).json({ error: 'Issue title is required' });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const issue = await Issue.create(projectId, title, description, priority || 'medium', req.user.id, {
      severity, type, tags, sprint_id, assignee_id,
    });
    res.status(201).json({ message: 'Issue created successfully', issue });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, priority, severity, type, assignee_id, sprint_id } = req.query;
    const filters = {};
    if (status)      filters.status      = status;
    if (priority)    filters.priority    = priority;
    if (severity)    filters.severity    = severity;
    if (type)        filters.type        = type;
    if (assignee_id) filters.assignee_id = assignee_id;
    if (sprint_id)   filters.sprint_id   = sprint_id;

    const issues = await Issue.findByProjectId(projectId, filters);
    res.json(issues);
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:issueId', verifyToken, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.issueId);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    res.json(issue);
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:issueId', verifyToken, async (req, res) => {
  try {
    const { issueId } = req.params;
    const issue = await Issue.findById(issueId);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const updatedIssue = await Issue.update(issueId, req.body);
    res.json({ message: 'Issue updated successfully', issue: updatedIssue });
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:issueId', verifyToken, async (req, res) => {
  try {
    const { issueId } = req.params;
    const issue = await Issue.findById(issueId);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    await Issue.delete(issueId);
    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
