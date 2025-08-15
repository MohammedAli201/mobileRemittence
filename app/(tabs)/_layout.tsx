// import { Stack, useRouter } from 'expo-router';
// import { useEffect, useState } from 'react';
// import { ActivityIndicator, View } from 'react-native';
// import { UserProvider } from '../../context/UserContext';

// export default function RootLayout() {
//   const router = useRouter();
//   const [isReady, setIsReady] = useState(false);

//   // Simulate login check (later use SecureStore/AsyncStorage)
//   const isLoggedIn = false;

//   useEffect(() => {
//     if (!isLoggedIn) {
//       router.replace('/login');
//     }
//     setIsReady(true);
//   }, []);

//   if (!isReady) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   return (
//     <UserProvider>
//       <Stack screenOptions={{ headerShown: false }} />
//     </UserProvider>
//   );
// }

import { StripeProvider } from '@stripe/stripe-react-native';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { UserProvider } from '../../context/UserContext';

export default function RootLayout() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  // Simulate login check (replace with SecureStore/AsyncStorage later)
  const isLoggedIn = false;

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/login');
    }
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <StripeProvider
      publishableKey="pk_live_51Px2GJ2Lxy4F5WffNAhVgzwwn86dXubHc5mVzY4aPVjv5ueO9x1oSecmLlpCjYM2BSSkD8PlaNWB0SHz3yNewMC8006apYQ7ex" // Replace with your LIVE key
      merchantIdentifier="" // Required for Apple Pay (if needed)
      urlScheme="https://68fd8382a329.ngrok-free.app/api" // Must match app.json scheme
    >
      <UserProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </UserProvider>
    </StripeProvider>
  );
}
