const pool = require('../db');

class ParkingGroup {
  static async findAll() {
    const result = await pool.query('SELECT * FROM parking_groups');
    return result.rows;
  }

  static async findById(parking_group_id) {
    const result = await pool.query('SELECT * FROM parking_groups WHERE parking_group_id = $1', [parking_group_id]);
    return result.rows[0];
  }

  static async create({ parking_id, group_name, description }) {
    const result = await pool.query(
      'INSERT INTO parking_groups (parking_id, group_name, description) VALUES ($1, $2, $3) RETURNING *',
      [parking_id, group_name, description]
    );
    return result.rows[0];
  }

  static async update(parking_group_id, { parking_id, group_name, description }) {
    const result = await pool.query(
      'UPDATE parking_groups SET parking_id = $1, group_name = $2, description = $3 WHERE parking_group_id = $4 RETURNING *',
      [parking_id, group_name, description, parking_group_id]
    );
    return result.rows[0];
  }

  static async delete(parking_group_id) {
    const result = await pool.query(
      'DELETE FROM parking_groups WHERE parking_group_id = $1 RETURNING *',
      [parking_group_id]
    );
    return result.rows[0];
  }
}

module.exports = ParkingGroup;