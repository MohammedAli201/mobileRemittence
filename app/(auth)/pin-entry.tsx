import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '../../context/UserContext';
import { AuthHelpers } from '../../services/AuthHelpers';

const MAX_ATTEMPTS = 5;

const keypadRows = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

export default function PinEntryScreen() {
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState('Biometrics');
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useUser();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const [pinExists, bioAvailable, label] = await Promise.all([
          AuthHelpers.pinExists(),
          AuthHelpers.isBiometricAvailable(),
          AuthHelpers.getBiometricLabel(),
        ]);

        setBiometricAvailable(bioAvailable);
        setBiometricLabel(label);

        if (!pinExists) {
          router.replace('/(auth)/login');
          return;
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const resetPinState = () => setPin(['', '', '', '']);

  const fullName = useMemo(() => {
    const first = user?.firstName || user?.FirstName || '';
    const last = user?.lastName || user?.LastName || '';
    const emailName = user?.email ? String(user.email).split('@')[0] : '';
    return [first, last].filter(Boolean).join(' ') || emailName || 'Account User';
  }, [user]);

  const phone = useMemo(() => {
    return user?.phoneNumber || user?.PhoneNumber || user?.phone || user?.Phone || '';
  }, [user]);

  const initials = useMemo(() => {
    const letters = fullName
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return letters || 'AU';
  }, [fullName]);

  const handleSubmit = async (pinCode: string) => {
    setIsLoading(true);
    try {
      const valid = await AuthHelpers.authenticateWithPin(pinCode);

      if (valid) {
        router.replace('/transaction/RecentTransactions');
        return;
      }

      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      resetPinState();
      Vibration.vibrate(100);

      if (nextAttempts >= MAX_ATTEMPTS) {
        await AuthHelpers.clearPin();
        Alert.alert(
          'Too many attempts',
          'Quick login was removed for security. Sign in again with your password.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
        );
        return;
      }

      Alert.alert('Incorrect PIN', `${MAX_ATTEMPTS - nextAttempts} attempts remaining.`);
    } catch (error) {
      Alert.alert('Error', 'Failed to verify PIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (value: string) => {
    if (isLoading) return;

    if (value === 'backspace') {
      const firstEmptyIndex = pin.findIndex((digit) => digit === '');
      const indexToClear = firstEmptyIndex === -1 ? 3 : firstEmptyIndex - 1;

      if (indexToClear >= 0) {
        const next = [...pin];
        next[indexToClear] = '';
        setPin(next);
      }
      return;
    }

    if (!/^\d$/.test(value)) return;

    const firstEmptyIndex = pin.findIndex((digit) => digit === '');
    if (firstEmptyIndex === -1) return;

    const next = [...pin];
    next[firstEmptyIndex] = value;
    setPin(next);

    if (firstEmptyIndex === 3) {
      handleSubmit(next.join(''));
    }
  };

  const handleBiometricAuth = async () => {
    setIsLoading(true);
    const success = await AuthHelpers.authenticateWithBiometrics();
    setIsLoading(false);

    if (success) {
      router.replace('/transaction/RecentTransactions');
      return;
    }

    Alert.alert('Authentication failed', `We could not unlock with ${biometricLabel}.`);
  };

  if (isLoading && !pin.some(Boolean)) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#F4DF78" />
        <Text style={styles.loadingBrand}>JubaPay</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { paddingTop: insets.top + 8, paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/(auth)/login')}
            activeOpacity={0.85}
          >
            <Ionicons name="chevron-back" size={18} color="#B8BCC8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tapChip}
            onPress={biometricAvailable ? handleBiometricAuth : undefined}
            disabled={!biometricAvailable}
            activeOpacity={0.85}
          >
            <Ionicons name="radio-outline" size={12} color="#F4DF78" />
            <Text style={styles.tapChipText}>JubaPay</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileBlock}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.nameText}>{fullName}</Text>
          {phone ? <Text style={styles.phoneText}>{phone}</Text> : null}
        </View>

        <View style={styles.codeBlock}>
          <Text style={styles.codeTitle}>Enter your code</Text>

          <View style={styles.pinRow}>
            {pin.map((digit, index) => (
              <View key={index} style={[styles.pinBox, digit && styles.pinBoxFilled]}>
                {digit ? <View style={styles.pinDot} /> : null}
              </View>
            ))}
          </View>

          <TouchableOpacity onPress={() => router.push('/(auth)/ResetPinScreen')} activeOpacity={0.8}>
            <Text style={styles.forgotText}>Forgot code?</Text>
          </TouchableOpacity>
        </View>

        {biometricAvailable ? (
          <TouchableOpacity style={styles.bioButton} onPress={handleBiometricAuth} activeOpacity={0.88}>
            <Text style={styles.bioButtonText}>Use biometrics</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.keypad}>
          {keypadRows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.keypadRow}>
              {row.map((key) => (
                <TouchableOpacity
                  key={key}
                  style={styles.keypadButton}
                  onPress={() => handleKeyPress(key)}
                  activeOpacity={0.82}
                >
                  <Text style={styles.keypadText}>{key}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          <View style={styles.keypadRow}>
            {biometricAvailable ? (
              <TouchableOpacity style={styles.keypadButton} onPress={handleBiometricAuth} activeOpacity={0.82}>
                <Ionicons name="finger-print-outline" size={22} color="#F8F6F0" />
              </TouchableOpacity>
            ) : (
              <View style={[styles.keypadButton, styles.keypadButtonMuted]}>
                <Ionicons name="lock-closed-outline" size={20} color="#8F897B" />
              </View>
            )}
            <TouchableOpacity style={styles.keypadButton} onPress={() => handleKeyPress('0')} activeOpacity={0.82}>
              <Text style={styles.keypadText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keypadButton} onPress={() => handleKeyPress('backspace')} activeOpacity={0.82}>
              <Ionicons name="backspace-outline" size={22} color="#F8F6F0" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2F2B23',
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2F2B23',
  },
  loadingBrand: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: '800',
    color: '#F4DF78',
    letterSpacing: 0.2,
  },
  container: {
    flex: 1,
    backgroundColor: '#2F2B23',
    paddingHorizontal: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#4B453A',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3A362B',
  },
  tapChip: {
    minHeight: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#5C5443',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#3A362B',
  },
  tapChipText: {
    fontSize: 12,
    color: '#F4DF78',
    fontWeight: '600',
  },
  profileBlock: {
    alignItems: 'center',
    marginTop: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F0FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2F2B23',
  },
  nameText: {
    marginTop: 10,
    fontSize: 18,
    color: '#F8F6F0',
    fontWeight: '700',
  },
  phoneText: {
    marginTop: 6,
    fontSize: 13,
    color: '#C9C1B2',
  },
  codeBlock: {
    alignItems: 'center',
    marginTop: 18,
  },
  codeTitle: {
    fontSize: 14,
    color: '#C9C1B2',
    fontWeight: '600',
  },
  pinRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  pinBox: {
    width: 44,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#3A362B',
    borderWidth: 1,
    borderColor: '#5C5443',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinBoxFilled: {
    borderColor: '#F4DF78',
    backgroundColor: '#4A4334',
  },
  pinDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F4DF78',
  },
  forgotText: {
    marginTop: 12,
    fontSize: 12,
    color: '#F4DF78',
    textDecorationLine: 'underline',
  },
  bioButton: {
    alignSelf: 'center',
    marginTop: 16,
    minHeight: 44,
    borderRadius: 22,
    paddingHorizontal: 24,
    backgroundColor: '#F4DF78',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F4DF78',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  bioButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2F2B23',
  },
  keypad: {
    marginTop: 'auto',
    paddingBottom: 2,
    gap: 8,
  },
  keypadRow: {
    flexDirection: 'row',
    gap: 12,
  },
  keypadButton: {
    flex: 1,
    height: 48,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3D392F',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#4F493C',
  },
  keypadButtonMuted: {
    backgroundColor: '#363227',
  },
  keypadText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#F8F6F0',
  },
});
