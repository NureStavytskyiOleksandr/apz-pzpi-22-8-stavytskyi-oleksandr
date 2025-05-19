const express = require('express');
const router = express.Router();
const UserGroup = require('../models/UserGroup');
const restrictTo = require('../middleware/restrictTo');

router.get('/', async (req, res) => {
  try {
    const groups = await UserGroup.findAll();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user groups' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const group = await UserGroup.findById(id);
    if (!group) return res.status(404).json({ error: 'User group not found' });
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user group' });
  }
});

router.post('/', restrictTo('super_admin'), async (req, res) => {
  try {
    const group = await UserGroup.create(req.body);
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user group' });
  }
});

router.put('/:id', restrictTo('super_admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const group = await UserGroup.update(id, req.body);
    if (!group) return res.status(404).json({ error: 'User group not found' });
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user group' });
  }
});

router.delete('/:id', restrictTo('super_admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const group = await UserGroup.delete(id);
    if (!group) return res.status(404).json({ error: 'User group not found' });
    res.json({ message: 'User group deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user group' });
  }
});

module.exports = router;