import * as SecureStore from 'expo-secure-store';

const FINGERPRINT_KEY = 'device_fingerprint_v1';

export const persistFingerprint = async (fingerprint: string) => {
  await SecureStore.setItemAsync(FINGERPRINT_KEY, fingerprint);
};

export const getStoredFingerprint = async () => {
  return await SecureStore.getItemAsync(FINGERPRINT_KEY);
};

export const compareFingerprint = async () => {
  const current = await generateFingerprint();
  const stored = await getStoredFingerprint();
  return {
    isMatch: current === stored,
    currentFingerprint: current
  };
};