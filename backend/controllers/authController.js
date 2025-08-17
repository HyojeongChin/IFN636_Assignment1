const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const registerUser = async (req, res) => {
  let { name, email, password } = req.body || {};
  try {
    const emailNorm = (email || '').trim().toLowerCase();

    const userExists = await User.findOne({ email: emailNorm });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email: emailNorm, password });

    res
      .status(201)
      .json({ id: user.id, name: user.name, email: user.email, token: generateToken(user.id) });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body || {};
  try {
    const emailNorm = (email || '').trim().toLowerCase();

    const user = await User.findOne({ email: emailNorm }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid email or password' });

    res.json({ id: user.id, name: user.name, email: user.email, token: generateToken(user.id) });
  } catch (error) {
    console.error('[AUTH] login error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      name: user.name,
      email: user.email,
      university: user.university,
      address: user.address,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, university, address } = req.body || {};
    user.name = name ?? user.name;
    user.email = (email ? email.trim().toLowerCase() : user.email);
    user.university = university ?? user.university;
    user.address = address ?? user.address;

    const updatedUser = await user.save();
    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      university: updatedUser.university,
      address: updatedUser.address,
      token: generateToken(updatedUser.id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, updateUserProfile, getProfile };