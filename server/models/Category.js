const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = path.join(__dirname, '../data/categories.json');

class Category {
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

  async readCategories() {
    await this.ensureDataFile();
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  }

  async writeCategories(categories) {
    await fs.writeFile(DATA_FILE, JSON.stringify(categories, null, 2));
  }

  async findAll() {
    return await this.readCategories();
  }

  async findById(id) {
    const categories = await this.readCategories();
    return categories.find(category => category.id === id);
  }

  async create(categoryData) {
    const categories = await this.readCategories();
    
    const newCategory = {
      id: uuidv4(),
      name: categoryData.name,
      color: categoryData.color || '#7c5cbf',
      icon: categoryData.icon || '🏠',
      position: categoryData.position || {
        x: Math.floor(Math.random() * 600) + 100,
        y: Math.floor(Math.random() * 150) + 50
      },
      createdAt: new Date().toISOString()
    };

    categories.push(newCategory);
    await this.writeCategories(categories);
    
    return newCategory;
  }

  async update(id, updates) {
    const categories = await this.readCategories();
    const index = categories.findIndex(category => category.id === id);
    
    if (index === -1) {
      return null;
    }

    categories[index] = {
      ...categories[index],
      ...updates,
      id: categories[index].id, // Preserve ID
      updatedAt: new Date().toISOString()
    };

    await this.writeCategories(categories);
    return categories[index];
  }

  async delete(id) {
    const categories = await this.readCategories();
    const filteredCategories = categories.filter(category => category.id !== id);
    
    if (categories.length === filteredCategories.length) {
      return false;
    }

    await this.writeCategories(filteredCategories);
    return true;
  }
}

module.exports = new Category();
