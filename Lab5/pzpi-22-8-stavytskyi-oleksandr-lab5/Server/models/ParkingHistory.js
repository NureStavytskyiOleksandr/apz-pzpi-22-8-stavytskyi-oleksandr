const pool = require('../db');

class ParkingHistory {
  static async create({ spot_id, device_uuid, is_occupied, duration_seconds }) {
    const result = await pool.query(
      'INSERT INTO parking_history (spot_id, device_uuid, is_occupied, duration_seconds) VALUES ($1, $2, $3, $4) RETURNING *',
      [spot_id, device_uuid, is_occupied, duration_seconds || null]
    );
    return result.rows[0];
  }

  static async findBySpotId(spot_id) {
    const result = await pool.query(
      'SELECT * FROM parking_history WHERE spot_id = $1 ORDER BY timestamp DESC',
      [spot_id]
    );
    return result.rows;
  }

  static async findByParkingId(parking_id, start_time, end_time) {
    const result = await pool.query(
      'SELECT ph.* FROM parking_history ph JOIN parking_spots ps ON ph.spot_id = ps.spot_id JOIN parking_groups pg ON ps.parking_group_id = pg.parking_group_id WHERE pg.parking_id = $1 AND ph.timestamp BETWEEN $2 AND $3 ORDER BY ph.timestamp DESC',
      [parking_id, start_time, end_time]
    );
    return result.rows;
  }
}

module.exports = ParkingHistory;