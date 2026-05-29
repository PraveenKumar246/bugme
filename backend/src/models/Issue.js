import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class Issue {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS issues (
        id UUID PRIMARY KEY,
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'open',
        priority VARCHAR(50) DEFAULT 'medium',
        severity VARCHAR(50) DEFAULT 'medium',
        type VARCHAR(50) DEFAULT 'bug',
        tags TEXT[] DEFAULT '{}',
        sprint_id UUID,
        assignee_id UUID REFERENCES users(id),
        created_by UUID NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_issues_project ON issues(project_id);
      CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
      CREATE INDEX IF NOT EXISTS idx_issues_assignee ON issues(assignee_id);
      CREATE INDEX IF NOT EXISTS idx_issues_created_by ON issues(created_by);
    `;
    try {
      await pool.query(query);
      await pool.query(`ALTER TABLE issues ADD COLUMN IF NOT EXISTS severity VARCHAR(50) DEFAULT 'medium'`);
      await pool.query(`ALTER TABLE issues ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'bug'`);
      await pool.query(`ALTER TABLE issues ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'`);
      await pool.query(`ALTER TABLE issues ADD COLUMN IF NOT EXISTS sprint_id UUID`);
      await pool.query(`ALTER TABLE issues ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_issues_sprint ON issues(sprint_id)`);
      console.log('Issues table created successfully');
    } catch (error) {
      console.error('Error creating issues table:', error);
    }
  }

  static async create(projectId, title, description, priority, createdBy, extras = {}) {
    const id = uuidv4();
    const { severity = 'medium', type = 'bug', tags = [], sprint_id = null, assignee_id = null } = extras;
    const query = `
      INSERT INTO issues (id, project_id, title, description, priority, severity, type, tags, sprint_id, assignee_id, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, project_id, title, description, status, priority, severity, type, tags, sprint_id, assignee_id, created_by, created_at;
    `;
    const result = await pool.query(query, [
      id, projectId, title, description, priority, severity, type, tags, sprint_id, assignee_id, createdBy
    ]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT i.id, i.project_id, i.title, i.description, i.status, i.priority,
             i.severity, i.type, i.tags, i.sprint_id, i.assignee_id,
             i.created_by, i.created_at, i.updated_at,
             a.name AS assignee_name, a.email AS assignee_email,
             c.name AS created_by_name
      FROM issues i
      LEFT JOIN users a ON i.assignee_id = a.id
      LEFT JOIN users c ON i.created_by = c.id
      WHERE i.id = $1;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByProjectId(projectId, filters = {}) {
    let query = `
      SELECT i.id, i.project_id, i.title, i.description, i.status, i.priority,
             i.severity, i.type, i.tags, i.sprint_id, i.assignee_id,
             i.created_by, i.created_at, i.updated_at,
             a.name AS assignee_name, a.email AS assignee_email,
             c.name AS created_by_name
      FROM issues i
      LEFT JOIN users a ON i.assignee_id = a.id
      LEFT JOIN users c ON i.created_by = c.id
      WHERE i.project_id = $1
    `;
    const params = [projectId];
    let p = 2;

    if (filters.status)      { query += ` AND i.status = $${p++}`;      params.push(filters.status); }
    if (filters.priority)    { query += ` AND i.priority = $${p++}`;    params.push(filters.priority); }
    if (filters.severity)    { query += ` AND i.severity = $${p++}`;    params.push(filters.severity); }
    if (filters.type)        { query += ` AND i.type = $${p++}`;        params.push(filters.type); }
    if (filters.assignee_id) { query += ` AND i.assignee_id = $${p++}`; params.push(filters.assignee_id); }
    if (filters.sprint_id)   { query += ` AND i.sprint_id = $${p++}`;   params.push(filters.sprint_id); }

    query += ` ORDER BY i.created_at DESC LIMIT 200`;
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async update(id, updates) {
    const { title, description, status, priority, severity, type, tags, sprint_id, assignee_id } = updates;
    const query = `
      UPDATE issues SET
        title       = COALESCE($1,  title),
        description = COALESCE($2,  description),
        status      = COALESCE($3,  status),
        priority    = COALESCE($4,  priority),
        severity    = COALESCE($5,  severity),
        type        = COALESCE($6,  type),
        tags        = COALESCE($7,  tags),
        sprint_id   = COALESCE($8,  sprint_id),
        assignee_id = $9,
        updated_at  = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING id, project_id, title, description, status, priority, severity, type, tags,
                sprint_id, assignee_id, created_by, created_at, updated_at;
    `;
    const result = await pool.query(query, [
      title, description, status, priority, severity, type,
      tags !== undefined ? tags : null,
      sprint_id !== undefined ? sprint_id : null,
      assignee_id !== undefined ? assignee_id : null,
      id,
    ]);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query(`DELETE FROM issues WHERE id = $1 RETURNING id`, [id]);
    return result.rows[0];
  }
}

export default Issue;
