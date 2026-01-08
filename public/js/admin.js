// Admin Module
const Admin = {
  selectedCharacter: null,

  init() {
    if (!Auth.isAdmin()) return;

    const panel = document.getElementById('adminPanel');
    panel.classList.remove('hidden');

    this.setupControls();
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

  selectCharacter(char) {
    this.selectedCharacter = char;
    const selectedDiv = document.getElementById('selectedCharacter');
    const actionsDiv = document.getElementById('adminActions');

    selectedDiv.innerHTML = `
      <strong>Selected:</strong> ${char.username}<br>
      <strong>Position:</strong> (${Math.round(char.character.position.x)}, ${Math.round(char.character.position.y)})
    `;

    actionsDiv.classList.remove('hidden');
  },

  deselectCharacter() {
    this.selectedCharacter = null;
    const selectedDiv = document.getElementById('selectedCharacter');
    const actionsDiv = document.getElementById('adminActions');
    const moveBtn = document.getElementById('moveCharacterBtn');

    selectedDiv.innerHTML = '<em>No character selected</em>';
    actionsDiv.classList.add('hidden');
    moveBtn.textContent = 'Enable Move Mode';
    Town.setMoveMode(false);
  },

  toggleMoveMode() {
    if (!this.selectedCharacter) return;

    const moveBtn = document.getElementById('moveCharacterBtn');
    const isEnabled = moveBtn.textContent === 'Disable Move Mode';

    if (isEnabled) {
      moveBtn.textContent = 'Enable Move Mode';
      Town.setMoveMode(false);
    } else {
      moveBtn.textContent = 'Disable Move Mode';
      Town.setMoveMode(true);
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
