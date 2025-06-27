import React from 'react';
import { SessionProvider } from '../../src/contexts';
import { ThemeProvider } from '../../src/hooks/useTheme';
import HomeScreen from '../../src/screens/HomeScreen';

export default function App() {
  return (
    <SessionProvider>
      <ThemeProvider>
        <HomeScreen />
      </ThemeProvider>
    </SessionProvider>
  );
} 