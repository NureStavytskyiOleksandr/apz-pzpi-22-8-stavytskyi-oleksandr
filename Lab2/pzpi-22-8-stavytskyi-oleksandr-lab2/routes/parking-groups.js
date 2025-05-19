const express = require('express');
const router = express.Router();
const ParkingGroup = require('../models/ParkingGroup');
const restrictTo = require('../middleware/restrictTo');

router.get('/', async (req, res) => {
  try {
    const groups = await ParkingGroup.findAll();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch parking groups' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const group = await ParkingGroup.findById(id);
    if (!group) return res.status(404).json({ error: 'Parking group not found' });
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch parking group' });
  }
});

router.post('/', restrictTo('super_admin', 'parking_admin'), async (req, res) => {
  try {
    const group = await ParkingGroup.create(req.body);
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create parking group' });
  }
});

router.put('/:id', restrictTo('super_admin', 'parking_admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const group = await ParkingGroup.update(id, req.body);
    if (!group) return res.status(404).json({ error: 'Parking group not found' });
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update parking group' });
  }
});

router.delete('/:id', restrictTo('super_admin', 'parking_admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const group = await ParkingGroup.delete(id);
    if (!group) return res.status(404).json({ error: 'Parking group not found' });
    res.json({ message: 'Parking group deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete parking group' });
  }
});

module.exports = router;