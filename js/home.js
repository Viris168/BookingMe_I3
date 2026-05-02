(function () {
    const destinationContainer = document.getElementById("dest-container");
    const featuredContainer = document.getElementById("student-container");
    const topContainer = document.getElementById("top-container");

    const asset = (path, fallback = "/assets/images/Image.png") => {
        if (!path) return fallback;
        return path.startsWith("./") ? path.replace("./", "/") : path;
    };

    const slugify = (value = "") => value.toLowerCase().trim().replace(/\s+/g, "-");

    const destinationMeta = {
        "Phnom Penh": {
            subtitle: "Royal Palace, riverside, and city stays",
            image: "/assets/images/cambodia-phnom-penh-royal-palace.jpg",
            alt: "Royal Palace in Phnom Penh",
        },
        "Siem Reap": {
            subtitle: "Gateway to Angkor Wat",
            image: "/assets/images/angkorwat.jpg",
            alt: "Angkor Wat temple in Siem Reap",
        },
        Kampot: {
            subtitle: "Riverfront stays and Bokor views",
            image: "/assets/images/kampotTop.jpg",
            alt: "Kampot riverside and mountain scenery",
        },
        Battambang: {
            subtitle: "Heritage streets and creative stays",
            image: "/assets/images/cambodia-battambang-city.jpg",
            alt: "Aerial view of Battambang city",
        },
        Kep: {
            subtitle: "Coastal rooms near seafood markets",
            image: "/assets/images/cambodia-kep-crab-market.jpg",
            alt: "Kep crab market by the coast",
        },
        "Kampong Cham": {
            subtitle: "Mekong riverside and student stays",
            image: "/assets/images/cambodia-kampong-cham-mekong.jpg",
            alt: "Mekong bridge in Kampong Cham",
        },
        Mondulkiri: {
            subtitle: "Highland eco stays and waterfalls",
            image: "/assets/images/cambodia-mondulkiri-waterfall.jpg",
            alt: "Bou Sra waterfall in Mondulkiri",
        },
        Ratanakiri: {
            subtitle: "Lakeside dorms and nature escapes",
            image: "/assets/images/cambodia-ratanakiri-banlung.jpg",
            alt: "Banlung landscape in Ratanakiri",
        },
        "Preah Vihear": {
            subtitle: "Northern heritage routes",
            image: "/assets/images/cambodia-preah-vihear-temple.jpg",
            alt: "Preah Vihear temple",
        },
        "Koh Kong": {
            subtitle: "Riverside retreats and nature",
            image: "/assets/images/Koh-Kong.jpg",
            alt: "Koh Kong riverside retreat",
        },
    };

    function renderDestinations(products) {
        if (!destinationContainer) return;

        const destinations = [...new Set(products.map((item) => item.location).filter(Boolean))]
            .map((location) => {
                const count = products.filter((item) => item.location === location).length;
                const meta = destinationMeta[location] || {};
                const sample = products.find((item) => item.location === location);
                return {
                    location,
                    count,
                    subtitle: meta.subtitle || `${count} stays available`,
                    image: meta.image || asset(sample?.image),
                    alt: meta.alt || `${location} destination in Cambodia`,
                };
            })
            .sort((a, b) => b.count - a.count || a.location.localeCompare(b.location))
            .slice(0, 10);

        destinationContainer.innerHTML = destinations.map((item) => `
            <a class="destination-card" href="/component/places/places.html?place=${slugify(item.location)}">
                <img src="${item.image}" alt="${item.alt}" loading="lazy" decoding="async">
                <div class="destination-card-body">
                    <span class="destination-chip">${item.count} ${item.count === 1 ? "stay" : "stays"}</span>
                    <h3>${item.location}</h3>
                    <p>${item.subtitle}</p>
                </div>
            </a>
        `).join("");
    }

    function renderFeaturedStays(products) {
        if (!featuredContainer) return;

        const featured = [...products]
            .sort((a, b) => (b.rating - a.rating) || (b.reviews - a.reviews))
            .slice(0, 12);

        featuredContainer.innerHTML = featured.map((item, index) => {
            const features = (item.features || []).slice(0, 3);
            const badge = index === 0 ? "Top rated" : index < 4 ? "Popular" : item.category === "hotel" ? "Hotel" : "Student";

            return `
                <article class="home-listing-card">
                    <img src="${asset(item.image)}" alt="${item.title}" loading="lazy" decoding="async">
                    <span class="listing-badge">${badge}</span>
                    <button class="listing-fav" type="button" aria-label="Save ${item.title}">
                        <i class="fa-regular fa-heart"></i>
                    </button>
                    <div class="home-listing-body">
                        <div class="home-listing-heading">
                            <h3>${item.title}</h3>
                            <p class="listing-price">$${item.price}/night</p>
                        </div>
                        <p class="listing-rating"><i class="fa-solid fa-star"></i> ${item.rating} <span>(${item.reviews} reviews)</span></p>
                        <p class="home-location"><i class="fa-solid fa-location-dot"></i> ${item.location}</p>
                        <div class="listing-amenities">
                            ${features.map((feature) => `
                                <span><i class="fa-solid fa-circle-check"></i> ${feature.label}</span>
                            `).join("")}
                        </div>
                        <a class="btn" href="/component/partials/Property-Detai.html?id=${item.id}">View Details</a>
                    </div>
                </article>
            `;
        }).join("");

        featuredContainer.querySelectorAll(".listing-fav").forEach((button) => {
            button.addEventListener("click", () => {
                const icon = button.querySelector("i");
                icon.classList.toggle("fa-regular");
                icon.classList.toggle("fa-solid");
            });
        });
    }

    function renderTopDestinations(products) {
        if (!topContainer) return;

        const top = Object.entries(destinationMeta)
            .map(([location, meta]) => ({
                location,
                ...meta,
                count: products.filter((item) => item.location === location).length,
            }))
            .filter((item) => item.count > 0)
            .sort((a, b) => b.count - a.count || a.location.localeCompare(b.location))
            .slice(0, 8);

        topContainer.innerHTML = top.map((item) => `
            <a class="top-destination-card" href="/component/places/places.html?place=${slugify(item.location)}">
                <img src="${item.image}" alt="${item.alt}" loading="lazy" decoding="async">
                <div class="top-destination-overlay">
                    <span>${item.count} stays</span>
                    <p>${item.location}</p>
                    <small>${item.subtitle}</small>
                </div>
            </a>
        `).join("");
    }

    const getScrollStep = (target) => {
        const card = target?.querySelector(":scope > *");
        return card ? card.getBoundingClientRect().width + 20 : 320;
    };

    function bindScroller(containerId, leftId, rightId) {
        const container = document.getElementById(containerId);
        const left = document.getElementById(leftId);
        const right = document.getElementById(rightId);
        if (!container || !left || !right) return;

        left.addEventListener("click", () => {
            container.scrollBy({ left: -getScrollStep(container), behavior: "smooth" });
        });

        right.addEventListener("click", () => {
            container.scrollBy({ left: getScrollStep(container), behavior: "smooth" });
        });
    }

    async function initHome() {
        try {
            const response = await fetch("/data/product.json");
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const products = await response.json();

            renderDestinations(products);
            renderFeaturedStays(products);
            renderTopDestinations(products);

            if (window.BookingMEI18n) {
                window.BookingMEI18n.apply(document);
            }
        } catch (error) {
            console.error("Failed to load home data:", error);
            [destinationContainer, featuredContainer, topContainer].forEach((container) => {
                if (container) {
                    container.innerHTML = '<p class="home-loading">Unable to load this section right now.</p>';
                }
            });
        }
    }

    bindScroller("dest-container", "dest-left", "dest-right");
    bindScroller("student-container", "student-left", "student-right");
    bindScroller("top-container", "top-left", "top-right");
    initHome();
})();
