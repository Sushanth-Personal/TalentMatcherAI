const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login request:', { email ,password});
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }


    const isMatch = await user.comparePassword('12345678', user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }


    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15d' }
    );
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log('Signup request:', { name, email, password, role });
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!['searcher', 'creator', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
   
    const existingUser = await User.findOne({ email });
   
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    const user = new User({ name, email, password: password, role });
    await user.save();
    console.log("User saved:", user);
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.status(201).json({ token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};