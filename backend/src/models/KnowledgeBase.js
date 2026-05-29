import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class KnowledgeBase {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS knowledge_base_docs (
        id UUID PRIMARY KEY,
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        category VARCHAR(50) NOT NULL,
        subcategory VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        url TEXT,
        doc_type VARCHAR(20) DEFAULT 'link',
        created_by UUID NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_kb_project ON knowledge_base_docs(project_id);
      CREATE INDEX IF NOT EXISTS idx_kb_category ON knowledge_base_docs(project_id, category, subcategory);
    `;
    try {
      await pool.query(query);
      console.log('Knowledge Base table created successfully');
    } catch (error) {
      console.error('Error creating knowledge_base_docs table:', error);
    }
  }

  static async create(projectId, category, subcategory, title, content, url, docType, createdBy) {
    const id = uuidv4();
    const query = `
      INSERT INTO knowledge_base_docs (id, project_id, category, subcategory, title, content, url, doc_type, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    try {
      const result = await pool.query(query, [id, projectId, category, subcategory, title, content, url, docType, createdBy]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating knowledge base doc: ${error.message}`);
    }
  }

  static async findByProjectAndSubcategory(projectId, category, subcategory) {
    const query = `
      SELECT * FROM knowledge_base_docs
      WHERE project_id = $1 AND category = $2 AND subcategory = $3
      ORDER BY created_at DESC;
    `;
    try {
      const result = await pool.query(query, [projectId, category, subcategory]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding knowledge base docs: ${error.message}`);
    }
  }

  static async findById(id) {
    const query = `SELECT * FROM knowledge_base_docs WHERE id = $1;`;
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding knowledge base doc: ${error.message}`);
    }
  }

  static async update(id, title, content, url) {
    const query = `
      UPDATE knowledge_base_docs
      SET
        title = COALESCE($1, title),
        content = COALESCE($2, content),
        url = COALESCE($3, url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *;
    `;
    try {
      const result = await pool.query(query, [title, content, url, id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating knowledge base doc: ${error.message}`);
    }
  }

  static async delete(id) {
    const query = `DELETE FROM knowledge_base_docs WHERE id = $1 RETURNING id;`;
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting knowledge base doc: ${error.message}`);
    }
  }
}

export default KnowledgeBase;
