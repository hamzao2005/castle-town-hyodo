const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = path.join(__dirname, '../data/users.json');

class User {
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

  async readUsers() {
    await this.ensureDataFile();
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  }

  async writeUsers(users) {
    await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2));
  }

  async findAll() {
    return await this.readUsers();
  }

  async findById(id) {
    const users = await this.readUsers();
    return users.find(user => user.id === id);
  }

  async findByUsername(username) {
    const users = await this.readUsers();
    return users.find(user => user.username === username);
  }

  async create(userData) {
    const users = await this.readUsers();
    
    // Check if this is the first user
    const isFirstUser = users.length === 0;
    const isAdminUsername = userData.username === 'admin';
    
    const newUser = {
      id: uuidv4(),
      username: userData.username,
      password: userData.password,
      isAdmin: isFirstUser || isAdminUsername,
      isNPC: userData.isNPC || false,
      character: {
        name: userData.username,
        color: userData.character?.color || '#8b5fbf',
        style: userData.character?.style || 'round',
        description: userData.character?.description || '',
        particularity: userData.character?.particularity || '',
        message: userData.character?.message || 'Hello!',
        position: {
          x: Math.floor(Math.random() * 600) + 50,
          y: Math.floor(Math.random() * 300) + 200
        },
        goldenHearts: 0,
        categoryId: null,
        costumeImage: null,
        traits: [],
        items: [],
        history: [],
        interactions: []
      },
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await this.writeUsers(users);
    
    return newUser;
  }

  async update(id, updates) {
    const users = await this.readUsers();
    const index = users.findIndex(user => user.id === id);
    
    if (index === -1) {
      return null;
    }

    users[index] = {
      ...users[index],
      ...updates,
      id: users[index].id, // Preserve ID
      updatedAt: new Date().toISOString()
    };

    await this.writeUsers(users);
    return users[index];
  }

  async updateCharacter(id, characterUpdates) {
    const users = await this.readUsers();
    const index = users.findIndex(user => user.id === id);
    
    if (index === -1) {
      return null;
    }

    users[index].character = {
      ...users[index].character,
      ...characterUpdates
    };
    users[index].updatedAt = new Date().toISOString();

    await this.writeUsers(users);
    return users[index];
  }

  async delete(id) {
    const users = await this.readUsers();
    const filteredUsers = users.filter(user => user.id !== id);
    
    if (users.length === filteredUsers.length) {
      return false;
    }

    await this.writeUsers(filteredUsers);
    return true;
  }
}

module.exports = new User();
