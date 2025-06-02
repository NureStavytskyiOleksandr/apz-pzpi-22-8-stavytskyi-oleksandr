const pool = require('../db');

class Parking {
  static async findAll() {
    const result = await pool.query('SELECT * FROM parkings');
    return result.rows;
  }

  static async findById(parking_id) {
    const result = await pool.query('SELECT * FROM parkings WHERE parking_id = $1', [parking_id]);
    return result.rows[0];
  }

  static async findAllForUser(user_id) {
    const query = `
      SELECT DISTINCT p.*
      FROM parkings p
      JOIN user_groups ug ON p.parking_id = ug.parking_id
      JOIN user_group_members ugm ON ug.group_id = ugm.group_id
      WHERE ugm.user_id = $1
    `;
    const result = await pool.query(query, [user_id]);
    return result.rows;
  }

  static async create({ name, address }) {
    const result = await pool.query(
      'INSERT INTO parkings (name, address) VALUES ($1, $2) RETURNING *',
      [name, address]
    );
    return result.rows[0];
  }

  static async update(parking_id, { name, address }) {
    const result = await pool.query(
      'UPDATE parkings SET name = $1, address = $2 WHERE parking_id = $3 RETURNING *',
      [name, address, parking_id]
    );
    return result.rows[0];
  }

  static async delete(parking_id) {
    const result = await pool.query(
      'DELETE FROM parkings WHERE parking_id = $1 RETURNING *',
      [parking_id]
    );
    return result.rows[0];
  }
}

module.exports = Parking;