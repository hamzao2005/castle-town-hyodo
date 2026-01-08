// Auth Module
const Auth = {
  currentUser: null,

  async init() {
    const token = api.getToken();
    if (token) {
      const result = await api.verifyToken();
      if (result.valid) {
        this.currentUser = result.user;
        return true;
      } else {
        api.logout();
        return false;
      }
    }
    return false;
  },

  async login(username, password) {
    try {
      const data = await api.login(username, password);
      this.currentUser = data.user;
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async register(username, password, character) {
    try {
      const data = await api.register(username, password, character);
      this.currentUser = data.user;
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  logout() {
    api.logout();
    this.currentUser = null;
  },

  isAuthenticated() {
    return this.currentUser !== null;
  },

  isAdmin() {
    return this.currentUser && this.currentUser.isAdmin;
  },

  getUser() {
    return this.currentUser;
  },

  setupAuthModal() {
    const authModal = document.getElementById('authModal');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const authError = document.getElementById('authError');

    const showError = (message) => {
      authError.textContent = message;
    };

    const clearError = () => {
      authError.textContent = '';
    };

    loginBtn.addEventListener('click', async () => {
      clearError();
      const username = usernameInput.value.trim();
      const password = passwordInput.value;

      if (!username || !password) {
        showError('Please enter username and password');
        return;
      }

      const result = await this.login(username, password);
      if (result.success) {
        authModal.classList.add('hidden');
        window.app.showTownView();
      } else {
        showError(result.error);
      }
    });

    registerBtn.addEventListener('click', async () => {
      clearError();
      const username = usernameInput.value.trim();
      const password = passwordInput.value;

      if (!username || !password) {
        showError('Please enter username and password');
        return;
      }

      if (username.length < 3) {
        showError('Username must be at least 3 characters');
        return;
      }

      if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
      }

      // Show character customization modal
      authModal.classList.add('hidden');
      Character.showCustomizationModal(async (characterData) => {
        const result = await this.register(username, password, characterData);
        if (result.success) {
          window.app.showTownView();
        } else {
          authModal.classList.remove('hidden');
          showError(result.error);
        }
      });
    });

    // Allow Enter key to login
    passwordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        loginBtn.click();
      }
    });
  },

  showAuthModal() {
    const authModal = document.getElementById('authModal');
    authModal.classList.remove('hidden');
  },

  hideAuthModal() {
    const authModal = document.getElementById('authModal');
    authModal.classList.add('hidden');
  }
};
