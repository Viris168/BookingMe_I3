/**
 * UserStorage — Handles Bookings and Favorites for the currently logged in user.
 * Connects with AuthStorage to store data per-user.
 */
const UserStorage = (function () {
  const DATA_KEY = 'bookingme_user_data';

  // Helper: Get all user data
  function _getAllData() {
    try {
      return JSON.parse(localStorage.getItem(DATA_KEY)) || {};
    } catch {
      return {};
    }
  }

  // Helper: Get data for current user
  function _getCurrentUserData() {
    if (typeof AuthStorage === 'undefined') return { favorites: [], bookings: [] };
    const user = AuthStorage.getCurrentUser();
    if (!user) return { favorites: [], bookings: [] };

    const allData = _getAllData();
    if (!allData[user.id]) {
      allData[user.id] = { favorites: [], bookings: [] };
      localStorage.setItem(DATA_KEY, JSON.stringify(allData));
    }
    return allData[user.id];
  }

  // Helper: Save data for current user
  function _saveCurrentUserData(userData) {
    if (typeof AuthStorage === 'undefined') return;
    const user = AuthStorage.getCurrentUser();
    if (!user) return;

    const allData = _getAllData();
    allData[user.id] = userData;
    localStorage.setItem(DATA_KEY, JSON.stringify(allData));
  }


  // --- Favorites API ---

  function getFavorites() {
    return _getCurrentUserData().favorites || [];
  }

  function addFavorite(property) {
    const data = _getCurrentUserData();
    data.favorites = data.favorites || [];
    
    // Check if already favorited
    if (!data.favorites.some(p => p.id === property.id)) {
        property.savedOn = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        data.favorites.push(property);
        _saveCurrentUserData(data);
    }
  }

  function removeFavorite(propertyId) {
    const data = _getCurrentUserData();
    data.favorites = (data.favorites || []).filter(p => p.id !== propertyId);
    _saveCurrentUserData(data);
  }

  function isFavorite(propertyId) {
    return getFavorites().some(p => p.id === propertyId);
  }

  function toggleFavorite(property) {
    if (isFavorite(property.id)) {
        removeFavorite(property.id);
        return false;
    } else {
        addFavorite(property);
        return true;
    }
  }


  // --- Bookings API ---

  function getBookings() {
    return _getCurrentUserData().bookings || [];
  }

  function addBooking(bookingData) {
    const data = _getCurrentUserData();
    data.bookings = data.bookings || [];
    
    const newBooking = Object.assign({}, bookingData, {
      bookingId: 'HK-' + Math.floor(Math.random() * 90000 + 10000),
      status: 'upcoming', // upcoming, completed, cancelled
      bookedOn: new Date().toISOString()
    });

    data.bookings.push(newBooking);
    _saveCurrentUserData(data);
    return newBooking;
  }

  function cancelBooking(bookingId) {
    const data = _getCurrentUserData();
    const booking = (data.bookings || []).find(b => b.bookingId === bookingId);
    if (booking) {
      booking.status = 'cancelled';
      _saveCurrentUserData(data);
    }
  }

  function completeBooking(bookingId) {
      // Helper to simulate a past stay
      const data = _getCurrentUserData();
      const booking = (data.bookings || []).find(b => b.bookingId === bookingId);
      if (booking) {
        booking.status = 'completed';
        _saveCurrentUserData(data);
      }
  }

  return {
    getFavorites: getFavorites,
    addFavorite: addFavorite,
    removeFavorite: removeFavorite,
    isFavorite: isFavorite,
    toggleFavorite: toggleFavorite,
    
    getBookings: getBookings,
    addBooking: addBooking,
    cancelBooking: cancelBooking,
    completeBooking: completeBooking
  };
})();
