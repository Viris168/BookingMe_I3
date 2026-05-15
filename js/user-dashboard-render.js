/**
 * User Dashboard Render Logic
 * Dynamically replaces hardcoded favorites and bookings with real data from UserStorage.
 */
function initUserDashboard() {
    // Check which page we're on
    var isFavoritesPage = document.querySelector('h1')?.textContent.includes('Favorites');
    var isBookingHistoryPage = document.querySelector('h1')?.textContent.includes('Booking History');
    var isBookingStatusPage = document.querySelector('h1')?.textContent.includes('Booking Status');
    
    // Find the container holding the cards
    var cardsContainer = document.querySelector('.dashboard-content-wide .flex.flex-col.gap-6') || document.querySelector('.dashboard-content-wide .flex.flex-col.gap-8');
    
    if (!cardsContainer) return;

    if (isFavoritesPage) {
        renderFavorites(cardsContainer);
    } else if (isBookingHistoryPage) {
        renderBookings(cardsContainer, 'completed');
    } else if (isBookingStatusPage) {
        renderBookings(cardsContainer, 'upcoming');
        
        // Setup filter buttons
        var filterBtns = document.querySelectorAll('.dashboard-content-wide .flex.flex-wrap.gap-3 button');
        filterBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                // Update active state
                filterBtns.forEach(function(b) {
                    b.className = "px-5 py-2 rounded-full text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-all";
                });
                btn.className = "px-5 py-2 rounded-full bg-white dark:bg-slate-800 text-mekong-blue dark:text-mekong-blue-light font-semibold shadow-sm border border-slate-200 dark:border-slate-700";
                
                var status = btn.textContent.toLowerCase().trim();
                if (status === 'past stays') status = 'completed';
                renderBookings(cardsContainer, status);
            });
        });
    }

    // Also update the sidebar user profile info
    var user = typeof AuthStorage !== 'undefined' ? AuthStorage.getCurrentUser() : null;
    if (user) {
        var profileName = document.querySelector('.dashboard-profile-name');
        var profileAvatar = document.querySelector('.dashboard-profile-avatar');
        var memberPill = document.querySelector('.dashboard-member-pill');

        if (profileName) profileName.textContent = user.name;
        if (profileAvatar) profileAvatar.style.backgroundImage = 'url("' + (user.avatar || '../../assets/icons/icon.png') + '")';
        if (memberPill) {
            memberPill.innerHTML = '<span class="material-symbols-outlined text-[16px]">' + (user.role === 'host' ? 'verified' : 'stars') + '</span>' + (user.role === 'host' ? 'Host Account' : 'Traveler');
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUserDashboard);
} else {
    initUserDashboard();
}
function renderFavorites(container) {
    if (typeof UserStorage === 'undefined') return;
    var favorites = UserStorage.getFavorites();

    if (favorites.length === 0) {
        container.innerHTML = '<div class="glass-panel p-8 text-center text-slate-500 font-medium rounded-[2rem]">You have no saved favorites yet.</div>';
        return;
    }

    container.innerHTML = favorites.map(function(prop) {
        var image = prop.image || (prop.images && prop.images[0]) || '../../assets/images/room1.jpg';
        // Normalize path
        if (image.startsWith('./')) image = image.replace('./', '/');
        
        return '\
          <div class="glass-panel listing-card group">\
            <div class="listing-card-media" style="background-image: url(\'' + image + '\');"></div>\
            <div class="flex-1 w-full">\
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-2">\
                <div>\
                  <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-1">' + prop.title + '</h3>\
                  <p class="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1">\
                    <span class="material-symbols-outlined text-[16px]">location_on</span>\
                    ' + prop.location + '\
                  </p>\
                </div>\
                <div class="text-left sm:text-right shrink-0">\
                  <p class="text-xl font-bold text-mekong-blue dark:text-primary">$' + prop.price + ' / night</p>\
                </div>\
              </div>\
              <div class="grid grid-cols-2 gap-4 mt-4">\
                <div>\
                  <p class="text-xs text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider mb-1">Type</p>\
                  <p class="text-slate-800 dark:text-slate-200 font-semibold text-sm">' + (prop.type || 'Property') + '</p>\
                </div>\
                <div>\
                  <p class="text-xs text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider mb-1">Saved on</p>\
                  <p class="text-slate-800 dark:text-slate-200 font-semibold text-sm">' + (prop.savedOn || 'Recently') + '</p>\
                </div>\
              </div>\
            </div>\
            <div class="listing-card-actions">\
              <button onclick="window.location.href=\'/component/partials/Property-Detai.html?id=' + prop.id + '\'" class="flex-1 lg:flex-none bg-gradient-to-r from-primary to-[#FF9900] hover:from-[#FF9900] hover:to-primary text-white px-6 py-3 rounded-2xl font-bold shadow-glow transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 whitespace-nowrap">\
                <span class="material-symbols-outlined text-[18px]">hotel</span> Book Now\
              </button>\
              <button onclick="UserStorage.removeFavorite(' + prop.id + '); window.location.reload();" class="flex-1 lg:flex-none px-6 py-3 bg-white/50 dark:bg-slate-800/50 border border-red-200 dark:border-red-700 rounded-2xl text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors shadow-sm flex items-center justify-center gap-2 whitespace-nowrap text-red-600 dark:text-red-400">\
                <span class="material-symbols-outlined text-[18px]">delete</span> Remove\
              </button>\
            </div>\
          </div>';
    }).join('');
}

