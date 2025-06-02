const express = require('express');
const router = express.Router();
const ParkingAdmin = require('../models/ParkingAdmin');
const restrictTo = require('../middleware/restrictTo');

router.get('/', restrictTo('super_admin'), async (req, res) => {
  try {
    const admins = await ParkingAdmin.findAll();
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch parking admins' });
  }
});

router.get('/:id', restrictTo('super_admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const admin = await ParkingAdmin.findById(id);
    if (!admin) return res.status(404).json({ error: 'Parking admin not found' });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch parking admin' });
  }
});

router.get('/manage/:parking_id', restrictTo('parking_admin', 'super_admin'), async (req, res) => {
  const { parking_id } = req.params;
  try {
    const admins = await ParkingAdmin.findByParkingId(parking_id);
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch parking admins for parking' });
  }
});

// Новий маршрут для отримання парковок конкретного користувача
router.get('/user/:userId', restrictTo('parking_admin', 'super_admin'), async (req, res) => {
  const { userId } = req.params;
  try {
    const admins = await ParkingAdmin.findAll();
    const userAdmins = admins.filter(pa => pa.user_id === parseInt(userId));
    res.json(userAdmins);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch parking admins for user' });
  }
});

router.post('/', restrictTo('super_admin'), async (req, res) => {
  try {
    const admin = await ParkingAdmin.create(req.body);
    res.status(201).json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to create parking admin' });
  }
});

router.put('/:id', restrictTo('super_admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const admin = await ParkingAdmin.update(id, req.body);
    if (!admin) return res.status(404).json({ error: 'Parking admin not found' });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to update parking admin' });
  }
});

router.delete('/:id', restrictTo('super_admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const admin = await ParkingAdmin.delete(id);
    if (!admin) return res.status(404).json({ error: 'Parking admin not found' });
    res.json({ message: 'Parking admin deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete parking admin' });
  }
});

module.exports = router;