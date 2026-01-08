const express = require('express');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');

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

// Move character
router.put('/move/:userId', adminAuth, async (req, res) => {
  try {
    const { x, y } = req.body;

    if (typeof x !== 'number' || typeof y !== 'number') {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await User.updateCharacter(req.params.userId, {
      position: { x, y }
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Move character error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add trait to character
router.post('/trait/:userId', adminAuth, async (req, res) => {
  try {
    const { trait } = req.body;

    if (!trait) {
      return res.status(400).json({ error: 'Trait is required' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const traits = user.character.traits || [];
    traits.push({
      text: sanitize(trait),
      addedAt: new Date().toISOString(),
      addedBy: req.user.username
    });

    const updatedUser = await User.updateCharacter(req.params.userId, { traits });

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Add trait error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add item to character
router.post('/item/:userId', adminAuth, async (req, res) => {
  try {
    const { item } = req.body;

    if (!item) {
      return res.status(400).json({ error: 'Item is required' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const items = user.character.items || [];
    items.push({
      text: sanitize(item),
      addedAt: new Date().toISOString(),
      addedBy: req.user.username
    });

    const updatedUser = await User.updateCharacter(req.params.userId, { items });

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Add item error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add to character history
router.post('/history/:userId', adminAuth, async (req, res) => {
  try {
    const { entry } = req.body;

    if (!entry) {
      return res.status(400).json({ error: 'History entry is required' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const history = user.character.history || [];
    history.push({
      text: sanitize(entry),
      addedAt: new Date().toISOString(),
      addedBy: req.user.username
    });

    const updatedUser = await User.updateCharacter(req.params.userId, { history });

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Add history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add interaction
router.post('/interact/:userId', adminAuth, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const interactions = user.character.interactions || [];
    interactions.push({
      message: sanitize(message),
      addedAt: new Date().toISOString(),
      addedBy: req.user.username
    });

    const updatedUser = await User.updateCharacter(req.params.userId, { interactions });

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Add interaction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
