const listProductHTML = document.querySelector('#ListProduct');
const sortSelect = document.querySelector('#property-sort');
const propertyCount = document.querySelector('#property-count');
const paginationControls = document.querySelector('#pagination-controls');

let listProduct = [];
const itemsPerPage = 3;
let currentPage = 1;
let l = '';

const normalizeAssetPath = (path, fallback = '/assets/images/Image.png') => {
    if (!path) {
        return fallback;
    }

    return path.startsWith('./') ? path.replace('./', '/') : path;
};

const imageFallback = '/assets/images/Image.png';

const updatePropertyCount = (count) => {
    if (!propertyCount) {
        return;
    }

    const roomLabel = count === 1 ? 'stay' : 'stays';
    propertyCount.textContent = `${count} ${roomLabel} available across Cambodia`;
};

const updateFilterResultCount = (count) => {
    document.querySelectorAll('[data-filter-result-count]').forEach(el => {
        el.textContent = `${count} ${count === 1 ? 'result' : 'results'}`;
    });
};

const getSortedProducts = () => {
    let products = [...listProduct];
    const filters = getFilters();
    products = products.filter(product => matchesFilters(product, filters));


    const sortSelectValue = sortSelect ? sortSelect.value : 'campus';


    products = products.filter(product => {


        const productCategory = product.category || 'campus';
        return productCategory === sortSelectValue;
    });


    if (l) {
        products = products.filter(product =>
            product.location.toLowerCase().replace(/\s/g, '-') === l.toLowerCase()
        );
    }


    return products.sort((a, b) => {
        // User properties always come first
        if (a.source === 'user' && b.source !== 'user') return -1;
        if (a.source !== 'user' && b.source === 'user') return 1;
        // Then sort by ID
        return a.id - b.id;
    });
};

const createFeaturesHTML = (features = []) =>
    features.map(feature => `
        <div class="group flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 transition-colors cursor-default hover:border-primary hover:bg-blue-50">
            <span class="material-symbols-outlined text-[13px] text-slate-400 transition-colors group-hover:text-primary">${feature.icon}</span>
            <span class="text-[10px] font-medium text-slate-600 transition-colors group-hover:text-primary">${feature.label}</span>
        </div>
    `).join('');

