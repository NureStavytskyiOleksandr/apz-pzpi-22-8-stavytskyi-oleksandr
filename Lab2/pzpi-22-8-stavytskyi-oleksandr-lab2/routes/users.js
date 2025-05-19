const express = require('express');
const router = express.Router();
const User = require('../models/User');
const restrictTo = require('../middleware/restrictTo');

router.get('/', restrictTo('super_admin'), async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/:id', restrictTo('super_admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.put('/:id', restrictTo('super_admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.update(id, req.body);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/:id', restrictTo('super_admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.delete(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
