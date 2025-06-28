import { View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import ThemeAwareStatusBar from '../../src/components/ui/ThemeAwareStatusBar'
import { SessionProvider } from '../../src/contexts/SessionContext'
import { ThemeProvider } from '../../src/hooks/useTheme'
import HomeScreen from '../../src/screens/HomeScreen'

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SessionProvider>
          <View style={{ flex: 1 }}>
            <HomeScreen />
            <ThemeAwareStatusBar />
          </View>
        </SessionProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
} 