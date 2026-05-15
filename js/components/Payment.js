
const urlParams = new URLSearchParams(window.location.search);
const savedBookingData = JSON.parse(sessionStorage.getItem("bookingData") || "null");
const productId = Number.parseInt(urlParams.get("id") || savedBookingData?.productId || "1", 10);

fetch("/data/product.json")
    .then(res => res.json())
    .then(products => {
        const product = products.find(data => data.id === productId);
        if (product) pay(product);
    });

const bookingData = savedBookingData;
const detailUrl = `/component/partials/Property-Detai.html?id=${productId}`;
document.getElementById("payment-back-link")?.setAttribute("href", detailUrl);
document.querySelectorAll("[data-property-edit]").forEach((link) => {
    link.href = detailUrl;
});

function pay(data) {

    const propertyImage = document.getElementById("property-image");
    propertyImage.onerror = () => {
        propertyImage.onerror = null;
        propertyImage.src = "/assets/images/Image.png";
    };
    propertyImage.src = data.image.replace("./", "/");
    document.getElementById("property-type").textContent = data.type;
    document.getElementById("property-name").textContent = data.title;
    document.getElementById("rating-score").textContent = data.rating;
    document.getElementById("rating-count").textContent = `(${data.reviews} reviews)`;

    if (bookingData) {

        const nights = Number(bookingData.nights) || 1;
        document.getElementById("price-per-stay").textContent = `$${bookingData.pricePerNight} x ${nights} nights`;

        const subtotal = bookingData.pricePerNight * bookingData.nights;

        document.getElementById("price-stay-total").textContent = `$${subtotal}`;
        document.getElementById("cleaning-fee").textContent = `$${bookingData.cleaningFee}`;
        document.getElementById("service-fee").textContent = `$${bookingData.serviceFee}`;
        document.getElementById("total-amount").textContent = `$${bookingData.totalPrice || bookingData.total || 0}`;
        document.getElementById("trip-guests").textContent = `${bookingData.guests}`;
        document.getElementById("trip-dates").textContent = bookingData.checkOut
            ? `${bookingData.checkIn} - ${bookingData.checkOut}`
            : `${bookingData.checkIn}`;
    }
}

document.getElementById('confirm-pay-btn').addEventListener('click', () => {
    if (typeof AuthStorage !== 'undefined' && !AuthStorage.getCurrentUser()) {
        if (typeof BMEAlert !== 'undefined') {
            BMEAlert.show('Please log in to complete your payment.', {
                title: 'Login Required', type: 'warn', icon: 'lock',
                buttonText: 'Go to Login',
                redirectUrl: '/component/Login/index-login.html'
            });
        } else {
            window.location.href = '/component/Login/index-login.html';
        }
        return;
    }

    // --- Payment Validation ---
    const selectedPayment = document.querySelector('input[name="payment"]:checked');
    if (!selectedPayment) {
        showPaymentError('Please select a payment method.');
        return;
    }

    if (selectedPayment.value === 'card') {
        const cardNum = document.getElementById('cardnum');
        const cardExpiry = document.getElementById('carddate');
        const cardCvv = document.getElementById('cardcvv');

        var errors = [];
        if (!cardNum || cardNum.value.replace(/\s/g, '').length < 13) errors.push('Card number');
        if (!cardExpiry || cardExpiry.value.trim().length < 4) errors.push('Expiry date');
        if (!cardCvv || cardCvv.value.trim().length < 3) errors.push('CVV');

        if (errors.length > 0) {
            showPaymentError('Please fill in: ' + errors.join(', '));
            return;
        }
    }

    if (bookingData && typeof UserStorage !== 'undefined') {
        const booking = UserStorage.addBooking(bookingData);
        sessionStorage.setItem('lastBookingId', booking.bookingId);
    }

    window.location.href = 'Comfirmation.html';
});

function showPaymentError(msg) {
    // Remove existing error toast
    var old = document.getElementById('payment-error-toast');
    if (old) old.remove();

    var toast = document.createElement('div');
    toast.id = 'payment-error-toast';
    toast.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;padding:16px 24px;border-radius:16px;background:#0f172a;color:#fff;font-weight:700;font-size:14px;box-shadow:0 18px 35px rgba(15,23,42,0.22);display:flex;align-items:center;gap:10px;animation:slideUp .3s ease;';
    toast.innerHTML = '<span class="material-symbols-outlined" style="color:#f87171;font-size:20px;">error</span>' + msg;
    document.body.appendChild(toast);

    setTimeout(function() { toast.remove(); }, 4000);
}
