import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { AuthHelpers } from '../../services/AuthHelpers';

export default function ResetPinScreen() {
  const [password, setPassword] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);
  const router = useRouter();

  const handleReset = async () => {
    if (!password.trim()) return Alert.alert('Error', 'Please enter your password');
    if (newPin.length !== 4 || confirmPin.length !== 4) return Alert.alert('Error', 'PIN must be exactly 4 digits');
    if (newPin !== confirmPin) return Alert.alert('Error', 'PINs do not match');

    setIsLoading(true);
    try {
      const userId = await AuthHelpers.verifyCredentialsForPinReset('', password);
      await AuthHelpers.completePinReset(userId, newPin);
      Alert.alert('Success', 'Your PIN has been changed successfully');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to reset PIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await AuthHelpers.clearPin();
    router.replace('/login');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.title}>Reset Your PIN</Text>
          <Text style={styles.subtitle}>For security, please enter your password and new PIN</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Current Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>New 4-digit PIN</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter new PIN"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry={secureText}
              value={newPin}
              onChangeText={setNewPin}
            />
            <TouchableOpacity 
              onPress={() => setSecureText(!secureText)} 
              style={styles.eyeIcon}
              accessibilityLabel={secureText ? 'Show PIN' : 'Hide PIN'}
            >
              <MaterialIcons 
                name={secureText ? 'visibility-off' : 'visibility'} 
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
              placeholder="Confirm new PIN"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry={secureText}
              value={confirmPin}
              onChangeText={setConfirmPin}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.disabledButton]}
          onPress={handleReset}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save New PIN</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutText}>Forgot password? Sign out</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  inner: { 
    flex: 1, 
    padding: 24, 
    justifyContent: 'center' 
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: { 
    fontSize: 24, 
    fontWeight: '600', 
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 24,
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
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    height: 50, 
    fontSize: 16,
    color: '#1e293b',
  },
  eyeIcon: { 
    padding: 8,
    marginLeft: 4,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledButton: { 
    opacity: 0.7,
  },
  buttonText: { 
    color: 'white', 
    fontWeight: '600', 
    fontSize: 16,
  },
  logoutButton: { 
    marginTop: 24, 
    alignItems: 'center',
    padding: 12,
  },
  logoutText: { 
    color: '#ef4444', 
    fontWeight: '500',
    fontSize: 14,
  },
});