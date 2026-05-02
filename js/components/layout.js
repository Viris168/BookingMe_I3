// js/components/layout.js

document.addEventListener("DOMContentLoaded", () => {
    const extractPartial = (html, selector) => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        return doc.querySelector(selector)?.outerHTML || html;
    };

    const handleLogout = (event) => {
        const logout = event.target.closest("[data-logout]");
        if (!logout) return;

        event.preventDefault();
        const confirmed = window.confirm("Are you sure you want to log out?");
        if (!confirmed) return;

        localStorage.removeItem("bookingme_user");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        sessionStorage.clear();
        window.location.href = "/index.html";
    };

    const initProfileMenu = (root) => {
        const menuRoot = root.querySelector("[data-profile-menu-root]");
        const button = root.querySelector("[data-profile-menu-button]");
        const menu = root.querySelector("[data-profile-menu]");
        if (!menuRoot || !button || !menu) return;

        const closeMenu = () => {
            menu.classList.add("hidden");
            button.setAttribute("aria-expanded", "false");
        };

        button.addEventListener("click", (event) => {
            event.stopPropagation();
            const isOpen = !menu.classList.contains("hidden");
            menu.classList.toggle("hidden", isOpen);
            button.setAttribute("aria-expanded", String(!isOpen));
        });

        menu.addEventListener("click", (event) => {
            event.stopPropagation();
        });

        document.addEventListener("click", (event) => {
            if (!menuRoot.contains(event.target)) {
                closeMenu();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeMenu();
            }
        });
    };

    const initLanguageMenu = (root) => {
        const menuRoot = root.querySelector("[data-language-menu-root]");
        const button = root.querySelector("[data-language-menu-button]");
        const menu = root.querySelector("[data-language-menu]");
        if (!menuRoot || !button || !menu) return;

        const closeMenu = () => {
            menu.classList.add("hidden");
            button.setAttribute("aria-expanded", "false");
        };

        button.addEventListener("click", (event) => {
            event.stopPropagation();
            const isOpen = !menu.classList.contains("hidden");
            menu.classList.toggle("hidden", isOpen);
            button.setAttribute("aria-expanded", String(!isOpen));
        });

        menu.addEventListener("click", (event) => {
            const option = event.target.closest("[data-language]");
            if (option) closeMenu();
        });

        document.addEventListener("click", (event) => {
            if (!menuRoot.contains(event.target)) {
                closeMenu();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeMenu();
            }
        });
    };

    // 1. Load Header using absolute path
    // By starting the path with "/", it will always look for the shared partials from the project root,
    // regardless of whether this script is loaded from the root folder, a subfolder, or a deeply nested folder.
    fetch("/component/partials/header.html")
        .then(res => res.text())
        .then(html => {
            const headerContainer = document.getElementById("header");
            if (headerContainer) {
                // Inject the header HTML into the container
                headerContainer.innerHTML = extractPartial(html, "header");

                // Initialize mobile menu toggle logic
                const toggle = document.getElementById("menu-toggle");
                const menu = document.getElementById("mobile-menu");
                if (toggle && menu) {
                    toggle.addEventListener("click", () => {
                        const isOpen = menu.style.maxHeight && menu.style.maxHeight !== "0px";
                        menu.style.maxHeight = isOpen ? "0px" : "620px";
                        const icon = toggle.querySelector(".material-symbols-outlined");
                        if (icon) icon.textContent = isOpen ? "menu" : "close";
                    });
                }

                initProfileMenu(headerContainer);
                initLanguageMenu(headerContainer);
                headerContainer.addEventListener("click", handleLogout);

                if (window.BookingMEI18n) {
                    window.BookingMEI18n.apply(headerContainer);
                }
            }
        })
        .catch(err => console.error("Error loading header:", err));

    // 2. Load Footer using absolute path
    fetch("/component/partials/footer.html")
        .then(res => res.text())
        .then(html => {
            const footerContainer = document.getElementById("footer");
            if (footerContainer) {
                // Inject the footer HTML into the container
                footerContainer.innerHTML = extractPartial(html, "footer");
                if (window.BookingMEI18n) {
                    window.BookingMEI18n.apply(footerContainer);
                }
            }
        })
        .catch(err => console.error("Error loading footer:", err));
});
