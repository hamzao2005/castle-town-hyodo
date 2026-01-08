const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Sanitize input to prevent XSS
const sanitize = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Get all characters (public)
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll();
    
    // Return only character data without passwords
    const characters = users.map(user => ({
      id: user.id,
      username: user.username,
      character: user.character,
      isAdmin: user.isAdmin
    }));

    res.json(characters);
  } catch (error) {
    console.error('Get characters error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get specific character (public)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Character not found' });
    }

    // Return character data without password
    const character = {
      id: user.id,
      username: user.username,
      character: user.character,
      isAdmin: user.isAdmin
    };

    res.json(character);
  } catch (error) {
    console.error('Get character error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update own character (authenticated)
router.put('/me', auth, async (req, res) => {
  try {
    const { color, style, description, particularity, message } = req.body;

    const updates = {};
    if (color) updates.color = color;
    if (style) updates.style = style;
    if (description !== undefined) updates.description = sanitize(description);
    if (particularity !== undefined) updates.particularity = sanitize(particularity);
    if (message !== undefined) updates.message = sanitize(message);

    const updatedUser = await User.updateCharacter(req.user.id, updates);

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Update character error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
