// components/AuthGate.tsx
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AuthService from '../services/AuthHelpers';

const AuthGate = ({ children, navigation }) => {
  const [authMethod, setAuthMethod] = useState<'biometric' | 'pin' | null>(null);
  const [loading, setLoading] = useState(true);
  const [pinAttempt, setPinAttempt] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const { biometric, pin } = await AuthService.getAuthTypes();
      
      if (biometric) {
        setAuthMethod('biometric');
        const success = await AuthService.authenticateWithBiometrics();
        if (success) {
          navigation.replace('App');
        }
      } else if (pin) {
        setAuthMethod('pin');
      } else {
        navigation.replace('AuthSetup');
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleBiometricAuth = async () => {
    const success = await AuthService.authenticateWithBiometrics();
    if (success) {
      navigation.replace('App');
    } else {
      setError('Authentication failed. Please try again.');
    }
  };

  const handlePinAuth = async () => {
    if (pinAttempt.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }

    const success = await AuthService.authenticateWithPin(pinAttempt);
    if (success) {
      navigation.replace('App');
    } else {
      setError('Incorrect PIN');
      setPinAttempt('');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {authMethod === 'biometric' ? 'Biometric Authentication' : 'Enter Your PIN'}
      </Text>
      
      {authMethod === 'pin' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter 4-digit PIN"
            keyboardType="numeric"
            secureTextEntry
            maxLength={4}
            value={pinAttempt}
            onChangeText={setPinAttempt}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity 
            style={styles.button}
            onPress={handlePinAuth}
          >
            <Text style={styles.buttonText}>Authenticate</Text>
          </TouchableOpacity>
        </>
      )}
      
      {authMethod === 'biometric' && (
        <>
          <TouchableOpacity 
            style={styles.button}
            onPress={handleBiometricAuth}
          >
            <Text style={styles.buttonText}>Authenticate with Biometrics</Text>
          </TouchableOpacity>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => setAuthMethod('pin')}
          >
            <Text style={styles.secondaryButtonText}>Use PIN Instead</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 16,
    fontSize: 16,
    textAlign: 'center',
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
  secondaryButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#3182ce',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#e53e3e',
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default AuthGate;