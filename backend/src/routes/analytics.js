import express from 'express';
import Analytics from '../services/analytics.js';
import Project from '../models/Project.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Get dashboard data
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const dashboardData = await Analytics.getDashboardData(projectId);

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get project stats
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    const stats = await Analytics.getProjectStats(projectId);

    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get issues by status
router.get('/issues/by-status', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    const data = await Analytics.getIssuesByStatus(projectId);

    res.json(data);
  } catch (error) {
    console.error('Issues by status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get issues by priority
router.get('/issues/by-priority', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    const data = await Analytics.getIssuesByPriority(projectId);

    res.json(data);
  } catch (error) {
    console.error('Issues by priority error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get test coverage
router.get('/coverage', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    const coverage = await Analytics.getTestCoverage(projectId);

    res.json(coverage);
  } catch (error) {
    console.error('Coverage error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get recent issues
router.get('/recent-issues', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const limit = req.query.limit || 10;

    const issues = await Analytics.getRecentIssues(projectId, limit);

    res.json(issues);
  } catch (error) {
    console.error('Recent issues error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
