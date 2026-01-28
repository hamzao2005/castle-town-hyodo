const express = require('express');
const Category = require('../models/Category');
const { adminAuth } = require('../middleware/auth');
const { sanitize } = require('../utils/sanitize');

const router = express.Router();

// Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get specific category (public)
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create category (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, color, icon, position } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const categoryData = {
      name: sanitize(name),
      color: color || '#7c5cbf',
      icon: icon || '🏠',
      position
    };

    const newCategory = await Category.create(categoryData);
    res.json(newCategory);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update category (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { name, color, icon, position } = req.body;

    const updates = {};
    if (name) updates.name = sanitize(name);
    if (color) updates.color = color;
    if (icon) updates.icon = icon;
    if (position) updates.position = position;

    const updatedCategory = await Category.update(req.params.id, updates);

    if (!updatedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(updatedCategory);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete category (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const deleted = await Category.delete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
