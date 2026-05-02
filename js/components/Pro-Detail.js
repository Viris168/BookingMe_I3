// 1. Get product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = Number.parseInt(urlParams.get("id") || "1", 10);


// 2. Fetch product.json and find matching product
fetch("/data/product.json")
    .then(res => res.json())
    .then(products => {
        const product = products.find(p => p.id === productId);
        if (product) populatePage(product);
    });



// 3. Fill the page with data
function populatePage(p) {

    document.getElementById("priceAmount").textContent = `$${p.price}`;
    document.getElementById("ratingScore").textContent = p.rating;
    document.getElementById("ratingReviews").textContent = p.reviews + ` reviews`;
    document.getElementById("cleaningVal").textContent = `$${p.cleaningFee}`;
    document.getElementById("serviceVal").textContent = `$${p.serviceFee}`;
    document.getElementById("title").textContent = p.title;
    document.getElementById("type").textContent = p.type;
    const reviewsLink = document.getElementById("reviewsLink");
    if (reviewsLink) {
        reviewsLink.href = `/component/partials/Reviews.html?id=${p.id}`;
    }

    // 4. Update the Gallery Images dynamically
    const galleryImages = document.querySelectorAll(".gallery img");
    if (p.images && p.images.length > 0) {
        galleryImages.forEach((img, index) => {
            // Use the matching index image, or fallback to the first image if array is smaller than 5
            const imagePath = p.images[index] || p.images[0];
            // Replace './' with '/' to ensure it loads from the absolute root directory correctly
            img.onerror = () => {
                img.onerror = null;
                img.src = "/assets/images/Image.png";
            };
            img.src = imagePath.replace('./', '/'); 
        });
    } else if (p.image) {
        // Fallback if no "images" array exists yet
        galleryImages.forEach(img => {
            img.onerror = () => {
                img.onerror = null;
                img.src = "/assets/images/Image.png";
            };
            img.src = p.image.replace('./', '/');
        });
    }

    const iin = document.getElementById('checkInDate');
    const out = document.getElementById('checkOutDate');

    let nights = 0;
    let totals = 0;

    function update() {
        const checkIn = new Date(iin.value);
        const checkOut = new Date(out.value);


        if (iin.value && out.value && checkOut > checkIn) {
            nights = (checkOut - checkIn) / (1000 * 60 * 60 * 24);
            const subtotal = p.price * nights;
            totals = subtotal + p.cleaningFee + p.serviceFee;

            document.getElementById("nightsLabel").textContent = `$${p.price} x ${nights} nights`;
            document.getElementById("nightsVal").textContent = `$${subtotal}`;
            document.getElementById("totalVal").textContent = `$${totals}`;
        }
    }
    iin.addEventListener('change', update);
    out.addEventListener('change', update);

    document.getElementById('reserveBtn').addEventListener('click', () => {
        // Save data first
        const bookingData = {
            productId: p.id,
            checkIn: document.getElementById('checkInDate').value,
            checkOut: document.getElementById('checkOutDate').value,
            guests: document.getElementById('guestsValue').textContent,
            pricePerNight: p.price,  // from product data
            nights: nights,          // calculated from dates
            cleaningFee: p.cleaningFee,
            serviceFee: p.serviceFee,
            total: totals
        };
        sessionStorage.setItem('bookingData', JSON.stringify(bookingData));

        // Then navigate
        window.location.href = `/component/partials/Payment.html?id=${p.id}`;
    });

}


/* ── Custom Guests Dropdown ── */
function toggleGuestsDropdown() {
    const dropdown = document.getElementById('guestsDropdown');
    const chevron = document.getElementById('guestsChevron');
    dropdown.classList.toggle('show');
    chevron.classList.toggle('open');
}

function selectGuest(e, el) {
    e.stopPropagation();
    const value = el.textContent;
    document.getElementById('guestsValue').textContent = value;

    // Update selected state
    document.querySelectorAll('.guests-option').forEach(opt => opt.classList.remove('selected'));
    el.classList.add('selected');

    // Close dropdown
    document.getElementById('guestsDropdown').classList.remove('show');
    document.getElementById('guestsChevron').classList.remove('open');
}

// Close dropdown when clicking outside
document.addEventListener('click', function (e) {
    const box = document.getElementById('guestsBox');
    if (box && !box.contains(e.target)) {
        document.getElementById('guestsDropdown').classList.remove('show');
        document.getElementById('guestsChevron').classList.remove('open');
    }
});
