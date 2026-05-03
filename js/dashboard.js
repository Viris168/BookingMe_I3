(function () {
  /* ── Style injection ──────────────────────────────────────── */
  function injectDashboardStyles() {
    if (document.getElementById("bookingme-dashboard-js-styles")) return;

    const style = document.createElement("style");
    style.id = "bookingme-dashboard-js-styles";
    style.textContent = `
      /* ── Toast ──────────────────────────────────── */
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

      @media (min-width: 768px) {
        .bme-mobile-topbar { display: none !important; }
        .bme-sidebar-overlay { display: none !important; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ── Toast ──────────────────────────────────────────────── */
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

  /* ── Logout ─────────────────────────────────────────────── */
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

  /* ── Active nav ─────────────────────────────────────────── */
  function setActiveNav() {
    const currentPath = window.location.pathname.replace(/\/+$/, "");
    const links = document.querySelectorAll(".dashboard-nav-link, .host-side-nav a");

    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      const linkPath = new URL(href, window.location.href).pathname.replace(/\/+$/, "");
      const isActive = linkPath === currentPath;

      link.classList.toggle("is-active", isActive);
      link.classList.toggle(
        "dashboard-nav-link-active",
        isActive && link.classList.contains("dashboard-nav-link")
      );
    });
  }

  /* ── Action feedback ────────────────────────────────────── */
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

  /* ── Settings persistence ───────────────────────────────── */
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
        localStorage.setItem(
          key,
          input.type === "checkbox" ? String(input.checked) : input.value
        );
        showToast("Preference updated.", "success");
      });
    });
  }

  /* ── Mobile Sidebar Drawer ──────────────────────────────── */
  // NOTE: Mobile topbar HTML is now hardcoded in each page's HTML.
  // The inline <script> at the bottom of each page handles toggle logic.
  // No injection needed here.

  document.addEventListener("click", handleLogout);
  document.addEventListener("DOMContentLoaded", () => {
    injectDashboardStyles();
    setActiveNav();
    bindActionFeedback();
    bindSettingsPersistence();
  });

  window.BookingMEDashboard = {
    showToast,
    setActiveNav,
  };
})();
