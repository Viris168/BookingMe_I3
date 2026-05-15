

document.addEventListener("DOMContentLoaded", () => {
    const extractPartial = (html, selector) => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        return doc.querySelector(selector)?.outerHTML || html;
    };

    const setMenuOpen = (root, menu, button, open) => {
        menu.classList.toggle("hidden", !open);
        button.setAttribute("aria-expanded", String(open));

        const icon = button.querySelector(".material-symbols-outlined:last-child");
        if (icon) {
            icon.classList.toggle("rotate-180", open);
            icon.classList.toggle("bg-white", open);
            icon.classList.toggle("text-primary", open);
        }
    };

    const closeMenus = (scope = document) => {
        scope.querySelectorAll("[data-profile-menu-root], [data-language-menu-root]").forEach((root) => {
            const menu = root.querySelector("[data-profile-menu], [data-language-menu]");
            const button = root.querySelector("[data-profile-menu-button], [data-language-menu-button]");
            if (menu && button) {
                setMenuOpen(root, menu, button, false);
            }
        });
    };

    const getDemoUser = () => {
        if (typeof AuthStorage !== 'undefined') {
            return AuthStorage.getCurrentUser();
        }
        return null;
    };

    const applyProfileState = (headerContainer) => {
        const user = getDemoUser();
        
        headerContainer.querySelectorAll("[data-profile-menu]").forEach((menu) => {
            if (!user) {
                // Not logged in state
                menu.innerHTML = `
                    <div class="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white px-4 py-4">
                        <img src="/assets/icons/icon.png" alt="User" class="h-11 w-11 rounded-full border-2 border-white object-cover shadow-sm ring-1 ring-primary/25">
                        <div class="min-w-0">
                            <p class="truncate text-sm font-extrabold text-slate-900">Guest</p>
                            <p class="truncate text-xs font-medium text-slate-500">Login to continue</p>
                        </div>
                    </div>
                    <div class="grid gap-2 p-3">
                        <a href="/component/Login/index-login.html" class="flex items-center justify-center rounded-xl bg-primary px-3 py-2.5 text-sm font-extrabold text-white transition hover:bg-blue-600">
                            Login
                        </a>
                        <a href="/component/Login/index-login.html" class="flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50">
                            Create Account
                        </a>
                    </div>
                `;
                return;
            }

            const name = user.name || "User";
            const email = user.email || "user@example.com";
            const isHost = user.role === 'host';

            let linksHtml = `
                <a href="/component/dashboard/profile.html" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-blue-50 hover:text-primary">
                    <span class="material-symbols-outlined text-[20px]">person</span>
                    <span data-i18n="account.profile">My Profile</span>
                </a>
                <a href="/component/dashboard/Booking-history.html" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-blue-50 hover:text-primary">
                    <span class="material-symbols-outlined text-[20px]">history</span>
                    <span data-i18n="account.orderHistory">My Bookings</span>
                </a>
            `;

            if (isHost) {
                linksHtml += `
                    <a href="/component/host/host-dashboard.html" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-amber-50 hover:text-amber-700">
                        <span class="material-symbols-outlined text-[20px]">dashboard</span>
                        <span data-i18n="account.hostDashboard">Host Dashboard</span>
                    </a>
                `;
            } else {
                linksHtml += `
                    <a href="#" onclick="alert('Upgrade feature coming soon!')" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-green-50 hover:text-green-700">
                        <span class="material-symbols-outlined text-[20px]">home_work</span>
                        <span data-i18n="account.becomeHost">Become a Host</span>
                    </a>
                `;
            }

            menu.innerHTML = `
                <div class="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white px-4 py-4">
                    <img src="${user.avatar || '/assets/icons/icon.png'}" alt="User" class="h-11 w-11 rounded-full border-2 border-white object-cover shadow-sm ring-1 ring-primary/25">
                    <div class="min-w-0">
                        <p class="truncate text-sm font-extrabold text-slate-900">${name}</p>
                        <p class="truncate text-xs font-medium text-slate-500">${email}</p>
                    </div>
                </div>
                <div class="grid gap-1 p-2">
                    ${linksHtml}
                </div>
                <div class="border-t border-slate-100 p-2">
                    <a href="#" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-extrabold text-red-600 transition hover:bg-red-50" data-logout>
                        <span class="material-symbols-outlined text-[20px]">logout</span>
                        <span data-i18n="account.logout">Log Out</span>
                    </a>
                </div>
            `;
        });

        // Skip mobile account injection for now to keep things simple
    };

    const initDropdownMenu = (headerContainer, rootSelector, buttonSelector, menuSelector) => {
        headerContainer.querySelectorAll(rootSelector).forEach((root) => {
            const button = root.querySelector(buttonSelector);
            const menu = root.querySelector(menuSelector);
            if (!button || !menu) return;

            button.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                const willOpen = menu.classList.contains("hidden");
                closeMenus(headerContainer);
                setMenuOpen(root, menu, button, willOpen);
            });
        });
    };

    const initProfileMenu = (headerContainer) => {
        initDropdownMenu(headerContainer, "[data-profile-menu-root]", "[data-profile-menu-button]", "[data-profile-menu]");
    };

    const initLanguageMenu = (headerContainer) => {
        initDropdownMenu(headerContainer, "[data-language-menu-root]", "[data-language-menu-button]", "[data-language-menu]");
    };

    const handleLogout = (event) => {
        const logoutButton = event.target.closest("[data-logout]");
        if (!logoutButton) return;

        event.preventDefault();
        if (typeof AuthStorage !== 'undefined' && AuthStorage.confirmLogout) {
            AuthStorage.confirmLogout();
        } else {
            if (!window.confirm("Are you sure you want to log out?")) return;
            sessionStorage.clear();
            window.location.href = "/index.html";
        }
    };

    document.addEventListener("click", (event) => {
        if (event.target.closest("[data-profile-menu-root], [data-language-menu-root]")) return;
        closeMenus();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenus();
        }
    });

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
                        menu.style.maxHeight = isOpen ? "0px" : "620px";
                        const icon = toggle.querySelector(".material-symbols-outlined");
                        if (icon) icon.textContent = isOpen ? "menu" : "close";
                    });
                }

                initProfileMenu(headerContainer);
                initLanguageMenu(headerContainer);
                applyProfileState(headerContainer);
                headerContainer.addEventListener("click", handleLogout);

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
