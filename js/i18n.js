(function () {
  const DEFAULT_LANG = "en";
  const STORAGE_KEY = "bookingme.lang";
  const supported = new Set(["en", "km"]);
  let currentDictionary = null;
  let currentLang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;

  function injectTypography() {
    if (!document.querySelector('link[data-bookingme-fonts="true"]')) {
      const preconnectGoogle = document.createElement("link");
      preconnectGoogle.rel = "preconnect";
      preconnectGoogle.href = "https://fonts.googleapis.com";
      preconnectGoogle.setAttribute("data-bookingme-fonts", "true");
      document.head.appendChild(preconnectGoogle);

      const preconnectGstatic = document.createElement("link");
      preconnectGstatic.rel = "preconnect";
      preconnectGstatic.href = "https://fonts.gstatic.com";
      preconnectGstatic.crossOrigin = "";
      preconnectGstatic.setAttribute("data-bookingme-fonts", "true");
      document.head.appendChild(preconnectGstatic);

      const fontLink = document.createElement("link");
      fontLink.rel = "stylesheet";
      fontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Kantumruy+Pro:wght@400;500;600;700;800&display=swap";
      fontLink.setAttribute("data-bookingme-fonts", "true");
      document.head.appendChild(fontLink);
    }

    if (!document.getElementById("bookingme-i18n-typography")) {
      const style = document.createElement("style");
      style.id = "bookingme-i18n-typography";
      style.textContent = `
        :root {
          --bookingme-font-en: "Inter", "Kantumruy Pro", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          --bookingme-font-km: "Kantumruy Pro", "Inter", system-ui, sans-serif;
        }
        html body,
        html body *:not(.material-symbols-outlined):not(.fa):not(.fa-solid):not(.fa-regular):not(.fa-brands):not([class^="fa-"]):not([class*=" fa-"]) {
          font-family: var(--bookingme-font-en) !important;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
        }
        html body {
          font-family: "Inter", "Kantumruy Pro", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
        }
        html.lang-km body,
        html.lang-km body *:not(.material-symbols-outlined):not(.fa):not(.fa-solid):not(.fa-regular):not(.fa-brands):not([class^="fa-"]):not([class*=" fa-"]),
        html.lang-km input,
        html.lang-km button,
        html.lang-km select,
        html.lang-km textarea {
          font-family: var(--bookingme-font-km) !important;
          line-height: 1.65;
        }
        html.lang-km h1,
        html.lang-km h2,
        html.lang-km h3,
        html.lang-km h4,
        html.lang-km .title {
          letter-spacing: 0;
          line-height: 1.25;
        }
      `;
      document.head.appendChild(style);
    }
  }

  function normalize(text) {
    return text.replace(/\s+/g, " ").trim();
  }

  function interpolate(value, params = {}) {
    return String(value).replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (match, key) => {
      return Object.prototype.hasOwnProperty.call(params, key) ? params[key] : match;
    });
  }

  function lookup(dictionary, key, params = {}) {
    if (!key) {
      return "";
    }

    const value =
      dictionary[key] ||
      dictionary.key?.[key] ||
      dictionary.attr?.[key] ||
      dictionary.text?.[key];

    return value ? interpolate(value, params) : "";
  }

  async function loadDictionary(lang) {
    const safeLang = supported.has(lang) ? lang : DEFAULT_LANG;
    const response = await fetch(`/data/lang/${safeLang}.json`);
    if (!response.ok) {
      throw new Error(`Unable to load language file: ${safeLang}`);
    }
    return response.json();
  }

  function applyKeyTranslations(root, dictionary) {
    root.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n");
      const value = lookup(dictionary, key);
      if (value && element.textContent !== value) {
        element.textContent = value;
      }
    });

    ["placeholder", "aria-label", "title", "alt"].forEach((attribute) => {
      const selector = `[data-i18n-${attribute}]`;
      root.querySelectorAll(selector).forEach((element) => {
        const key = element.getAttribute(`data-i18n-${attribute}`);
        const value = lookup(dictionary, key);
        if (value && element.getAttribute(attribute) !== value) {
          element.setAttribute(attribute, value);
        }
      });
    });
  }

  function applyExactTextTranslations(root, dictionary) {
    const textMap = dictionary.text || {};
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || ["SCRIPT", "STYLE", "TEXTAREA"].includes(parent.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }
        return normalize(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });

    const nodes = [];
    while (walker.nextNode()) {
      nodes.push(walker.currentNode);
    }

    nodes.forEach((node) => {
      if (!node.__bookingmeOriginalText) {
        node.__bookingmeOriginalText = normalize(node.nodeValue);
      }
      const translated = textMap[node.__bookingmeOriginalText] || translatePattern(node.__bookingmeOriginalText);
      if (translated) {
        const leading = node.nodeValue.match(/^\s*/)?.[0] || "";
        const trailing = node.nodeValue.match(/\s*$/)?.[0] || "";
        const nextValue = `${leading}${translated}${trailing}`;
        if (node.nodeValue !== nextValue) {
          node.nodeValue = nextValue;
        }
      }
    });
  }

  function translatePattern(text) {
    if (currentLang !== "km") {
      return "";
    }

    const reviewCount = text.match(/^\(?(\d+)\s+reviews\)?$/i);
    if (reviewCount) {
      return text.startsWith("(") ? `(${reviewCount[1]} ការវាយតម្លៃ)` : `${reviewCount[1]} ការវាយតម្លៃ`;
    }

    const nightlyPrice = text.match(/^\$(\d+(?:\.\d+)?)\s*\/\s*night$/i);
    if (nightlyPrice) {
      return `$${nightlyPrice[1]} / យប់`;
    }

    const nightsTotal = text.match(/^\$(\d+(?:\.\d+)?)\s*x\s*(\d+)\s+nights$/i);
    if (nightsTotal) {
      return `$${nightsTotal[1]} x ${nightsTotal[2]} យប់`;
    }

    const campusCount = text.match(/^(\d+)\s+(room|rooms)\s+available near Phnom Penh campuses$/i);
    if (campusCount) {
      return `មានបន្ទប់ ${campusCount[1]} នៅក្បែរសាកលវិទ្យាល័យក្នុងភ្នំពេញ`;
    }

    const monthlyPrice = text.match(/^\$(\d+(?:\.\d+)?)\s*\/\s*(month|mo)$/i);
    if (monthlyPrice) {
      return `$${monthlyPrice[1]} / ខែ`;
    }

    return "";
  }

  function applyAttributeTranslations(root, dictionary) {
    const attrMap = dictionary.attr || {};
    const translatedAttributes = ["placeholder", "aria-label", "title", "alt"];

    root.querySelectorAll("[placeholder]").forEach((element) => {
      if (!element.dataset.i18nOriginalPlaceholder) {
        element.dataset.i18nOriginalPlaceholder = element.getAttribute("placeholder");
      }
      const original = element.dataset.i18nOriginalPlaceholder;
      if (attrMap[original] && element.getAttribute("placeholder") !== attrMap[original]) {
        element.setAttribute("placeholder", attrMap[original]);
      }
    });

    translatedAttributes.forEach((attribute) => {
      root.querySelectorAll(`[${attribute}]`).forEach((element) => {
        const dataKey = `i18nOriginal${attribute.replace(/(^|-)([a-z])/g, (_, __, letter) => letter.toUpperCase())}`;
        if (!element.dataset[dataKey]) {
          element.dataset[dataKey] = element.getAttribute(attribute);
        }
        const original = element.dataset[dataKey];
        const stableKey = element.getAttribute(`data-i18n-${attribute}`);
        const translated = lookup(dictionary, stableKey) || attrMap[original] || dictionary.text?.[original];
        if (translated && element.getAttribute(attribute) !== translated) {
          element.setAttribute(attribute, translated);
        }
      });
    });
  }

  function updateLanguageButtons(lang) {
    document.querySelectorAll("[data-language-toggle]").forEach((button) => {
      button.setAttribute("aria-label", lang === "en" ? "Switch to Khmer" : "Switch to English");
      const label = button.querySelector("[data-language-label]") || button;
      label.textContent = lang === "en" ? "EN / KH" : "KH / EN";
    });

    const currentMeta = lang === "km"
      ? { flag: "/assets/flag/cambodia.png", label: "KH", alt: "Khmer" }
      : { flag: "/assets/flag/England.png", label: "EN", alt: "English" };

    document.querySelectorAll("[data-language-current-flag]").forEach((element) => {
      if (element.tagName === "IMG") {
        element.src = currentMeta.flag;
        element.alt = currentMeta.alt;
      } else {
        element.textContent = currentMeta.label;
      }
    });

    document.querySelectorAll("[data-language-current-label]").forEach((element) => {
      element.textContent = currentMeta.label;
    });

    document.querySelectorAll("[data-language]").forEach((button) => {
      const isActive = button.dataset.language === lang;
      button.classList.toggle("is-active", isActive);
      button.classList.toggle("bg-blue-50", isActive);
      button.classList.toggle("text-primary", isActive);
      button.classList.toggle("text-slate-600", !isActive);
      button.querySelectorAll("[data-language-check]").forEach((check) => {
        check.classList.toggle("hidden", !isActive);
      });
    });
  }

  async function setLanguage(lang) {
    currentLang = supported.has(lang) ? lang : DEFAULT_LANG;
    currentDictionary = await loadDictionary(currentLang);
    localStorage.setItem(STORAGE_KEY, currentLang);
    document.documentElement.lang = currentLang;
    document.documentElement.classList.toggle("lang-km", currentLang === "km");
    apply(document);
  }

  function apply(root = document) {
    if (!currentDictionary) {
      return;
    }
    applyKeyTranslations(root, currentDictionary);
    applyExactTextTranslations(root, currentDictionary);
    applyAttributeTranslations(root, currentDictionary);
    updateLanguageButtons(currentLang);
  }

  function initLanguageControls() {
    document.addEventListener("click", (event) => {
      const toggle = event.target.closest("[data-language-toggle]");
      if (toggle) {
        event.preventDefault();
        setLanguage(currentLang === "en" ? "km" : "en");
        return;
      }

      const option = event.target.closest("[data-language]");
      if (option) {
        event.preventDefault();
        setLanguage(option.dataset.language);
        option.closest("[data-language-menu]")?.classList.add("hidden");
        option.closest("[data-language-menu-root]")?.querySelector("[data-language-menu-button]")?.setAttribute("aria-expanded", "false");
      }
    });
  }

  function observeDynamicContent() {
    let frame = null;
    const observer = new MutationObserver(() => {
      if (frame || !currentDictionary) {
        return;
      }
      frame = requestAnimationFrame(() => {
        frame = null;
        apply(document);
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  window.BookingMEI18n = {
    apply,
    setLanguage,
    getLanguage: () => currentLang,
    t: (key, params) => (currentDictionary ? lookup(currentDictionary, key, params) || key : key),
  };

  injectTypography();
  initLanguageControls();
  observeDynamicContent();
  document.addEventListener("DOMContentLoaded", () => {
    setLanguage(currentLang).catch((error) => console.error("i18n error:", error));
  });
})();
