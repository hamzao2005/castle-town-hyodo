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
  }
};
