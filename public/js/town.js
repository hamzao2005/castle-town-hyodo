// Town Module
const Town = {
  canvas: null,
  ctx: null,
  characters: [],
  selectedCharacter: null,
  refreshInterval: null,
  
  // Town settings (no longer isometric room)
  canvasWidth: 800,
  canvasHeight: 600,

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
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
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

    // Draw sky
    this.drawSky(width, height);

    // Draw clouds
    this.drawClouds(width, height);

    // Draw ground/grass
    this.drawGround(width, height);

    // Draw streets/paths
    this.drawStreets(width, height);

    // Draw category houses
    this.drawCategoryHouses();

    // Draw central gallery wall
    this.drawGalleryWall(width / 2, 200);

    // Draw decorations (trees, streetlights)
    this.drawDecorations();

    // Sort and draw characters by depth (Y position for proper layering)
    const sortedCharacters = [...this.characters].sort((a, b) => {
      return a.character.position.y - b.character.position.y;
    });
    
    sortedCharacters.forEach(char => this.drawCharacter(char));
  },

  drawSky(width, height) {
    // Gradient sky
    const gradient = this.ctx.createLinearGradient(0, 0, 0, height * 0.6);
    gradient.addColorStop(0, '#87CEEB'); // Light blue
    gradient.addColorStop(1, '#E0F6FF'); // Very light blue
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height * 0.6);
  },

  drawClouds(width, height) {
    const clouds = [
      { x: 100, y: 40, size: 1 },
      { x: 300, y: 70, size: 0.8 },
      { x: 500, y: 50, size: 1.2 },
      { x: 650, y: 80, size: 0.9 }
    ];

    clouds.forEach(cloud => {
      this.drawCloud(cloud.x, cloud.y, cloud.size);
    });
  },

  drawCloud(x, y, size) {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    // Draw cloud circles
    const baseSize = 20 * size;
    this.ctx.beginPath();
    this.ctx.arc(x, y, baseSize, 0, Math.PI * 2);
    this.ctx.arc(x + baseSize, y - baseSize * 0.3, baseSize * 0.8, 0, Math.PI * 2);
    this.ctx.arc(x + baseSize * 2, y, baseSize * 0.9, 0, Math.PI * 2);
    this.ctx.arc(x + baseSize * 1.5, y + baseSize * 0.5, baseSize * 0.7, 0, Math.PI * 2);
    this.ctx.fill();
  },

  drawGround(width, height) {
    // Grass ground
    this.ctx.fillStyle = '#90EE90';
    this.ctx.fillRect(0, height * 0.3, width, height * 0.7);
    
    // Add some texture
    this.ctx.fillStyle = 'rgba(70, 140, 70, 0.1)';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const y = height * 0.3 + Math.random() * height * 0.7;
      this.ctx.fillRect(x, y, 3, 3);
    }
  },

  drawStreets(width, height) {
    // Horizontal street
    const streetY = height * 0.7;
    this.ctx.fillStyle = '#808080';
    this.ctx.fillRect(0, streetY, width, 60);
    
    // Street markings
    this.ctx.fillStyle = '#FFFF00';
    for (let x = 0; x < width; x += 40) {
      this.ctx.fillRect(x, streetY + 28, 20, 4);
    }
    
    // Sidewalk
    this.ctx.fillStyle = '#A9A9A9';
    this.ctx.fillRect(0, streetY - 10, width, 10);
    this.ctx.fillRect(0, streetY + 60, width, 10);
  },

  drawCategoryHouses() {
    if (typeof Categories === 'undefined' || !Categories.categories) return;
    
    const houses = Categories.categories;
    const spacing = this.canvasWidth / (houses.length + 1);
    
    houses.forEach((category, index) => {
      const x = spacing * (index + 1);
      const y = 150;
      
      // Update category position if not set
      if (!category.position || category.position.x === 0) {
        category.position = { x, y };
      }
      
      this.drawHouse(category.position.x, category.position.y, category.color, category.icon, category.name);
    });
  },

  drawHouse(x, y, color, icon, name) {
    // House body
    this.ctx.fillStyle = color || '#7c5cbf';
    this.ctx.fillRect(x - 40, y, 80, 60);
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x - 40, y, 80, 60);
    
    // Roof
    this.ctx.fillStyle = '#8B4513';
    this.ctx.beginPath();
    this.ctx.moveTo(x - 50, y);
    this.ctx.lineTo(x, y - 40);
    this.ctx.lineTo(x + 50, y);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
    
    // Door
    this.ctx.fillStyle = '#654321';
    this.ctx.fillRect(x - 15, y + 30, 30, 30);
    this.ctx.strokeRect(x - 15, y + 30, 30, 30);
    
    // Window
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(x - 30, y + 15, 20, 20);
    this.ctx.strokeRect(x - 30, y + 15, 20, 20);
    this.ctx.fillRect(x + 10, y + 15, 20, 20);
    this.ctx.strokeRect(x + 10, y + 15, 20, 20);
    
    // Icon/emoji
    this.ctx.font = '24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(icon || '🏠', x, y - 45);
    
    // Name label
    this.ctx.font = '10px "Press Start 2P"';
    this.ctx.fillStyle = '#000';
    this.ctx.fillText(name || 'House', x, y + 80);
  },

  drawGalleryWall(x, y) {
    // Wall/billboard structure
    this.ctx.fillStyle = '#8B7355';
    this.ctx.fillRect(x - 100, y - 20, 200, 150);
    this.ctx.strokeStyle = '#654321';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(x - 100, y - 20, 200, 150);
    
    // Frame
    this.ctx.fillStyle = '#FFD700';
    this.ctx.fillRect(x - 90, y - 10, 180, 130);
    this.ctx.strokeStyle = '#DAA520';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x - 90, y - 10, 180, 130);
    
    // Image area
    this.ctx.fillStyle = '#FFF';
    this.ctx.fillRect(x - 85, y - 5, 170, 120);
    
    // Display current gallery image if available
    if (typeof Gallery !== 'undefined' && Gallery.images && Gallery.images.length > 0) {
      const currentImage = Gallery.images[Gallery.currentIndex];
      if (currentImage && currentImage.data) {
        const img = new Image();
        img.src = currentImage.data;
        // Draw image fitting in the frame
        this.ctx.drawImage(img, x - 85, y - 5, 170, 120);
      }
    } else {
      // Placeholder text
      this.ctx.fillStyle = '#999';
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Gallery', x, y + 55);
    }
    
    // Sign
    this.ctx.font = '8px "Press Start 2P"';
    this.ctx.fillStyle = '#000';
    this.ctx.fillText('🖼️ TOWN GALLERY', x, y + 145);
  },

  drawDecorations() {
    // Trees
    this.drawTree(120, 320);
    this.drawTree(280, 340);
    this.drawTree(520, 330);
    this.drawTree(680, 325);
    
    // Streetlights
    this.drawStreetlight(200, 360);
    this.drawStreetlight(400, 360);
    this.drawStreetlight(600, 360);
  },

  drawTree(x, y) {
    // Trunk
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(x - 8, y, 16, 40);
    this.ctx.strokeStyle = '#654321';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x - 8, y, 16, 40);
    
    // Foliage
    this.ctx.fillStyle = '#228B22';
    this.ctx.beginPath();
    this.ctx.arc(x, y - 10, 30, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#006400';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    // More foliage circles for fullness
    this.ctx.beginPath();
    this.ctx.arc(x - 15, y - 5, 20, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    
    this.ctx.beginPath();
    this.ctx.arc(x + 15, y - 5, 20, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
  },

  drawStreetlight(x, y) {
    // Post
    this.ctx.fillStyle = '#696969';
    this.ctx.fillRect(x - 3, y, 6, 80);
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x - 3, y, 6, 80);
    
    // Light
    this.ctx.fillStyle = '#FFD700';
    this.ctx.beginPath();
    this.ctx.arc(x, y - 5, 12, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    // Glow
    const gradient = this.ctx.createRadialGradient(x, y - 5, 0, x, y - 5, 30);
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y - 5, 30, 0, Math.PI * 2);
    this.ctx.fill();
  },

  drawCharacter(char) {
    const x = char.character.position.x;
    const y = char.character.position.y;

    // Draw shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.beginPath();
    this.ctx.ellipse(x, y + 20, 20, 10, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Check if character has custom costume
    if (char.character.costumeImage) {
      // Draw custom costume image
      const img = new Image();
      img.src = char.character.costumeImage;
      this.ctx.drawImage(img, x - 25, y - 25, 50, 50);
    } else {
      // Draw default sprite
      const sprite = Character.createSprite(char.character, 50);
      this.ctx.drawImage(sprite, x - 25, y - 25);
    }

    // Draw golden hearts if any
    if (char.character.goldenHearts > 0) {
      this.drawGoldenHearts(x, y - 35, char.character.goldenHearts);
    }

    // Draw speech bubble if message exists
    if (char.character.message) {
      this.drawSpeechBubble(x, y - 50, char.character.message);
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

  drawGoldenHearts(x, y, count) {
    const heartSize = 12;
    const spacing = 14;
    const totalWidth = count * spacing;
    const startX = x - totalWidth / 2;

    for (let i = 0; i < count; i++) {
      const heartX = startX + i * spacing;
      this.drawHeart(heartX, y, heartSize, '#FFD700');
    }
  },

  drawHeart(x, y, size, color) {
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 1;
    
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + size / 4);
    this.ctx.bezierCurveTo(x, y, x - size / 2, y - size / 3, x - size / 2, y + size / 4);
    this.ctx.bezierCurveTo(x - size / 2, y + size / 2, x, y + size * 0.75, x, y + size);
    this.ctx.bezierCurveTo(x, y + size * 0.75, x + size / 2, y + size / 2, x + size / 2, y + size / 4);
    this.ctx.bezierCurveTo(x + size / 2, y - size / 3, x, y, x, y + size / 4);
    this.ctx.fill();
    this.ctx.stroke();
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

  cleanup() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }
};
