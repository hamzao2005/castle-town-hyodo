// Character Module
const Character = {
  callback: null,

  createSprite(character, size = 50) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const color = character.color || '#8b5fbf';
    const style = character.style || 'round';

    // Draw body
    ctx.fillStyle = color;
    if (style === 'round') {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(5, 5, size - 10, size - 10);
    }

    // Draw eyes
    ctx.fillStyle = '#ffffff';
    const eyeSize = size / 8;
    const eyeY = size / 2 - eyeSize / 2;
    
    // Left eye
    ctx.beginPath();
    ctx.arc(size / 3, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Right eye
    ctx.beginPath();
    ctx.arc((2 * size) / 3, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();

    // Draw pupils
    ctx.fillStyle = '#000000';
    const pupilSize = eyeSize / 2;
    ctx.beginPath();
    ctx.arc(size / 3, eyeY, pupilSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc((2 * size) / 3, eyeY, pupilSize, 0, Math.PI * 2);
    ctx.fill();

    return canvas;
  },

  updatePreview() {
    const color = document.getElementById('characterColor').value;
    const style = document.getElementById('characterStyle').value;
    const previewCanvas = document.getElementById('characterPreview');
    const ctx = previewCanvas.getContext('2d');

    ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

    const sprite = this.createSprite({ color, style }, 100);
    ctx.drawImage(sprite, 0, 0);
  },

  showCustomizationModal(callback) {
    this.callback = callback;
    const modal = document.getElementById('characterModal');
    modal.classList.remove('hidden');
    this.updatePreview();
  },

  hideCustomizationModal() {
    const modal = document.getElementById('characterModal');
    modal.classList.add('hidden');
    this.callback = null;
  },

  setupCharacterModal() {
    const colorSelect = document.getElementById('characterColor');
    const styleSelect = document.getElementById('characterStyle');
    const saveBtn = document.getElementById('saveCharacterBtn');
    const cancelBtn = document.getElementById('cancelCharacterBtn');
    const characterError = document.getElementById('characterError');

    const showError = (message) => {
      characterError.textContent = message;
    };

    const clearError = () => {
      characterError.textContent = '';
    };

    // Update preview when selections change
    colorSelect.addEventListener('change', () => this.updatePreview());
    styleSelect.addEventListener('change', () => this.updatePreview());

    saveBtn.addEventListener('click', async () => {
      clearError();
      
      const characterData = {
        color: colorSelect.value,
        style: styleSelect.value,
        description: document.getElementById('characterDescription').value.trim(),
        particularity: document.getElementById('characterParticularity').value.trim(),
        message: document.getElementById('characterMessage').value.trim() || 'Hello!'
      };

      if (this.callback) {
        // Registration flow
        this.hideCustomizationModal();
        await this.callback(characterData);
      } else {
        // Update existing character
        try {
          const result = await api.updateMyCharacter(characterData);
          Auth.currentUser = result;
          this.hideCustomizationModal();
          window.Town.loadCharacters();
        } catch (error) {
          showError(error.message);
        }
      }
    });

    cancelBtn.addEventListener('click', () => {
      this.hideCustomizationModal();
      
      // If this was during registration, show auth modal again
      if (this.callback) {
        Auth.showAuthModal();
      }
    });
  },

  showEditModal() {
    const user = Auth.getUser();
    if (!user) return;

    const character = user.character;
    
    document.getElementById('characterColor').value = character.color || '#8b5fbf';
    document.getElementById('characterStyle').value = character.style || 'round';
    document.getElementById('characterDescription').value = character.description || '';
    document.getElementById('characterParticularity').value = character.particularity || '';
    document.getElementById('characterMessage').value = character.message || 'Hello!';

    this.showCustomizationModal(null);
  }
};
