import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../hooks/useTheme';

export default function ThemeAwareStatusBar() {
  const { themeMode } = useTheme();
  
  return (
    <StatusBar 
      style={themeMode === 'dark' ? 'light' : 'dark'} 
      backgroundColor="transparent"
      translucent
    />
  );
} 