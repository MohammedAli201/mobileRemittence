import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useUser } from '../../context/UserContext';
import { AuthHelpers } from '../../services/AuthHelpers';

export default function SetupPinScreen() {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [secureEntry, setSecureEntry] = useState(true);
  const [confirmSecureEntry, setConfirmSecureEntry] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const router = useRouter();
  const { user } = useUser();

  // Verify user data is available before allowing PIN setup
  useEffect(() => {
    if (user?.id) {
      setIsReady(true);
    } else {
      Alert.alert('Error', 'User information not available. Please sign in again.');
      router.replace('/login');
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!isReady) return;

    if (pin.length !== 4 || confirmPin.length !== 4) {
      Alert.alert('Error', 'PIN must be exactly 4 digits');
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert('Error', 'PINs do not match');
      return;
    }

    setIsLoading(true);
    try {
      // First setup PIN with backend (if applicable)
      // await yourBackendService.setupPin(user.id, pin);
      
      // Then enable quick login locally
      const success = await AuthHelpers.enableQuickLogin(user.id, pin);
      
      if (success) {
        Alert.alert('Success', 'Your PIN has been set successfully. You can now use your PIN or biometrics to login.', [
          { text: 'OK', onPress: () => router.replace('/(auth)/authenticate') }
        ]);
      } else {
        throw new Error('Failed to save PIN to device');
      }
    } catch (error) {
      console.error('PIN setup failed:', error);
      Alert.alert('Error', error.message || 'Failed to setup PIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isReady) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MaterialIcons name="lock" size={48} color="#4f46e5" style={styles.icon} />
      <Text style={styles.title}>Secure Your Account</Text>
      <Text style={styles.description}>
        Set a 4-digit PIN to protect your account. You can also use biometrics.
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Enter 4-digit PIN</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="••••"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry={secureEntry}
            value={pin}
            onChangeText={setPin}
            editable={!isLoading}
            autoFocus
          />
          <TouchableOpacity 
            onPress={() => setSecureEntry(!secureEntry)} 
            style={styles.eyeIcon}
            disabled={isLoading}
          >
            <MaterialIcons 
              name={secureEntry ? 'visibility-off' : 'visibility'} 
              size={22} 
              color="#6b7280" 
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Confirm 4-digit PIN</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="••••"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry={confirmSecureEntry}
            value={confirmPin}
            onChangeText={setConfirmPin}
            editable={!isLoading}
          />
          <TouchableOpacity 
            onPress={() => setConfirmSecureEntry(!confirmSecureEntry)} 
            style={styles.eyeIcon}
            disabled={isLoading}
          >
            <MaterialIcons 
              name={confirmSecureEntry ? 'visibility-off' : 'visibility'} 
              size={22} 
              color="#6b7280" 
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.button, isLoading && styles.disabledButton]} 
        onPress={handleSubmit}
        disabled={isLoading || !pin || !confirmPin}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Save PIN</Text>
        )}
      </TouchableOpacity>

      <View style={styles.biometricTip}>
        <MaterialIcons name="fingerprint" size={20} color="#6b7280" />
        <Text style={styles.biometricText}> You can also use fingerprint or Face ID</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 24, 
    justifyContent: 'center', 
    backgroundColor: '#f8fafc' 
  },
  loadindContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: { 
    alignSelf: 'center', 
    marginBottom: 16 
  },
  title: { 
    fontSize: 24, 
    fontWeight: '700', 
    textAlign: 'center', 
    marginBottom: 8, 
    color: '#1e293b' 
  },
  description: { 
    fontSize: 15, 
    color: '#64748b', 
    textAlign: 'center', 
    marginBottom: 32,
    lineHeight: 22,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 18,
    letterSpacing: 4,
    color: '#1e293b',
    fontWeight: '600',
  },
  eyeIcon: {
    padding: 8,
    marginLeft: 4,
  },
  button: {
    backgroundColor: '#4f46e5',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#c7d2fe',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  biometricTip: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  biometricText: {
    color: '#64748b',
    fontSize: 14,
    marginLeft: 6,
  },
});