function renderBookings(container, statusFilter) {
    if (typeof UserStorage === 'undefined') return;
    var allBookings = UserStorage.getBookings();
    
    // For Booking Status page, default to upcoming, but we might want to handle past stays tabs
    var bookings = allBookings.filter(b => statusFilter === 'upcoming' ? b.status === 'upcoming' : b.status !== 'upcoming');

    if (bookings.length === 0) {
        container.innerHTML = '<div class="glass-panel p-8 text-center text-slate-500 font-medium rounded-[2rem]">No ' + statusFilter + ' bookings found.</div>';
        return;
    }

    container.innerHTML = bookings.map(function(b) {
        var prop = b.property || {};
        var image = prop.image || (prop.images && prop.images[0]) || '../../assets/images/room1.jpg';
        // Normalize path
        if (image.startsWith('./')) image = image.replace('./', '/');
        
        var isUpcoming = b.status === 'upcoming';
        var badgeColor = isUpcoming ? 'bg-blue-100 text-blue-700' : (b.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700');
        var badgeIcon = isUpcoming ? 'pending_actions' : (b.status === 'completed' ? 'event_available' : 'cancel');
        
        var actionButtons = isUpcoming 
            ? '<button onclick="UserStorage.cancelBooking(\'' + b.bookingId + '\'); window.location.reload();" class="px-6 py-2.5 rounded-full bg-white dark:bg-slate-800 border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition-colors shadow-sm text-sm flex items-center gap-2">Cancel</button>'
            : '<button onclick="window.location.href=\'/component/partials/Property-Detai.html?id=' + prop.id + '\'" class="bg-gradient-to-r from-primary to-[#FF9900] text-white px-6 py-3 rounded-2xl font-bold shadow-glow hover:-translate-y-0.5 flex gap-2"><span class="material-symbols-outlined text-[18px]">replay</span> Rebook</button>';

        return '\
          <div class="glass-panel rounded-3xl p-6 flex flex-col @[800px]:flex-row gap-8 items-start @[800px]:items-center relative overflow-hidden group hover:shadow-lg transition-all duration-300">\
            <div class="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent dark:from-slate-800/60 pointer-events-none"></div>\
            <div class="w-full @[800px]:w-1/3 aspect-[4/3] rounded-2xl bg-cover bg-center shadow-inner relative z-10 overflow-hidden" style="background-image: url(\'' + image + '\');"></div>\
            <div class="flex-1 flex flex-col gap-4 relative z-10">\
              <div class="flex justify-between items-start w-full">\
                <div>\
                  <div class="flex items-center gap-2 mb-2">\
                    <span class="' + badgeColor + ' px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">\
                      <span class="material-symbols-outlined text-[14px]">' + badgeIcon + '</span> ' + b.status + '\
                    </span>\
                    <span class="text-slate-400 text-sm font-medium">Booking ID: ' + b.bookingId + '</span>\
                  </div>\
                  <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-1">' + (prop.title || 'Unknown Property') + '</h2>\
                  <p class="text-slate-500 dark:text-slate-400 flex items-center gap-1 text-sm font-medium">\
                    <span class="material-symbols-outlined text-[18px]">location_on</span>\
                    ' + (prop.location || 'Unknown Location') + '\
                  </p>\
                </div>\
                <div class="text-right">\
                  <p class="text-xl font-bold text-mekong-blue dark:text-primary">$' + (b.totalPrice || prop.price || 0) + '</p>\
                </div>\
              </div>\
              <div class="flex justify-between items-center pt-2">\
                  ' + actionButtons + '\
              </div>\
            </div>\
          </div>';
    }).join('');
}
