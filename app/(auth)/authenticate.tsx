import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AuthService from '../../services/AuthHelpers';

export default function AuthenticateScreen() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const router = useRouter();

  const handleBiometricAuth = async () => {
    setIsAuthenticating(true);
    const success = await AuthService.authenticateWithBiometrics();
    setIsAuthenticating(false);

    if (success) {
      router.replace('/(tabs)'); // ✅ Correct route
    } else {
      Alert.alert('Authentication Failed', 'Please try again');
    }
  };

  const handlePinAuth = () => {
    router.push('/(auth)/pin-entry'); // ✅ Correct route
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Authenticate</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleBiometricAuth}
        disabled={isAuthenticating}
      >
        <Text style={styles.buttonText}>
          {isAuthenticating ? 'Authenticating...' : 'Use Biometrics'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={handlePinAuth}
      >
        <Text style={styles.buttonSecondaryText}>Use PIN Instead</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
    color: '#666',
  },
  buttonSecondary:{

  },
  buttonSecondaryText:{

  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3182ce',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

