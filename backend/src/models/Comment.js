import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class Comment {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS comments (
        id UUID PRIMARY KEY,
        issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
        author_id UUID NOT NULL REFERENCES users(id),
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_comments_issue ON comments(issue_id);
      CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
    `;
    try {
      await pool.query(query);
      console.log('Comments table created successfully');
    } catch (error) {
      console.error('Error creating comments table:', error);
    }
  }

  static async create(issueId, authorId, text) {
    const id = uuidv4();
    
    const query = `
      INSERT INTO comments (id, issue_id, author_id, text)
      VALUES ($1, $2, $3, $4)
      RETURNING id, issue_id, author_id, text, created_at;
    `;
    
    try {
      const result = await pool.query(query, [id, issueId, authorId, text]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating comment: ${error.message}`);
    }
  }

  static async findByIssueId(issueId) {
    const query = `
      SELECT c.id, c.issue_id, c.author_id, c.text, c.created_at, u.name, u.email
      FROM comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.issue_id = $1
      ORDER BY c.created_at ASC;
    `;
    
    try {
      const result = await pool.query(query, [issueId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding comments: ${error.message}`);
    }
  }

  static async update(id, text) {
    const query = `
      UPDATE comments
      SET text = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, issue_id, author_id, text, created_at, updated_at;
    `;
    
    try {
      const result = await pool.query(query, [text, id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating comment: ${error.message}`);
    }
  }

  static async delete(id) {
    const query = `
      DELETE FROM comments WHERE id = $1
      RETURNING id;
    `;
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting comment: ${error.message}`);
    }
  }
}

export default Comment;
