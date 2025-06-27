export type ThemeMode = 'light' | 'dark';

export const purple = '#a78bfa';

export const lightTheme = {
  background: '#f8fafc', // very light gray
  panel: '#f1f5f9',      // light panel
  text: '#18181b',       // almost black
  secondaryText: '#52525b',
  border: '#e5e7eb',
  accent: purple,
  disabled: '#d1d5db',
};

export const darkTheme = {
  background: '#242428FF', // dark background
  panel: '#23232b',      // dark panel
  text: '#f4f4f5',       // near white
  secondaryText: '#a1a1aa',
  border: '#27272a',
  accent: purple,
  disabled: '#3f3f46',
}; 