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
      await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2));
    }
  }

  async readGallery() {
    await this.ensureDataFile();
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(data);
    // Handle both array format and object format for backwards compatibility
    return Array.isArray(parsed) ? parsed : (parsed.images || []);
  }

  async writeGallery(images) {
    await fs.writeFile(DATA_FILE, JSON.stringify(images, null, 2));
  }

  async findAll() {
    return await this.readGallery();
  }

  async findById(id) {
    const images = await this.readGallery();
    return images.find(image => image.id === id);
  }

  async create(imageData) {
    const images = await this.readGallery();
    
    const newImage = {
      id: uuidv4(),
      data: imageData.data, // base64
      title: imageData.title || '',
      addedAt: new Date().toISOString()
    };

    images.push(newImage);
    await this.writeGallery(images);
    
    return newImage;
  }

  async updateOrder(imageIds) {
    const images = await this.readGallery();
    
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
    
    await this.writeGallery(reorderedImages);
    
    return reorderedImages;
  }

  async delete(id) {
    const images = await this.readGallery();
    const originalLength = images.length;
    const filteredImages = images.filter(image => image.id !== id);
    
    if (filteredImages.length === originalLength) {
      return false;
    }

    await this.writeGallery(filteredImages);
    return true;
  }
}

module.exports = new Gallery();
