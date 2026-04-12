import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import {
  FintechHeroCard,
  FintechInlineMessage,
  FintechPrimaryButton,
  FintechScreenHeader,
  FintechSecondaryButton,
  FintechStatusPill,
  FintechTextField,
  fintechColors,
} from '../../components/ui/fintech';
import { useUser } from '../../context/UserContext';
import { AuthHelpers } from '../../services/AuthHelpers';

export default function ResetPinScreen() {
  const [password, setPassword] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  const handleReset = async () => {
    if (!password.trim()) {
      Alert.alert('Missing password', 'Enter your password to continue.');
      return;
    }

    if (newPin.length !== 4 || confirmPin.length !== 4) {
      Alert.alert('Invalid PIN', 'PIN must be exactly 4 digits.');
      return;
    }

    if (newPin !== confirmPin) {
      Alert.alert('PIN mismatch', 'PINs do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const userId = await AuthHelpers.verifyCredentialsForPinReset(user?.email || '', password);
      await AuthHelpers.completePinReset(userId, newPin);
      Alert.alert('PIN updated', 'Your quick login PIN has been changed.', [
        { text: 'Continue', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Reset failed', error.message || 'Failed to reset PIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await AuthHelpers.clearPin();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.container}>
          <FintechScreenHeader
            eyebrow="Reset PIN"
            title="Create a new PIN"
            subtitle="Verify with your password first."
            right={<FintechStatusPill icon="shield-checkmark-outline" label="Secure reset" tone="info" />}
          />

          <FintechHeroCard
            title="Keep access protected"
            subtitle="A new PIN replaces the existing quick login code on this device."
          >
            <View style={styles.form}>
              <FintechTextField
                label="Password"
                icon="lock-closed-outline"
                placeholder="Current password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <FintechTextField
                label="New PIN"
                icon="keypad-outline"
                placeholder="4 digits"
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
                value={newPin}
                onChangeText={(value) => setNewPin(value.replace(/\D/g, ''))}
              />
              <FintechTextField
                label="Confirm PIN"
                icon="shield-outline"
                placeholder="Repeat PIN"
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
                value={confirmPin}
                onChangeText={(value) => setConfirmPin(value.replace(/\D/g, ''))}
              />
            </View>
          </FintechHeroCard>

          <FintechInlineMessage
            text="If you no longer remember your password, sign out and log back in before creating a new PIN."
          />

          <View style={styles.actions}>
            <FintechPrimaryButton onPress={handleReset} loading={isLoading} disabled={isLoading}>
              Save new PIN
            </FintechPrimaryButton>
            <FintechSecondaryButton label="Sign out instead" onPress={handleLogout} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: fintechColors.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
    gap: 18,
  },
  form: {
    gap: 14,
  },
  actions: {
    gap: 10,
  },
});
