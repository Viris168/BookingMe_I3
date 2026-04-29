
// TODO: change back to URL param later
// const urlParams = new URLSearchParams(window.location.search);
// const productId = parseInt(urlParams.get("id"));
const productId = 1; // fixed ID for testing

fetch("/data/product.json")
    .then(res => res.json())
    .then(products => {
        const product = products.find(data => data.id === productId);
        if (product) pay(product);
    });

const bookingData = JSON.parse(sessionStorage.getItem('bookingData'));

function pay(data) {
    // data.image is a string like "./assets/images/Image.png"; load it from the project root.
    document.getElementById("property-image").src = data.image.replace("./", "/");
    document.getElementById("property-type").textContent = data.type;
    document.getElementById("property-name").textContent = data.title;
    document.getElementById("rating-score").textContent = data.rating;
    document.getElementById("rating-count").textContent = `(${data.reviews} reviews)`;

    if (bookingData) {

        document.getElementById("price-per-stay").textContent = `$${bookingData.pricePerNight} x ${bookingData.nights} nights`;

        const subtotal = bookingData.pricePerNight * bookingData.nights;

        document.getElementById("price-stay-total").textContent = `$${subtotal}`;
        document.getElementById("cleaning-fee").textContent = `$${bookingData.cleaningFee}`;
        document.getElementById("service-fee").textContent = `$${bookingData.serviceFee}`;
        document.getElementById("total-amount").textContent = `$${bookingData.total}`;
        document.getElementById("trip-guests").textContent = `${bookingData.guests}`;
        document.getElementById("trip-dates").textContent = `${bookingData.checkIn}`;
    }
}

document.getElementById('confirm-pay-btn').addEventListener('click', () => {

    // Then navigate
    window.location.href = 'Comfirmation.html';
});
