// Gallery Module
const Gallery = {
  images: [],
  currentIndex: 0,
  autoPlayInterval: null,

  async init() {
    await this.loadImages();
    this.setupNavigation();
  },

  async loadImages() {
    try {
      this.images = await api.getAllGalleryImages();
      this.render();
      return this.images;
    } catch (error) {
      console.error('Failed to load gallery images:', error);
      return [];
    }
  },

  setupNavigation() {
    const prevBtn = document.getElementById('gallery-prev');
    const nextBtn = document.getElementById('gallery-next');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.previous());
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.next());
    }
  },

  render() {
    const imageContainer = document.getElementById('gallery-image-container');
    const indicators = document.getElementById('gallery-indicators');

    if (!imageContainer) return;

    if (this.images.length === 0) {
      imageContainer.innerHTML = '<p style="color: white;">No images yet</p>';
      if (indicators) indicators.innerHTML = '';
      return;
    }

    const currentImage = this.images[this.currentIndex];
    const img = document.getElementById('current-gallery-image');
    
    if (img && currentImage) {
      img.src = currentImage.data;
      img.alt = currentImage.title || 'Gallery image';
    }

    // Update indicators
    if (indicators) {
      indicators.innerHTML = '';
      this.images.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'gallery-indicator' + (index === this.currentIndex ? ' active' : '');
        dot.addEventListener('click', () => this.goTo(index));
        indicators.appendChild(dot);
      });
    }
  },

  next() {
    if (this.images.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.render();
  },

  previous() {
    if (this.images.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.render();
  },

  goTo(index) {
    if (index >= 0 && index < this.images.length) {
      this.currentIndex = index;
      this.render();
    }
  },

  startAutoPlay(intervalMs = 5000) {
    this.stopAutoPlay();
    this.autoPlayInterval = setInterval(() => this.next(), intervalMs);
  },

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  },

  async addImage(imageData, title) {
    try {
      await api.addGalleryImage(imageData, title);
      await this.loadImages();
      this.currentIndex = this.images.length - 1; // Show the new image
    } catch (error) {
      console.error('Failed to add gallery image:', error);
      throw error;
    }
  },

  async deleteImage(id) {
    try {
      await api.deleteGalleryImage(id);
      await this.loadImages();
      if (this.currentIndex >= this.images.length) {
        this.currentIndex = Math.max(0, this.images.length - 1);
      }
    } catch (error) {
      console.error('Failed to delete gallery image:', error);
      throw error;
    }
  },

  // Helper function to compress and convert image to base64
  async compressImage(file, maxSizeKB = 500) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Resize if too large
          const maxDimension = 800;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Try different quality levels to meet size requirement
          let quality = 0.9;
          let result = canvas.toDataURL('image/jpeg', quality);
          
          while (result.length > maxSizeKB * 1024 * 1.37 && quality > 0.1) {
            quality -= 0.1;
            result = canvas.toDataURL('image/jpeg', quality);
          }
          
          resolve(result);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};
