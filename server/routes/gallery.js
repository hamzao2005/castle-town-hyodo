const express = require('express');
const Gallery = require('../models/Gallery');
const { adminAuth } = require('../middleware/auth');
const { sanitize } = require('../utils/sanitize');

const router = express.Router();

// Get all gallery images (public)
router.get('/', async (req, res) => {
  try {
    const images = await Gallery.findAll();
    res.json(images);
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get specific gallery image (public)
router.get('/:id', async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.json(image);
  } catch (error) {
    console.error('Get gallery image error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add image to gallery (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { data, title } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Validate base64 image data
    if (!data.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image data format' });
    }

    const imageData = {
      data,
      title: title ? sanitize(title) : ''
    };

    const newImage = await Gallery.create(imageData);
    res.json(newImage);
  } catch (error) {
    console.error('Add gallery image error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reorder gallery images (admin only)
router.put('/order', adminAuth, async (req, res) => {
  try {
    const { imageIds } = req.body;

    if (!Array.isArray(imageIds)) {
      return res.status(400).json({ error: 'imageIds must be an array' });
    }

    const reorderedImages = await Gallery.updateOrder(imageIds);
    res.json(reorderedImages);
  } catch (error) {
    console.error('Reorder gallery error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete gallery image (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const deleted = await Gallery.delete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete gallery image error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
