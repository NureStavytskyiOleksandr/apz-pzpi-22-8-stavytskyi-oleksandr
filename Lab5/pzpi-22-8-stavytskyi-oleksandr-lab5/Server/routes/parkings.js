const express = require('express');
const router = express.Router();
const Parking = require('../models/Parking');
const restrictTo = require('../middleware/restrictTo');

router.get('/', async (req, res) => {
  try {
    const parkings = await Parking.findAll();
    res.json(parkings);
  } catch (error) {
    console.error('Error fetching parkings:', error);
    res.status(500).json({ error: 'Failed to fetch parkings' });
  }
});

router.get('/for-user', restrictTo('user', 'parking_admin', 'super_admin'), async (req, res) => {
  try {
    const user_id = req.user.user_id;
    if (!user_id) {
      return res.status(400).json({ error: 'User ID not found in token' });
    }
    const parkings = await Parking.findAllForUser(user_id);
    res.json(parkings);
  } catch (error) {
    console.error('Error fetching parkings for user:', error);
    res.status(500).json({ error: 'Failed to fetch parkings for user' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const parking = await Parking.findById(id);
    if (!parking) return res.status(404).json({ error: 'Parking not found' });
    res.json(parking);
  } catch (error) {
    console.error('Error fetching parking:', error);
    res.status(500).json({ error: 'Failed to fetch parking' });
  }
});

router.post('/', restrictTo('super_admin'), async (req, res) => {
  try {
    const parking = await Parking.create(req.body);
    res.status(201).json(parking);
  } catch (error) {
    console.error('Error creating parking:', error);
    res.status(500).json({ error: 'Failed to create parking' });
  }
});

router.put('/:id', restrictTo('super_admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const parking = await Parking.update(id, req.body);
    if (!parking) return res.status(404).json({ error: 'Parking not found' });
    res.json(parking);
  } catch (error) {
    console.error('Error updating parking:', error);
    res.status(500).json({ error: 'Failed to update parking' });
  }
});

router.delete('/:id', restrictTo('super_admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const parking = await Parking.delete(id);
    if (!parking) return res.status(404).json({ error: 'Parking not found' });
    res.json({ message: 'Parking deleted' });
  } catch (error) {
    console.error('Error deleting parking:', error);
    res.status(500).json({ error: 'Failed to delete parking' });
  }
});

module.exports = router;