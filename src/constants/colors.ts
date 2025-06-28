export type ThemeMode = 'light' | 'dark';

export const purple = '#a78bfa';

// Common colors used across themes
export const common = {
  shadow: '#000',
  white: '#fff',
  black: '#000',
  primary: '#007bff',
  primaryAlt: '#007AFF',
  success: '#388e3c',
  warning: '#ff9800',
  error: '#d32f2f',
  errorAlt: '#ff4444',
  gray: {
    100: '#f8f9fa',
    200: '#e9ecef',
    300: '#dee2e6',
    400: '#ced4da',
    500: '#adb5bd',
    600: '#6c757d',
    700: '#495057',
    800: '#343a40',
    900: '#212529',
  },
  blue: {
    50: '#f8fafd',
    100: '#f1f5f9',
    500: '#007bff',
  },
  border: {
    light: '#e0e0e0',
    medium: '#ddd',
    dark: '#ccc',
  },
  background: {
    light: '#fafafa',
    card: '#f8fafd',
  }
};

export const lightTheme = {
  background: '#f8fafc', // very light gray
  panel: '#f1f5f9',      // light panel
  text: '#18181b',       // almost black
  secondaryText: '#52525b',
  border: '#e5e7eb',
  accent: purple,
  disabledAccent: '#705EA6FF',
  disabled: '#d1d5db',
  buttonBackground: '#D9DDE0FF',
  // Additional colors for light theme
  cardBackground: common.background.card,
  primaryText: common.gray[900],
  mutedText: common.gray[500],
  borderColor: common.border.light,
  inputBackground: common.white,
  inputBorder: common.border.medium,
  shadow: common.shadow,
  white: common.white,
  primary: common.primary,
  success: common.success,
  warning: common.warning,
  error: common.error,
  // Gray scale
  gray: common.gray,
  // Background object
  backgroundObj: common.background,
};

export const darkTheme = {
  background: '#242428FF', // dark background
  panel: '#23232b',      // dark panel
  text: '#f4f4f5',       // near white
  secondaryText: '#a1a1aa',
  border: '#434348FF',
  accent: purple,
  disabledAccent: '#705EA6FF',
  disabled: '#3f3f46',
  buttonBackground: '#18181EFF',
  // Additional colors for dark theme
  cardBackground: '#2a2a2e',
  primaryText: '#f4f4f5',
  mutedText: '#71717a',
  borderColor: '#3f3f46',
  inputBackground: '#2a2a2e',
  inputBorder: '#3f3f46',
  shadow: common.shadow,
  white: common.white,
  primary: common.primary,
  success: common.success,
  warning: common.warning,
  error: common.error,
  // Gray scale
  gray: common.gray,
  // Background object
  backgroundObj: common.background,
}; 