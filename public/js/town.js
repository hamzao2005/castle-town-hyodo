// Town Module
const Town = {
  canvas: null,
  ctx: null,
  characters: [],
  selectedCharacter: null,
  moveMode: false,
  refreshInterval: null,

  init() {
    this.canvas = document.getElementById('townCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    
    window.addEventListener('resize', () => this.resizeCanvas());
    this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));

    // Auto-refresh every 30 seconds
    this.refreshInterval = setInterval(() => this.loadCharacters(), 30000);
  },

  resizeCanvas() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    this.render();
  },

  async loadCharacters() {
    try {
      this.characters = await api.getAllCharacters();
      this.render();
    } catch (error) {
      console.error('Failed to load characters:', error);
    }
  },

  render() {
    if (!this.ctx) return;

    const width = this.canvas.width;
    const height = this.canvas.height;

    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);

    // Draw background (sky)
    const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(1, '#2a2a4a');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);

    // Draw stars
    this.drawStars(width, height);

    // Draw ground
    const groundHeight = height * 0.4;
    const groundGradient = this.ctx.createLinearGradient(0, height - groundHeight, 0, height);
    groundGradient.addColorStop(0, '#2d4a3d');
    groundGradient.addColorStop(1, '#1a3028');
    this.ctx.fillStyle = groundGradient;
    this.ctx.fillRect(0, height - groundHeight, width, groundHeight);

    // Draw buildings
    this.drawBuildings(width, height);

    // Draw characters
    this.characters.forEach(char => this.drawCharacter(char));
  },

  drawStars(width, height) {
    this.ctx.fillStyle = '#ffffff';
    const starCount = 50;
    
    for (let i = 0; i < starCount; i++) {
      const x = (i * 137.5) % width; // Pseudo-random distribution
      const y = (i * 97.3) % (height * 0.6);
      const size = (i % 3) + 1;
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }
  },

  drawBuildings(width, height) {
    const groundY = height * 0.6;

    // Castle (left)
    this.ctx.fillStyle = '#5a4a7a';
    this.ctx.fillRect(50, groundY - 200, 150, 200);
    
    // Castle towers
    this.ctx.fillRect(40, groundY - 250, 40, 50);
    this.ctx.fillRect(170, groundY - 250, 40, 50);
    
    // Castle windows
    this.ctx.fillStyle = '#ffd700';
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        this.ctx.fillRect(70 + i * 35, groundY - 180 + j * 40, 20, 30);
      }
    }

    // Shop (center)
    this.ctx.fillStyle = '#8b6f47';
    this.ctx.fillRect(width / 2 - 75, groundY - 120, 150, 120);
    
    // Shop roof
    this.ctx.fillStyle = '#6b4f37';
    this.ctx.beginPath();
    this.ctx.moveTo(width / 2 - 90, groundY - 120);
    this.ctx.lineTo(width / 2, groundY - 170);
    this.ctx.lineTo(width / 2 + 90, groundY - 120);
    this.ctx.fill();
    
    // Shop sign
    this.ctx.fillStyle = '#ffd700';
    this.ctx.fillRect(width / 2 - 40, groundY - 100, 80, 30);
    this.ctx.fillStyle = '#000000';
    this.ctx.font = '12px "Press Start 2P"';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('SHOP', width / 2, groundY - 78);

    // House (right)
    this.ctx.fillStyle = '#7a5a8a';
    this.ctx.fillRect(width - 200, groundY - 150, 120, 150);
    
    // House roof
    this.ctx.fillStyle = '#5a3a6a';
    this.ctx.beginPath();
    this.ctx.moveTo(width - 210, groundY - 150);
    this.ctx.lineTo(width - 140, groundY - 200);
    this.ctx.lineTo(width - 70, groundY - 150);
    this.ctx.fill();
    
    // House door
    this.ctx.fillStyle = '#3a2a4a';
    this.ctx.fillRect(width - 175, groundY - 80, 40, 80);
  },

  drawCharacter(char) {
    const sprite = Character.createSprite(char.character, 50);
    const x = char.character.position.x;
    const y = char.character.position.y;

    // Draw character sprite
    this.ctx.drawImage(sprite, x - 25, y - 25);

    // Draw speech bubble if message exists
    if (char.character.message) {
      this.drawSpeechBubble(x, y - 40, char.character.message);
    }

    // Highlight selected character
    if (this.selectedCharacter && this.selectedCharacter.id === char.id) {
      this.ctx.strokeStyle = '#ffd700';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 30, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  },

  drawSpeechBubble(x, y, message) {
    this.ctx.font = '8px "Press Start 2P"';
    const metrics = this.ctx.measureText(message);
    const bubbleWidth = Math.min(metrics.width + 20, 200);
    const bubbleHeight = 30;
    const bubbleX = x - bubbleWidth / 2;
    const bubbleY = y - bubbleHeight;

    // Draw bubble
    this.ctx.fillStyle = '#ffffff';
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 2;
    
    // Bubble rectangle
    this.ctx.fillRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight);
    this.ctx.strokeRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight);

    // Bubble pointer
    this.ctx.beginPath();
    this.ctx.moveTo(x - 5, y);
    this.ctx.lineTo(x, bubbleY + bubbleHeight);
    this.ctx.lineTo(x + 5, y);
    this.ctx.fill();
    this.ctx.stroke();

    // Draw text
    this.ctx.fillStyle = '#000000';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      message.length > 25 ? message.substring(0, 25) + '...' : message,
      x,
      bubbleY + bubbleHeight / 2 + 4
    );
  },

  handleCanvasClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // If in move mode, move the selected character
    if (this.moveMode && this.selectedCharacter && Auth.isAdmin()) {
      window.Admin.moveCharacterTo(this.selectedCharacter.id, x, y);
      return;
    }

    // Check if clicked on a character
    let clicked = null;
    for (const char of this.characters) {
      const charX = char.character.position.x;
      const charY = char.character.position.y;
      const distance = Math.sqrt((x - charX) ** 2 + (y - charY) ** 2);
      
      if (distance < 30) {
        clicked = char;
        break;
      }
    }

    if (clicked) {
      this.selectCharacter(clicked);
    } else {
      this.deselectCharacter();
    }
  },

  selectCharacter(char) {
    this.selectedCharacter = char;
    this.render();
    this.showCharacterInfo(char);
    
    if (Auth.isAdmin() && typeof Admin !== 'undefined') {
      Admin.selectCharacter(char);
    }
  },

  deselectCharacter() {
    this.selectedCharacter = null;
    this.render();
    this.hideCharacterInfo();
    
    if (Auth.isAdmin() && typeof Admin !== 'undefined') {
      Admin.deselectCharacter();
    }
  },

  showCharacterInfo(char) {
    const panel = document.getElementById('infoPanel');
    const name = document.getElementById('infoPanelName');
    const content = document.getElementById('infoPanelContent');

    name.textContent = char.username;
    
    let html = '';
    
    if (char.character.description) {
      html += `<p><strong>Description:</strong> ${char.character.description}</p>`;
    }
    
    if (char.character.particularity) {
      html += `<p><strong>Particularity:</strong> ${char.character.particularity}</p>`;
    }

    if (char.character.traits && char.character.traits.length > 0) {
      html += '<p><strong>Traits:</strong></p><ul>';
      char.character.traits.forEach(trait => {
        html += `<li>${trait.text}</li>`;
      });
      html += '</ul>';
    }

    if (char.character.items && char.character.items.length > 0) {
      html += '<p><strong>Items:</strong></p><ul>';
      char.character.items.forEach(item => {
        html += `<li>${item.text}</li>`;
      });
      html += '</ul>';
    }

    if (char.character.history && char.character.history.length > 0) {
      html += '<p><strong>History:</strong></p><ul>';
      char.character.history.forEach(entry => {
        html += `<li>${entry.text}</li>`;
      });
      html += '</ul>';
    }

    if (char.character.interactions && char.character.interactions.length > 0) {
      html += '<p><strong>Interactions:</strong></p><ul>';
      char.character.interactions.forEach(interaction => {
        html += `<li>${interaction.message}</li>`;
      });
      html += '</ul>';
    }

    content.innerHTML = html || '<p>No additional information.</p>';
    panel.classList.remove('hidden');
  },

  hideCharacterInfo() {
    const panel = document.getElementById('infoPanel');
    panel.classList.add('hidden');
  },

  setMoveMode(enabled) {
    this.moveMode = enabled;
    this.canvas.style.cursor = enabled ? 'crosshair' : 'pointer';
  },

  cleanup() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }
};
