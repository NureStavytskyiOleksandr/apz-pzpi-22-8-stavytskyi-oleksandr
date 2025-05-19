const pool = require('../db');
const bcrypt = require('bcryptjs');

class User {
  static async findAll() {
    const result = await pool.query('SELECT * FROM users');
    return result.rows;
  }

  static async findById(user_id) {
    const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [user_id]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async create({ username, email, password, role }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, email, hashedPassword, role || 'user']
    );
    return result.rows[0];
  }

  static async update(user_id, { username, email, password, role }) {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
    const result = await pool.query(
      'UPDATE users SET username = $1, email = $2, password = COALESCE($3, password), role = $4 WHERE user_id = $5 RETURNING *',
      [username, email, hashedPassword, role, user_id]
    );
    return result.rows[0];
  }

  static async delete(user_id) {
    const result = await pool.query(
      'DELETE FROM users WHERE user_id = $1 RETURNING *',
      [user_id]
    );
    return result.rows[0];
  }
}

module.exports = User;
