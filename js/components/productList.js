
const listProductHTML = document.querySelector('#ListProduct');
const paginationControls = document.querySelector('#pagination-controls');

let listProduct = [];
const itemsPerPage = 4;
let currentPage = 1;
let activeFilter = 'all'; // 'all' | 'affordable' | 'campus'
let activePlace = '';

/* Helpers */

const getFilteredProducts = () => {
    let products = [...listProduct];

    if (activeFilter === 'affordable') {
        products = products.sort((a, b) => a.price - b.price);
    } else if (activeFilter === 'campus') {
        products = products.filter(p => p.category === 'campus');
    }

    if (activePlace) {
        const normalizedPlace = activePlace.replace(/-/g, ' ').toLowerCase();
        products = products.filter((product) => (product.location || '').toLowerCase() === normalizedPlace);
    }

    return products;
};

/* Card renderer */

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

/* Render list */

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

/* Pagination */

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

/* Filter tabs */

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

    placeSelect.addEventListener('change', () => {
        activePlace = placeSelect.value;
        currentPage = 1;
        addDataToHTML();
    });
};

/* Init */

/* Map setup */
const map = L.map('map').setView([11.5620, 104.9240], 14);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const markers = {};

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

/* Select a hotel: updates card and map */
let activeId = null;

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

  if (hotel.lat && hotel.lng) {
    map.flyTo([hotel.lat, hotel.lng], 15, { duration: 1.2 });
  }

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
        initPlaceFilter();
        initMarkers();
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
