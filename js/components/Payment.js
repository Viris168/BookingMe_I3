
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
        document.getElementById("total-amount").textContent = `$${bookingData.total}`;
        document.getElementById("trip-guests").textContent = `${bookingData.guests}`;
        document.getElementById("trip-dates").textContent = bookingData.checkOut
            ? `${bookingData.checkIn} - ${bookingData.checkOut}`
            : `${bookingData.checkIn}`;
    }
}

document.getElementById('confirm-pay-btn').addEventListener('click', () => {


    window.location.href = 'Comfirmation.html';
});
