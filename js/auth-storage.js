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
    if (document.getElementById('custom-logout-modal')) {
      document.getElementById('custom-logout-modal').remove();
    }

    var modalHTML = '\
      <div id="custom-logout-modal" style="position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; background:rgba(15,23,42,0.4); backdrop-filter:blur(4px); opacity:0; transition:opacity 0.25s ease;">\
          <div id="logout-modal-content" style="width:100%; max-width:380px; background:#fff; padding:24px; border-radius:20px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); transform:scale(0.95); opacity:0; transition:all 0.25s cubic-bezier(0.4, 0, 0.2, 1); margin:0 16px;">\
              <div style="display:flex; align-items:flex-start; gap:16px;">\
                  <div style="display:flex; flex-shrink:0; align-items:center; justify-content:center; width:48px; height:48px; border-radius:100px; background:#fee2e2; color:#dc2626;">\
                      <span class="material-symbols-outlined" style="font-size:24px;">logout</span>\
                  </div>\
                  <div>\
                      <h3 style="margin:0; font-size:18px; font-weight:800; color:#0f172a; font-family:\'Inter\', sans-serif;">Log out</h3>\
                      <p style="margin:6px 0 0; font-size:14px; color:#64748b; font-family:\'Inter\', sans-serif; line-height:1.5;">Are you sure you want to log out of your account?</p>\
                  </div>\
              </div>\
              <div style="margin-top:24px; display:flex; gap:12px; justify-content:flex-end;">\
                  <button id="btn-cancel-logout" style="padding:10px 16px; border-radius:12px; border:1px solid #e2e8f0; background:#fff; color:#475569; font-weight:700; font-size:14px; cursor:pointer; font-family:\'Inter\', sans-serif; transition:all 0.2s;">Cancel</button>\
                  <button id="btn-confirm-logout" style="padding:10px 16px; border-radius:12px; border:none; background:#dc2626; color:#fff; font-weight:700; font-size:14px; cursor:pointer; font-family:\'Inter\', sans-serif; box-shadow:0 4px 12px rgba(220,38,38,0.2); transition:all 0.2s;">Yes, log out</button>\
              </div>\
          </div>\
      </div>';

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    var modal = document.getElementById('custom-logout-modal');
    var content = document.getElementById('logout-modal-content');
    
    // Animate in
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        modal.style.opacity = '1';
        content.style.opacity = '1';
        content.style.transform = 'scale(1)';
      });
    });

    function closeAnd(callback) {
      modal.style.opacity = '0';
      content.style.opacity = '0';
      content.style.transform = 'scale(0.95)';
      setTimeout(function() {
        modal.remove();
        if (callback) callback();
      }, 250);
    }

    document.getElementById('btn-cancel-logout').addEventListener('click', function() { closeAnd(); });
    document.getElementById('btn-confirm-logout').addEventListener('click', function() { closeAnd(logout); });
    
    // Hover effects
    document.getElementById('btn-cancel-logout').onmouseover = function() { this.style.background = '#f8fafc'; this.style.color = '#0f172a'; };
    document.getElementById('btn-cancel-logout').onmouseout = function() { this.style.background = '#fff'; this.style.color = '#475569'; };
    document.getElementById('btn-confirm-logout').onmouseover = function() { this.style.background = '#b91c1c'; };
    document.getElementById('btn-confirm-logout').onmouseout = function() { this.style.background = '#dc2626'; };
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
