const express = require('express');
const router = express.Router();
const UserGroupParkingGroupAccess = require('../models/UserGroupParkingGroupAccess');
const restrictTo = require('../middleware/restrictTo');

router.get('/', restrictTo('super_admin', 'parking_admin'), async (req, res) => {
  try {
    const access = await UserGroupParkingGroupAccess.findAll();
    res.json(access);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch access records' });
  }
});

router.post('/', restrictTo('super_admin', 'parking_admin'), async (req, res) => {
  try {
    const access = await UserGroupParkingGroupAccess.create(req.body);
    res.status(201).json(access);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create access record' });
  }
});

router.delete('/:group_id/:parking_group_id', restrictTo('super_admin', 'parking_admin'), async (req, res) => {
  const { group_id, parking_group_id } = req.params;
  try {
    const access = await UserGroupParkingGroupAccess.delete(group_id, parking_group_id);
    if (!access) return res.status(404).json({ error: 'Access record not found' });
    res.json({ message: 'Access record deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete access record' });
  }
});

module.exports = router;