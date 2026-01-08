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
  },

  showTownView() {
    const townView = document.getElementById('townView');
    const currentUserSpan = document.getElementById('currentUser');
    const user = Auth.getUser();

    if (!user) {
      Auth.showAuthModal();
      return;
    }

    currentUserSpan.textContent = `Welcome, ${user.username}${user.isAdmin ? ' (Admin)' : ''}`;
    townView.classList.remove('hidden');

    // Initialize town
    Town.init();
    Town.loadCharacters();

    // Initialize admin panel if user is admin
    if (Auth.isAdmin()) {
      Admin.init();
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
