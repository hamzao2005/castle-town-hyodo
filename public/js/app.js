// Main Application
const app = {
  async init() {
    // Store app reference globally
    window.app = this;

    // Initialize modules
    Auth.setupAuthModal();
    Character.setupCharacterModal();

    // Check if user is already authenticated
    const isAuthenticated = await Auth.init();

    if (isAuthenticated) {
      this.showTownView();
    } else {
      Auth.showAuthModal();
    }

    // Setup global event handlers
    this.setupEventHandlers();
  },

  setupEventHandlers() {
    const logoutBtn = document.getElementById('logoutBtn');
    const editCharacterBtn = document.getElementById('editCharacterBtn');
    const closeInfoBtn = document.getElementById('closeInfoBtn');

    logoutBtn.addEventListener('click', () => {
      Auth.logout();
      this.hideTownView();
      Auth.showAuthModal();
    });

    editCharacterBtn.addEventListener('click', () => {
      Character.showEditModal();
    });

    closeInfoBtn.addEventListener('click', () => {
      Town.hideCharacterInfo();
    });

    // User costume upload
    const uploadCostumeBtn = document.getElementById('upload-costume-btn');
    const removeCostumeBtn = document.getElementById('remove-costume-btn');
    
    if (uploadCostumeBtn) {
      uploadCostumeBtn.addEventListener('click', () => Character.uploadCostume());
    }
    
    if (removeCostumeBtn) {
      removeCostumeBtn.addEventListener('click', () => Character.removeCostume());
    }

    // Admin event handlers
    this.setupAdminEventHandlers();
  },

  setupAdminEventHandlers() {
    // NPC creation
    const addPlayerBtn = document.getElementById('add-player-btn');
    if (addPlayerBtn) {
      addPlayerBtn.addEventListener('click', () => Admin.createNPC());
    }

    // Hearts controls
    const addHeartBtn = document.getElementById('add-heart-btn');
    const removeHeartBtn = document.getElementById('remove-heart-btn');
    
    if (addHeartBtn) {
      addHeartBtn.addEventListener('click', () => Admin.updateHearts(1));
    }
    
    if (removeHeartBtn) {
      removeHeartBtn.addEventListener('click', () => Admin.updateHearts(-1));
    }

    // Category assignment
    const assignCategoryBtn = document.getElementById('assign-category-btn');
    if (assignCategoryBtn) {
      assignCategoryBtn.addEventListener('click', () => Admin.assignCategory());
    }

    // Admin costume controls
    const adminUploadCostumeBtn = document.getElementById('admin-upload-costume-btn');
    const adminRemoveCostumeBtn = document.getElementById('admin-remove-costume-btn');
    
    if (adminUploadCostumeBtn) {
      adminUploadCostumeBtn.addEventListener('click', () => Admin.uploadCostume());
    }
    
    if (adminRemoveCostumeBtn) {
      adminRemoveCostumeBtn.addEventListener('click', () => Admin.removeCostume());
    }

    // Category management
    const addCategoryBtn = document.getElementById('add-category-btn');
    if (addCategoryBtn) {
      addCategoryBtn.addEventListener('click', () => Admin.createCategory());
    }

    // Gallery management
    const uploadGalleryBtn = document.getElementById('upload-gallery-btn');
    if (uploadGalleryBtn) {
      uploadGalleryBtn.addEventListener('click', () => Admin.uploadGalleryImage());
    }
  },

  async showTownView() {
    const townView = document.getElementById('townView');
    const currentUserSpan = document.getElementById('currentUser');
    const user = Auth.getUser();

    if (!user) {
      Auth.showAuthModal();
      return;
    }

    currentUserSpan.textContent = `Welcome, ${user.username}${user.isAdmin ? ' (Admin)' : ''}`;
    townView.classList.remove('hidden');

    // Initialize categories and gallery first
    await Categories.init();
    await Gallery.init();

    // Initialize town
    Town.init();
    await Town.loadCharacters();

    // Initialize admin panel if user is admin
    if (Auth.isAdmin()) {
      Admin.init();
      Admin.loadCategoryOptions();
      Admin.renderCategoriesList();
      Admin.renderGalleryList();
    }
  },

  hideTownView() {
    const townView = document.getElementById('townView');
    townView.classList.add('hidden');
    Town.cleanup();
  }
};

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}
