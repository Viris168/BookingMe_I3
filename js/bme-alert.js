/**
 * BookingME Custom UI Alerts & Modals
 * Replaces all native alert() and confirm() with beautiful, premium modals.
 * Loaded globally across all pages.
 */
const BMEAlert = (function() {

  // Inject styles once
  var stylesInjected = false;
  function injectStyles() {
    if (stylesInjected) return;
    stylesInjected = true;
    var style = document.createElement('style');
    style.id = 'bme-alert-styles';
    style.textContent = '\
      .bme-modal-overlay {\
        position: fixed; inset: 0; z-index: 99999;\
        display: flex; align-items: center; justify-content: center;\
        background: rgba(15,23,42,0.45); backdrop-filter: blur(6px);\
        opacity: 0; transition: opacity 0.28s ease;\
        font-family: "Kantumruy Pro", "Inter", system-ui, sans-serif;\
      }\
      .bme-modal-overlay.is-visible { opacity: 1; }\
      .bme-modal-card {\
        width: 100%; max-width: 420px; margin: 0 16px;\
        background: #fff; border-radius: 24px;\
        box-shadow: 0 25px 60px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1);\
        transform: scale(0.92) translateY(12px); opacity: 0;\
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);\
        overflow: hidden;\
      }\
      .bme-modal-overlay.is-visible .bme-modal-card {\
        transform: scale(1) translateY(0); opacity: 1;\
      }\
      .bme-modal-header {\
        display: flex; align-items: flex-start; gap: 16px;\
        padding: 28px 28px 0;\
      }\
      .bme-modal-icon {\
        display: flex; flex-shrink: 0; align-items: center; justify-content: center;\
        width: 52px; height: 52px; border-radius: 16px;\
      }\
      .bme-modal-icon span { font-size: 26px; }\
      .bme-modal-icon.info  { background: linear-gradient(135deg, #dbeafe, #eff6ff); color: #2563eb; }\
      .bme-modal-icon.warn  { background: linear-gradient(135deg, #fef3c7, #fffbeb); color: #d97706; }\
      .bme-modal-icon.error { background: linear-gradient(135deg, #fee2e2, #fef2f2); color: #dc2626; }\
      .bme-modal-icon.success { background: linear-gradient(135deg, #dcfce7, #f0fdf4); color: #16a34a; }\
      .bme-modal-icon.logout { background: linear-gradient(135deg, #fee2e2, #fef2f2); color: #dc2626; }\
      .bme-modal-title {\
        margin: 0; font-size: 19px; font-weight: 800; color: #0f172a; line-height: 1.3;\
      }\
      .bme-modal-msg {\
        margin: 6px 0 0; font-size: 14px; color: #64748b; line-height: 1.6;\
      }\
      .bme-modal-body { padding: 20px 28px 28px; }\
      .bme-modal-actions {\
        display: flex; gap: 12px; justify-content: flex-end;\
        padding: 0 28px 28px;\
      }\
      .bme-modal-btn {\
        padding: 11px 22px; border-radius: 14px; font-size: 14px;\
        font-weight: 700; cursor: pointer; transition: all 0.2s ease;\
        border: none; outline: none;\
      }\
      .bme-modal-btn:hover { transform: translateY(-1px); }\
      .bme-modal-btn:active { transform: translateY(0); }\
      .bme-modal-btn.cancel {\
        background: #fff; color: #475569;\
        border: 1.5px solid #e2e8f0;\
        box-shadow: 0 1px 3px rgba(0,0,0,0.04);\
      }\
      .bme-modal-btn.cancel:hover { background: #f8fafc; color: #0f172a; border-color: #cbd5e1; }\
      .bme-modal-btn.primary {\
        background: linear-gradient(135deg, #2563eb, #3b82f6); color: #fff;\
        box-shadow: 0 4px 14px rgba(37,99,235,0.25);\
      }\
      .bme-modal-btn.primary:hover { box-shadow: 0 6px 20px rgba(37,99,235,0.35); }\
      .bme-modal-btn.danger {\
        background: linear-gradient(135deg, #dc2626, #ef4444); color: #fff;\
        box-shadow: 0 4px 14px rgba(220,38,38,0.25);\
      }\
      .bme-modal-btn.danger:hover { box-shadow: 0 6px 20px rgba(220,38,38,0.35); }\
      .bme-modal-btn.success {\
        background: linear-gradient(135deg, #16a34a, #22c55e); color: #fff;\
        box-shadow: 0 4px 14px rgba(22,163,74,0.25);\
      }\
      .bme-modal-btn.success:hover { box-shadow: 0 6px 20px rgba(22,163,74,0.35); }\
      .bme-modal-btn.warn {\
        background: linear-gradient(135deg, #d97706, #f59e0b); color: #fff;\
        box-shadow: 0 4px 14px rgba(217,119,6,0.25);\
      }\
      @media (prefers-color-scheme: dark) {\
        .bme-modal-card { background: #1e293b; box-shadow: 0 25px 60px rgba(0,0,0,0.5); }\
        .bme-modal-title { color: #f1f5f9; }\
        .bme-modal-msg { color: #94a3b8; }\
        .bme-modal-btn.cancel { background: #334155; color: #e2e8f0; border-color: #475569; }\
        .bme-modal-btn.cancel:hover { background: #475569; }\
      }\
    ';
    document.head.appendChild(style);
  }

  // Icon map
  var icons = {
    info: 'info',
    warn: 'warning',
    error: 'error',
    success: 'check_circle',
    logout: 'logout',
    delete: 'delete_forever',
    approve: 'check_circle',
    decline: 'cancel',
    lock: 'lock'
  };

  /**
   * Show a beautiful alert (replaces window.alert)
   * @param {string} message
   * @param {object} opts - { title, type: 'info'|'warn'|'error'|'success', buttonText, onClose, redirectUrl }
   */
  function show(message, opts) {
    opts = opts || {};
    injectStyles();

    var type = opts.type || 'info';
    var title = opts.title || (type === 'error' ? 'Oops!' : type === 'warn' ? 'Attention' : type === 'success' ? 'Success' : 'Notice');
    var icon = opts.icon || icons[type] || 'info';
    var btnText = opts.buttonText || 'Got it';
    var btnClass = type === 'error' ? 'danger' : type === 'success' ? 'success' : type === 'warn' ? 'warn' : 'primary';

    var overlay = document.createElement('div');
    overlay.className = 'bme-modal-overlay';
    overlay.innerHTML = '\
      <div class="bme-modal-card">\
        <div class="bme-modal-header">\
          <div class="bme-modal-icon ' + type + '">\
            <span class="material-symbols-outlined">' + icon + '</span>\
          </div>\
          <div>\
            <h3 class="bme-modal-title">' + title + '</h3>\
            <p class="bme-modal-msg">' + message + '</p>\
          </div>\
        </div>\
        <div class="bme-modal-actions">\
          <button class="bme-modal-btn ' + btnClass + ' bme-alert-ok">' + btnText + '</button>\
        </div>\
      </div>';

    document.body.appendChild(overlay);
    requestAnimationFrame(function() {
      requestAnimationFrame(function() { overlay.classList.add('is-visible'); });
    });

    function close() {
      overlay.classList.remove('is-visible');
      setTimeout(function() {
        overlay.remove();
        if (opts.onClose) opts.onClose();
        if (opts.redirectUrl) window.location.href = opts.redirectUrl;
      }, 300);
    }

    overlay.querySelector('.bme-alert-ok').addEventListener('click', close);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) close();
    });
    document.addEventListener('keydown', function handler(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', handler); }
    });
  }

  /**
   * Show a beautiful confirm dialog (replaces window.confirm)
   * @param {string} message
   * @param {object} opts - { title, type, confirmText, cancelText, onConfirm, onCancel, icon }
   */
  function ask(message, opts) {
    opts = opts || {};
    injectStyles();

    var type = opts.type || 'warn';
    var title = opts.title || 'Are you sure?';
    var icon = opts.icon || icons[type] || 'help';
    var confirmText = opts.confirmText || 'Confirm';
    var cancelText = opts.cancelText || 'Cancel';
    var btnClass = type === 'error' || type === 'logout' || type === 'delete' ? 'danger' : type === 'success' || type === 'approve' ? 'success' : 'primary';

    var overlay = document.createElement('div');
    overlay.className = 'bme-modal-overlay';
    overlay.innerHTML = '\
      <div class="bme-modal-card">\
        <div class="bme-modal-header">\
          <div class="bme-modal-icon ' + type + '">\
            <span class="material-symbols-outlined">' + icon + '</span>\
          </div>\
          <div>\
            <h3 class="bme-modal-title">' + title + '</h3>\
            <p class="bme-modal-msg">' + message + '</p>\
          </div>\
        </div>\
        <div class="bme-modal-actions">\
          <button class="bme-modal-btn cancel bme-confirm-cancel">' + cancelText + '</button>\
          <button class="bme-modal-btn ' + btnClass + ' bme-confirm-ok">' + confirmText + '</button>\
        </div>\
      </div>';

    document.body.appendChild(overlay);
    requestAnimationFrame(function() {
      requestAnimationFrame(function() { overlay.classList.add('is-visible'); });
    });

    function close(confirmed) {
      overlay.classList.remove('is-visible');
      setTimeout(function() {
        overlay.remove();
        if (confirmed && opts.onConfirm) opts.onConfirm();
        if (!confirmed && opts.onCancel) opts.onCancel();
      }, 300);
    }

    overlay.querySelector('.bme-confirm-ok').addEventListener('click', function() { close(true); });
    overlay.querySelector('.bme-confirm-cancel').addEventListener('click', function() { close(false); });
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) close(false);
    });
    document.addEventListener('keydown', function handler(e) {
      if (e.key === 'Escape') { close(false); document.removeEventListener('keydown', handler); }
    });
  }

  return { show: show, ask: ask };
})();
