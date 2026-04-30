import {
  getStoredTheme,
  normalizeTheme,
  setStoredTheme,
} from "./ThemeStorageService.js";

const THEME_CHANGE_EVENT = "app:themechange";
const THEME_CONTROL_SELECTOR = "[data-theme-switcher]";

function getThemeMeta() {
  return {
    light: {
      icon: "light_mode",
      label: "Tema claro",
    },
    dark: {
      icon: "dark_mode",
      label: "Tema escuro",
    },
  };
}

function getBody() {
  return document.body || document.getElementsByTagName("body")[0];
}

function syncMaterialDashboardCompatibility(theme) {
  const body = getBody();
  if (!body) return;

  body.classList.toggle("dark-version", theme === "dark");
  body.classList.toggle("bg-gray-100", theme === "light");
  body.classList.toggle("bg-gray-600", theme === "dark");

  document.querySelectorAll(".bg-gray-100, .bg-gray-600").forEach((element) => {
    if (element === body) return;
    element.classList.toggle("bg-gray-100", theme === "light");
    element.classList.toggle("bg-gray-600", theme === "dark");
  });
}

function syncThemeControls(theme) {
  const meta = getThemeMeta()[theme];

  document.querySelectorAll(THEME_CONTROL_SELECTOR).forEach((control) => {
    const isCheckbox = control.matches('input[type="checkbox"]');
    const nextTheme = theme === "dark" ? "light" : "dark";

    control.dataset.themeValue = theme;
    control.dataset.themeNext = nextTheme;
    control.setAttribute("aria-label", meta.label);
    control.setAttribute("title", meta.label);

    if (isCheckbox) {
      control.checked = theme === "dark";
      return;
    }

    const icon = control.querySelector("[data-theme-switcher-icon]");
    const label = control.querySelector("[data-theme-switcher-label]");

    if (icon) icon.textContent = meta.icon;
    if (label) label.textContent = theme === "dark" ? "Escuro" : "Claro";
  });

  const legacyToggle = document.getElementById("dark-version");
  if (legacyToggle && legacyToggle.matches('input[type="checkbox"]')) {
    legacyToggle.checked = theme === "dark";
    if (theme === "dark") legacyToggle.setAttribute("checked", "true");
    if (theme === "light") legacyToggle.removeAttribute("checked");
  }
}

function syncLogo(theme) {
  document.querySelectorAll(".navbar-brand-img").forEach((logo) => {
    if (!logo.src) return;

    if (theme === "dark" && logo.src.includes("logo-ct-dark.png")) {
      logo.src = logo.src.replace("logo-ct-dark.png", "logo-ct.png");
    }

    if (theme === "light" && logo.src.includes("logo-ct.png")) {
      logo.src = logo.src.replace("logo-ct.png", "logo-ct-dark.png");
    }
  });
}

function dispatchThemeChange(theme) {
  window.dispatchEvent(
    new CustomEvent(THEME_CHANGE_EVENT, {
      detail: { theme },
    })
  );
}

function applyTheme(theme, options = {}) {
  const safeTheme = normalizeTheme(theme);
  const shouldPersist = options.persist !== false;
  const shouldNotify = options.notify !== false;

  document.documentElement.dataset.theme = safeTheme;
  document.documentElement.dataset.bsTheme = safeTheme;
  document.documentElement.style.colorScheme = safeTheme;

  if (shouldPersist) setStoredTheme(safeTheme);

  syncMaterialDashboardCompatibility(safeTheme);
  syncLogo(safeTheme);
  syncThemeControls(safeTheme);

  if (shouldNotify) dispatchThemeChange(safeTheme);

  return safeTheme;
}

function getTheme() {
  return normalizeTheme(document.documentElement.dataset.theme || getStoredTheme());
}

function setTheme(theme) {
  return applyTheme(theme, { persist: true, notify: true });
}

function toggleTheme() {
  return setTheme(getTheme() === "dark" ? "light" : "dark");
}

function subscribe(callback) {
  const listener = (event) => callback(event.detail.theme);
  window.addEventListener(THEME_CHANGE_EVENT, listener);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, listener);
}

function bindThemeControls() {
  document.querySelectorAll(THEME_CONTROL_SELECTOR).forEach((control) => {
    if (control.dataset.themeBound === "true") return;
    control.dataset.themeBound = "true";

    control.addEventListener("click", (event) => {
      if (control.matches('input[type="checkbox"]')) return;
      event.preventDefault();
      toggleTheme();
    });

    control.addEventListener("change", () => {
      if (!control.matches('input[type="checkbox"]')) return;
      setTheme(control.checked ? "dark" : "light");
    });
  });
}

function initTheme() {
  applyTheme(getStoredTheme(), { persist: false, notify: false });
  bindThemeControls();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTheme);
} else {
  initTheme();
}
window.addEventListener("load", () => applyTheme(getTheme(), { persist: false }));

window.AppTheme = {
  getTheme,
  setTheme,
  toggleTheme,
  subscribe,
};

export {
  THEME_CHANGE_EVENT,
  applyTheme,
  getTheme,
  initTheme,
  setTheme,
  subscribe,
  toggleTheme,
};
