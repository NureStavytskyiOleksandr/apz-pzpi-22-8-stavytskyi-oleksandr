const pool = require('../db');

class ParkingAdmin {
  static async findAll() {
    const result = await pool.query(
      'SELECT pa.*, u.email FROM parking_admins pa JOIN users u ON pa.user_id = u.user_id'
    );
    return result.rows;
  }

  static async findById(parking_admin_id) {
    const result = await pool.query(
      'SELECT pa.*, u.email FROM parking_admins pa JOIN users u ON pa.user_id = u.user_id WHERE pa.parking_admin_id = $1',
      [parking_admin_id]
    );
    return result.rows[0];
  }

  static async findByParkingId(parking_id) {
    const result = await pool.query(
      'SELECT pa.*, u.email FROM parking_admins pa JOIN users u ON pa.user_id = u.user_id WHERE pa.parking_id = $1',
      [parking_id]
    );
    return result.rows;
  }

  static async create({ user_id, parking_id }) {
    const userResult = await pool.query('SELECT role FROM users WHERE user_id = $1', [user_id]);
    const user = userResult.rows[0];
    if (!user || !['parking_admin', 'super_admin'].includes(user.role)) {
      throw new Error('User must have parking_admin or super_admin role');
    }

    const result = await pool.query(
      'INSERT INTO parking_admins (user_id, parking_id) VALUES ($1, $2) RETURNING *',
      [user_id, parking_id]
    );
    return result.rows[0];
  }

  static async update(parking_admin_id, { user_id, parking_id }) {
    const userResult = await pool.query('SELECT role FROM users WHERE user_id = $1', [user_id]);
    const user = userResult.rows[0];
    if (!user || !['parking_admin', 'super_admin'].includes(user.role)) {
      throw new Error('User must have parking_admin or super_admin role');
    }

    const result = await pool.query(
      'UPDATE parking_admins SET user_id = $1, parking_id = $2 WHERE parking_admin_id = $3 RETURNING *',
      [user_id, parking_id, parking_admin_id]
    );
    return result.rows[0];
  }

  static async delete(parking_admin_id) {
    const result = await pool.query(
      'DELETE FROM parking_admins WHERE parking_admin_id = $1 RETURNING *',
      [parking_admin_id]
    );
    return result.rows[0];
  }
}

module.exports = ParkingAdmin;