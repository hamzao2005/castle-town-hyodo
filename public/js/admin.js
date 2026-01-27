// Admin Module
const Admin = {
  selectedCharacter: null,
  isMovingCharacter: false,
  movingUserId: null,

  init() {
    if (!Auth.isAdmin()) return;

    const panel = document.getElementById('adminPanel');
    panel.classList.remove('hidden');

    this.setupControls();
    this.setupEventListeners();
  },

  setupControls() {
    const moveBtn = document.getElementById('moveCharacterBtn');
    const addTraitBtn = document.getElementById('addTraitBtn');
    const addItemBtn = document.getElementById('addItemBtn');
    const addHistoryBtn = document.getElementById('addHistoryBtn');
    const addInteractionBtn = document.getElementById('addInteractionBtn');

    moveBtn.addEventListener('click', () => this.toggleMoveMode());
    addTraitBtn.addEventListener('click', () => this.addTrait());
    addItemBtn.addEventListener('click', () => this.addItem());
    addHistoryBtn.addEventListener('click', () => this.addHistory());
    addInteractionBtn.addEventListener('click', () => this.addInteraction());
  },

  setupEventListeners() {
    // Coordinate update button
    const updateCoordsBtn = document.getElementById('update-coords-btn');
    if (updateCoordsBtn) {
      updateCoordsBtn.addEventListener('click', () => this.updateCoordinates());
    }

    // Allow Enter key to update coordinates
    const coordX = document.getElementById('coord-x');
    const coordY = document.getElementById('coord-y');
    
    if (coordX) {
      coordX.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.updateCoordinates();
      });
    }
    
    if (coordY) {
      coordY.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.updateCoordinates();
      });
    }

    // Town container click for move mode
    const townCanvas = document.getElementById('townCanvas');
    if (townCanvas) {
      townCanvas.addEventListener('click', (e) => {
        if (this.isMovingCharacter) {
          this.finishMoveCharacter(e);
        }
      }, true); // Use capture phase
    }

    // ESC key to cancel move mode
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMovingCharacter) {
        this.cancelMoveCharacter();
      }
    });
  },

  getSelectedUserId() {
    return this.selectedCharacter ? this.selectedCharacter.id : null;
  },

  selectCharacter(char) {
    this.selectedCharacter = char;
    const selectedDiv = document.getElementById('selectedCharacter');
    const actionsDiv = document.getElementById('adminActions');

    selectedDiv.innerHTML = `
      <strong>Selected:</strong> ${char.username}<br>
      <strong>Position:</strong> (${Math.round(char.character.position.x)}, ${Math.round(char.character.position.y)})
    `;

    actionsDiv.classList.remove('hidden');

    // Populate coordinate fields
    const coordX = document.getElementById('coord-x');
    const coordY = document.getElementById('coord-y');
    if (coordX && char.character.position) {
      coordX.value = Math.round(char.character.position.x);
    }
    if (coordY && char.character.position) {
      coordY.value = Math.round(char.character.position.y);
    }
  },

  deselectCharacter() {
    this.selectedCharacter = null;
    const selectedDiv = document.getElementById('selectedCharacter');
    const actionsDiv = document.getElementById('adminActions');
    const moveBtn = document.getElementById('moveCharacterBtn');

    selectedDiv.innerHTML = '<em>No character selected</em>';
    actionsDiv.classList.add('hidden');
    moveBtn.textContent = 'Enable Move Mode';
    this.cancelMoveCharacter();
  },

  toggleMoveMode() {
    if (!this.selectedCharacter) return;

    const moveBtn = document.getElementById('moveCharacterBtn');
    const isEnabled = this.isMovingCharacter;

    if (isEnabled) {
      this.cancelMoveCharacter();
      moveBtn.textContent = 'Enable Move Mode';
    } else {
      this.startMoveCharacter();
      moveBtn.textContent = 'Disable Move Mode';
    }
  },

  startMoveCharacter() {
    const userId = this.getSelectedUserId();
    if (!userId) return;

    this.isMovingCharacter = true;
    this.movingUserId = userId;

    document.body.style.cursor = 'crosshair';
    
    console.log('Move mode activated for:', userId);
  },

  async finishMoveCharacter(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const canvas = document.getElementById('townCanvas');
    const rect = canvas.getBoundingClientRect();

    // Calculate position as coordinates on canvas
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    console.log('Moving to canvas position:', x, y);

    try {
      await api.moveCharacter(this.movingUserId, x, y);
      await Town.loadCharacters();
      
      setTimeout(() => {
        const updatedChar = Town.characters.find(c => c.id === this.movingUserId);
        if (updatedChar) {
          Town.selectCharacter(updatedChar);
        }
      }, 100);
    } catch (error) {
      console.error('Error moving character:', error);
      alert(error.message);
    }

    this.cancelMoveCharacter();
  },

  cancelMoveCharacter() {
    this.isMovingCharacter = false;
    this.movingUserId = null;
    document.body.style.cursor = 'default';
    
    const moveBtn = document.getElementById('moveCharacterBtn');
    if (moveBtn) {
      moveBtn.textContent = 'Enable Move Mode';
    }
  },

  async updateCoordinates() {
    const userId = this.getSelectedUserId();
    if (!userId) return;

    const xInput = document.getElementById('coord-x');
    const yInput = document.getElementById('coord-y');
    
    const x = parseFloat(xInput.value);
    const y = parseFloat(yInput.value);

    if (isNaN(x) || isNaN(y)) {
      alert('Please enter valid coordinates');
      return;
    }

    // Get canvas dimensions
    const canvas = document.getElementById('townCanvas');
    const canvasWidth = canvas ? canvas.width : 800;
    const canvasHeight = canvas ? canvas.height : 600;

    // Clamp values between 0 and canvas size
    const clampedX = Math.max(0, Math.min(canvasWidth, x));
    const clampedY = Math.max(0, Math.min(canvasHeight, y));

    try {
      await api.moveCharacter(userId, clampedX, clampedY);
      await Town.loadCharacters();
      
      const updatedChar = Town.characters.find(c => c.id === userId);
      if (updatedChar) {
        Town.selectCharacter(updatedChar);
      }
      
      // Update input fields with clamped values
      xInput.value = Math.round(clampedX);
      yInput.value = Math.round(clampedY);
    } catch (error) {
      console.error('Error updating coordinates:', error);
      alert(error.message);
    }
  },

  async moveCharacterTo(userId, x, y) {
    try {
      await api.moveCharacter(userId, x, y);
      await Town.loadCharacters();
      
      // Update selected character display
      if (this.selectedCharacter && this.selectedCharacter.id === userId) {
        const updatedChar = Town.characters.find(c => c.id === userId);
        if (updatedChar) {
          this.selectCharacter(updatedChar);
        }
      }
    } catch (error) {
      alert('Failed to move character: ' + error.message);
    }
  },

  async addTrait() {
    if (!this.selectedCharacter) return;

    const input = document.getElementById('traitInput');
    const trait = input.value.trim();

    if (!trait) {
      alert('Please enter a trait');
      return;
    }

    try {
      await api.addTrait(this.selectedCharacter.id, trait);
      input.value = '';
      await Town.loadCharacters();
      
      const updatedChar = Town.characters.find(c => c.id === this.selectedCharacter.id);
      if (updatedChar) {
        Town.selectCharacter(updatedChar);
      }
    } catch (error) {
      alert('Failed to add trait: ' + error.message);
    }
  },

  async addItem() {
    if (!this.selectedCharacter) return;

    const input = document.getElementById('itemInput');
    const item = input.value.trim();

    if (!item) {
      alert('Please enter an item');
      return;
    }

    try {
      await api.addItem(this.selectedCharacter.id, item);
      input.value = '';
      await Town.loadCharacters();
      
      const updatedChar = Town.characters.find(c => c.id === this.selectedCharacter.id);
      if (updatedChar) {
        Town.selectCharacter(updatedChar);
      }
    } catch (error) {
      alert('Failed to add item: ' + error.message);
    }
  },

  async addHistory() {
    if (!this.selectedCharacter) return;

    const input = document.getElementById('historyInput');
    const entry = input.value.trim();

    if (!entry) {
      alert('Please enter a history entry');
      return;
    }

    try {
      await api.addHistory(this.selectedCharacter.id, entry);
      input.value = '';
      await Town.loadCharacters();
      
      const updatedChar = Town.characters.find(c => c.id === this.selectedCharacter.id);
      if (updatedChar) {
        Town.selectCharacter(updatedChar);
      }
    } catch (error) {
      alert('Failed to add history: ' + error.message);
    }
  },

  async addInteraction() {
    if (!this.selectedCharacter) return;

    const input = document.getElementById('interactionInput');
    const message = input.value.trim();

    if (!message) {
      alert('Please enter an interaction message');
      return;
    }

    try {
      await api.addInteraction(this.selectedCharacter.id, message);
      input.value = '';
      await Town.loadCharacters();
      
      const updatedChar = Town.characters.find(c => c.id === this.selectedCharacter.id);
      if (updatedChar) {
        Town.selectCharacter(updatedChar);
      }
    } catch (error) {
      alert('Failed to add interaction: ' + error.message);
    }
  },

  // New NPC creation
  async createNPC() {
    const nameInput = document.getElementById('new-player-name');
    const descInput = document.getElementById('new-player-description');
    
    const name = nameInput.value.trim();
    const description = descInput.value.trim();

    if (!name) {
      alert('Please enter a name for the NPC');
      return;
    }

    try {
      await api.createNPC(name, description);
      nameInput.value = '';
      descInput.value = '';
      await Town.loadCharacters();
      alert('NPC created successfully!');
    } catch (error) {
      alert('Failed to create NPC: ' + error.message);
    }
  },

  // Golden hearts management
  async updateHearts(delta) {
    if (!this.selectedCharacter) return;

    const currentHearts = this.selectedCharacter.character.goldenHearts || 0;
    const newHearts = Math.max(0, currentHearts + delta);

    try {
      await api.updateHearts(this.selectedCharacter.id, newHearts);
      await Town.loadCharacters();
      
      const updatedChar = Town.characters.find(c => c.id === this.selectedCharacter.id);
      if (updatedChar) {
        Town.selectCharacter(updatedChar);
      }
      
      this.updateHeartsDisplay();
    } catch (error) {
      alert('Failed to update hearts: ' + error.message);
    }
  },

  updateHeartsDisplay() {
    const heartsCount = document.getElementById('hearts-count');
    if (heartsCount && this.selectedCharacter) {
      heartsCount.textContent = this.selectedCharacter.character.goldenHearts || 0;
    }
  },

  // Category assignment
  async assignCategory() {
    if (!this.selectedCharacter) return;

    const categorySelect = document.getElementById('player-category');
    const categoryId = categorySelect.value || null;

    try {
      await api.assignCategory(this.selectedCharacter.id, categoryId);
      await Town.loadCharacters();
      
      const updatedChar = Town.characters.find(c => c.id === this.selectedCharacter.id);
      if (updatedChar) {
        Town.selectCharacter(updatedChar);
      }
      
      alert('Category assigned successfully!');
    } catch (error) {
      alert('Failed to assign category: ' + error.message);
    }
  },

  async loadCategoryOptions() {
    const categorySelect = document.getElementById('player-category');
    if (!categorySelect) return;

    try {
      const categories = await api.getAllCategories();
      
      categorySelect.innerHTML = '<option value="">Sans catégorie</option>';
      categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = `${cat.icon} ${cat.name}`;
        categorySelect.appendChild(option);
      });

      // Select current category if any
      if (this.selectedCharacter && this.selectedCharacter.character.categoryId) {
        categorySelect.value = this.selectedCharacter.character.categoryId;
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  },

  // Costume upload for admin
  async uploadCostume() {
    if (!this.selectedCharacter) return;

    const fileInput = document.getElementById('admin-costume-upload');
    const file = fileInput.files[0];

    if (!file) {
      alert('Please select an image file');
      return;
    }

    try {
      const compressedImage = await Gallery.compressImage(file);
      await api.updateCostumeAdmin(this.selectedCharacter.id, compressedImage);
      
      fileInput.value = '';
      await Town.loadCharacters();
      
      const updatedChar = Town.characters.find(c => c.id === this.selectedCharacter.id);
      if (updatedChar) {
        Town.selectCharacter(updatedChar);
      }
      
      alert('Costume updated successfully!');
    } catch (error) {
      alert('Failed to upload costume: ' + error.message);
    }
  },

  async removeCostume() {
    if (!this.selectedCharacter) return;

    try {
      await api.updateCostumeAdmin(this.selectedCharacter.id, null);
      await Town.loadCharacters();
      
      const updatedChar = Town.characters.find(c => c.id === this.selectedCharacter.id);
      if (updatedChar) {
        Town.selectCharacter(updatedChar);
      }
      
      alert('Costume removed successfully!');
    } catch (error) {
      alert('Failed to remove costume: ' + error.message);
    }
  },

  // Category management
  async createCategory() {
    const nameInput = document.getElementById('new-category-name');
    const colorInput = document.getElementById('new-category-color');
    
    const name = nameInput.value.trim();
    const color = colorInput.value;

    if (!name) {
      alert('Please enter a category name');
      return;
    }

    try {
      await api.createCategory(name, color, '🏠');
      nameInput.value = '';
      colorInput.value = '#7c5cbf';
      
      await Categories.loadCategories();
      await this.loadCategoryOptions();
      await Town.render();
      
      alert('Category created successfully!');
    } catch (error) {
      alert('Failed to create category: ' + error.message);
    }
  },

  async deleteCategory(categoryId) {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await api.deleteCategory(categoryId);
      await Categories.loadCategories();
      await this.loadCategoryOptions();
      await Town.render();
      
      alert('Category deleted successfully!');
    } catch (error) {
      alert('Failed to delete category: ' + error.message);
    }
  },

  renderCategoriesList() {
    const listContainer = document.getElementById('categories-list');
    if (!listContainer || typeof Categories === 'undefined') return;

    listContainer.innerHTML = '';
    
    Categories.categories.forEach(cat => {
      const catDiv = document.createElement('div');
      catDiv.className = 'category-item';
      catDiv.innerHTML = `
        <span style="color: ${cat.color}">${cat.icon} ${cat.name}</span>
        <button class="btn-small delete-category-btn" data-id="${cat.id}">Delete</button>
      `;
      listContainer.appendChild(catDiv);
      
      const deleteBtn = catDiv.querySelector('.delete-category-btn');
      deleteBtn.addEventListener('click', () => this.deleteCategory(cat.id));
    });
  },

  // Gallery management
  async uploadGalleryImage() {
    const fileInput = document.getElementById('gallery-upload');
    const files = fileInput.files;

    if (files.length === 0) {
      alert('Please select at least one image');
      return;
    }

    try {
      for (let file of files) {
        const compressedImage = await Gallery.compressImage(file);
        await api.addGalleryImage(compressedImage, file.name);
      }
      
      fileInput.value = '';
      await Gallery.loadImages();
      await Town.render();
      
      alert(`${files.length} image(s) uploaded successfully!`);
    } catch (error) {
      alert('Failed to upload gallery image: ' + error.message);
    }
  },

  async deleteGalleryImage(imageId) {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      await Gallery.deleteImage(imageId);
      await Town.render();
      alert('Image deleted successfully!');
    } catch (error) {
      alert('Failed to delete image: ' + error.message);
    }
  },

  renderGalleryList() {
    const listContainer = document.getElementById('gallery-images-list');
    if (!listContainer || typeof Gallery === 'undefined') return;

    listContainer.innerHTML = '';
    
    Gallery.images.forEach(img => {
      const imgDiv = document.createElement('div');
      imgDiv.className = 'gallery-item';
      imgDiv.innerHTML = `
        <img src="${img.data}" alt="${img.title}" style="width: 50px; height: 50px; object-fit: cover;">
        <span>${img.title || 'Untitled'}</span>
        <button class="btn-small delete-gallery-btn" data-id="${img.id}">Delete</button>
      `;
      listContainer.appendChild(imgDiv);
      
      const deleteBtn = imgDiv.querySelector('.delete-gallery-btn');
      deleteBtn.addEventListener('click', () => this.deleteGalleryImage(img.id));
    });
  }
};
