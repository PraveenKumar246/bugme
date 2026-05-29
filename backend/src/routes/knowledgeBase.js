import express from 'express';
import KnowledgeBase from '../models/KnowledgeBase.js';
import Project from '../models/Project.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// GET /projects/:projectId/knowledge-base?category=X&subcategory=Y
router.get('/', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { category, subcategory } = req.query;

    if (!category || !subcategory) {
      return res.status(400).json({ error: 'category and subcategory query params are required' });
    }

    const docs = await KnowledgeBase.findByProjectAndSubcategory(projectId, category, subcategory);
    res.json(docs);
  } catch (error) {
    console.error('Get KB docs error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /projects/:projectId/knowledge-base
router.post('/', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { category, subcategory, title, content, url, doc_type } = req.body;

    if (!category || !subcategory || !title) {
      return res.status(400).json({ error: 'category, subcategory, and title are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const doc = await KnowledgeBase.create(
      projectId, category, subcategory, title,
      content || null, url || null, doc_type || 'link', req.user.id
    );

    res.status(201).json({ message: 'Document created successfully', doc });
  } catch (error) {
    console.error('Create KB doc error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /projects/:projectId/knowledge-base/:docId
router.patch('/:docId', verifyToken, async (req, res) => {
  try {
    const { docId } = req.params;
    const { title, content, url } = req.body;

    const doc = await KnowledgeBase.findById(docId);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const updated = await KnowledgeBase.update(docId, title, content, url);
    res.json({ message: 'Document updated successfully', doc: updated });
  } catch (error) {
    console.error('Update KB doc error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /projects/:projectId/knowledge-base/:docId
router.delete('/:docId', verifyToken, async (req, res) => {
  try {
    const { docId } = req.params;

    const doc = await KnowledgeBase.findById(docId);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    await KnowledgeBase.delete(docId);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete KB doc error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
