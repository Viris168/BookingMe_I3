

document.addEventListener("DOMContentLoaded", () => {
    const extractPartial = (html, selector) => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        return doc.querySelector(selector)?.outerHTML || html;
    };




    fetch("/component/partials/header.html")
        .then(res => res.text())
        .then(html => {
            const headerContainer = document.getElementById("header");
            if (headerContainer) {

                headerContainer.innerHTML = extractPartial(html, "header");


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

                if (window.BookingMEI18n) {
                    window.BookingMEI18n.apply(headerContainer);
                }
            }
        })
        .catch(err => console.error("Error loading header:", err));


    fetch("/component/partials/footer.html")
        .then(res => res.text())
        .then(html => {
            const footerContainer = document.getElementById("footer");
            if (footerContainer) {

                footerContainer.innerHTML = extractPartial(html, "footer");
                if (window.BookingMEI18n) {
                    window.BookingMEI18n.apply(footerContainer);
                }
            }
        })
        .catch(err => console.error("Error loading footer:", err));
});