const addDataToHTML = () => {
    if (!listProductHTML) {
        return;
    }

    listProductHTML.innerHTML = '';
    const productsToRender = getSortedProducts();
    updatePropertyCount(productsToRender.length);
    updateFilterResultCount(productsToRender.length);

    if (!productsToRender.length) {
        listProductHTML.innerHTML = `
            <p class="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-8 text-sm text-gray-500">
                No rooms available right now.
            </p>
        `;
        return;
    }

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = productsToRender.slice(start, end);

    paginatedItems.forEach(product => {
        const newProduct = document.createElement('article');
        newProduct.className = 'w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm sm:flex transition-shadow hover:shadow-md';
        newProduct.dataset.productId = product.id;
        const featuresHTML = createFeaturesHTML(product.features);
        const imageSrc = normalizeAssetPath(product.image);

        newProduct.innerHTML = `
            <div class="relative h-36 shrink-0 sm:w-44">
                <img src="${imageSrc}" alt="${product.title}" class="h-full w-full object-cover" loading="lazy" onerror="this.onerror=null;this.src='${imageFallback}';" />
                <button type="button" class="wishlistBtn absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full transition-transform hover:scale-105">
                    <span class="wishlistIcon material-symbols-outlined text-[14px] leading-none text-gray-400">favorite</span>
                </button>
            </div>

            <div class="flex min-w-0 flex-1 flex-col justify-between p-3.5">
                <div>
                    <div class="mb-1 flex items-center justify-between gap-4">
                        <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400">${product.type}</p>
                        <div class="flex items-center gap-1 rounded bg-slate-800 px-1 py-0.5 text-[10px] font-bold text-white">
                            ${product.rating}
                            <span class="font-normal text-gray-400">/5</span>
                        </div>
                    </div>

                    <div class="mb-2 flex items-start justify-between">
                        <h3 class="text-sm font-bold text-gray-800 leading-snug break-words">${product.title}</h3>
                    </div>

                    <div class="flex flex-wrap gap-1">
                        ${featuresHTML}
                    </div>
                </div>

                <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <p class="text-lg font-bold text-gray-800">
                        $${product.price} <span class="text-[10px] font-normal text-gray-400">/ ${sortSelect && sortSelect.value === 'hotel' ? 'day' : 'month'}</span>
                    </p>
                    <button id="btn_detail" type="button" class="rounded-lg bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-primary">
                        View Detail
                    </button>
                </div>
            </div>

        `;

        const wishlistBtn = newProduct.querySelector('.wishlistBtn');
        const wishlistIcon = newProduct.querySelector('.wishlistIcon');
        if (wishlistBtn && wishlistIcon) {
            // Initial state from UserStorage
            if (typeof UserStorage !== 'undefined' && UserStorage.isFavorite(product.id)) {
                wishlistIcon.classList.remove('text-gray-400');
                wishlistIcon.classList.add('text-red-500');
            }

            wishlistBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (typeof AuthStorage !== 'undefined' && !AuthStorage.getCurrentUser()) {
                    if (typeof BMEAlert !== 'undefined') {
                        BMEAlert.show('Please log in to save to favorites.', {
                            title: 'Login Required', type: 'warn', icon: 'favorite',
                            buttonText: 'Go to Login',
                            redirectUrl: '/component/Login/index-login.html'
                        });
                    } else {
                        window.location.href = '/component/Login/index-login.html';
                    }
                    return;
                }

                if (typeof UserStorage !== 'undefined') {
                    const isFav = UserStorage.toggleFavorite(product);
                    if (isFav) {
                        wishlistIcon.classList.remove('text-gray-400');
                        wishlistIcon.classList.add('text-red-500');
                    } else {
                        wishlistIcon.classList.remove('text-red-500');
                        wishlistIcon.classList.add('text-gray-400');
                    }
                } else {
                    // Fallback UI
                    wishlistIcon.classList.toggle('text-red-500');
                    wishlistIcon.classList.toggle('text-gray-400');
                }
            });
        }

        listProductHTML.appendChild(newProduct);
    });

    renderPagination(productsToRender.length);
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
        btn.className = `w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
            i === currentPage
                ? 'bg-primary text-white cursor-default shadow-md shadow-primary/30'
                : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-primary hover:border-gray-300'
        }`;

        btn.addEventListener('click', () => {
            currentPage = i;
            addDataToHTML();


            const listTop = document.getElementById('ListProduct').getBoundingClientRect().top + window.scrollY;
            window.scrollTo({ top: listTop - 150, behavior: 'smooth' });
        });

        paginationControls.appendChild(btn);
    }
};

const showLoadError = () => {
    if (!listProductHTML) {
        return;
    }

    updatePropertyCount(0);
    listProductHTML.innerHTML = `
        <p class="rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-sm text-red-700">
            Unable to load rentals right now. Check product.json and try again.
        </p>
    `;
    if (window.BookingMEI18n) {
        window.BookingMEI18n.apply(listProductHTML);
    }
};

const initApp = async () => {
    try {
        const response = await fetch('/data/product.json');
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        listProduct = await response.json();

        // Merge user-created properties from localStorage
        if (typeof PropertyStorage !== 'undefined') {
            listProduct = PropertyStorage.mergeWithSeed(listProduct);
        }

        addDataToHTML();

        const urlParams = new URLSearchParams(window.location.search);
        const typeParam = urlParams.get('type');
        const placeParam = urlParams.get('place');

        // Switch to the correct category (hotel/campus) based on URL param
        if (typeParam || placeParam) {
            const sortSelectLive = document.getElementById('property-sort');
            if (sortSelectLive) {
                // If type param exists use it, otherwise default to 'hotel' when place is set
                sortSelectLive.value = typeParam || 'hotel';
                sortSelectLive.dispatchEvent(new Event('change'));
            }

            // Show the place selector for hotel type
            const effectiveType = typeParam || 'hotel';
            if (effectiveType === 'hotel') {
                const placeSelector = document.getElementById('hotel-place-selector');
                if (placeSelector) {
                    placeSelector.classList.remove('hidden');
                }
            }
        }

        if (placeParam) {
            // Wait for DOM to settle, then select the place
            setTimeout(() => {
                const option = document.querySelector(
                    `.hotel-place-option[data-value="${placeParam}"]`
                );
                if (option) {
                    // Use textContent (not innerText) — works even on invisible elements
                    const label = option.textContent.trim();

                    // Update the display label
                    const placeValueEl = document.getElementById('hotelPlaceValue');
                    if (placeValueEl) placeValueEl.innerText = label;

                    // Highlight the selected option
                    document.querySelectorAll('.hotel-place-option').forEach(opt => {
                        opt.classList.remove('bg-[#1e293b]', 'text-white', 'font-semibold');
                        opt.classList.add('text-[#4a4641]');
                    });
                    option.classList.remove('text-[#4a4641]');
                    option.classList.add('bg-[#1e293b]', 'text-white', 'font-semibold');

                    // Apply location filter and re-render
                    l = placeParam;
                    currentPage = 1;
                    addDataToHTML();
                }
            }, 500);
        }
    } catch (error) {
        console.error('Failed to load products:', error);
        showLoadError();
    }
};

