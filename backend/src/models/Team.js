import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class Team {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS teams (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS team_members (
        team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (team_id, user_id)
      );
      CREATE TABLE IF NOT EXISTS team_invitations (
        id UUID PRIMARY KEY,
        team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        invited_by UUID REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(token);
      CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
    `;
    try {
      await pool.query(query);
      console.log('Teams tables created successfully');
    } catch (error) {
      console.error('Error creating teams tables:', error);
    }
  }

  static async create(name, description, ownerId) {
    const id = uuidv4();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(
        `INSERT INTO teams (id, name, description, owner_id) VALUES ($1, $2, $3, $4) RETURNING *`,
        [id, name, description, ownerId]
      );
      await client.query(
        `INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, 'owner')`,
        [id, ownerId]
      );
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`Error creating team: ${error.message}`);
    } finally {
      client.release();
    }
  }

  static async findByUser(userId) {
    const query = `
      SELECT t.*, u.name as owner_name, u.email as owner_email,
             COUNT(tm2.user_id) as member_count
      FROM teams t
      JOIN team_members tm ON t.id = tm.team_id AND tm.user_id = $1
      JOIN users u ON t.owner_id = u.id
      LEFT JOIN team_members tm2 ON t.id = tm2.team_id
      GROUP BY t.id, u.name, u.email
      ORDER BY t.created_at DESC;
    `;
    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding teams: ${error.message}`);
    }
  }

  static async getMembers(teamId) {
    const query = `
      SELECT u.id, u.name, u.email, u.avatar_url, tm.role, tm.joined_at
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
      WHERE tm.team_id = $1
      ORDER BY CASE WHEN tm.role = 'owner' THEN 0 ELSE 1 END, tm.joined_at ASC;
    `;
    try {
      const result = await pool.query(query, [teamId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding team members: ${error.message}`);
    }
  }

  static async delete(id, ownerId) {
    try {
      const result = await pool.query(
        `DELETE FROM teams WHERE id = $1 AND owner_id = $2 RETURNING *`,
        [id, ownerId]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting team: ${error.message}`);
    }
  }

  // ── Invitation methods ────────────────────────────────────────────────────

  static async createInvitation(teamId, email, invitedById) {
    const teamRes = await pool.query('SELECT * FROM teams WHERE id = $1', [teamId]);
    if (!teamRes.rows[0]) throw new Error('Team not found');
    if (teamRes.rows[0].owner_id !== invitedById) throw new Error('Unauthorized');

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    // Cancel any existing pending invite for this email+team
    await pool.query(
      `DELETE FROM team_invitations WHERE team_id = $1 AND email = $2 AND status = 'pending'`,
      [teamId, email.toLowerCase()]
    );

    const result = await pool.query(
      `INSERT INTO team_invitations (id, team_id, email, invited_by, token, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [uuidv4(), teamId, email.toLowerCase(), invitedById, token, expiresAt]
    );

    return { ...result.rows[0], team: teamRes.rows[0] };
  }

  static async getInvitation(token) {
    const result = await pool.query(
      `SELECT i.*, t.name as team_name, u.name as inviter_name, u.email as inviter_email
       FROM team_invitations i
       JOIN teams t ON i.team_id = t.id
       JOIN users u ON i.invited_by = u.id
       WHERE i.token = $1`,
      [token]
    );
    return result.rows[0] || null;
  }

  static async removeMember(teamId, userId, requesterId) {
    const { rows } = await pool.query('SELECT * FROM teams WHERE id = $1', [teamId]);
    if (!rows[0]) throw new Error('Team not found');

    const isSelf        = userId === requesterId;
    const requesterIsOwner = rows[0].owner_id === requesterId;
    const targetIsOwner    = rows[0].owner_id === userId;

    if (targetIsOwner) throw new Error('Cannot remove the team owner');
    if (!isSelf && !requesterIsOwner) throw new Error('Unauthorized');

    await pool.query(
      'DELETE FROM team_members WHERE team_id = $1 AND user_id = $2',
      [teamId, userId]
    );
    return isSelf ? 'Left team' : 'Member removed';
  }

  static async acceptInvitation(token, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const inv = await client.query(
        `SELECT * FROM team_invitations WHERE token = $1 AND status = 'pending' AND expires_at > NOW()`,
        [token]
      );
      if (!inv.rows[0]) throw new Error('Invalid or expired invitation');

      const { team_id, id: invId } = inv.rows[0];

      // Add to team (idempotent)
      await client.query(
        `INSERT INTO team_members (team_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [team_id, userId]
      );

      // Mark accepted
      await client.query(
        `UPDATE team_invitations SET status = 'accepted' WHERE id = $1`,
        [invId]
      );

      await client.query('COMMIT');
      return team_id;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default Team;
