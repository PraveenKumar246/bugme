import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class Sprint {
  static async createTable() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sprints (
        id         UUID PRIMARY KEY,
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        name       VARCHAR(255) NOT NULL,
        goal       TEXT,
        start_date DATE,
        end_date   DATE,
        status     VARCHAR(50) DEFAULT 'planned',
        created_by UUID NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_sprints_project ON sprints(project_id);
    `);
    console.log('Sprints table created successfully');
  }

  static async create(projectId, { name, goal, start_date, end_date }, createdBy) {
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO sprints (id, project_id, name, goal, start_date, end_date, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [id, projectId, name, goal || null, start_date || null, end_date || null, createdBy]
    );
    return result.rows[0];
  }

  static async findByProjectId(projectId) {
    const result = await pool.query(
      `SELECT s.*,
              COUNT(i.id) AS issue_count,
              COUNT(CASE WHEN i.status = 'closed' THEN 1 END) AS closed_count
       FROM sprints s
       LEFT JOIN issues i ON i.sprint_id = s.id
       WHERE s.project_id = $1
       GROUP BY s.id
       ORDER BY s.created_at DESC`,
      [projectId]
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(`SELECT * FROM sprints WHERE id = $1`, [id]);
    return result.rows[0];
  }

  static async update(id, fields) {
    const { name, goal, start_date, end_date, status } = fields;
    const result = await pool.query(
      `UPDATE sprints SET
         name       = COALESCE($1, name),
         goal       = COALESCE($2, goal),
         start_date = COALESCE($3, start_date),
         end_date   = COALESCE($4, end_date),
         status     = COALESCE($5, status),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [name, goal, start_date, end_date, status, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query(`UPDATE issues SET sprint_id = NULL WHERE sprint_id = $1`, [id]);
    const result = await pool.query(`DELETE FROM sprints WHERE id = $1 RETURNING id`, [id]);
    return result.rows[0];
  }

  static async addIssue(sprintId, issueId) {
    await pool.query(`UPDATE issues SET sprint_id = $1 WHERE id = $2`, [sprintId, issueId]);
  }

  static async removeIssue(issueId) {
    await pool.query(`UPDATE issues SET sprint_id = NULL WHERE id = $1`, [issueId]);
  }
}

export default Sprint;
