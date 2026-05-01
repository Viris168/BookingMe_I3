const listProductHTML = document.querySelector('#ListProduct');
const sortSelect = document.querySelector('#property-sort');
const propertyCount = document.querySelector('#property-count');
const paginationControls = document.querySelector('#pagination-controls');

let listProduct = [];
const itemsPerPage = 3;
let currentPage = 1;

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

    const roomLabel = count === 1 ? 'room' : 'rooms';
    propertyCount.textContent = `${count} ${roomLabel} available near Phnom Penh campuses`;
};

const getSortedProducts = () => {
    let products = [...listProduct];
    
    // 1. Get the current value from the dropdown
    const sortSelectValue = sortSelect ? sortSelect.value : 'campus';
    
    // 2. Filter the products using a JS condition
    products = products.filter(product => {
        // Now that you have "category" in your product.json, we can filter by it!
        // We ensure a default 'category' exists just in case it's missing for a product
        const productCategory = product.category || 'campus';
        return productCategory === sortSelectValue;
    });

    // 3. Sort them as usual
    return products.sort((a, b) => a.id - b.id);
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

            <div class="flex flex-1 flex-col justify-between p-3.5">
                <div>
                    <div class="mb-1 flex items-center justify-between gap-4">
                        <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400">${product.type}</p>
                        <div class="flex items-center gap-1 rounded bg-slate-800 px-1 py-0.5 text-[10px] font-bold text-white">
                            ${product.rating}
                            <span class="font-normal text-gray-400">/5</span>
                        </div>
                    </div>

                    <div class="mb-2 flex items-start justify-between">
                        <h3 class="text-sm font-bold text-gray-800 leading-snug">${product.title}</h3>
                    </div>

                    <div class="flex flex-wrap gap-1">
                        ${featuresHTML}
                    </div>
                </div>

                <div class="mt-3 flex items-center justify-between gap-2">
                    <p class="text-lg font-bold text-gray-800">
                        $${product.price} <span class="text-[10px] font-normal text-gray-400">/ month</span>
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
            wishlistBtn.addEventListener('click', () => {
                wishlistIcon.classList.toggle('text-red-500');
                wishlistIcon.classList.toggle('text-gray-400');
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
            
            // Optionally scroll up slightly when paging
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
        addDataToHTML();
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

        addDataToHTML();
    });
}

initApp();

// --- Global functions for Custom Dropdown in section.html ---
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
