import express from 'express';
import Comment from '../models/Comment.js';
import Issue from '../models/Issue.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Create comment
router.post('/', verifyToken, async (req, res) => {
  try {
    const { projectId, issueId } = req.params;
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const comment = await Comment.create(issueId, req.user.id, text);

    res.status(201).json({
      message: 'Comment created successfully',
      comment,
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all comments for issue
router.get('/', verifyToken, async (req, res) => {
  try {
    const { issueId } = req.params;

    const comments = await Comment.findByIssueId(issueId);

    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update comment
router.patch('/:commentId', verifyToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const updatedComment = await Comment.update(commentId, text);

    if (!updatedComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.json({
      message: 'Comment updated successfully',
      comment: updatedComment,
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete comment
router.delete('/:commentId', verifyToken, async (req, res) => {
  try {
    const { commentId } = req.params;

    const result = await Comment.delete(commentId);

    if (!result) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
