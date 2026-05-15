/**
 * PropertyStorage — localStorage CRUD service for BookingME
 * Handles draft wizard state and published property persistence.
 */
const PropertyStorage = (function () {
  const STORAGE_KEY = 'bookingme_properties';
  const DRAFT_KEY = 'bookingme_property_draft';

  // ─── Internal helpers ─────────────────────────────────────
  function _getAll() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function _saveAll(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function _nextId() {
    const all = _getAll();
    const maxId = all.reduce(function (max, p) {
      return Math.max(max, p.id || 0);
    }, 1000);
    return maxId + 1;
  }

  // ─── Amenity → Material icon mapping ──────────────────────
  const AMENITY_ICONS = {
    'WiFi': 'wifi',
    'Air Conditioning': 'ac_unit',
    'Hot Water': 'hot_tub',
    'Cable TV': 'tv',
    'Free Parking': 'local_parking',
    'Kitchen': 'kitchen',
    'Swimming Pool': 'pool',
    'Balcony': 'balcony',
    'Smoke Alarm': 'detector_smoke',
    'Security Camera': 'security',
    'First Aid Kit': 'medical_services',
    'Fire Extinguisher': 'fire_extinguisher',
  };

  // ─── Draft management (in-progress wizard) ────────────────
  function getDraft() {
    try {
      return JSON.parse(localStorage.getItem(DRAFT_KEY)) || {};
    } catch {
      return {};
    }
  }

  function saveDraft(partial) {
    var current = getDraft();
    var merged = Object.assign({}, current, partial, {
      updatedAt: new Date().toISOString(),
    });
    localStorage.setItem(DRAFT_KEY, JSON.stringify(merged));
    return merged;
  }

  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
  }

  // ─── Publish draft → saved property ───────────────────────
  function publish() {
    var draft = getDraft();
    if (!draft.title) return null;

    var all = _getAll();
    var currentUser = typeof AuthStorage !== 'undefined' ? AuthStorage.getCurrentUser() : null;
    var hostName = currentUser ? currentUser.name : 'You';
    var hostAvatar = currentUser ? currentUser.avatar : './assets/icons/icon.png';

    var property = Object.assign({}, draft, {
      id: draft.id || _nextId(),
      source: 'user',
      status: 'active',
      rating: 0,
      reviews: 0,
      host: draft.host || hostName,
      hostImage: draft.hostImage || hostAvatar,
      createdAt: new Date().toISOString(),
    });

    // Build features array from amenities (for card rendering compatibility)
    if (!property.features || !property.features.length) {
      if (property.amenities && property.amenities.length) {
        property.features = property.amenities.slice(0, 3).map(function (a) {
          return {
            icon: AMENITY_ICONS[a] || 'check_circle',
            label: a,
          };
        });
      } else {
        property.features = [];
      }
    }

    // Defaults
    if (!property.image) property.image = './assets/images/Image.png';
    if (!property.images || !property.images.length) property.images = [property.image];
    if (!property.price) property.price = 0;
    if (!property.maxGuests) property.maxGuests = property.guests || 1;
    if (!property.beds) property.beds = property.bedrooms || 1;
    if (!property.serviceFee) property.serviceFee = Math.round(property.price * 0.12);

    // Upsert into saved list
    var idx = -1;
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === property.id) { idx = i; break; }
    }
    if (idx >= 0) {
      all[idx] = property;
    } else {
      all.push(property);
    }

    _saveAll(all);
    clearDraft();
    return property;
  }

  // ─── CRUD operations ──────────────────────────────────────
  function getAll() {
    return _getAll();
  }

  function getActive() {
    return _getAll().filter(function (p) {
      return p.status === 'active';
    });
  }

  function getById(id) {
    return _getAll().find(function (p) {
      return p.id === Number(id);
    });
  }

  function updateStatus(id, status) {
    var all = _getAll();
    var prop = all.find(function (p) { return p.id === Number(id); });
    if (prop) {
      prop.status = status;
      _saveAll(all);
    }
  }

  function remove(id) {
    _saveAll(_getAll().filter(function (p) {
      return p.id !== Number(id);
    }));
  }

  // ─── Merge user properties with seed data (product.json) ──
  function mergeWithSeed(seedProducts) {
    var userProps = _getAll().filter(function (p) {
      return p.status === 'active';
    });
    return userProps.concat(seedProducts);
  }

  // ─── Image compression utility ────────────────────────────
  function compressImage(file, maxWidth, quality) {
    maxWidth = maxWidth || 800;
    quality = quality || 0.6;
    return new Promise(function (resolve) {
      var img = new Image();
      var canvas = document.createElement('canvas');
      img.onload = function () {
        var ratio = Math.min(maxWidth / img.width, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = URL.createObjectURL(file);
    });
  }

  // ─── Storage usage check ──────────────────────────────────
  function getStorageUsage() {
    var total = 0;
    for (var key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length * 2; // UTF-16
      }
    }
    return {
      usedBytes: total,
      usedMB: (total / (1024 * 1024)).toFixed(2),
      limitMB: 5,
      percentUsed: ((total / (5 * 1024 * 1024)) * 100).toFixed(1),
    };
  }

  // ─── Public API ───────────────────────────────────────────
  return {
    getDraft: getDraft,
    saveDraft: saveDraft,
    clearDraft: clearDraft,
    publish: publish,
    getAll: getAll,
    getActive: getActive,
    getById: getById,
    updateStatus: updateStatus,
    remove: remove,
    mergeWithSeed: mergeWithSeed,
    compressImage: compressImage,
    getStorageUsage: getStorageUsage,
  };
})();
