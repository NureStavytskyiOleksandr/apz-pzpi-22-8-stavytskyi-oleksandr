const express = require('express');
const router = express.Router();
const ParkingSpot = require('../models/ParkingSpot');
const restrictTo = require('../middleware/restrictTo');

router.get('/', async (req, res) => {
  try {
    const spots = await ParkingSpot.findAll();
    res.json(spots);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch parking spots' });
  }
});

router.get('/for-user', restrictTo('user', 'parking_admin', 'super_admin'), async (req, res) => {
  const user_id = req.user.user_id;
  try {
    const spots = await ParkingSpot.findAllForUser(user_id);
    res.json(spots);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch parking spots for user' });
  }
});

router.get('/available-for-user', restrictTo('user', 'parking_admin', 'super_admin'), async (req, res) => {
  const user_id = req.user.user_id;
  try {
    const spots = await ParkingSpot.findAvailableForUser(user_id);
    res.json(spots);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch available parking spots for user' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const spot = await ParkingSpot.findById(id);
    if (!spot) return res.status(404).json({ error: 'Parking spot not found' });
    res.json(spot);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch parking spot' });
  }
});

router.post('/', restrictTo('super_admin', 'parking_admin'), async (req, res) => {
  try {
    const spot = await ParkingSpot.create(req.body);
    res.status(201).json(spot);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create parking spot' });
  }
});

router.put('/:id', restrictTo('super_admin', 'parking_admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const spot = await ParkingSpot.update(id, req.body);
    if (!spot) return res.status(404).json({ error: 'Parking spot not found' });
    res.json(spot);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update parking spot' });
  }
});

router.delete('/:id', restrictTo('super_admin', 'parking_admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const spot = await ParkingSpot.delete(id);
    if (!spot) return res.status(404).json({ error: 'Parking spot not found' });
    res.json({ message: 'Parking spot deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete parking spot' });
  }
});


router.get('/available-for-user-in-parking/:parking_id', restrictTo('user', 'parking_admin', 'super_admin'), async (req, res) => {
  const user_id = req.user.user_id;
  const { parking_id } = req.params;
  try {
    const spots = await ParkingSpot.findAvailableForUserInParking(user_id, parking_id);
    res.json(spots);
  } catch (error) {
    console.error('Error fetching available spots for user in parking:', error);
    res.status(500).json({ error: 'Failed to fetch available parking spots for user in parking' });
  }
});

module.exports = router;