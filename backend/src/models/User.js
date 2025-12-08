import pool from '../config/database.js';

class User {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    `;

    try {
      await pool.query(query);
      console.log('✓ Users table created or already exists');
    } catch (error) {
      console.error('Error creating users table:', error);
      throw error;
    }
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';

    try {
      const result = await pool.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = $1';

    try {
      const result = await pool.query(query, [username]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }

  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by id:', error);
      throw error;
    }
  }

  static async create({ username, email, password_hash, role = 'user' }) {
    const query = `
      INSERT INTO users (username, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, email, role, created_at
    `;

    try {
      const result = await pool.query(query, [username, email, password_hash, role]);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async update(id, updates) {
    const allowedFields = ['username', 'email', 'password_hash', 'role'];
    const fields = Object.keys(updates).filter(key => allowedFields.includes(key));

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    const setClause = fields.map((field, idx) => `${field} = $${idx + 2}`).join(', ');
    const query = `
      UPDATE users
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, username, email, role, updated_at
    `;

    try {
      const values = [id, ...fields.map(field => updates[field])];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}

export default User;
