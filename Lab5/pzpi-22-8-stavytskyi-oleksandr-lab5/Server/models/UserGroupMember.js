// models/UserGroupMember.js
const pool = require('../db');

class UserGroupMember {
  static async findAll() {
    const result = await pool.query('SELECT * FROM user_group_members');
    return result.rows;
  }

  static async findByUserId(user_id) {
    const result = await pool.query('SELECT * FROM user_group_members WHERE user_id = $1', [user_id]);
    return result.rows;
  }

  static async findByGroupId(group_id) {
    const result = await pool.query('SELECT * FROM user_group_members WHERE group_id = $1', [group_id]);
    return result.rows;
  }

  static async create({ user_id, group_id }) {
    const result = await pool.query(
      'INSERT INTO user_group_members (user_id, group_id) VALUES ($1, $2) RETURNING *',
      [user_id, group_id]
    );
    return result.rows[0];
  }

  static async delete(user_id, group_id) {
    const result = await pool.query(
      'DELETE FROM user_group_members WHERE user_id = $1 AND group_id = $2 RETURNING *',
      [user_id, group_id]
    );
    return result.rows[0];
  }
}

module.exports = UserGroupMember;