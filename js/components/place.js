
const listProductHTML = document.querySelector('#ListProduct');
const paginationControls = document.querySelector('#pagination-controls');

let listProduct = [];
const itemsPerPage = 4;
let currentPage = 1;
let activeFilter = 'all'; // 'all' | 'affordable' | 'campus'
let activeLocation = '';
let activeId = null;
let mapFlightToken = 0;

/* ── helpers ─────────────────────────────────────────────────── */

const getFilteredProducts = () => {
    let products = [...listProduct];

    if (activeFilter === 'affordable') {
        products = products.sort((a, b) => a.price - b.price);
    } else if (activeFilter === 'campus') {
        products = products.filter(p => p.category === 'campus');
    }

    if (activeLocation) {
        products = products.filter(p => slugifyLocation(p.location) === activeLocation);
    }

    return products;
};

const slugifyLocation = (value = '') =>
    value.toLowerCase().trim().replace(/\s+/g, '-');

/* ── card renderer ───────────────────────────────────────────── */

const createProductCard = (product) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.dataset.productId = product.id;

    const imageSrc = (product.image || '/assets/images/Image.png').replace('./', '/');

    card.innerHTML = `
        <div class="card-img">
            <img src="${imageSrc}" alt="${product.title}" loading="lazy" />
        </div>
        <div class="card-body">
            <div class="card-header">
                <div class="card-rating">
                    <span class="star">★</span>
                    <span class="rating-value">${product.rating}</span>
                    <span class="review-count">(${product.reviews || 0} reviews)</span>
                </div>
                <button type="button" class="wishlist-btn" aria-label="Save to wishlist">
                    <i class="fa-regular fa-heart"></i>
                </button>
            </div>
            <h3 class="card-name">${product.title}</h3>
            <div class="card-pricing">
                <span class="price-label">AVG. RENT</span>
                <div class="price-row">
                    <span class="price-value">$${product.price}</span>
                    <span class="price-period">/mo</span>
                    <a href="/component/partials/Property-Detai.html?id=${product.id}" class="view-btn">View Rooms</a>
                </div>
            </div>
        </div>
    `;

    // Wishlist toggle
    const wishBtn = card.querySelector('.wishlist-btn');
    if (wishBtn) {
        wishBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const icon = wishBtn.querySelector('i');
            icon.classList.toggle('fa-regular');
            icon.classList.toggle('fa-solid');
            icon.classList.toggle('liked');
        });
    }

    // Trigger the master selection function on click
    card.addEventListener('click', () => {
        selectHotel(product.id);
    });

    return card;
};

/* ── render list ─────────────────────────────────────────────── */

const addDataToHTML = () => {
    if (!listProductHTML) return;

    listProductHTML.innerHTML = '';
    const products = getFilteredProducts();

    if (!products.length) {
        listProductHTML.innerHTML = `
            <p class="empty-state">No listings available right now.</p>
        `;
        if (paginationControls) paginationControls.innerHTML = '';
        return;
    }

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = products.slice(start, end);

    paginatedItems.forEach(product => {
        listProductHTML.appendChild(createProductCard(product));
    });

    renderPagination(products.length);
};

/* ── pagination ──────────────────────────────────────────────── */

const renderPagination = (totalItems) => {
    if (!paginationControls) return;

    paginationControls.innerHTML = '';
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;

        btn.addEventListener('click', () => {
            currentPage = i;
            addDataToHTML();
            const listTop = listProductHTML.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({ top: listTop - 100, behavior: 'smooth' });
        });

        paginationControls.appendChild(btn);
    }
};

/* ── filter tabs ─────────────────────────────────────────────── */

const initFilterTabs = () => {
    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeFilter = tab.dataset.filter;
            currentPage = 1;
            addDataToHTML();
        });
    });
};

/* ── init ─────────────────────────────────────────────────────── */

/* Map setup */
const map = L.map('map').setView([11.5620, 104.9240], 14);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

