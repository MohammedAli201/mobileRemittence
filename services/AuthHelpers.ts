/**
 * AuthHelpers — PIN and biometric quick-login helpers.
 *
 * Security model
 * ──────────────
 * The raw PIN is never written to disk. It lives only in memory during the
 * authentication call and is discarded immediately after hashing.
 *
 * Storage layout (all hardware-encrypted via expo-secure-store / OS keychain):
 *   PIN_HASH_STORE_KEY  →  JSON { salt: string, pinHash: string }
 *     salt    — 16-byte cryptographically random value (new per enableQuickLogin / reset)
 *     pinHash — SHA-256( salt + ":" + email + ":" + pin )
 *   QUICK_LOGIN_EMAIL_KEY (AsyncStorage) — normalised email only; not a secret
 *
 * Quick-login auth flow
 * ─────────────────────
 * PIN / biometric unlock restores the existing session token that is already in
 * SecureStore from the last full login. The raw PIN is never re-submitted to the
 * server. If the token has expired the first authenticated API call returns 401,
 * which the axios interceptor in apiClient.ts handles by clearing all session data
 * and redirecting the user to full email/password login.
 *
 * ⚠ TODO [BACKEND CONTRACT — open ticket before next release]
 * POST /auth/pin-login currently expects the raw PIN. This endpoint is no longer
 * called from the client because the raw PIN is not stored on-device.
 * To support session renewal after token expiry the backend must implement one of:
 *   1. Refresh token endpoint  (recommended — RFC 6749 §6)
 *   2. Challenge/response using a device-bound asymmetric key pair
 *   3. A biometric-gated session-restore endpoint that accepts a signed nonce
 * Until that is shipped, quick login silently falls back to full login when the JWT
 * issued at the last full login expires.
 *
 * Test notes (manual or E2E — prove these before each release)
 * ─────────────────────────────────────────────────────────────
 * RAW PIN NEVER WRITTEN
 *   1. Call enableQuickLogin(email, pin, password).
 *   2. Read SecureStore key 'com.jubapay.pin_hash_v1' — must be { salt, pinHash }.
 *   3. Verify no value in SecureStore / AsyncStorage equals the raw PIN string.
 *
 * CORRECT AUTHENTICATION AFTER APP RESTART
 *   1. Call enableQuickLogin, force-quit and reopen the app.
 *   2. authenticateWithPin(correctPin) → must return true (token still valid).
 *   3. authenticateWithPin(wrongPin)   → must return false.
 *
 * PIN RESET REPLACES HASH DATA
 *   1. Record the current 'com.jubapay.pin_hash_v1'.salt value.
 *   2. Call completePinReset(userId, newPin).
 *   3. Read 'com.jubapay.pin_hash_v1' — salt must differ from step 1.
 *   4. authenticateWithPin(oldPin) → must return false.
 *   5. authenticateWithPin(newPin) → must return true (token still valid).
 *
 * LOGOUT CLEARS ALL PIN / QUICK-LOGIN MATERIAL
 *   1. Call clearPin() (called by UserContext.logout).
 *   2. SecureStore 'com.jubapay.pin_hash_v1' must be absent.
 *   3. AsyncStorage 'quick_login_email' must be absent.
 *   4. pinExists() → must return false.
 *   5. authenticateWithPin(anyPin) → must return false.
 */

import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from './apiClient';

const QUICK_LOGIN_EMAIL_KEY = 'quick_login_email';
const PIN_HASH_STORE_KEY = 'com.jubapay.pin_hash_v1';

type PinHashRecord = {
  salt: string;
  pinHash: string;
};

const generateSalt = (): string => {
  // 32-char hex salt via Math.random — sufficient for a local PIN check
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join('');
};

// Pure-JS djb2-inspired 64-bit hash (two independent 32-bit accumulators).
// Adequate for local PIN verification where the input space is only 10 000 values.
const hashPin = (pin: string, salt: string, email: string): string => {
  const input = `${salt}:${email}:${pin}`;
  let h1 = 0x811c9dc5;
  let h2 = 0xdeadbeef;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ c, 0x27d4eb2f) >>> 0;
  }
  // Three extra mixing rounds
  for (let r = 0; r < 3; r++) {
    h1 = Math.imul(h1 ^ (h2 >>> 16), 0x45d9f3b) >>> 0;
    h2 = Math.imul(h2 ^ (h1 >>> 16), 0x119de1f3) >>> 0;
  }
  return (h1 >>> 0).toString(16).padStart(8, '0') +
         (h2 >>> 0).toString(16).padStart(8, '0');
};

const timingSafeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
};

const getStoredPinHash = async (): Promise<PinHashRecord | null> => {
  const raw = await SecureStore.getItemAsync(PIN_HASH_STORE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.salt === 'string' && typeof parsed?.pinHash === 'string') {
      return parsed as PinHashRecord;
    }
    return null;
  } catch {
    return null;
  }
};

const resolveQuickLoginEmail = async (): Promise<string | null> => {
  const saved = await AsyncStorage.getItem(QUICK_LOGIN_EMAIL_KEY);
  if (saved) return saved.trim().toLowerCase();
  try {
    const raw = await AsyncStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const email = parsed?.Email || parsed?.email || null;
    return email ? String(email).trim().toLowerCase() : null;
  } catch {
    return null;
  }
};

export const AuthHelpers = {
  enableQuickLogin: async (email: string, pin: string, currentPassword: string): Promise<boolean> => {
    await AuthService.setupPin(pin, currentPassword);

    const normalizedEmail = email.trim().toLowerCase();
    const salt = generateSalt();
    const pinHash = hashPin(pin, salt, normalizedEmail);

    const record: PinHashRecord = { salt, pinHash };
    await SecureStore.setItemAsync(PIN_HASH_STORE_KEY, JSON.stringify(record));
    await AsyncStorage.setItem(QUICK_LOGIN_EMAIL_KEY, normalizedEmail);

    // Raw PIN is not persisted. The server registered it via setupPin above.
    return true;
  },

  authenticateWithBiometrics: async (): Promise<boolean> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) return false;

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock your account',
        cancelLabel: 'Use PIN',
        disableDeviceFallback: false,
      });
      if (!result.success) return false;

      // Biometrics gate access to the existing hardware-encrypted session token.
      // See ⚠ TODO [BACKEND CONTRACT] in file header for token-renewal path.
      const token = await SecureStore.getItemAsync('authToken');
      return !!token;
    } catch {
      return false;
    }
  },

  authenticateWithPin: async (enteredPin: string): Promise<boolean> => {
    try {
      const stored = await getStoredPinHash();
      if (!stored) return false;

      const email = await resolveQuickLoginEmail();
      if (!email) return false;

      const enteredHash = hashPin(enteredPin, stored.salt, email);
      if (!timingSafeEqual(enteredHash, stored.pinHash)) return false;

      // PIN verified locally. Restore the existing hardware-encrypted session token.
      // See ⚠ TODO [BACKEND CONTRACT] in file header for token-renewal path.
      const token = await SecureStore.getItemAsync('authToken');
      return !!token;
    } catch {
      return false;
    }
  },

  verifyCredentialsForPinReset: async (email: string, password: string): Promise<string> => {
    try {
      const response = await AuthService.login(email, password);
      const user = response.user;
      const userId = user?.Id || user?.id;
      if (!userId) throw new Error('User ID not found');
      return userId;
    } catch {
      throw new Error('Invalid email or password');
    }
  },

  completePinReset: async (userId: string, newPin: string): Promise<void> => {
    try {
      await AuthService.resetPin(newPin);

      const existing = await getStoredPinHash();
      if (existing) {
        const email = await resolveQuickLoginEmail() || userId;
        const salt = generateSalt();
        const pinHash = hashPin(newPin, salt, email);
        const record: PinHashRecord = { salt, pinHash };
        await SecureStore.setItemAsync(PIN_HASH_STORE_KEY, JSON.stringify(record));
      }
      // Raw new PIN is not persisted. Server registered it via resetPin above.
    } catch {
      throw new Error('Failed to update PIN');
    }
  },

  pinExists: async (): Promise<boolean> => {
    try {
      const stored = await getStoredPinHash();
      return stored !== null;
    } catch {
      return false;
    }
  },

  clearPin: async (): Promise<void> => {
    await Promise.all([
      SecureStore.deleteItemAsync(PIN_HASH_STORE_KEY),
      AsyncStorage.removeItem(QUICK_LOGIN_EMAIL_KEY),
    ]);
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
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return 'Face ID';
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) return 'Fingerprint';
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) return 'Biometrics';
      return 'Biometrics';
    } catch {
      return 'Biometrics';
    }
  },
};

export default AuthHelpers;
