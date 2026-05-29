import express from 'express';
import CustomField from '../models/CustomField.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.get('/', verifyToken, async (req, res) => {
  try {
    const fields = await CustomField.findByProjectId(req.params.projectId);
    res.json(fields);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, field_type, placeholder, mandatory, options } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Field name is required' });
    const field = await CustomField.create(req.params.projectId, { name: name.trim(), field_type, placeholder, mandatory, options });
    res.status(201).json(field);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:fieldId', verifyToken, async (req, res) => {
  try {
    await CustomField.delete(req.params.fieldId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
