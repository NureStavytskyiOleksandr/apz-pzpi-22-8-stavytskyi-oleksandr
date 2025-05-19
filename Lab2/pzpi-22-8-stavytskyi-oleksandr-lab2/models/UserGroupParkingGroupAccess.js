const pool = require('../db');

class UserGroupParkingGroupAccess {
  static async findAll() {
    const result = await pool.query('SELECT * FROM user_group_parking_group_access');
    return result.rows;
  }

  static async create({ group_id, parking_group_id }) {
    const result = await pool.query(
      'INSERT INTO user_group_parking_group_access (group_id, parking_group_id) VALUES ($1, $2) RETURNING *',
      [group_id, parking_group_id]
    );
    return result.rows[0];
  }

  static async delete(group_id, parking_group_id) {
    const result = await pool.query(
      'DELETE FROM user_group_parking_group_access WHERE group_id = $1 AND parking_group_id = $2 RETURNING *',
      [group_id, parking_group_id]
    );
    return result.rows[0];
  }
}

module.exports = UserGroupParkingGroupAccess;