import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

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

  static async updateProfile(id, { name, avatar_url }) {
    const query = `
      UPDATE users
      SET name = COALESCE($1, name),
          avatar_url = COALESCE($2, avatar_url),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, email, name, avatar_url, created_at, updated_at;
    `;
    try {
      const result = await pool.query(query, [name || null, avatar_url || null, id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating profile: ${error.message}`);
    }
  }

  static async updatePassword(id, newPassword) {
    const hashed = await bcrypt.hash(newPassword, 10);
    const query = `
      UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 RETURNING id;
    `;
    try {
      const result = await pool.query(query, [hashed, id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating password: ${error.message}`);
    }
  }

  // ── Password-reset tokens ──

  static async createPasswordResetTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(128) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_prt_token ON password_reset_tokens(token);
    `;
    try {
      await pool.query(query);
      console.log('Password reset tokens table created successfully');
    } catch (error) {
      console.error('Error creating password_reset_tokens table:', error);
    }
  }

  static async createPasswordResetToken(userId) {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    const id = uuidv4();
    const query = `
      INSERT INTO password_reset_tokens (id, user_id, token, expires_at)
      VALUES ($1, $2, $3, $4) RETURNING token;
    `;
    try {
      const result = await pool.query(query, [id, userId, token, expiresAt]);
      return result.rows[0].token;
    } catch (error) {
      throw new Error(`Error creating reset token: ${error.message}`);
    }
  }

  static async findPasswordResetToken(token) {
    const query = `
      SELECT prt.*, u.id as user_id, u.email
      FROM password_reset_tokens prt
      JOIN users u ON u.id = prt.user_id
      WHERE prt.token = $1
        AND prt.used = FALSE
        AND prt.expires_at > NOW();
    `;
    try {
      const result = await pool.query(query, [token]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding reset token: ${error.message}`);
    }
  }

  static async markResetTokenUsed(token) {
    const query = `UPDATE password_reset_tokens SET used = TRUE WHERE token = $1;`;
    try {
      await pool.query(query, [token]);
    } catch (error) {
      throw new Error(`Error marking token used: ${error.message}`);
    }
  }
}

export default User;
