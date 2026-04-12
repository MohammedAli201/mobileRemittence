import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import {
  FintechInfoRow,
  FintechPrimaryButton,
  FintechScreenHeader,
  FintechSectionBlock,
  FintechSectionHeader,
  FintechStatusPill,
  fintechColors,
} from '../../components/ui/fintech';
import { useUser } from '../../context/UserContext';
import { AuthHelpers } from '../../services/AuthHelpers';

const BIOMETRIC_PREF_KEY = 'biometric_preference_enabled';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useUser();
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    const loadSecurityState = async () => {
      const [available, savedValue] = await Promise.all([
        AuthHelpers.isBiometricAvailable(),
        AsyncStorage.getItem(BIOMETRIC_PREF_KEY),
      ]);
      setBiometricAvailable(available);
      setBiometricEnabled(savedValue === 'true');
    };

    loadSecurityState();
  }, []);

  const handleBiometricToggle = async (value: boolean) => {
    setBiometricEnabled(value);
    await AsyncStorage.setItem(BIOMETRIC_PREF_KEY, String(value));
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FintechScreenHeader
          eyebrow="Profile"
          title="Account and security"
          subtitle="Keep access, verification, and support in one place."
          right={(
            <FintechStatusPill
              icon="shield-checkmark-outline"
              label={user?.isKycVerified ? 'Verified' : 'KYC pending'}
              tone={user?.isKycVerified ? 'success' : 'warning'}
            />
          )}
        />

        <FintechSectionBlock>
          <FintechSectionHeader title="Account" />
          <FintechInfoRow label="Name" value={user?.firstName || 'Account holder'} />
          <FintechInfoRow label="Email" value={user?.email || 'No email'} />
        </FintechSectionBlock>

        <FintechSectionBlock>
          <FintechSectionHeader title="Security" />
          <FintechInfoRow label="Change PIN" value="Open reset flow" />
          <TouchableOpacity style={styles.securityRow} onPress={() => router.push('/(auth)/ResetPinScreen')} activeOpacity={0.85}>
            <Text style={styles.securityAction}>Change PIN</Text>
          </TouchableOpacity>
          <View style={styles.toggleRow}>
            <View style={styles.toggleCopy}>
              <Text style={styles.toggleTitle}>Biometric unlock</Text>
              <Text style={styles.toggleText}>
                {biometricAvailable ? 'Use device biometrics for quick access.' : 'Biometric unlock is unavailable on this device.'}
              </Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
              disabled={!biometricAvailable}
              trackColor={{ false: '#D9E2EC', true: '#9EC1E6' }}
              thumbColor={biometricEnabled ? fintechColors.primary : '#FFFFFF'}
            />
          </View>
          <TouchableOpacity style={styles.securityRow} activeOpacity={0.85}>
            <Text style={styles.securityAction}>Change password</Text>
          </TouchableOpacity>
        </FintechSectionBlock>

        <FintechSectionBlock>
          <FintechSectionHeader title="Support" />
          <TouchableOpacity style={styles.supportRow} activeOpacity={0.85}>
            <Text style={styles.supportAction}>Help center</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.supportRow} activeOpacity={0.85}>
            <Text style={styles.supportAction}>Contact support</Text>
          </TouchableOpacity>
        </FintechSectionBlock>

        <FintechPrimaryButton style={styles.logoutButton} label="Log out" onPress={handleLogout} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: fintechColors.background,
  },
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  securityRow: {
    paddingVertical: 4,
  },
  securityAction: {
    fontSize: 14,
    fontWeight: '600',
    color: fintechColors.primary,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  toggleCopy: {
    flex: 1,
    gap: 2,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: fintechColors.text,
  },
  toggleText: {
    fontSize: 13,
    color: fintechColors.textMuted,
  },
  supportRow: {
    paddingVertical: 4,
  },
  supportAction: {
    fontSize: 14,
    fontWeight: '600',
    color: fintechColors.text,
  },
  logoutButton: {
    marginTop: 'auto',
  },
});
