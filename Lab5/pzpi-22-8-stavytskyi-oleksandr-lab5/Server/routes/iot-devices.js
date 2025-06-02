const express = require('express');
const router = express.Router();
const IoTDevice = require('../models/IoTDevice');
const restrictTo = require('../middleware/restrictTo');

router.get('/', restrictTo('parking_admin', 'super_admin'), async (req, res) => {
  try {
    const devices = await IoTDevice.findAll(req.user.user_id);
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch IoT devices' });
  }
});

router.get('/:id', restrictTo('parking_admin', 'super_admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const device = await IoTDevice.findById(id, req.user.user_id);
    if (!device) return res.status(404).json({ error: 'IoT device not found' });
    res.json(device);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch IoT device' });
  }
});

router.post('/', restrictTo('parking_admin', 'super_admin'), async (req, res) => {
  try {
    const device = await IoTDevice.create(req.body);
    res.status(201).json(device);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create IoT device' });
  }
});

router.put('/:id', restrictTo('parking_admin', 'super_admin'), async (req, res) => {
  const { id } = req.params;
  const { device_uuid, spot_id } = req.body;
  try {
    const device = await IoTDevice.update(id, { device_uuid, spot_id, user_id: req.user.user_id });
    if (!device) return res.status(404).json({ error: 'IoT device not found or no access to parking spot' });
    res.json(device);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update IoT device' });
  }
});

router.delete('/:id', restrictTo('parking_admin', 'super_admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const device = await IoTDevice.delete(id, req.user.user_id);
    if (!device) return res.status(404).json({ error: 'IoT device not found or no access to parking spot' });
    res.json({ message: 'IoT device deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete IoT device' });
  }
});

module.exports = router;