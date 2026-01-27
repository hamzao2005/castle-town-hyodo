// Categories Module
const Categories = {
  categories: [],
  selectedCategory: null,

  async init() {
    await this.loadCategories();
  },

  async loadCategories() {
    try {
      this.categories = await api.getAllCategories();
      this.render();
      return this.categories;
    } catch (error) {
      console.error('Failed to load categories:', error);
      return [];
    }
  },

  render() {
    // This will be called by Town to render category houses
    if (typeof Town !== 'undefined' && Town.render) {
      Town.render();
    }
  },

  async createCategory(name, color, icon) {
    try {
      const newCategory = await api.createCategory(name, color, icon);
      await this.loadCategories();
      return newCategory;
    } catch (error) {
      console.error('Failed to create category:', error);
      throw error;
    }
  },

  async updateCategory(id, updates) {
    try {
      const updated = await api.updateCategory(id, updates);
      await this.loadCategories();
      return updated;
    } catch (error) {
      console.error('Failed to update category:', error);
      throw error;
    }
  },

  async deleteCategory(id) {
    try {
      await api.deleteCategory(id);
      await this.loadCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      throw error;
    }
  },

  getCategoryById(id) {
    return this.categories.find(cat => cat.id === id);
  },

  getCharactersByCategory(categoryId) {
    if (typeof Town === 'undefined') return [];
    return Town.characters.filter(char => 
      char.character.categoryId === categoryId
    );
  }
};
