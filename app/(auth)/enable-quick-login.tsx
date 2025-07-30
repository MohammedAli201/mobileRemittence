

// app/(auth)/enable-quick-login.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function EnableQuickLoginScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enable Quick Login?</Text>
      <Text style={styles.subtitle}>
        Use PIN or fingerprint to access your account faster next time.
      </Text>

      <TouchableOpacity style={styles.button} onPress={() => router.replace('/(auth)/setup-pin')}>
        <Text style={styles.buttonText}>Yes, Set It Up</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.skipButton]}
        onPress={() => router.replace('/transaction/RecentTransactions')}
      >
        <Text style={styles.buttonText}>No, Skip for Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#555', marginBottom: 24, textAlign: 'center' },
  button: {
    backgroundColor: '#4f46e5',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: '#9ca3af',
  },
  buttonText: { color: 'white', fontSize: 16 },
});
