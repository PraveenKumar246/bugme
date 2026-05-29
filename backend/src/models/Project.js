import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class Project {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        owner_id UUID NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
    `;
    try {
      await pool.query(query);
      await pool.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS team_id UUID`);
      await pool.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS platform VARCHAR(50) DEFAULT 'desktop_web'`);
      console.log('Projects table created successfully');
    } catch (error) {
      console.error('Error creating projects table:', error);
    }
  }

  static async create(name, description, ownerId, teamId, platform) {
    const id = uuidv4();
    const query = `
      INSERT INTO projects (id, name, description, owner_id, team_id, platform)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, description, owner_id, team_id, platform, created_at;
    `;
    try {
      const result = await pool.query(query, [
        id, name, description, ownerId,
        teamId || null,
        platform || 'desktop_web',
      ]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating project: ${error.message}`);
    }
  }

  static async findById(id) {
    const query = `
      SELECT id, name, description, owner_id, created_at, updated_at
      FROM projects WHERE id = $1;
    `;
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding project: ${error.message}`);
    }
  }

  static async createFavoritesTable() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_favorites (
        user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, project_id)
      );
    `);
  }

  static async toggleFavorite(userId, projectId) {
    const existing = await pool.query(
      `SELECT 1 FROM project_favorites WHERE user_id = $1 AND project_id = $2`,
      [userId, projectId]
    );
    if (existing.rows.length > 0) {
      await pool.query(
        `DELETE FROM project_favorites WHERE user_id = $1 AND project_id = $2`,
        [userId, projectId]
      );
      return false;
    } else {
      await pool.query(
        `INSERT INTO project_favorites (user_id, project_id) VALUES ($1, $2)`,
        [userId, projectId]
      );
      return true;
    }
  }

  static async findByOwnerId(ownerId) {
    const query = `
      SELECT p.id, p.name, p.description, p.owner_id, p.team_id, p.platform,
             p.created_at, p.updated_at,
             t.name as team_name,
             COUNT(i.id) FILTER (WHERE i.status != 'closed') AS open_issues,
             COUNT(i.id) FILTER (WHERE i.status = 'closed') AS closed_issues,
             COUNT(i.id) AS total_issues,
             CASE WHEN f.user_id IS NOT NULL THEN true ELSE false END AS is_favorite
      FROM projects p
      LEFT JOIN issues i ON p.id = i.project_id
      LEFT JOIN teams t ON p.team_id = t.id
      LEFT JOIN project_favorites f ON p.id = f.project_id AND f.user_id = $1
      WHERE p.owner_id = $1
      GROUP BY p.id, t.name, f.user_id
      ORDER BY p.created_at DESC;
    `;

    try {
      const result = await pool.query(query, [ownerId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding projects: ${error.message}`);
    }
  }

  static async update(id, name, description, platform) {
    const query = `
      UPDATE projects
      SET name = $1, description = $2, platform = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, name, description, platform, owner_id, created_at, updated_at;
    `;

    try {
      const result = await pool.query(query, [name, description, platform, id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating project: ${error.message}`);
    }
  }

  static async delete(id) {
    const query = `
      DELETE FROM projects WHERE id = $1
      RETURNING id;
    `;
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting project: ${error.message}`);
    }
  }
}

export default Project;
