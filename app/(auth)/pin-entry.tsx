import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View
} from 'react-native';
import { useUser } from '../../context/UserContext';
import { AuthHelpers } from '../../services/AuthHelpers'; // Fixed import path

export default function PinEntryScreen() {
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if PIN exists and biometrics are available
        const [pinExists, bioAvailable] = await Promise.all([
          AuthHelpers.pinExists(),
          AuthHelpers.isBiometricAvailable()
        ]);
        
        setBiometricAvailable(bioAvailable);
        
        if (!pinExists) {
          router.replace('/login');
          return;
        }

        // Try biometric auth if available
        if (bioAvailable && attempts === 0) {
          const success = await AuthHelpers.authenticateWithBiometrics();
          if (success) {
            router.replace('/transaction/RecentTransactions');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [attempts]);

  const handleKeyPress = (value: string) => {
    if (value === 'backspace') {
      // Handle backspace
      const firstEmptyIndex = pin.findIndex(digit => digit === '');
      const indexToClear = firstEmptyIndex === -1 ? 3 : firstEmptyIndex - 1;
      
      if (indexToClear >= 0) {
        const newPin = [...pin];
        newPin[indexToClear] = '';
        setPin(newPin);
      }
    } else if (/^\d$/.test(value)) {
      // Handle digit input
      const firstEmptyIndex = pin.findIndex(digit => digit === '');
      if (firstEmptyIndex !== -1) {
        const newPin = [...pin];
        newPin[firstEmptyIndex] = value;
        setPin(newPin);
        
        // Auto-submit when last digit is entered
        if (firstEmptyIndex === 3) {
          handleSubmit(newPin.join(''));
        }
      }
    }
  };

  const handleSubmit = async (pinCode: string) => {
    try {
      const valid = await AuthHelpers.authenticateWithPin(pinCode);
      
      if (valid) {
        router.replace('/transaction/RecentTransactions');
      } else {
        Vibration.vibrate();
        setAttempts(prev => prev + 1);
        Alert.alert('Invalid PIN', `Attempts remaining: ${5 - attempts}`);
        setPin(['', '', '', '']);
        
        if (attempts >= 4) {
          Alert.alert('Too many attempts', 'You will be logged out for security');
          await AuthHelpers.clearPin();
          router.replace('/login');
        }
      }
    } catch (error) {
      console.error('PIN authentication error:', error);
      Alert.alert('Error', 'Failed to authenticate. Please try again.');
    }
  };

  const handleBiometricAuth = async () => {
    try {
      setIsLoading(true);
      const success = await AuthHelpers.authenticateWithBiometrics();
      if (success) {
        router.replace('/transaction/RecentTransactions');
      }
    } catch (error) {
      console.error('Biometric auth failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2B6CB0" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>PaySii</Text>
      
      <View style={styles.content}>
        <Text style={styles.title}>Enter PIN</Text>
        <Text style={styles.subtitle}>Enter your 4-digit PIN to login</Text>
        
        {/* PIN Dots */}
        <View style={styles.pinContainer}>
          {pin.map((digit, index) => (
            <View key={index} style={[styles.pinDot, digit !== '' && styles.filledPinDot]}>
              {digit !== '' && <View style={styles.pinDotInner} />}
            </View>
          ))}
        </View>
        
        {/* Biometric Button */}
        {biometricAvailable && (
          <TouchableOpacity 
            style={styles.biometricButton}
            onPress={handleBiometricAuth}
            disabled={isLoading}
          >
            <MaterialIcons name="fingerprint" size={32} color="#2B6CB0" />
            <Text style={styles.biometricText}>Use Biometrics</Text>
          </TouchableOpacity>
        )}
        
        {/* Forgot PIN Link */}
        <TouchableOpacity 
          onPress={() => router.push('/ResetPinScreen')} 
          style={styles.forgotButton}
        >
          <Text style={styles.forgotText}>
            Forgot PIN? <Text style={styles.resetLink}>Reset it now</Text>
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Keypad */}
      <View style={styles.keypad}>
        <View style={styles.keypadRow}>
          {['1', '2', '3'].map((num) => (
            <KeypadButton key={num} value={num} onPress={handleKeyPress} />
          ))}
        </View>
        
        <View style={styles.keypadRow}>
          {['4', '5', '6'].map((num) => (
            <KeypadButton key={num} value={num} onPress={handleKeyPress} />
          ))}
        </View>
        
        <View style={styles.keypadRow}>
          {['7', '8', '9'].map((num) => (
            <KeypadButton key={num} value={num} onPress={handleKeyPress} />
          ))}
        </View>
        
        <View style={styles.keypadRow}>
          <KeypadButton 
            value="backspace" 
            onPress={handleKeyPress} 
            icon="backspace" 
          />
          <KeypadButton value="0" onPress={handleKeyPress} />
          <KeypadButton 
            value="submit" 
            onPress={() => pin.every(d => d) && handleSubmit(pin.join(''))} 
            icon="check" 
            primary 
            disabled={!pin.every(d => d)}
          />
        </View>
      </View>
    </View>
  );
}

const KeypadButton = ({ 
  value, 
  onPress, 
  disabled = false, 
  primary = false,
  icon
}: {
  value: string;
  onPress: (value: string) => void;
  disabled?: boolean;
  primary?: boolean;
  icon?: string;
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.keypadButton,
        primary && styles.primaryButton,
        disabled && styles.disabledButton
      ]}
      onPress={() => !disabled && onPress(value)}
      disabled={disabled}
    >
      {icon ? (
        <MaterialIcons 
          name={icon} 
          size={24} 
          color={primary ? 'white' : '#2B6CB0'} 
        />
      ) : (
        <Text style={[
          styles.keypadText,
          primary && styles.primaryText,
          disabled && styles.disabledText
        ]}>
          {value}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    position: 'absolute',
    top: 50,
    right: 24,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2B6CB0',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
    gap: 20,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filledPinDot: {
    borderColor: '#2B6CB0',
  },
  pinDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2B6CB0',
  },
  biometricButton: {
    alignItems: 'center',
    marginBottom: 30,
  },
  biometricText: {
    color: '#2B6CB0',
    marginTop: 8,
  },
  forgotButton: {
    marginBottom: 40,
  },
  forgotText: {
    color: '#666',
  },
  resetLink: {
    color: '#2B6CB0',
    fontWeight: '600',
  },
  keypad: {
    marginBottom: 30,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  keypadButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  keypadText: {
    fontSize: 24,
    color: '#333',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#999',
  },
  primaryButton: {
    backgroundColor: '#2B6CB0',
  },
  primaryText: {
    color: 'white',
  },
});