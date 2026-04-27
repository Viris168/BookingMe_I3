// js/components/layout.js

document.addEventListener("DOMContentLoaded", () => {
    // 1. Load Header using absolute path
    // By starting the path with "/", it will always look for the "partials" folder at the root of your project,
    // regardless of whether this script is loaded from the root folder, a subfolder, or a deeply nested folder.
    fetch("/partials/header.html")
        .then(res => res.text())
        .then(html => {
            const headerContainer = document.getElementById("header");
            if (headerContainer) {
                // Inject the header HTML into the container
                headerContainer.innerHTML = html;

                // Initialize mobile menu toggle logic
                const toggle = document.getElementById("menu-toggle");
                const menu = document.getElementById("mobile-menu");
                if (toggle && menu) {
                    toggle.addEventListener("click", () => {
                        const isOpen = menu.style.maxHeight && menu.style.maxHeight !== "0px";
                        menu.style.maxHeight = isOpen ? "0px" : "400px";
                        const icon = toggle.querySelector(".material-symbols-outlined");
                        if (icon) icon.textContent = isOpen ? "menu" : "close";
                    });
                }
            }
        })
        .catch(err => console.error("Error loading header:", err));

    // 2. Load Footer using absolute path
    fetch("/partials/footer.html")
        .then(res => res.text())
        .then(html => {
            const footerContainer = document.getElementById("footer");
            if (footerContainer) {
                // Inject the footer HTML into the container
                footerContainer.innerHTML = html;
            }
        })
        .catch(err => console.error("Error loading footer:", err));
});
