// import { useColorScheme } from '@/hooks/useColorScheme';
// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// import { useFonts } from 'expo-font';
// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import { UserProvider } from '../context/UserContext';

// export default function RootLayout() {
//   const colorScheme = useColorScheme();
//   const [loaded] = useFonts({
//     SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
//   });

//   if (!loaded) return null;

//   return (
//     <UserProvider>
//       <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
//         {/* DO NOT manually declare nested routes like (auth)/(tabs) */}
//         <Stack screenOptions={{ headerShown: false }} />
//         <StatusBar style="auto" />
//       </ThemeProvider>
//     </UserProvider>
//   );
// }


import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TransactionProvider } from '../context/TransactionContext'; // Add this import
import { UserProvider } from '../context/UserContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) return null;

  return (
    <UserProvider>
      <TransactionProvider> {/* Add this wrapper */}
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          {/* DO NOT manually declare nested routes like (auth)/(tabs) */}
          <Stack screenOptions={{ headerShown: false }} />
          <StatusBar style="auto" />
        </ThemeProvider>
      </TransactionProvider> {/* Close wrapper */}
    </UserProvider>
  );
}