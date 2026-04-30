const THEME_STORAGE_KEY = "app-theme";
const VALID_THEMES = ["light", "dark"];
const DEFAULT_THEME = "light";

function isValidTheme(theme) {
  return VALID_THEMES.includes(theme);
}

export function getStoredTheme() {
  try {
    const theme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isValidTheme(theme) ? theme : DEFAULT_THEME;
  } catch (error) {
    return DEFAULT_THEME;
  }
}

export function setStoredTheme(theme) {
  const safeTheme = isValidTheme(theme) ? theme : DEFAULT_THEME;

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, safeTheme);
  } catch (error) {
    return safeTheme;
  }

  return safeTheme;
}

export function normalizeTheme(theme) {
  return isValidTheme(theme) ? theme : DEFAULT_THEME;
}

export { DEFAULT_THEME, THEME_STORAGE_KEY, VALID_THEMES };
