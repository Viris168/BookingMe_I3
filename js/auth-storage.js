/**
 * AuthStorage — localStorage Auth service for BookingME
 * Simulates fullstack user authentication with Roles (user, host).
 */
const AuthStorage = (function () {
  const USERS_KEY = 'bookingme_users';
  const SESSION_KEY = 'bookingme_session';

  // ─── Internal helpers ─────────────────────────────────────
  function _getUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch {
      return [];
    }
  }

  function _saveUsers(list) {
    localStorage.setItem(USERS_KEY, JSON.stringify(list));
  }

  // Ensure default admin host exists if no users
  function _initDefaultUsers() {
    const users = _getUsers();
    if (users.length === 0) {
      users.push({
        id: 1,
        name: 'Sokha Chea',
        email: 'host@bookingme.com',
        password: 'password', // Simulate hashed pass
        role: 'host',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjtokZu6fSynbfM_6fgvaFhpVAAM8TGSOQ5lPNngUcj2BK8jIfPgA7zrYdXioW4G6Q2UGnaBIoO4cGlJNuIWX1b89n_bMQpgyikRLfvc3N6cBZdiNfbUp1_OqO1muhhjDBOaSDWBJIzBEIasAq-mY9tKRqzn7x-CvOkVhF4z3q7TbBGmRBno5Il5iLsFvx_mlYMuBxaczU8CSq6Rv4WpA9SSI2kIUqAvaOgG9aKUM0kYQBYud6S7t_35naczOSvPLMc6lCKBwXkVTg'
      });
      users.push({
        id: 2,
        name: 'Student Guest',
        email: 'user@bookingme.com',
        password: 'password',
        role: 'user',
        avatar: '../../assets/icons/icon.png'
      });
      _saveUsers(users);
    }
  }

  // Initialize on load
  _initDefaultUsers();

  // ─── Public API ───────────────────────────────────────────
  function register(name, email, password, role) {
    var users = _getUsers();
    var existingUser = users.find(function(u) { return u.email === email; });
    
    if (existingUser) {
      return { success: false, message: 'Email already in use.' };
    }

    var newUser = {
      id: Date.now(),
      name: name,
      email: email,
      password: password, // In a real app this is hashed
      role: role || 'user',
      avatar: '../../assets/icons/icon.png'
    };

    users.push(newUser);
    _saveUsers(users);

    // Auto-login after registration
    return login(email, password);
  }

  function login(email, password) {
    var users = _getUsers();
    var user = users.find(function(u) { return u.email === email && u.password === password; });

    if (user) {
      // Don't store password in session
      var sessionUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      return { success: true, user: sessionUser };
    }
    
    return { success: false, message: 'Invalid email or password.' };
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = '/index.html'; // Redirect to home
  }

  function getCurrentUser() {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function upgradeToHost() {
    var sessionUser = getCurrentUser();
    if (!sessionUser) return false;

    var users = _getUsers();
    var dbUser = users.find(function(u) { return u.id === sessionUser.id; });
    
    if (dbUser) {
      dbUser.role = 'host';
      sessionUser.role = 'host';
      
      _saveUsers(users);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      return true;
    }
    return false;
  }

  function confirmLogout() {
    if (typeof BMEAlert !== 'undefined') {
      BMEAlert.ask("Are you sure you want to log out of your account?", {
        title: "Log out",
        type: "logout",
        icon: "logout",
        confirmText: "Yes, log out",
        cancelText: "Cancel",
        onConfirm: function() { logout(); }
      });
    } else {
      // Fallback if BMEAlert isn't loaded
      if (window.confirm("Are you sure you want to log out?")) {
        logout();
      }
    }
  }

  return {
    register: register,
    login: login,
    logout: logout,
    confirmLogout: confirmLogout,
    getCurrentUser: getCurrentUser,
    upgradeToHost: upgradeToHost
  };
})();
