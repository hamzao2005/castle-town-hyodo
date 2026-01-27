const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = path.join(__dirname, '../data/gallery.json');

class Gallery {
  constructor() {
    this.ensureDataFile();
  }

  async ensureDataFile() {
    try {
      await fs.access(DATA_FILE);
    } catch {
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
      await fs.writeFile(DATA_FILE, JSON.stringify({ images: [] }, null, 2));
    }
  }

  async readGallery() {
    await this.ensureDataFile();
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  }

  async writeGallery(gallery) {
    await fs.writeFile(DATA_FILE, JSON.stringify(gallery, null, 2));
  }

  async findAll() {
    const gallery = await this.readGallery();
    return gallery.images || [];
  }

  async findById(id) {
    const images = await this.findAll();
    return images.find(image => image.id === id);
  }

  async create(imageData) {
    const gallery = await this.readGallery();
    
    const newImage = {
      id: uuidv4(),
      data: imageData.data, // base64
      title: imageData.title || '',
      addedAt: new Date().toISOString()
    };

    gallery.images.push(newImage);
    await this.writeGallery(gallery);
    
    return newImage;
  }

  async updateOrder(imageIds) {
    const gallery = await this.readGallery();
    const images = gallery.images;
    
    // Reorder images based on provided IDs
    const reorderedImages = [];
    imageIds.forEach(id => {
      const image = images.find(img => img.id === id);
      if (image) {
        reorderedImages.push(image);
      }
    });
    
    // Add any images that weren't in the reorder list
    images.forEach(image => {
      if (!imageIds.includes(image.id)) {
        reorderedImages.push(image);
      }
    });
    
    gallery.images = reorderedImages;
    await this.writeGallery(gallery);
    
    return gallery.images;
  }

  async delete(id) {
    const gallery = await this.readGallery();
    const originalLength = gallery.images.length;
    gallery.images = gallery.images.filter(image => image.id !== id);
    
    if (gallery.images.length === originalLength) {
      return false;
    }

    await this.writeGallery(gallery);
    return true;
  }
}

module.exports = new Gallery();
