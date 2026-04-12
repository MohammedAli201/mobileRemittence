// app/_layout.tsx
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AppResumeLock from '../components/AppResumeLock';
import { UserProvider } from '../context/UserContext';

export default function RootLayout() {
  const cs = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  if (!loaded) return null;

  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PK!}
      merchantIdentifier="merchant.com.your.app" // For Apple Pay
      urlScheme="moodtracker" // Must match your app.json scheme
    >
      <UserProvider>
        <ThemeProvider value={cs === 'dark' ? DarkTheme : DefaultTheme}>
          <AppResumeLock />
          <Slot />
          <StatusBar style="auto" />
        </ThemeProvider>
      </UserProvider>
    </StripeProvider>
  );
}
