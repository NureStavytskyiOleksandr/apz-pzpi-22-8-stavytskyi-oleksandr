const pool = require('../db');

class UserGroup {
  static async findAll() {
    const result = await pool.query('SELECT * FROM user_groups');
    return result.rows;
  }

  static async findById(group_id) {
    const result = await pool.query('SELECT * FROM user_groups WHERE group_id = $1', [group_id]);
    return result.rows[0];
  }

  static async findByParkingId(parking_id) {
    const result = await pool.query('SELECT * FROM user_groups WHERE parking_id = $1', [parking_id]);
    return result.rows;
  }
  
  static async create({ group_name, description, parking_id}) {
    const result = await pool.query(
      'INSERT INTO user_groups (group_name, description, parking_id) VALUES ($1, $2, $3) RETURNING *',
      [group_name, description, parking_id]
    );
    return result.rows[0];
  }

  static async update(group_id, { group_name, description, parking_id}) {
    const result = await pool.query(
      'UPDATE user_groups SET group_name = $1, description = $2, parking_id = $3 WHERE group_id = $4 RETURNING *',
      [group_name, description, parking_id, group_id]
    );
    return result.rows[0];
  }

  static async delete(group_id) {
    const result = await pool.query(
      'DELETE FROM user_groups WHERE group_id = $1 RETURNING *',
      [group_id]
    );
    return result.rows[0];
  }

}

module.exports = UserGroup;