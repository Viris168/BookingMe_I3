/**
 * User Dashboard Render Logic
 * Appends dynamic bookings/favorites from UserStorage alongside the static HTML cards.
 * The static cards in the HTML stay untouched; new data is injected after them.
 */
function initUserDashboard() {
    // Check which page we're on
    var mainTitle = document.querySelector('.dashboard-content-wide h1');
    var isFavoritesPage = mainTitle && mainTitle.textContent.indexOf('Favorites') !== -1;
    var isBookingHistoryPage = mainTitle && mainTitle.textContent.indexOf('Booking History') !== -1;
    var isBookingStatusPage = mainTitle && mainTitle.textContent.indexOf('Booking Status') !== -1;

    // Find the @container div that holds the cards — it has gap-8 or gap-6 AND @container
    var cardsContainer = document.querySelector('.dashboard-content-wide .flex.flex-col.gap-8')
                      || document.querySelector('.dashboard-content-wide .flex.flex-col.gap-6');

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

// --- Helper: format a date string for display ---
function formatDateForDisplay(dateStr) {
    if (!dateStr) return 'N/A';
    // Try to parse — works for YYYY-MM-DD and most date formats
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) {
        // If it can't be parsed, just return the original string
        return dateStr;
    }
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

// --- Helper: normalize image path for dashboard depth ---
function normalizeDashboardImage(image) {
    if (!image) return '../../assets/images/room1.jpg';
    if (image.startsWith('./assets/')) return '../../' + image.substring(2);
    if (image.startsWith('/assets/')) return '../../' + image.substring(1);
    return image;
}

// ---- FAVORITES ----
function renderFavorites(container) {
    if (typeof UserStorage === 'undefined') return;
    var favorites = UserStorage.getFavorites();

    // Remove any previously injected dynamic cards
    var oldDyn = container.querySelectorAll('.bme-dynamic');
    oldDyn.forEach(function(el) { el.remove(); });

    if (favorites.length === 0) return;

    favorites.forEach(function(prop) {
        var image = normalizeDashboardImage(prop.image || (prop.images && prop.images[0]));

        var card = document.createElement('div');
        card.className = 'glass-panel listing-card group bme-dynamic';
        card.innerHTML = '\
            <div class="listing-card-media" style="background-image: url(\'' + image + '\');"></div>\
            <div class="flex-1 w-full">\
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-2">\
                <div>\
                  <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-1">' + (prop.title || 'Property') + '</h3>\
                  <p class="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1">\
                    <span class="material-symbols-outlined text-[16px]">location_on</span>\
                    ' + (prop.location || 'Unknown') + '\
                  </p>\
                </div>\
                <div class="text-left sm:text-right shrink-0">\
                  <p class="text-xl font-bold text-mekong-blue dark:text-primary">$' + (prop.price || 0) + ' / night</p>\
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
            </div>';
        container.appendChild(card);
    });
}

// ---- BOOKINGS ----
function renderBookings(container, statusFilter) {
    if (typeof UserStorage === 'undefined') return;
    var allBookings = UserStorage.getBookings();

    var bookings = allBookings.filter(function(b) {
        if (statusFilter === 'upcoming') return b.status === 'upcoming';
        if (statusFilter === 'completed') return b.status === 'completed';
        if (statusFilter === 'cancelled') return b.status === 'cancelled';
        return true;
    });

    // Remove any previously injected dynamic cards
    var oldDyn = container.querySelectorAll('.bme-dynamic');
    oldDyn.forEach(function(el) { el.remove(); });

    if (bookings.length === 0) return;

    bookings.forEach(function(b) {
        var prop = b.property || {};
        var image = normalizeDashboardImage(prop.image || (prop.images && prop.images[0]));
        var hostImage = normalizeDashboardImage(prop.hostImage);

        var isUpcoming = b.status === 'upcoming';
        var badgeColor, badgeIcon, badgeLabel;
        if (isUpcoming) {
            badgeColor = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            badgeIcon = 'pending_actions';
            badgeLabel = 'Upcoming';
        } else if (b.status === 'completed') {
            badgeColor = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            badgeIcon = 'event_available';
            badgeLabel = 'Confirmed';
        } else {
            badgeColor = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            badgeIcon = 'cancel';
            badgeLabel = 'Cancelled';
        }

        var actionBtns = '';
        if (isUpcoming) {
            actionBtns = '\
                <button class="px-5 py-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm text-sm flex items-center gap-2">\
                    <span class="material-symbols-outlined text-[18px]">chat</span> Contact\
                </button>\
                <button onclick="UserStorage.cancelBooking(\'' + b.bookingId + '\'); window.location.reload();" class="px-6 py-2.5 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5 text-sm flex items-center gap-2 shadow-md">\
                    Cancel <span class="material-symbols-outlined text-[18px]">close</span>\
                </button>';
        } else {
            actionBtns = '\
                <button class="px-5 py-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm text-sm flex items-center gap-2">\
                    <span class="material-symbols-outlined text-[18px]">chat</span> Contact\
                </button>\
                <button class="px-6 py-2.5 rounded-full bg-gradient-to-r from-mekong-blue to-mekong-blue-light text-white font-semibold hover:shadow-glow-blue transition-all hover:-translate-y-0.5 text-sm flex items-center gap-2 shadow-md">\
                    Manage <span class="material-symbols-outlined text-[18px]">arrow_forward</span>\
                </button>';
        }

        var card = document.createElement('div');
        card.className = 'glass-panel rounded-3xl p-6 flex flex-col @[800px]:flex-row gap-8 items-start @[800px]:items-center relative overflow-hidden group hover:shadow-lg transition-all duration-300 bme-dynamic';
        card.innerHTML = '\
            <div class="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent dark:from-slate-800/60 pointer-events-none"></div>\
            <div class="w-full @[800px]:w-1/3 aspect-[4/3] rounded-2xl bg-cover bg-center shadow-inner relative z-10 overflow-hidden" style="background-image: url(\'' + image + '\');"></div>\
            <div class="flex-1 flex flex-col gap-4 relative z-10">\
              <div class="flex justify-between items-start w-full">\
                <div>\
                  <div class="flex items-center gap-2 mb-2">\
                    <span class="' + badgeColor + ' px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">\
                      <span class="material-symbols-outlined text-[14px]">' + badgeIcon + '</span> ' + badgeLabel + '\
                    </span>\
                    <span class="text-slate-400 text-sm font-medium">Booking ID: #' + b.bookingId + '</span>\
                  </div>\
                  <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-1">' + (prop.title || 'Unknown Property') + '</h2>\
                  <p class="text-slate-500 dark:text-slate-400 flex items-center gap-1 text-sm font-medium">\
                    <span class="material-symbols-outlined text-[18px]">location_on</span>\
                    ' + (prop.location || 'Unknown') + '\
                  </p>\
                </div>\
              </div>\
              <div class="grid grid-cols-2 gap-4 py-4 border-y border-slate-200/50 dark:border-slate-700/50">\
                <div>\
                  <p class="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Check-in</p>\
                  <p class="text-slate-800 dark:text-slate-200 font-semibold">' + formatDateForDisplay(b.checkIn) + '</p>\
                  <p class="text-sm text-slate-500">2:00 PM</p>\
                </div>\
                <div>\
                  <p class="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Check-out</p>\
                  <p class="text-slate-800 dark:text-slate-200 font-semibold">' + formatDateForDisplay(b.checkOut) + '</p>\
                  <p class="text-sm text-slate-500">11:00 AM</p>\
                </div>\
              </div>\
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-2">\
                <div class="flex items-center gap-3">\
                  <div class="bg-cover bg-center size-10 rounded-full border-2 border-white shadow-sm" style="background-image: url(\'' + hostImage + '\');"></div>\
                  <div>\
                    <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">Hosted by ' + (prop.host || 'BookingME') + '</p>\
                    <p class="text-xs text-slate-500">Superhost</p>\
                  </div>\
                </div>\
                <div class="flex gap-3">\
                  ' + actionBtns + '\
                </div>\
              </div>\
            </div>';
        container.appendChild(card);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUserDashboard);
} else {
    initUserDashboard();
}
