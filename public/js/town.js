// Town Module
const Town = {
  canvas: null,
  ctx: null,
  characters: [],
  selectedCharacter: null,
  moveMode: false,
  refreshInterval: null,
  
  // Isometric settings
  tileWidth: 64,
  tileHeight: 32,
  gridWidth: 12,
  gridHeight: 12,

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
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.render();
  },
  
  // Convert cartesian coordinates to isometric
  cartesianToIsometric(x, y) {
    return {
      isoX: (x - y) * this.tileWidth / 2,
      isoY: (x + y) * this.tileHeight / 2
    };
  },
  
  // Convert screen coordinates to grid coordinates
  screenToGrid(screenX, screenY) {
    const offsetX = this.canvas.width / 2;
    const offsetY = 100;
    
    const relX = screenX - offsetX;
    const relY = screenY - offsetY;
    
    const gridX = Math.floor((relX / this.tileWidth + relY / this.tileHeight));
    const gridY = Math.floor((relY / this.tileHeight - relX / this.tileWidth));
    
    return { gridX, gridY };
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

    // Draw background (black space)
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, width, height);

    // Draw isometric room
    this.drawIsometricRoom(width, height);

    // Draw decorations
    this.drawDecorations();

    // Sort and draw characters by depth (Y position for proper layering)
    const sortedCharacters = [...this.characters].sort((a, b) => {
      return a.character.position.y - b.character.position.y;
    });
    
    sortedCharacters.forEach(char => this.drawCharacter(char));
  },
  
  drawIsometricRoom(width, height) {
    const offsetX = width / 2;
    const offsetY = 100;
    
    // Draw floor tiles
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const iso = this.cartesianToIsometric(x, y);
        const screenX = offsetX + iso.isoX;
        const screenY = offsetY + iso.isoY;
        
        this.drawFloorTile(screenX, screenY, (x + y) % 2 === 0);
      }
    }
    
    // Draw back wall (L-shaped)
    this.drawWalls(offsetX, offsetY);
    
    // Draw windows on walls
    this.drawWindows(offsetX, offsetY);
  },
  
  drawFloorTile(x, y, isAlt) {
    const w = this.tileWidth;
    const h = this.tileHeight;
    
    // Draw diamond/rhombus shape
    this.ctx.fillStyle = isAlt ? '#4A9B9B' : '#5AABAB';
    this.ctx.strokeStyle = '#2A6B6B';
    this.ctx.lineWidth = 1;
    
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x + w/2, y + h/2);
    this.ctx.lineTo(x, y + h);
    this.ctx.lineTo(x - w/2, y + h/2);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  },
  
  drawWalls(offsetX, offsetY) {
    // Left wall
    this.ctx.fillStyle = '#7ECFC0';
    this.ctx.strokeStyle = '#2A6B6B';
    this.ctx.lineWidth = 3;
    
    const leftWallPoints = [
      { x: offsetX - this.tileWidth * 6, y: offsetY },
      { x: offsetX, y: offsetY - this.tileHeight * 6 },
      { x: offsetX, y: offsetY + this.tileHeight * 2 },
      { x: offsetX - this.tileWidth * 6, y: offsetY + this.tileHeight * 8 }
    ];
    
    this.ctx.beginPath();
    this.ctx.moveTo(leftWallPoints[0].x, leftWallPoints[0].y);
    leftWallPoints.forEach(p => this.ctx.lineTo(p.x, p.y));
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
    
    // Right wall
    const rightWallPoints = [
      { x: offsetX, y: offsetY - this.tileHeight * 6 },
      { x: offsetX + this.tileWidth * 6, y: offsetY },
      { x: offsetX + this.tileWidth * 6, y: offsetY + this.tileHeight * 8 },
      { x: offsetX, y: offsetY + this.tileHeight * 2 }
    ];
    
    this.ctx.beginPath();
    this.ctx.moveTo(rightWallPoints[0].x, rightWallPoints[0].y);
    rightWallPoints.forEach(p => this.ctx.lineTo(p.x, p.y));
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  },
  
  drawWindows(offsetX, offsetY) {
    // Windows on left wall
    for (let i = 0; i < 3; i++) {
      const x = offsetX - this.tileWidth * 5 + i * this.tileWidth * 2;
      const y = offsetY + this.tileHeight * 2 + i * this.tileHeight;
      
      this.ctx.fillStyle = '#5AABAB';
      this.ctx.strokeStyle = '#2A6B6B';
      this.ctx.lineWidth = 2;
      this.ctx.fillRect(x, y, 30, 40);
      this.ctx.strokeRect(x, y, 30, 40);
      
      // Window panes
      this.ctx.strokeStyle = '#2A6B6B';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(x + 15, y);
      this.ctx.lineTo(x + 15, y + 40);
      this.ctx.moveTo(x, y + 20);
      this.ctx.lineTo(x + 30, y + 20);
      this.ctx.stroke();
    }
    
    // Windows on right wall
    for (let i = 0; i < 3; i++) {
      const x = offsetX + this.tileWidth * 3 + i * this.tileWidth * 1.5;
      const y = offsetY + this.tileHeight + i * this.tileHeight;
      
      this.ctx.fillStyle = '#5AABAB';
      this.ctx.strokeStyle = '#2A6B6B';
      this.ctx.lineWidth = 2;
      this.ctx.fillRect(x, y, 30, 40);
      this.ctx.strokeRect(x, y, 30, 40);
      
      // Window panes
      this.ctx.strokeStyle = '#2A6B6B';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(x + 15, y);
      this.ctx.lineTo(x + 15, y + 40);
      this.ctx.moveTo(x, y + 20);
      this.ctx.lineTo(x + 30, y + 20);
      this.ctx.stroke();
    }
  },
  
  drawDecorations() {
    const offsetX = this.canvas.width / 2;
    const offsetY = 100;
    
    // Draw plants
    this.drawPlant(offsetX - 200, offsetY + 200);
    this.drawPlant(offsetX + 200, offsetY + 200);
    
    // Draw lamps
    this.drawLamp(offsetX - 150, offsetY + 150);
    this.drawLamp(offsetX + 150, offsetY + 150);
    
    // Draw sofa
    this.drawSofa(offsetX, offsetY + 300);
  },
  
  drawPlant(x, y) {
    // Pot
    this.ctx.fillStyle = '#8B4513';
    this.ctx.strokeStyle = '#2A6B6B';
    this.ctx.lineWidth = 2;
    this.ctx.fillRect(x - 15, y + 20, 30, 25);
    this.ctx.strokeRect(x - 15, y + 20, 30, 25);
    
    // Leaves
    this.ctx.fillStyle = '#4A8B4A';
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const leafX = x + Math.cos(angle) * 20;
      const leafY = y + Math.sin(angle) * 20;
      
      this.ctx.beginPath();
      this.ctx.arc(leafX, leafY, 12, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.strokeStyle = '#2A6B6B';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }
  },
  
  drawLamp(x, y) {
    // Lamp post
    this.ctx.fillStyle = '#FFD700';
    this.ctx.strokeStyle = '#2A6B6B';
    this.ctx.lineWidth = 2;
    this.ctx.fillRect(x - 3, y, 6, 40);
    this.ctx.strokeRect(x - 3, y, 6, 40);
    
    // Lamp shade
    this.ctx.fillStyle = '#FFA500';
    this.ctx.beginPath();
    this.ctx.arc(x, y, 15, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    
    // Light glow
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 40);
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 40, 0, Math.PI * 2);
    this.ctx.fill();
  },
  
  drawSofa(x, y) {
    // Sofa base
    this.ctx.fillStyle = '#FF6B6B';
    this.ctx.strokeStyle = '#2A6B6B';
    this.ctx.lineWidth = 2;
    this.ctx.fillRect(x - 60, y, 120, 40);
    this.ctx.strokeRect(x - 60, y, 120, 40);
    
    // Sofa back
    this.ctx.fillRect(x - 60, y - 20, 120, 20);
    this.ctx.strokeRect(x - 60, y - 20, 120, 20);
    
    // Sofa arms
    this.ctx.fillRect(x - 70, y - 10, 10, 40);
    this.ctx.strokeRect(x - 70, y - 10, 10, 40);
    this.ctx.fillRect(x + 60, y - 10, 10, 40);
    this.ctx.strokeRect(x + 60, y - 10, 10, 40);
  },

  drawCharacter(char) {
    const sprite = Character.createSprite(char.character, 50);
    const x = char.character.position.x;
    const y = char.character.position.y;

    // Draw shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.beginPath();
    this.ctx.ellipse(x, y + 20, 20, 10, 0, 0, Math.PI * 2);
    this.ctx.fill();

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
