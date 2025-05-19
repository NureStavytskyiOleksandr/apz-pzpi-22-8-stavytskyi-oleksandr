const express = require('express');
const router = express.Router();
const ParkingHistory = require('../models/ParkingHistory');
const restrictTo = require('../middleware/restrictTo');

router.get('/:parking_id/occupancy', restrictTo('super_admin', 'parking_admin'), async (req, res) => {
  const { parking_id } = req.params;
  const { start_time, end_time } = req.query;

  try {
    const history = await ParkingHistory.findByParkingId(parking_id, start_time, end_time);

    const totalRecords = history.length;
    const occupiedRecords = history.filter(record => record.is_occupied).length;
    const occupancyRate = totalRecords > 0 ? (occupiedRecords / totalRecords) * 100 : 0;

    res.json({ occupancy_rate: occupancyRate.toFixed(2) + '%' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate occupancy rate' });
  }
});

router.get('/:parking_id/average-duration', restrictTo('super_admin', 'parking_admin'), async (req, res) => {
  const { parking_id } = req.params;
  const { start_time, end_time } = req.query;

  try {
    const history = await ParkingHistory.findByParkingId(parking_id, start_time, end_time);
    const durations = history.filter(record => record.duration_seconds).map(record => record.duration_seconds);

    const averageDuration = durations.length > 0
      ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length
      : 0;

    res.json({ average_duration_seconds: averageDuration.toFixed(2) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate average duration' });
  }
});

module.exports = router;