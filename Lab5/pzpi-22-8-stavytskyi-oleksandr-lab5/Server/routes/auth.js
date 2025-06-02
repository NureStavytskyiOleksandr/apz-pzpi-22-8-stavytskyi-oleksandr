const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const user = await User.create({ username, email, password, role });
    // Повертаємо лише дані користувача без токена
    res.status(201).json({ user_id: user.user_id, username: user.username, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;