const pool = require('../db');

class ParkingSpot {
  static async findAll() {
    const result = await pool.query('SELECT * FROM parking_spots');
    return result.rows;
  }

  static async findById(spot_id) {
    const result = await pool.query('SELECT * FROM parking_spots WHERE spot_id = $1', [spot_id]);
    return result.rows[0];
  }

  static async findAllForUser(user_id) {
    const query = `
      SELECT DISTINCT ps.*
      FROM parking_spots ps
      JOIN parking_groups pg ON ps.parking_group_id = pg.parking_group_id
      JOIN user_group_parking_group_access ugpga ON pg.parking_group_id = ugpga.parking_group_id
      JOIN user_group_members ugm ON ugpga.group_id = ugm.group_id
      WHERE ugm.user_id = $1
    `;
    const result = await pool.query(query, [user_id]);
    return result.rows;
  }

  static async findAvailableForUser(user_id) {
    const query = `
      SELECT DISTINCT ps.*
      FROM parking_spots ps
      JOIN parking_groups pg ON ps.parking_group_id = pg.parking_group_id
      JOIN user_group_parking_group_access ugpga ON pg.parking_group_id = ugpga.parking_group_id
      JOIN user_group_members ugm ON ugpga.group_id = ugm.group_id
      WHERE ugm.user_id = $1 AND ps.is_occupied = false
    `;
    const result = await pool.query(query, [user_id]);
    return result.rows;
  }

  static async create({ parking_group_id, spot_number }) {
    const result = await pool.query(
      'INSERT INTO parking_spots (parking_group_id, spot_number) VALUES ($1, $2) RETURNING *',
      [parking_group_id, spot_number]
    );
    return result.rows[0];
  }

  static async update(spot_id, { parking_group_id, spot_number, is_occupied }) {
    const result = await pool.query(
      'UPDATE parking_spots SET parking_group_id = $1, spot_number = $2, is_occupied = $3 WHERE spot_id = $4 RETURNING *',
      [parking_group_id, spot_number, is_occupied, spot_id]
    );
    return result.rows[0];
  }

  static async delete(spot_id) {
    const result = await pool.query(
      'DELETE FROM parking_spots WHERE spot_id = $1 RETURNING *',
      [spot_id]
    );
    return result.rows[0];
  }
}

module.exports = ParkingSpot;