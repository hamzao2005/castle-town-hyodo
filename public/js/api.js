// API Client for Castle Town Hub
const API_BASE = '/api';

class API {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken() {
    return this.token;
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(username, password, character) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, character })
    });
    this.setToken(data.token);
    return data;
  }

  async login(username, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    this.setToken(data.token);
    return data;
  }

  async getMe() {
    return await this.request('/auth/me');
  }

  async verifyToken() {
    try {
      return await this.request('/auth/verify');
    } catch {
      return { valid: false };
    }
  }

  // Character endpoints
  async getAllCharacters() {
    return await this.request('/characters');
  }

  async getCharacter(id) {
    return await this.request(`/characters/${id}`);
  }

  async updateMyCharacter(updates) {
    return await this.request('/characters/me', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  // Admin endpoints
  async moveCharacter(userId, x, y) {
    return await this.request(`/admin/move/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ x, y })
    });
  }

  async createNPC(name, description, color, style) {
    return await this.request('/admin/create-player', {
      method: 'POST',
      body: JSON.stringify({ name, description, color, style })
    });
  }

  async updateHearts(userId, hearts) {
    return await this.request(`/admin/hearts/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ hearts })
    });
  }

  async assignCategory(userId, categoryId) {
    return await this.request(`/admin/assign-category/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ categoryId })
    });
  }

  async updateCostumeAdmin(userId, costumeImage) {
    return await this.request(`/admin/costume/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ costumeImage })
    });
  }

  async addTrait(userId, trait) {
    return await this.request(`/admin/trait/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ trait })
    });
  }

  async addItem(userId, item) {
    return await this.request(`/admin/item/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ item })
    });
  }

  async addHistory(userId, entry) {
    return await this.request(`/admin/history/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ entry })
    });
  }

  async addInteraction(userId, message) {
    return await this.request(`/admin/interact/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  }

  // Category endpoints
  async getAllCategories() {
    return await this.request('/categories');
  }

  async getCategory(id) {
    return await this.request(`/categories/${id}`);
  }

  async createCategory(name, color, icon, position) {
    return await this.request('/categories', {
      method: 'POST',
      body: JSON.stringify({ name, color, icon, position })
    });
  }

  async updateCategory(id, updates) {
    return await this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteCategory(id) {
    return await this.request(`/categories/${id}`, {
      method: 'DELETE'
    });
  }

  // Gallery endpoints
  async getAllGalleryImages() {
    return await this.request('/gallery');
  }

  async addGalleryImage(data, title) {
    return await this.request('/gallery', {
      method: 'POST',
      body: JSON.stringify({ data, title })
    });
  }

  async reorderGallery(imageIds) {
    return await this.request('/gallery/order', {
      method: 'PUT',
      body: JSON.stringify({ imageIds })
    });
  }

  async deleteGalleryImage(id) {
    return await this.request(`/gallery/${id}`, {
      method: 'DELETE'
    });
  }

  // Character costume
  async updateMyCostume(costumeImage) {
    return await this.request('/characters/me/costume', {
      method: 'PUT',
      body: JSON.stringify({ costumeImage })
    });
  }

  logout() {
    this.setToken(null);
  }
}

// Create global API instance
const api = new API();