if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
        const sectionTitle = document.getElementById('section-title');
        if (sectionTitle) {
            sectionTitle.textContent = e.target.value === 'hotel'
                ? 'Premium Hotel Stays'
                : 'University Student Rentals';
        }


        const placeSelector = document.getElementById('hotel-place-selector');
        if (placeSelector) {
            if (e.target.value === 'hotel') {
                placeSelector.classList.remove('hidden');
            } else {
                placeSelector.classList.add('hidden');
            }
        }

        // Reset all aside filters when switching categories
        document.querySelectorAll('#aside input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        const slider = document.getElementById('price-range');
        const display = document.getElementById('price-display');
        if (slider) {
            slider.value = 1000;
            updatePriceSliderDisplay(slider, display);
        }

        // Reset location filter and pagination
        l = '';
        currentPage = 1;

        // Reset place selector display
        const placeValueEl = document.getElementById('hotelPlaceValue');
        if (placeValueEl) placeValueEl.innerText = 'All Places';
        document.querySelectorAll('.hotel-place-option').forEach(opt => {
            opt.classList.remove('bg-[#1e293b]', 'text-white', 'font-semibold');
            opt.classList.add('text-[#4a4641]');
        });

        addDataToHTML();
    });
}

initApp();


window.toggleHotelPlaceDropdown = function(event) {
    const dropdown = document.getElementById("hotelPlaceDropdown");
    const chevron = document.getElementById("hotelPlaceChevron");
    if (dropdown) {
        dropdown.classList.toggle("opacity-0");
        dropdown.classList.toggle("invisible");
        dropdown.classList.toggle("-translate-y-2");
    }
    if (chevron) chevron.classList.toggle("rotate-180");
}

window.selectHotelPlace = function(event, el) {
    event.stopPropagation();
    const value = el.getAttribute("data-value");
    const text = el.innerText;

    document.getElementById("hotelPlaceValue").innerText = text;

    document.querySelectorAll(".hotel-place-option").forEach(opt => {
        opt.classList.remove("bg-[#1e293b]", "text-white", "font-semibold");
        opt.classList.add("text-[#4a4641]");
    });
    el.classList.remove("text-[#4a4641]");
    el.classList.add("bg-[#1e293b]", "text-white", "font-semibold");

    const dropdown = document.getElementById("hotelPlaceDropdown");
    const chevron = document.getElementById("hotelPlaceChevron");
    if (dropdown) {
        dropdown.classList.add("opacity-0", "invisible", "-translate-y-2");
    }
    if (chevron) {
        chevron.classList.remove("rotate-180");
    }

    const nativeSelect = document.getElementById("place-select");
    if (nativeSelect) {
        nativeSelect.value = value;
        nativeSelect.dispatchEvent(new Event('change'));
    }

    l = value;
    currentPage = 1;
    addDataToHTML();
}



document.addEventListener("click", function(event) {
    const box = document.getElementById("hotelPlaceBox");
    if (box && !box.contains(event.target)) {
        const dropdown = document.getElementById("hotelPlaceDropdown");
        const chevron = document.getElementById("hotelPlaceChevron");
        if (dropdown) dropdown.classList.add("opacity-0", "invisible", "-translate-y-2");
        if (chevron) chevron.classList.remove("rotate-180");
    }
});


const updatePriceSliderDisplay = (slider, display) => {
    if (!slider || !display) {
        return;
    }

    const min = Number(slider.min);
    const max = Number(slider.max);
    const val = Number(slider.value);
    const pct = ((val - min) / (max - min)) * 100;

    slider.style.setProperty('--pct', `${pct}%`);
    display.textContent = val >= 1000 ? '$1000+' : `$${val}`;
};










