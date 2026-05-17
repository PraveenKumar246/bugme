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
      console.log('Issues table created successfully');
    } catch (error) {
      console.error('Error creating issues table:', error);
    }
  }

  static async create(projectId, title, description, priority, createdBy) {
    const id = uuidv4();
    
    const query = `
      INSERT INTO issues (id, project_id, title, description, priority, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, project_id, title, description, status, priority, assignee_id, created_by, created_at;
    `;
    
    try {
      const result = await pool.query(query, [id, projectId, title, description, priority, createdBy]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating issue: ${error.message}`);
    }
  }

  static async findById(id) {
    const query = `
      SELECT id, project_id, title, description, status, priority, assignee_id, created_by, created_at, updated_at
      FROM issues WHERE id = $1;
    `;
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding issue: ${error.message}`);
    }
  }

  static async findByProjectId(projectId, filters = {}) {
    let query = `
      SELECT id, project_id, title, description, status, priority, assignee_id, created_by, created_at, updated_at
      FROM issues WHERE project_id = $1
    `;
    const params = [projectId];
    let paramCount = 2;

    if (filters.status) {
      query += ` AND status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.priority) {
      query += ` AND priority = $${paramCount}`;
      params.push(filters.priority);
      paramCount++;
    }

    if (filters.assignee_id) {
      query += ` AND assignee_id = $${paramCount}`;
      params.push(filters.assignee_id);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT 100`;
    
    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding issues: ${error.message}`);
    }
  }

  static async update(id, updates) {
    const { title, description, status, priority, assignee_id } = updates;
    
    const query = `
      UPDATE issues
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        priority = COALESCE($4, priority),
        assignee_id = COALESCE($5, assignee_id),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING id, project_id, title, description, status, priority, assignee_id, created_by, created_at, updated_at;
    `;
    
    try {
      const result = await pool.query(query, [title, description, status, priority, assignee_id, id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating issue: ${error.message}`);
    }
  }

  static async delete(id) {
    const query = `
      DELETE FROM issues WHERE id = $1
      RETURNING id;
    `;
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting issue: ${error.message}`);
    }
  }
}

export default Issue;
