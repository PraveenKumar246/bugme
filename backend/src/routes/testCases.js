import express from 'express';
import TestCase from '../models/TestCase.js';
import Project from '../models/Project.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Create test case
router.post('/', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, steps, expected_result } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Test case title is required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const testCase = await TestCase.create(
      projectId,
      title,
      description,
      steps || [],
      expected_result,
      req.user.id
    );

    res.status(201).json({
      message: 'Test case created successfully',
      testCase,
    });
  } catch (error) {
    console.error('Create test case error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all test cases for project
router.get('/', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    const testCases = await TestCase.findByProjectId(projectId);

    res.json(testCases);
  } catch (error) {
    console.error('Get test cases error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get test case by ID
router.get('/:testCaseId', verifyToken, async (req, res) => {
  try {
    const { testCaseId } = req.params;
    const testCase = await TestCase.findById(testCaseId);

    if (!testCase) {
      return res.status(404).json({ error: 'Test case not found' });
    }

    res.json(testCase);
  } catch (error) {
    console.error('Get test case error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update test case
router.patch('/:testCaseId', verifyToken, async (req, res) => {
  try {
    const { testCaseId } = req.params;
    const { title, description, steps, expected_result } = req.body;

    const testCase = await TestCase.findById(testCaseId);
    if (!testCase) {
      return res.status(404).json({ error: 'Test case not found' });
    }

    const updatedTestCase = await TestCase.update(
      testCaseId,
      title,
      description,
      steps,
      expected_result
    );

    res.json({
      message: 'Test case updated successfully',
      testCase: updatedTestCase,
    });
  } catch (error) {
    console.error('Update test case error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete test case
router.delete('/:testCaseId', verifyToken, async (req, res) => {
  try {
    const { testCaseId } = req.params;

    const testCase = await TestCase.findById(testCaseId);
    if (!testCase) {
      return res.status(404).json({ error: 'Test case not found' });
    }

    await TestCase.delete(testCaseId);

    res.json({ message: 'Test case deleted successfully' });
  } catch (error) {
    console.error('Delete test case error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