const placeCameras = {
    '': { center: [12.5657, 104.9910], zoom: 7 },
    'phnom-penh': { center: [11.5620, 104.9240], zoom: 13 },
    'siem-reap': { center: [13.3633, 103.8564], zoom: 13 },
    'kampot': { center: [10.6104, 104.1810], zoom: 13 },
    'kampong-cham': { center: [11.9934, 105.4635], zoom: 13 },
    'kep': { center: [10.4829, 104.3167], zoom: 13 },
};

const initMapToggle = () => {
    const panel = document.getElementById('map-panel');
    const frame = document.getElementById('map-frame');
    const toggle = document.getElementById('map-toggle');
    if (!panel || !toggle) return;

    const label = toggle.querySelector('[data-map-toggle-text]');
    const icon = toggle.querySelector('[data-map-toggle-icon]');

    const refreshMapSize = () => {
        map.invalidateSize();
        window.setTimeout(() => map.invalidateSize(), 320);
    };

    toggle.addEventListener('click', () => {
        const collapsed = panel.classList.toggle('is-collapsed');
        toggle.setAttribute('aria-expanded', String(!collapsed));

        if (label) label.textContent = collapsed ? 'Show map' : 'Hide map';
        if (icon) icon.textContent = collapsed ? 'expand_more' : 'expand_less';

        refreshMapSize();
    });

    if (frame) {
        frame.addEventListener('transitionend', (event) => {
            if (event.propertyName === 'height') map.invalidateSize();
        });
    }

    window.setTimeout(() => map.invalidateSize(), 0);
};

initMapToggle();

const markers = {};

const getProductsForPlace = (placeValue) => {
    const productsWithCoords = listProduct.filter(product => product.lat && product.lng);
    if (!placeValue) return productsWithCoords;

    return productsWithCoords.filter(product => slugifyLocation(product.location) === placeValue);
};

const getPlaceCamera = (placeValue) => {
    const products = getProductsForPlace(placeValue);
    if (products.length) {
        const bounds = L.latLngBounds(products.map(product => [product.lat, product.lng]));
        return {
            center: bounds.getCenter(),
            zoom: placeValue ? 13 : 7,
        };
    }

    return placeCameras[placeValue] || placeCameras[''];
};

const syncMapToggleState = (collapsed) => {
    const toggle = document.getElementById('map-toggle');
    if (!toggle) return;

    const label = toggle.querySelector('[data-map-toggle-text]');
    const icon = toggle.querySelector('[data-map-toggle-icon]');

    toggle.setAttribute('aria-expanded', String(!collapsed));
    if (label) label.textContent = collapsed ? 'Show map' : 'Hide map';
    if (icon) icon.textContent = collapsed ? 'expand_more' : 'expand_less';
};

const openCollapsedMap = () => {
    const panel = document.getElementById('map-panel');
    if (!panel || !panel.classList.contains('is-collapsed')) return 0;

    panel.classList.remove('is-collapsed');
    syncMapToggleState(false);
    map.invalidateSize();
    return 330;
};

const smoothFlyTo = (center, zoom) => {
    const token = ++mapFlightToken;
    const target = L.latLng(center);
    const distance = map.getCenter().distanceTo(target);
    const isLongFlight = distance > 80000;

    map.stop();
    map.invalidateSize();

    const finishFlight = () => {
        if (token !== mapFlightToken) return;
        map.flyTo(target, zoom, {
            animate: true,
            duration: isLongFlight ? 1.9 : 1.35,
            easeLinearity: 0.12,
        });
    };

    if (!isLongFlight) {
        finishFlight();
        return;
    }

    map.once('moveend', () => {
        window.setTimeout(finishFlight, 40);
    });

    map.flyTo(target, 8, {
        animate: true,
        duration: 1.15,
        easeLinearity: 0.16,
    });
};

const flyToPlace = (placeValue) => {
    const token = ++mapFlightToken;
    const camera = getPlaceCamera(placeValue);
    const delay = openCollapsedMap();

    window.setTimeout(() => {
        if (token !== mapFlightToken) return;
        map.closePopup();
        Object.keys(markers).forEach(id => markers[id].setIcon(makeIcon(false)));
        activeId = null;
        smoothFlyTo(camera.center, camera.zoom);
    }, delay);
};

