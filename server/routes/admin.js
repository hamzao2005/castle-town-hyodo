const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');
const { sanitize } = require('../utils/sanitize');

const router = express.Router();

// Create NPC player
router.post('/create-player', adminAuth, async (req, res) => {
  try {
    const { name, description, color, style } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Player name is required' });
    }

    // Check if username already exists
    const existingUser = await User.findByUsername(name);
    if (existingUser) {
      return res.status(400).json({ error: 'Player name already exists' });
    }

    const npcData = {
      username: name,
      password: null, // NPCs don't have passwords
      isNPC: true,
      character: {
        color: color || '#8b5fbf',
        style: style || 'round',
        description: description ? sanitize(description) : '',
        message: 'Hello!'
      }
    };

    const newNPC = await User.create(npcData);
    
    const { password: _, ...npcWithoutPassword } = newNPC;
    res.json(npcWithoutPassword);
  } catch (error) {
    console.error('Create NPC error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update golden hearts
router.put('/hearts/:userId', adminAuth, async (req, res) => {
  try {
    const { hearts } = req.body;

    if (typeof hearts !== 'number' || hearts < 0) {
      return res.status(400).json({ error: 'Invalid hearts value' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await User.updateCharacter(req.params.userId, {
      goldenHearts: hearts
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Update hearts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Assign category to character
router.put('/assign-category/:userId', adminAuth, async (req, res) => {
  try {
    const { categoryId } = req.body;

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await User.updateCharacter(req.params.userId, {
      categoryId: categoryId || null
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Assign category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update character costume (admin)
router.put('/costume/:userId', adminAuth, async (req, res) => {
  try {
    const { costumeImage } = req.body;

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate base64 image data if provided
    if (costumeImage && !costumeImage.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image data format' });
    }

    const updatedUser = await User.updateCharacter(req.params.userId, {
      costumeImage: costumeImage || null
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Update costume error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

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
