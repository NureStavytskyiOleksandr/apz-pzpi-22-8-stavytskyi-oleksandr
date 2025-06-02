const pool = require('../db');

class IoTDevice {
  static async findAll(user_id) {
    const result = await pool.query(
      'SELECT iod.* FROM iot_devices iod JOIN parking_spots ps ON iod.spot_id = ps.spot_id JOIN parking_groups pg ON ps.parking_group_id = pg.parking_group_id JOIN parkings p ON pg.parking_id = p.parking_id JOIN parking_admins pa ON p.parking_id = pa.parking_id WHERE pa.user_id = $1',
      [user_id]
    );
    return result.rows;
  }

  static async findById(id, user_id) {
    const result = await pool.query(
      'SELECT iod.* FROM iot_devices iod JOIN parking_spots ps ON iod.spot_id = ps.spot_id JOIN parking_groups pg ON ps.parking_group_id = pg.parking_group_id JOIN parkings p ON pg.parking_id = p.parking_id JOIN parking_admins pa ON p.parking_id = pa.parking_id WHERE iod.device_id = $1 AND pa.user_id = $2',
      [id, user_id]
    );
    return result.rows[0];
  }

  static async create({ device_uuid, spot_id }) {
    const result = await pool.query(
      'INSERT INTO iot_devices (device_uuid, spot_id) VALUES ($1, $2) RETURNING *',
      [device_uuid, spot_id]
    );
    return result.rows[0];
  }

  static async update(id, { device_uuid, spot_id, user_id }) {
    const result = await pool.query(
      'UPDATE iot_devices SET device_uuid = $1, spot_id = $2 WHERE device_id = $3 AND EXISTS (SELECT 1 FROM parking_spots ps JOIN parking_groups pg ON ps.parking_group_id = pg.parking_group_id JOIN parkings p ON pg.parking_id = p.parking_id JOIN parking_admins pa ON p.parking_id = pa.parking_id WHERE ps.spot_id = $2 AND pa.user_id = $4) RETURNING *',
      [device_uuid, spot_id, id, user_id]
    );
    return result.rows[0];
  }

  static async delete(id, user_id) {
    const result = await pool.query(
      'DELETE FROM iot_devices WHERE device_id = $1 AND EXISTS (SELECT 1 FROM parking_spots ps JOIN parking_groups pg ON ps.parking_group_id = pg.parking_group_id JOIN parkings p ON pg.parking_id = p.parking_id JOIN parking_admins pa ON p.parking_id = pa.parking_id WHERE ps.spot_id = (SELECT spot_id FROM iot_devices WHERE device_id = $1) AND pa.user_id = $2) RETURNING *',
      [id, user_id]
    );
    return result.rows[0];
  }

  static async updateStatus({ device_uuid, occupied }) {
    const result = await pool.query(
      'UPDATE parking_spots ps SET is_occupied = $1 FROM iot_devices iod WHERE ps.spot_id = iod.spot_id AND iod.device_uuid = $2 RETURNING ps.*',
      [occupied, device_uuid]
    );
    return result.rows[0];
  }
}

module.exports = IoTDevice;