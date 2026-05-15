/**
 * Host Guard — Protects Host Dashboard and Add Property routes
 * Redirects non-hosts to login or regular profile.
 */
(function() {
    if (typeof AuthStorage === 'undefined') {
        console.error('Host Guard requires AuthStorage.');
        return;
    }

    var user = AuthStorage.getCurrentUser();
    
    if (!user) {
        // Not logged in at all -> send to login
        alert('Please log in to access the Host Portal.');
        window.location.href = '/component/Login/index-login.html';
    } else if (user.role !== 'host') {
        // Logged in, but not a host -> send back to normal profile
        alert('You must be a Host to view this page.');
        window.location.href = '/component/dashboard/profile.html';
    }

    document.addEventListener("DOMContentLoaded", function() {
        var profileName = document.querySelector('.host-card-profile h2');
        var profileAvatar = document.querySelector('.host-avatar-lg');
        var heroTitle = document.querySelector('.host-hero h1');

        if (profileName && user) {
            profileName.textContent = user.name;
        }
        if (profileAvatar && user && user.avatar) {
            profileAvatar.style.backgroundImage = 'url("' + user.avatar + '")';
        }
        if (heroTitle && user) {
            var firstName = user.name.split(' ')[0];
            heroTitle.textContent = 'Welcome back, ' + firstName + '.';
        }

        // Add logout handler
        var logoutBtn = document.querySelector('[data-logout]');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (AuthStorage.confirmLogout) {
                    AuthStorage.confirmLogout();
                } else {
                    AuthStorage.logout();
                }
            });
        }
    });
})();
