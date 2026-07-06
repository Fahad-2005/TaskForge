const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// REGISTER ROUTE (Sign Up)
// URL: http://localhost:5000/api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // Hash the password safely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save user
    user = new User({ name, email, password: hashedPassword });
    await user.save();

    // Generate JWT Web Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secretkey123', { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server registration error', error: error.message });
  }
});

// 🔓 LOGIN ROUTE
// URL: http://localhost:5000/api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Look for user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

    // Compare encrypted passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secretkey123', { expiresIn: '7d' });

    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server login error', error: error.message });
  }
});

// UPDATE USER PROFILE
// URL: http://localhost:5000/api/auth/profile/:userId
router.put('/profile/:userId', async (req, res) => {
  try {
    const { name, email } = req.body;
    const { userId } = req.params;

    if (!name?.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!email?.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail !== user.email) {
      const emailTaken = await User.findOne({ email: normalizedEmail });
      if (emailTaken) {
        return res.status(400).json({ message: 'This email is already in use' });
      }
      user.email = normalizedEmail;
    }

    user.name = name.trim();
    await user.save();

    res.status(200).json({
      user: { id: user._id, _id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

module.exports = router;