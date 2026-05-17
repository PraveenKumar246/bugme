import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

class User {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        avatar_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `;
    try {
      await pool.query(query);
      console.log('Users table created successfully');
    } catch (error) {
      console.error('Error creating users table:', error);
    }
  }

  static async create(email, password, name) {
    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `
      INSERT INTO users (id, email, password, name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, name, avatar_url, created_at;
    `;
    
    try {
      const result = await pool.query(query, [id, email, hashedPassword, name]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  static async findById(id) {
    const query = `
      SELECT id, email, name, avatar_url, created_at, updated_at
      FROM users WHERE id = $1;
    `;
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  }

  static async findByEmail(email) {
    const query = `
      SELECT id, email, password, name, avatar_url, created_at, updated_at
      FROM users WHERE email = $1;
    `;
    
    try {
      const result = await pool.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

export default User;
