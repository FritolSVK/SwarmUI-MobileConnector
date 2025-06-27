import React, { createContext, ReactNode, useContext, useState } from 'react';
import { darkTheme, lightTheme, ThemeMode } from '../constants/colors';

interface ThemeContextProps {
  themeMode: ThemeMode;
  theme: typeof lightTheme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const toggleTheme = () => setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  const theme = themeMode === 'light' ? lightTheme : darkTheme;
  return (
    <ThemeContext.Provider value={{ themeMode, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}; 