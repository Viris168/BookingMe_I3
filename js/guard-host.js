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
        if (typeof BMEAlert !== 'undefined') {
            BMEAlert.show('You need to log in to access the Host Portal.', {
                title: 'Login Required', type: 'warn', icon: 'lock',
                buttonText: 'Go to Login',
                redirectUrl: '/component/Login/index-login.html'
            });
        } else {
            window.location.href = '/component/Login/index-login.html';
        }
        return;
    } else if (user.role !== 'host') {
        // Logged in, but not a host -> send back to normal profile
        if (typeof BMEAlert !== 'undefined') {
            BMEAlert.show('You must have a Host account to view this page.', {
                title: 'Access Denied', type: 'error', icon: 'block',
                buttonText: 'Go to Profile',
                redirectUrl: '/component/dashboard/profile.html'
            });
        } else {
            window.location.href = '/component/dashboard/profile.html';
        }
        return;
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
