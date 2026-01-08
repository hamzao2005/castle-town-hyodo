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

  logout() {
    this.setToken(null);
  }
}

// Create global API instance
const api = new API();
