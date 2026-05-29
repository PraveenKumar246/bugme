import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class CustomField {
  static async createTable() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS custom_fields (
        id         UUID PRIMARY KEY,
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        name       VARCHAR(255) NOT NULL,
        field_type VARCHAR(50)  NOT NULL DEFAULT 'single_line_text',
        placeholder TEXT        DEFAULT '',
        mandatory  BOOLEAN      DEFAULT false,
        options    JSONB        DEFAULT '{}',
        position   INTEGER      DEFAULT 0,
        created_at TIMESTAMPTZ  DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_custom_fields_project ON custom_fields(project_id);
    `);
  }

  static async findByProjectId(projectId) {
    const r = await pool.query(
      'SELECT * FROM custom_fields WHERE project_id = $1 ORDER BY position, created_at',
      [projectId]
    );
    return r.rows;
  }

  static async create(projectId, { name, field_type, placeholder, mandatory, options }) {
    const id = uuidv4();
    const r = await pool.query(
      `INSERT INTO custom_fields (id, project_id, name, field_type, placeholder, mandatory, options)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [id, projectId, name, field_type || 'single_line_text', placeholder || '', !!mandatory, JSON.stringify(options || {})]
    );
    return r.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM custom_fields WHERE id = $1', [id]);
  }
}

export default CustomField;
