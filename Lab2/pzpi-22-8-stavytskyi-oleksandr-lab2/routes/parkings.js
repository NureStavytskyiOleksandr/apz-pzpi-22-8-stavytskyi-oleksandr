const express = require('express');
const router = express.Router();
const Parking = require('../models/Parking');
const restrictTo = require('../middleware/restrictTo');

router.get('/', async (req, res) => {
  try {
    const parkings = await Parking.findAll();
    res.json(parkings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch parkings' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const parking = await Parking.findById(id);
    if (!parking) return res.status(404).json({ error: 'Parking not found' });
    res.json(parking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch parking' });
  }
});

router.post('/', restrictTo('super_admin'), async (req, res) => {
  try {
    const parking = await Parking.create(req.body);
    res.status(201).json(parking);
  } catch (error) {
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
    res.status(500).json({ error: 'Failed to delete parking' });
  }
});

module.exports = router;