function getFilters() {
    const slider = document.getElementById('price-range');
    const filters = {
        price: slider ? Number(slider.value) : Infinity,
        university: [],
        roomType: [],
        amenity: [],
        leaseTerm: [],
        rating: [],
    };

    document.querySelectorAll('#aside input[type="checkbox"]:checked').forEach(cb => {
        const key = cb.dataset.filter;
        const val = cb.dataset.value;
        if (key && val && filters[key] !== undefined) {
            filters[key].push(val);
        }
    });

    return filters;
}




function matchesFilters(product, filters) {
    if (product.price > filters.price && filters.price < 1000) {
        return false;
    }

    if (filters.university.length && !filters.university.includes(product.nearUniversity)) {
        return false;
    }

    const productType = `${product.type || ''} ${product.title || ''}`.toLowerCase().replace(/[\s-]/g, '');
    if (filters.roomType.length && !filters.roomType.some(type =>
        productType.includes(type.toLowerCase().replace(/[\s-]/g, ''))
    )) {
        return false;
    }

    const featureText = (product.features || [])
        .map(feature => `${feature.icon || ''} ${feature.label || ''}`)
        .join(' ')
        .toLowerCase();

    if (filters.amenity.length && !filters.amenity.every(amenity => featureText.includes(amenity))) {
        return false;
    }

    const minRating = filters.rating.length
        ? Math.max(...filters.rating.map(Number).filter(Number.isFinite))
        : 0;
    if (minRating && Number(product.rating || 0) < minRating) {
        return false;
    }

    const productLeaseTerm = (product.leaseTerm || '').toLowerCase().replace(/[\s-]/g, '');
    if (filters.leaseTerm.length && productLeaseTerm && !filters.leaseTerm.some(term =>
        productLeaseTerm.includes(term.toLowerCase().replace(/[\s-]/g, ''))
    )) {
        return false;
    }

    return true;
}



function applyFilters() {
    currentPage = 1;
    addDataToHTML();
}

function setFilterSheetOpen(open) {
    const sheet = document.getElementById('filter-sheet');
    const backdrop = document.getElementById('filter-backdrop');

    if (!sheet || !backdrop) {
        return;
    }

    sheet.classList.toggle('translate-y-full', !open);
    sheet.classList.toggle('translate-y-0', open);
    backdrop.classList.toggle('opacity-0', !open);
    backdrop.classList.toggle('opacity-100', open);
    backdrop.classList.toggle('pointer-events-none', !open);
    document.body.classList.toggle('overflow-hidden', open && window.innerWidth < 1024);
}

function initFilterSheetControls() {
    const openBtn = document.getElementById('open-filter-sheet');
    const closeBtn = document.getElementById('close-filter-sheet');
    const showBtn = document.getElementById('show-filter-results');
    const backdrop = document.getElementById('filter-backdrop');

    [
        [openBtn, () => setFilterSheetOpen(true)],
        [closeBtn, () => setFilterSheetOpen(false)],
        [showBtn, () => setFilterSheetOpen(false)],
        [backdrop, () => setFilterSheetOpen(false)],
    ].forEach(([el, handler]) => {
        if (!el || el.dataset.sheetBound) {
            return;
        }
        el.dataset.sheetBound = 'true';
        el.addEventListener('click', handler);
    });
}


function initProductFilterControls() {
    const slider = document.getElementById('price-range');
    const display = document.getElementById('price-display');
    initFilterSheetControls();

    if (slider && display && !slider.dataset.filterBound) {
        slider.dataset.filterBound = 'true';
        updatePriceSliderDisplay(slider, display);
        slider.addEventListener('input', () => {
            updatePriceSliderDisplay(slider, display);
            applyFilters();
        });
    }

    document.querySelectorAll('#aside input[type="checkbox"]').forEach(cb => {
        if (cb.dataset.filterBound) {
            return;
        }
        cb.dataset.filterBound = 'true';
        cb.addEventListener('change', applyFilters);
    });


    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn && !resetBtn.dataset.filterBound) {
        resetBtn.dataset.filterBound = 'true';
        resetBtn.addEventListener('click', () => {
            document.querySelectorAll('#aside input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
            });

            if (slider) {
                slider.value = 1000;
                updatePriceSliderDisplay(slider, display);
            }

            applyFilters();
        });
    }

    const applyBtn = document.getElementById('apply-btn');
    if (applyBtn && !applyBtn.dataset.filterBound) {
        applyBtn.dataset.filterBound = 'true';
        applyBtn.addEventListener('click', applyFilters);
    }
}

window.applyProductFilters = applyFilters;
window.initProductFilterControls = initProductFilterControls;
window.setFilterSheetOpen = setFilterSheetOpen;

initProductFilterControls();