function makeIcon(active) {
    return L.divIcon({
        className: '',
        html: `<div style="
      width: ${active ? 18 : 14}px;
      height: ${active ? 18 : 14}px;
      background: ${active ? '#1a73e8' : '#888'};
      border: 2px solid #fff;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,.3);
      transition: all .3s;
    "></div>`,
        iconSize: [active ? 18 : 14, active ? 18 : 14],
        iconAnchor: [active ? 9 : 7, active ? 9 : 7],
    });
}

/* Select a hotel — updates card + map */
function selectHotel(id) {
    const hotel = listProduct.find(h => h.id === id);
    if (!hotel) return;

    // Remove active from all cards
    document.querySelectorAll('.product-card').forEach(c => c.classList.remove('active'));

    // Add active to clicked card
    const card = document.querySelector(`.product-card[data-product-id="${id}"]`);
    if (card) {
        card.classList.add('active');
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Reset all markers to inactive
    Object.keys(markers).forEach(mid => {
        markers[mid].setIcon(makeIcon(false));
    });

    // Set clicked marker to active & fly to it
    if (markers[id]) {
        markers[id].setIcon(makeIcon(true));
        markers[id].openPopup();
    }

    if (hotel.lat && hotel.lng) smoothFlyTo([hotel.lat, hotel.lng], 15);

    activeId = id;
}

/* Create map markers after data is loaded */
const initMarkers = () => {
    listProduct.forEach(product => {
        if (!product.lat || !product.lng) return;

        const marker = L.marker([product.lat, product.lng], { icon: makeIcon(false) })
            .addTo(map)
            .bindPopup(`
              <div class="popup-inner">
                <div class="popup-name">${product.title}</div>
                <div class="popup-price">$${product.price}<small>/mo</small></div>
                <a href="/component/partials/Property-Detai.html?id=${product.id}" class="popup-btn">View Rooms</a>
              </div>
            `);

        marker.on('click', () => selectHotel(product.id));
        markers[product.id] = marker;
    });
};

/* Fetch data, render cards, then add markers */
const initProductList = async () => {
    try {
        const response = await fetch('/data/product.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        listProduct = await response.json();
        addDataToHTML();
        initFilterTabs();
        initMarkers();
    } catch (error) {
        console.error('Failed to load products:', error);
        if (listProductHTML) {
            listProductHTML.innerHTML = `
                <p class="error-state">Unable to load listings. Please try again later.</p>
            `;
        }
    }


};

initProductList();

function togglePlaceDropdown() {
    const dropdown = document.getElementById("placeDropdown");
    const chevron = document.getElementById("placeChevron");
    dropdown.classList.toggle("show");
    chevron.classList.toggle("open");
}

function selectPlace(event, el) {
    event.stopPropagation();
    const value = el.getAttribute("data-value");
    const text = el.innerText;

    // Update UI
    document.getElementById("placeValue").innerText = text;

    // Update selected class
    document.querySelectorAll(".custom-place-option").forEach(opt => opt.classList.remove("selected"));
    el.classList.add("selected");

    // Close dropdown
    document.getElementById("placeDropdown").classList.remove("show");
    document.getElementById("placeChevron").classList.remove("open");

    // Update native hidden select and trigger change for productList.js
    const nativeSelect = document.getElementById("place-select");
    if (nativeSelect) {
        nativeSelect.value = value;
        nativeSelect.dispatchEvent(new Event('change'));
    }

    // Update location filter and re-render the list
    activeLocation = value;
    currentPage = 1;
    addDataToHTML();
    window.requestAnimationFrame(() => flyToPlace(value));
}

// Close when clicking outside
document.addEventListener("click", function (event) {
    const box = document.getElementById("placeBox");
    if (box && !box.contains(event.target)) {
        const dropdown = document.getElementById("placeDropdown");
        const chevron = document.getElementById("placeChevron");
        if (dropdown) dropdown.classList.remove("show");
        if (chevron) chevron.classList.remove("open");
    }
});
