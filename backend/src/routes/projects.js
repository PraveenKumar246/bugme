import express from 'express';
import Project from '../models/Project.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Create project
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, description, team_id, platform } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const project = await Project.create(name, description, req.user.id, team_id, platform);

    res.status(201).json({
      message: 'Project created successfully',
      project,
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all projects for user
router.get('/', verifyToken, async (req, res) => {
  try {
    const projects = await Project.findByOwnerId(req.user.id);
    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get project by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update project
router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const { name, description, platform } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updatedProject = await Project.update(req.params.id, name, description, platform);

    res.json({
      message: 'Project updated successfully',
      project: updatedProject,
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Toggle favorite
router.post('/:id/favorite', verifyToken, async (req, res) => {
  try {
    const isFavorite = await Project.toggleFavorite(req.user.id, req.params.id);
    res.json({ is_favorite: isFavorite });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete project
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Project.delete(req.params.id);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
