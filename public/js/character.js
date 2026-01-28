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

    // Draw legs
    ctx.fillStyle = '#5a5a7a';
    ctx.fillRect(size * 0.3, size * 0.7, size * 0.15, size * 0.25);
    ctx.fillRect(size * 0.55, size * 0.7, size * 0.15, size * 0.25);

    // Draw body
    ctx.fillStyle = color;
    ctx.fillRect(size * 0.25, size * 0.35, size * 0.5, size * 0.4);
    
    // Draw outline for body
    ctx.strokeStyle = '#2a2a4a';
    ctx.lineWidth = 2;
    ctx.strokeRect(size * 0.25, size * 0.35, size * 0.5, size * 0.4);

    // Draw head
    ctx.fillStyle = color;
    if (style === 'round') {
      ctx.beginPath();
      ctx.arc(size / 2, size * 0.3, size * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2a2a4a';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.fillRect(size * 0.3, size * 0.1, size * 0.4, size * 0.35);
      ctx.strokeStyle = '#2a2a4a';
      ctx.lineWidth = 2;
      ctx.strokeRect(size * 0.3, size * 0.1, size * 0.4, size * 0.35);
    }

    // Draw eyes
    ctx.fillStyle = '#ffffff';
    const eyeSize = size / 10;
    const eyeY = size * 0.27;
    
    // Left eye
    ctx.beginPath();
    ctx.arc(size * 0.4, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Right eye
    ctx.beginPath();
    ctx.arc(size * 0.6, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();

    // Draw pupils
    ctx.fillStyle = '#000000';
    const pupilSize = eyeSize / 2;
    ctx.beginPath();
    ctx.arc(size * 0.4, eyeY, pupilSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(size * 0.6, eyeY, pupilSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw simple smile
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(size / 2, size * 0.32, size * 0.12, 0.2, Math.PI - 0.2);
    ctx.stroke();

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
    colorSelect.addEventListener('change', () => Character.updatePreview());
    styleSelect.addEventListener('change', () => Character.updatePreview());

    saveBtn.addEventListener('click', async () => {
      clearError();
      
      const characterData = {
        color: colorSelect.value,
        style: styleSelect.value,
        description: document.getElementById('characterDescription').value.trim(),
        particularity: document.getElementById('characterParticularity').value.trim(),
        message: document.getElementById('characterMessage').value.trim() || 'Hello!'
      };

      if (Character.callback) {
        // Registration flow - save callback before hiding modal
        const callback = Character.callback;
        Character.hideCustomizationModal();
        await callback(characterData);
      } else {
        // Update existing character
        try {
          const result = await api.updateMyCharacter(characterData);
          Auth.currentUser = result;
          Character.hideCustomizationModal();
          if (typeof Town !== 'undefined') {
            Town.loadCharacters();
          }
        } catch (error) {
          showError(error.message);
        }
      }
    });

    cancelBtn.addEventListener('click', () => {
      Character.hideCustomizationModal();
      
      // If this was during registration, show auth modal again
      if (Character.callback) {
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
  },

  // Costume upload for users
  async uploadCostume() {
    const fileInput = document.getElementById('costume-upload');
    const file = fileInput.files[0];

    if (!file) {
      alert('Please select an image file');
      return;
    }

    try {
      const compressedImage = await Gallery.compressImage(file);
      const result = await api.updateMyCostume(compressedImage);
      
      Auth.currentUser = result;
      fileInput.value = '';
      
      if (typeof Town !== 'undefined') {
        Town.loadCharacters();
      }
      
      this.updateCostumePreview(compressedImage);
      alert('Costume uploaded successfully!');
    } catch (error) {
      alert('Failed to upload costume: ' + error.message);
    }
  },

  async removeCostume() {
    try {
      const result = await api.updateMyCostume(null);
      
      Auth.currentUser = result;
      
      if (typeof Town !== 'undefined') {
        Town.loadCharacters();
      }
      
      this.updateCostumePreview(null);
      alert('Costume removed successfully!');
    } catch (error) {
      alert('Failed to remove costume: ' + error.message);
    }
  },

  updateCostumePreview(imageData) {
    const preview = document.getElementById('costume-preview');
    if (preview) {
      if (imageData) {
        preview.src = imageData;
        preview.style.display = 'block';
      } else {
        preview.src = '';
        preview.style.display = 'none';
      }
    }
  }
};
