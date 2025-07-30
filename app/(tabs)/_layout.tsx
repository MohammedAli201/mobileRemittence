import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { UserProvider } from '../../context/UserContext';

export default function RootLayout() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  // Simulate login check (later use SecureStore/AsyncStorage)
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
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </UserProvider>
  );
}
