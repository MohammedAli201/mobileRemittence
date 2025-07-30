import * as LocalAuthentication from 'expo-local-authentication';
import * as Keychain from 'react-native-keychain';
import { AuthService } from './apiClient';


const PIN_SERVICE = 'com.your.app.pin_service';

export const AuthHelpers = {
  /**
   * Enables quick login by saving PIN securely and optionally setting up biometrics
   */
  enableQuickLogin: async (userId: string, pin: string): Promise<boolean> => {
    try {
      // First verify the PIN with backend
      const { token, user } = await AuthService.setupPin(pin);
      
      // Save PIN securely if backend verification succeeds
      await Keychain.setGenericPassword(userId, pin, {
        service: PIN_SERVICE,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });

      // Check for biometric capability
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        await LocalAuthentication.authenticateAsync({
          promptMessage: 'Enable biometric login',
        });
      }

      return true;
    } catch (error) {
      console.error('Error enabling quick login:', error);
      throw error;
    }
  },

  /**
   * Authenticates using biometrics (Face ID/Touch ID)
   */
  authenticateWithBiometrics: async (): Promise<boolean> => {
    try {
      // Check biometric capability
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        throw new Error('Biometrics not available');
      }

      // Authenticate with biometrics
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate with biometrics',
      });

      if (!result.success) return false;

      // Get stored credentials
      const credentials = await Keychain.getGenericPassword({ service: PIN_SERVICE });
      if (!credentials) {
        throw new Error('No saved credentials found');
      }

      // Authenticate with backend using stored PIN
      await AuthService.logInWithPin(credentials.username, credentials.password);
      return true;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      throw error;
    }
  },

  /**
   * Authenticates using PIN code
   */
  authenticateWithPin: async (enteredPin: string): Promise<boolean> => {
    try {
      const credentials = await Keychain.getGenericPassword({ service: PIN_SERVICE });
      if (!credentials) {
        throw new Error('No saved credentials found');
      }

      // Verify PIN matches stored PIN
      if (credentials.password !== enteredPin) {
        throw new Error('Incorrect PIN');
      }

      // Authenticate with backend
      await AuthService.logInWithPin(credentials.username, enteredPin);
      return true;
    } catch (error) {
      console.error('PIN authentication failed:', error);
      throw error;
    }
  },

  /**
   * Verify credentials using existing login flow
   * Returns userId if successful
   */
  verifyCredentialsForPinReset: async (email: string, password: string): Promise<string> => {
    try {
      // Use existing login method but don't persist the token
      const response = await AuthService.login(email, password);
      
      // Return the user ID for PIN reset purposes
      return response.user.id;
    } catch (error) {
      console.error('PIN reset verification failed:', error);
      throw new Error('Invalid email or password');
    }
  },

  /**
   * Complete PIN reset after verification
   */
  completePinReset: async (userId: string, newPin: string): Promise<void> => {
    try {
      // 1. Save new PIN to backend
      await AuthService.resetPin(newPin)
       
      
      // 2. Update local PIN storage if exists
      try {
        const credentials = await Keychain.getGenericPassword({ service: PIN_SERVICE });
        if (credentials) {
          await Keychain.setGenericPassword(
            userId, // use the verified userId
            newPin,
            { 
              service: PIN_SERVICE,
              accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY
            }
          );
        }
      } catch (keychainError) {
        console.warn('Local PIN update failed (proceeding anyway):', keychainError);
      }
    } catch (error) {
      console.error('PIN reset completion failed:', error);
      throw new Error('Failed to update PIN');
    }
  },

  /**
   * Checks if PIN credentials exist
   */
  pinExists: async (): Promise<boolean> => {
    try {
      const credentials = await Keychain.getGenericPassword({ service: PIN_SERVICE });
      return !!(credentials?.username && credentials?.password);
    } catch (error) {
      console.error('Error checking PIN existence:', error);
      return false;
    }
  },

  /**
   * Clears saved PIN credentials
   */
  clearPin: async (): Promise<void> => {
    try {
      await Keychain.resetGenericPassword({ service: PIN_SERVICE });
    } catch (error) {
      console.error('Error clearing stored PIN:', error);
      throw error;
    }
  },

  /**
   * Checks if biometric authentication is available
   */
  isBiometricAvailable: async (): Promise<boolean> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }
};

export default AuthHelpers;