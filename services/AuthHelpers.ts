import * as LocalAuthentication from 'expo-local-authentication';
import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from './apiClient';

const PIN_SERVICE = 'com.moodtracker.quick_login';
const QUICK_LOGIN_EMAIL_KEY = 'quick_login_email';

const getStoredPinCredentials = async () => {
  const credentials = await Keychain.getGenericPassword({ service: PIN_SERVICE });
  return credentials || null;
};

const resolveQuickLoginEmail = async (storedUsername?: string) => {
  if (storedUsername?.includes('@')) {
    return storedUsername.trim().toLowerCase();
  }

  const savedEmail = await AsyncStorage.getItem(QUICK_LOGIN_EMAIL_KEY);
  if (savedEmail) {
    return savedEmail.trim().toLowerCase();
  }

  const rawUser = await AsyncStorage.getItem('user');
  if (!rawUser) {
    return null;
  }

  try {
    const parsedUser = JSON.parse(rawUser);
    const email = parsedUser?.Email || parsedUser?.email || null;
    return email ? String(email).trim().toLowerCase() : null;
  } catch {
    return null;
  }
};

export const AuthHelpers = {
  enableQuickLogin: async (email: string, pin: string, currentPassword: string): Promise<boolean> => {
    try {
      await AuthService.setupPin(pin, currentPassword);

      const normalizedEmail = email.trim().toLowerCase();

      await Keychain.setGenericPassword(normalizedEmail, pin, {
        service: PIN_SERVICE,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      await AsyncStorage.setItem(QUICK_LOGIN_EMAIL_KEY, normalizedEmail);

      return true;
    } catch (error) {
      throw error;
    }
  },

  authenticateWithBiometrics: async (): Promise<boolean> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock your account',
        cancelLabel: 'Use PIN',
        disableDeviceFallback: false,
      });

      if (!result.success) {
        return false;
      }

      const credentials = await getStoredPinCredentials();
      if (!credentials || !credentials.username || !credentials.password) {
        return false;
      }

      const email = await resolveQuickLoginEmail(credentials.username);
      if (!email) {
        return false;
      }

      await AuthService.logInWithPin(email, credentials.password);
      return true;
    } catch {
      return false;
    }
  },

  authenticateWithPin: async (enteredPin: string): Promise<boolean> => {
    try {
      const credentials = await getStoredPinCredentials();
      if (!credentials || !credentials.username || !credentials.password) {
        return false;
      }

      if (credentials.password !== enteredPin) {
        return false;
      }

      const email = await resolveQuickLoginEmail(credentials.username);
      if (!email) {
        return false;
      }

      await AuthService.logInWithPin(email, enteredPin);
      return true;
    } catch {
      return false;
    }
  },

  verifyCredentialsForPinReset: async (email: string, password: string): Promise<string> => {
    try {
      const response = await AuthService.login(email, password);
      const user = response.user;
      const userId = user?.Id || user?.id;

      if (!userId) {
        throw new Error('User ID not found');
      }

      return userId;
    } catch {
      throw new Error('Invalid email or password');
    }
  },

  completePinReset: async (userId: string, newPin: string): Promise<void> => {
    try {
      await AuthService.resetPin(newPin);

      const credentials = await getStoredPinCredentials();
      if (credentials && credentials.username && credentials.password) {
        await Keychain.setGenericPassword(userId, newPin, {
          service: PIN_SERVICE,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });
      }
    } catch {
      throw new Error('Failed to update PIN');
    }
  },

  pinExists: async (): Promise<boolean> => {
    try {
      const credentials = await getStoredPinCredentials();
      return !!(credentials?.username && credentials?.password);
    } catch {
      return false;
    }
  },

  clearPin: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(QUICK_LOGIN_EMAIL_KEY);
      await Keychain.resetGenericPassword({ service: PIN_SERVICE });
    } catch (error) {
      throw error;
    }
  },

  isBiometricAvailable: async (): Promise<boolean> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch {
      return false;
    }
  },

  getBiometricLabel: async (): Promise<string> => {
    try {
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return 'Face ID';
      }

      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return 'Fingerprint';
      }

      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        return 'Biometrics';
      }

      return 'Biometrics';
    } catch {
      return 'Biometrics';
    }
  }
};

export default AuthHelpers;
