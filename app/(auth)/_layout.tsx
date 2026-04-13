import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="check-auth" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="authenticate" options={{ headerShown: false }} />
      <Stack.Screen name="enable-quick-login" options={{ headerShown: false }} />
      <Stack.Screen name="setup-pin" options={{ headerShown: false }} />
      <Stack.Screen name="pin-entry" options={{ headerShown: false }} />
      <Stack.Screen name="ResetPinScreen" options={{ headerShown: false }} />
    </Stack>
  );
}
