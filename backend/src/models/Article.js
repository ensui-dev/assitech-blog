import pool from '../config/database.js';

class Article {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        summary TEXT,
        image_url TEXT,
        author VARCHAR(100) DEFAULT 'AI Writer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
    `;

    try {
      await pool.query(query);
      console.log('✓ Articles table created or already exists');
    } catch (error) {
      console.error('Error creating articles table:', error);
      throw error;
    }
  }

  static async getAll() {
    const query = 'SELECT * FROM articles ORDER BY created_at DESC';
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching all articles:', error);
      throw error;
    }
  }

  static async getById(id) {
    const query = 'SELECT * FROM articles WHERE id = $1';
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching article by id:', error);
      throw error;
    }
  }

  static async create({ title, content, summary, image_url, author = 'AI Writer' }) {
    const query = `
      INSERT INTO articles (title, content, summary, image_url, author)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [title, content, summary, image_url, author]);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating article:', error);
      throw error;
    }
  }

  static async count() {
    const query = 'SELECT COUNT(*) as count FROM articles';
    try {
      const result = await pool.query(query);
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      console.error('Error counting articles:', error);
      throw error;
    }
  }

  static async update(id, updates) {
    const allowedFields = ['title', 'content', 'summary', 'image_url', 'author'];
    const fields = Object.keys(updates).filter(key => allowedFields.includes(key));

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    const setClause = fields.map((field, idx) => `${field} = $${idx + 2}`).join(', ');
    const query = `
      UPDATE articles
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    try {
      const values = [id, ...fields.map(field => updates[field])];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating article:', error);
      throw error;
    }
  }

  static async delete(id) {
    const query = 'DELETE FROM articles WHERE id = $1 RETURNING id';

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting article:', error);
      throw error;
    }
  }
}

export default Article;
