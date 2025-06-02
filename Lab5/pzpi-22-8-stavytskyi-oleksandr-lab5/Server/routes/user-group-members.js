const express = require('express');
const router = express.Router();
const UserGroupMember = require('../models/UserGroupMember');
const restrictTo = require('../middleware/restrictTo');

router.get('/', restrictTo('super_admin', 'parking_admin'), async (req, res) => {
  try {
    const members = await UserGroupMember.findAll();
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user group members' });
  }
});

router.get('/user/:user_id', restrictTo('super_admin', 'parking_admin'), async (req, res) => {
  const { user_id } = req.params;
  try {
    const members = await UserGroupMember.findByUserId(user_id);
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user group members' });
  }
});

router.get('/group/:groupId', restrictTo('super_admin', 'parking_admin'), async (req, res) => {
  const group_id = req.params.groupId;
  try {
    const users = await UserGroupMember.findByGroupId(group_id);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка при отриманні користувачів групи' });
  }
});

router.post('/', restrictTo('super_admin', 'parking_admin'), async (req, res) => {
  try {
    const member = await UserGroupMember.create(req.body);
    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user group member' });
  }
});

router.delete('/:user_id/:group_id', restrictTo('super_admin', 'parking_admin'), async (req, res) => {
  const { user_id, group_id } = req.params;
  try {
    const member = await UserGroupMember.delete(user_id, group_id);
    if (!member) return res.status(404).json({ error: 'User group member not found' });
    res.json({ message: 'User group member deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user group member' });
  }
});

module.exports = router;