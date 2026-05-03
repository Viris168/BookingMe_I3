(function () {
  function injectDashboardStyles() {
    if (document.getElementById("bookingme-dashboard-js-styles")) return;

    const style = document.createElement("style");
    style.id = "bookingme-dashboard-js-styles";
    style.textContent = `
      .toast-root {
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 9999;
        display: grid;
        gap: 10px;
      }
      .toast {
        min-width: 260px;
        padding: 14px 16px;
        border-radius: 16px;
        background: #0f172a;
        color: #fff;
        box-shadow: 0 18px 35px rgba(15, 23, 42, 0.22);
        font-weight: 800;
      }
      .toast-success { background: #047857; }
      .account-mobile-bar {
        position: sticky;
        top: 0;
        z-index: 80;
        display: none;
        align-items: center;
        justify-content: flex-end;
        min-height: 58px;
        margin: -20px -16px 18px;
        padding: 12px 16px 10px;
        border-bottom: 0;
        background: transparent;
      }
      .account-mobile-title {
        min-width: 0;
      }
      .account-mobile-title strong {
        color: #0f172a;
        font-size: 15px;
        font-weight: 900;
        line-height: 1.1;
      }
      .account-mobile-menu-toggle {
        min-width: 44px;
        min-height: 44px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        border: 1px solid rgba(219, 234, 254, 0.96);
        border-radius: 999px;
        background: linear-gradient(135deg, #ffffff, #eff6ff);
        color: #1d4ed8;
        box-shadow: 0 12px 26px rgba(30, 58, 138, 0.12);
        font-weight: 900;
        padding: 0 13px 0 11px;
        letter-spacing: 0;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .account-mobile-menu-toggle:hover {
        transform: translateY(-1px);
        box-shadow: 0 16px 30px rgba(30, 58, 138, 0.16);
      }
      .account-mobile-menu-toggle .material-symbols-outlined {
        width: 24px;
        height: 24px;
        display: grid;
        place-items: center;
        border-radius: 999px;
        background: #1e3a8a;
        color: #ffffff;
        font-size: 18px;
      }
      .account-mobile-menu-toggle span:last-child {
        font-size: 13px;
      }
      .account-sidebar-backdrop {
        position: fixed;
        inset: 0;
        z-index: 89;
        display: none;
        background: rgba(15, 23, 42, 0.48);
        opacity: 0;
        transition: opacity 0.25s ease;
      }
      .account-sidebar-close {
        position: absolute;
        top: 16px;
        right: 16px;
        z-index: 30;
        width: 44px;
        height: 44px;
        display: none;
        place-items: center;
        border: 1px solid rgba(226, 232, 240, 0.9);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.92);
        color: #334155;
        box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
      }
      .dashboard-sidebar.account-sidebar,
      .host-sidebar.account-sidebar {
        isolation: isolate;
      }
      @media (max-width: 900px) {
        .account-mobile-bar {
          display: flex;
        }
        .account-sidebar-backdrop {
          display: block;
          pointer-events: none;
        }
      body.account-sidebar-open .account-sidebar-backdrop {
        opacity: 1;
        pointer-events: auto;
      }
      body.account-sidebar-open {
        overflow: hidden;
      }
        .account-sidebar-close {
          display: grid;
        }
        .dashboard-shell {
          display: block !important;
          padding: 0 14px 28px !important;
        }
        .dashboard-main,
        .host-dashboard-main {
          width: 100%;
          min-height: auto;
          padding-top: 0 !important;
          overflow: visible !important;
        }
        .dashboard-main {
          overflow-x: hidden !important;
        }
        .dashboard-content-wide {
          max-width: 100% !important;
        }
        .dashboard-main .text-4xl {
          font-size: clamp(1.85rem, 8vw, 2.35rem) !important;
          line-height: 1.1 !important;
        }
        .dashboard-main .text-lg {
          font-size: 0.98rem !important;
          line-height: 1.5 !important;
        }
        .dashboard-main .rounded-3xl,
        .dashboard-main .rounded-\\[2rem\\] {
          border-radius: 1.25rem !important;
        }
        .dashboard-main .p-8,
        .dashboard-main .p-7,
        .dashboard-main .p-6 {
          padding: 1.1rem !important;
        }
        .dashboard-main .gap-10 {
          gap: 1.25rem !important;
        }
        .dashboard-sidebar.account-sidebar,
        .host-sidebar.account-sidebar {
          position: fixed !important;
          inset: 0 auto 0 0 !important;
          z-index: 90 !important;
          display: flex !important;
          width: min(86vw, 390px) !important;
          max-width: calc(100vw - 28px) !important;
          height: 100dvh !important;
          min-height: 0 !important;
          margin: 0 !important;
          padding: 28px 20px 22px !important;
          border-radius: 0 28px 28px 0 !important;
          overflow-y: auto !important;
          gap: 20px !important;
          background:
            radial-gradient(circle at 78% 18%, rgba(255, 184, 0, 0.2), transparent 26%),
            radial-gradient(circle at 6% 86%, rgba(59, 130, 246, 0.16), transparent 30%),
            rgba(255, 255, 255, 0.88) !important;
          backdrop-filter: blur(22px);
          transform: translateX(-105%);
          transition: transform 0.3s ease;
          box-shadow: 24px 0 55px rgba(15, 23, 42, 0.22) !important;
        }
        body.account-sidebar-open .dashboard-sidebar.account-sidebar,
        body.account-sidebar-open .host-sidebar.account-sidebar {
          transform: translateX(0);
        }
        .dashboard-sidebar.account-sidebar nav,
        .host-sidebar.account-sidebar .host-side-nav {
          gap: 10px !important;
        }
        .dashboard-sidebar.account-sidebar .dashboard-nav-link,
        .host-sidebar.account-sidebar .host-side-nav a {
          min-height: 56px;
          border-radius: 20px;
          padding: 0 18px !important;
          background: rgba(255, 255, 255, 0.34);
          color: #64748b;
          font-weight: 850;
          border-left: 4px solid transparent !important;
          box-shadow: none;
        }
        .dashboard-sidebar.account-sidebar .dashboard-nav-link:hover,
        .host-sidebar.account-sidebar .host-side-nav a:hover {
          background: rgba(255, 255, 255, 0.72) !important;
          color: #1e3a8a !important;
        }
        .dashboard-sidebar.account-sidebar .dashboard-nav-link-active,
        .host-sidebar.account-sidebar .host-side-nav a.is-active {
          background: rgba(255, 255, 255, 0.94) !important;
          color: #1e3a8a !important;
          border-left: 4px solid #1e3a8a !important;
          box-shadow: 0 16px 30px rgba(15, 23, 42, 0.12) !important;
        }
        .dashboard-sidebar.account-sidebar .dashboard-sidebar-brand,
        .host-sidebar.account-sidebar .host-sidebar-brand {
          margin: 4px 58px 8px 2px !important;
          min-height: 42px;
        }
        .dashboard-sidebar.account-sidebar .dashboard-sidebar-brand img,
        .host-sidebar.account-sidebar .host-sidebar-brand img {
          width: 142px !important;
          max-width: 100%;
        }
        .dashboard-sidebar.account-sidebar .dashboard-profile-card,
        .host-sidebar.account-sidebar .host-card-profile {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 12px !important;
          min-height: 218px !important;
          margin: 0 0 14px !important;
          padding: 24px 18px !important;
          border-radius: 30px !important;
          background:
            radial-gradient(circle at 82% 18%, rgba(255, 184, 0, 0.22), transparent 32%),
            rgba(255, 255, 255, 0.82) !important;
          border: 1px solid rgba(255, 255, 255, 0.72) !important;
          box-shadow: 0 22px 48px rgba(15, 23, 42, 0.1) !important;
          overflow: visible !important;
          text-align: center !important;
        }
        .dashboard-sidebar.account-sidebar .dashboard-profile-avatar,
        .host-sidebar.account-sidebar .host-avatar-lg {
          width: 82px !important;
          height: 82px !important;
          border: 5px solid #ffffff !important;
          box-shadow: 0 0 0 7px rgba(255, 184, 0, 0.22), 0 16px 30px rgba(15, 23, 42, 0.16) !important;
        }
        .dashboard-sidebar.account-sidebar .dashboard-profile-name,
        .host-sidebar.account-sidebar .host-card-profile h2 {
          display: block !important;
          margin: 6px 0 0 !important;
          color: #0f172a !important;
          font-size: 1.45rem !important;
          font-weight: 950 !important;
          line-height: 1.1 !important;
        }
        .dashboard-sidebar.account-sidebar .dashboard-member-pill,
        .host-sidebar.account-sidebar .pill-success {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          min-height: 38px;
          padding: 0 16px !important;
          border-radius: 999px !important;
          background: #dcfce7 !important;
          border: 1px solid #86efac !important;
          color: #047857 !important;
          font-size: 0.82rem !important;
          font-weight: 900 !important;
        }
        .dashboard-sidebar.account-sidebar [class*="-mr-10"],
        .dashboard-sidebar.account-sidebar [class*="-ml-10"] {
          opacity: 0.55;
        }
      }
      @media (max-width: 520px) {
        .account-mobile-bar {
          margin-left: -10px;
          margin-right: -10px;
        }
        .account-mobile-menu-toggle {
          width: 46px;
          min-width: 46px;
          padding: 0;
          gap: 0;
        }
        .account-mobile-menu-toggle span:last-child {
          display: none;
        }
        .dashboard-shell {
          padding-left: 10px !important;
          padding-right: 10px !important;
        }
        .dashboard-sidebar.account-sidebar,
        .host-sidebar.account-sidebar {
          width: min(92vw, 380px) !important;
          max-width: calc(100vw - 16px) !important;
          padding: 24px 16px 20px !important;
          border-radius: 0 24px 24px 0 !important;
        }
        .dashboard-profile-card,
        .host-card-profile {
          padding: 18px !important;
        }
        .dashboard-sidebar.account-sidebar .dashboard-profile-card,
        .host-sidebar.account-sidebar .host-card-profile {
          min-height: 205px !important;
          border-radius: 26px !important;
        }
        .dashboard-sidebar.account-sidebar .dashboard-nav-link,
        .host-sidebar.account-sidebar .host-side-nav a {
          min-height: 54px;
          border-radius: 18px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function showToast(message, type = "default") {
    injectDashboardStyles();
    let root = document.getElementById("toast-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "toast-root";
      root.className = "toast-root";
      document.body.appendChild(root);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    root.appendChild(toast);

    window.setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  function handleLogout(event) {
    const logoutButton = event.target.closest("[data-logout]");
    if (!logoutButton) return;

    event.preventDefault();
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (!confirmed) return;

    localStorage.removeItem("bookingme_user");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.clear();
    showToast("You have been logged out.", "success");

    window.setTimeout(() => {
      window.location.href = "/index.html";
    }, 450);
  }

  function setActiveNav() {
    const currentPath = window.location.pathname.replace(/\/+$/, "");
    const links = document.querySelectorAll(".dashboard-nav-link, .host-side-nav a");

    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      const linkPath = new URL(href, window.location.href).pathname.replace(/\/+$/, "");
      const isActive = linkPath === currentPath;

      link.classList.toggle("is-active", isActive);
      link.classList.toggle("dashboard-nav-link-active", isActive && link.classList.contains("dashboard-nav-link"));
    });
  }

  function bindActionFeedback() {
    document.addEventListener("click", (event) => {
      const approve = event.target.closest("[data-approve-request]");
      const decline = event.target.closest("[data-decline-request]");
      const save = event.target.closest("[data-save-preferences], [data-save-profile]");
      const deleteAction = event.target.closest("[data-delete-account], [data-delete-listing]");

      if (approve) {
        if (window.confirm("Approve this booking request?")) {
          approve.closest(".booking-card, .request-card")?.classList.add("is-approved");
          showToast("Booking request approved.", "success");
        }
      }

      if (decline) {
        if (window.confirm("Decline this booking request?")) {
          decline.closest(".booking-card, .request-card")?.classList.add("is-declined");
          showToast("Booking request declined.", "default");
        }
      }

      if (save) {
        showToast("Changes saved successfully.", "success");
      }

      if (deleteAction) {
        const confirmed = window.confirm("This action cannot be undone. Continue?");
        if (confirmed) {
          showToast("Action confirmed.", "default");
        }
      }
    });
  }

  function bindSettingsPersistence() {
    document.querySelectorAll("[data-setting]").forEach((input) => {
      const key = `bookingme.setting.${input.dataset.setting}`;
      const saved = localStorage.getItem(key);

      if (saved !== null && input.type === "checkbox") {
        input.checked = saved === "true";
      } else if (saved !== null) {
        input.value = saved;
      }

      input.addEventListener("change", () => {
        localStorage.setItem(key, input.type === "checkbox" ? String(input.checked) : input.value);
        showToast("Preference updated.", "success");
      });
    });
  }

  function initResponsiveSidebar() {
    const sidebar = document.querySelector(".dashboard-sidebar, .host-sidebar");
    const main = document.querySelector(".dashboard-main, .host-dashboard-main");
    if (!sidebar || !main || document.querySelector(".account-mobile-bar")) return;

    sidebar.classList.add("account-sidebar");

    const bar = document.createElement("div");
    bar.className = "account-mobile-bar";
    bar.innerHTML = `
      <button class="account-mobile-menu-toggle" type="button" aria-label="Open menu" aria-expanded="false">
        <span class="material-symbols-outlined">menu</span>
        <span>Menu</span>
      </button>
    `;

    const backdrop = document.createElement("div");
    backdrop.className = "account-sidebar-backdrop";

    const closeButton = document.createElement("button");
    closeButton.className = "account-sidebar-close";
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Close menu");
    closeButton.innerHTML = `<span class="material-symbols-outlined">close</span>`;

    main.prepend(bar);
    document.body.appendChild(backdrop);
    sidebar.prepend(closeButton);

    const toggle = bar.querySelector(".account-mobile-menu-toggle");

    const setOpen = (open) => {
      document.body.classList.toggle("account-sidebar-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };

    toggle.addEventListener("click", () => setOpen(true));
    closeButton.addEventListener("click", () => setOpen(false));
    backdrop.addEventListener("click", () => setOpen(false));

    sidebar.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
  }

  document.addEventListener("click", handleLogout);
  document.addEventListener("DOMContentLoaded", () => {
    injectDashboardStyles();
    initResponsiveSidebar();
    setActiveNav();
    bindActionFeedback();
    bindSettingsPersistence();
  });

  window.BookingMEDashboard = {
    showToast,
    setActiveNav,
  };
})();
