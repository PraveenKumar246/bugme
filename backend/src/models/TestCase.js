import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class TestCase {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS test_cases (
        id UUID PRIMARY KEY,
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        steps JSONB DEFAULT '[]',
        expected_result TEXT,
        created_by UUID NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_test_cases_project ON test_cases(project_id);
      CREATE INDEX IF NOT EXISTS idx_test_cases_created_by ON test_cases(created_by);
    `;
    try {
      await pool.query(query);
      console.log('Test Cases table created successfully');
    } catch (error) {
      console.error('Error creating test_cases table:', error);
    }
  }

  static async create(projectId, title, description, steps, expectedResult, createdBy) {
    const id = uuidv4();
    
    const query = `
      INSERT INTO test_cases (id, project_id, title, description, steps, expected_result, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, project_id, title, description, steps, expected_result, created_by, created_at;
    `;
    
    try {
      const result = await pool.query(query, [id, projectId, title, description, JSON.stringify(steps), expectedResult, createdBy]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating test case: ${error.message}`);
    }
  }

  static async findById(id) {
    const query = `
      SELECT id, project_id, title, description, steps, expected_result, created_by, created_at, updated_at
      FROM test_cases WHERE id = $1;
    `;
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding test case: ${error.message}`);
    }
  }

  static async findByProjectId(projectId) {
    const query = `
      SELECT id, project_id, title, description, steps, expected_result, created_by, created_at, updated_at
      FROM test_cases WHERE project_id = $1
      ORDER BY created_at DESC;
    `;
    
    try {
      const result = await pool.query(query, [projectId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding test cases: ${error.message}`);
    }
  }

  static async update(id, title, description, steps, expectedResult) {
    const query = `
      UPDATE test_cases
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        steps = COALESCE($3, steps),
        expected_result = COALESCE($4, expected_result),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING id, project_id, title, description, steps, expected_result, created_by, created_at, updated_at;
    `;
    
    try {
      const result = await pool.query(query, [title, description, JSON.stringify(steps), expectedResult, id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating test case: ${error.message}`);
    }
  }

  static async delete(id) {
    const query = `
      DELETE FROM test_cases WHERE id = $1
      RETURNING id;
    `;
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting test case: ${error.message}`);
    }
  }
}

export default TestCase;
