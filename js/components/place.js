
const listProductHTML = document.querySelector('#ListProduct');
const paginationControls = document.querySelector('#pagination-controls');

let listProduct = [];
const itemsPerPage = 4;
let currentPage = 1;
let activeFilter = 'all';
let activeLocation = '';
let activeId = null;
let mapFlightToken = 0;



const slugifyLocation = (value = '') =>
    value.toLowerCase().trim().replace(/\s+/g, '-');

const getFilteredProducts = () => {
    let products = [...listProduct];

    if (activeFilter === 'affordable') {
        products = products.sort((a, b) => a.price - b.price);
    } else if (activeFilter === 'campus') {
        products = products.filter(p => p.category === 'campus');
    }

    if (activeLocation) {
    products = products.filter(p =>
        slugifyLocation(p.location) === activeLocation &&
        p.category === 'campus'
    );
    }


    return products;
};



const createProductCard = (product) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.dataset.productId = product.id;

    const imageSrc = (product.image || '/assets/images/Image.png').replace('./', '/');
    const fallbackSrc = '/assets/images/Image.png';

    card.innerHTML = `
        <div class="card-img">
            <img src="${imageSrc}" alt="${product.title}" loading="lazy" onerror="this.onerror=null;this.src='${fallbackSrc}';" />
        </div>
        <div class="card-body">
            <div class="card-header">
                <div class="card-rating">
                    <span class="star">&#9733;</span>
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


    card.addEventListener('click', () => {
        selectHotel(product.id);
    });

    return card;
};



const addDataToHTML = () => {
    if (!listProductHTML) return;

    listProductHTML.innerHTML = '';
    const products = getFilteredProducts();

    if (!products.length) {
        listProductHTML.innerHTML = `
            <p class="empty-state">No listings available right now.</p>
        `;
        if (paginationControls) paginationControls.innerHTML = '';
        if (window.BookingMEI18n) window.BookingMEI18n.apply(listProductHTML);
        return;
    }

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = products.slice(start, end);

    paginatedItems.forEach(product => {
        listProductHTML.appendChild(createProductCard(product));
    });

    renderPagination(products.length);
    if (window.BookingMEI18n) {
        window.BookingMEI18n.apply(listProductHTML);
        if (paginationControls) window.BookingMEI18n.apply(paginationControls);
    }
};



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

const initPlaceFilter = () => {
    const placeSelect = document.getElementById('place-select');
    if (!placeSelect) return;

    if (activeLocation) {
        placeSelect.value = activeLocation;
        const selected = document.querySelector(`.custom-place-option[data-value="${activeLocation}"]`);
        if (selected) {
            document.querySelectorAll(".custom-place-option").forEach(opt => opt.classList.remove("selected"));
            selected.classList.add("selected");
            const placeValue = document.getElementById("placeValue");
            if (placeValue) placeValue.innerText = selected.innerText;
        }
    }

    placeSelect.addEventListener('change', () => {
        activeLocation = placeSelect.value;
        currentPage = 1;
        addDataToHTML();
        flyToPlace(activeLocation);
    });
};




const map = L.map('map').setView([11.5620, 104.9240], 14);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const placeCameras = {
    '': { center: [12.5657, 104.9910], zoom: 7 },
    'phnom-penh': { center: [11.5620, 104.9240], zoom: 13 },
    'siem-reap': { center: [13.3633, 103.8564], zoom: 13 },
    'kampot': { center: [10.6104, 104.1810], zoom: 13 },
    'kampong-cham': { center: [11.9934, 105.4635], zoom: 13 },
    'kep': { center: [10.4829, 104.3167], zoom: 13 },
    'battambang': { center: [13.0957, 103.2022], zoom: 13 },
    'mondulkiri': { center: [12.4558, 107.1881], zoom: 12 },
    'ratanakiri': { center: [13.7394, 106.9873], zoom: 12 },
    'preah-vihear': { center: [14.3904, 104.6806], zoom: 12 },
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

    let resizeTimer = null;
    window.addEventListener('resize', () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => map.invalidateSize(), 160);
    });

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


function selectHotel(id) {
    const hotel = listProduct.find(h => h.id === id);
    if (!hotel) return;


    document.querySelectorAll('.product-card').forEach(c => c.classList.remove('active'));


    const card = document.querySelector(`.product-card[data-product-id="${id}"]`);
    if (card) {
        card.classList.add('active');
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }


    Object.keys(markers).forEach(mid => {
        markers[mid].setIcon(makeIcon(false));
    });


    if (markers[id]) {
        markers[id].setIcon(makeIcon(true));
        markers[id].openPopup();
    }

    if (hotel.lat && hotel.lng) smoothFlyTo([hotel.lat, hotel.lng], 15);

    activeId = id;
}


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


const initProductList = async () => {
    try {
        const response = await fetch('/data/product.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        listProduct = await response.json();
        addDataToHTML();
        initFilterTabs();
        initPlaceFilter();
        initMarkers();
        if (activeLocation) {
            window.requestAnimationFrame(() => flyToPlace(activeLocation));
        }
    } catch (error) {
        console.error('Failed to load products:', error);
        if (listProductHTML) {
            listProductHTML.innerHTML = `
                <p class="error-state">Unable to load listings. Please try again later.</p>
            `;
            if (window.BookingMEI18n) window.BookingMEI18n.apply(listProductHTML);
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


    document.getElementById("placeValue").innerText = text;


    document.querySelectorAll(".custom-place-option").forEach(opt => opt.classList.remove("selected"));
    el.classList.add("selected");


    document.getElementById("placeDropdown").classList.remove("show");
    document.getElementById("placeChevron").classList.remove("open");


    const nativeSelect = document.getElementById("place-select");
    if (nativeSelect) {
        nativeSelect.value = value;
        nativeSelect.dispatchEvent(new Event('change'));
    }


    activeLocation = value;
    currentPage = 1;
    addDataToHTML();
    window.requestAnimationFrame(() => flyToPlace(value));
}


document.addEventListener("click", function (event) {
    const box = document.getElementById("placeBox");
    if (box && !box.contains(event.target)) {
        const dropdown = document.getElementById("placeDropdown");
        const chevron = document.getElementById("placeChevron");
        if (dropdown) dropdown.classList.remove("show");
        if (chevron) chevron.classList.remove("open");
    }
});
