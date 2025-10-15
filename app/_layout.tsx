// app/_layout.tsx
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TransactionProvider } from '../context/TransactionContext';
import { UserProvider } from '../context/UserContext';

export default function RootLayout() {
  const cs = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  if (!loaded) return null;

  return (
    // <StripeProvider
    //   publishableKey={process.env.EXPO_PUBLIC_STRIPE_PK!}
    //   urlScheme="moodtracker"               // must match app.json "scheme"
    // >
      <UserProvider>
        <TransactionProvider>
          <ThemeProvider value={cs === 'dark' ? DarkTheme : DefaultTheme}>
            <Slot />                         {/* renders child routes */}
            <StatusBar style="auto" />
          </ThemeProvider>
        </TransactionProvider>
      </UserProvider>
    // </StripeProvider>
  );
}
