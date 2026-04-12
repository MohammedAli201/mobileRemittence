import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  FintechHeroCard,
  FintechInlineMessage,
  FintechPrimaryButton,
  FintechScreenHeader,
  FintechStatusPill,
  FintechTextField,
  FintechTrustRow,
  fintechColors,
} from '../../components/ui/fintech';
import { AuthService } from '../../services/apiClient';

const emailRegex = /^\S+@\S+\.\S+$/;

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const emailError = useMemo(() => {
    if (!email) return '';
    return emailRegex.test(email.trim()) ? '' : 'Enter a valid email address.';
  }, [email]);

  const passwordError = useMemo(() => {
    if (!password) return '';
    return password.length >= 8 ? '' : 'Use at least 8 characters.';
  }, [password]);

  const isValid =
    fullName.trim().length >= 2 &&
    emailRegex.test(email.trim()) &&
    password.length >= 8;

  const handleRegister = async () => {
    if (!isValid) {
      Alert.alert('Check your details', 'Enter your full name, valid email, and a stronger password.');
      return;
    }

    setLoading(true);
    try {
      await AuthService.register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });

      Alert.alert(
        'Account created',
        'Your account is ready. Sign in to continue with secure transfers.',
        [{ text: 'Continue', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (error: any) {
      Alert.alert('Could not create account', error?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.container}>
          <FintechScreenHeader
            eyebrow="Create Account"
            title="Start sending in minutes"
            subtitle="Minimal setup, secure onboarding, clear costs."
            right={<FintechStatusPill icon="shield-checkmark-outline" label="Regulated" tone="success" />}
          />

          <FintechHeroCard
            title="Open your account"
            subtitle="Create your profile in under 30 seconds."
          >
            <View style={styles.form}>
              <FintechTextField
                label="Full name"
                icon="person-outline"
                placeholder="Jane Doe"
                value={fullName}
                onChangeText={setFullName}
              />
              <FintechTextField
                label="Email"
                icon="mail-outline"
                placeholder="you@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                error={emailError || undefined}
              />
              <FintechTextField
                label="Password"
                icon="lock-closed-outline"
                placeholder="At least 8 characters"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                error={passwordError || undefined}
              />
            </View>
          </FintechHeroCard>

          <FintechInlineMessage text="Secure and regulated transfers. Fees and exchange rates are shown before payment." />

          <View style={styles.footer}>
            <FintechPrimaryButton onPress={handleRegister} loading={loading} disabled={!isValid || loading}>
              Create account
            </FintechPrimaryButton>

            <TouchableOpacity style={styles.loginRow} onPress={() => router.replace('/(auth)/login')} activeOpacity={0.8}>
              <Text style={styles.loginLabel}>Already have an account?</Text>
              <Text style={styles.loginLink}>Sign in</Text>
            </TouchableOpacity>

            <FintechTrustRow
              icon="lock-closed-outline"
              title="Secure & regulated transfers"
              text="Account access, payment review, and transfer confirmation stay protected end to end."
            />
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
    gap: 16,
  },
  form: {
    gap: 14,
  },
  footer: {
    gap: 14,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  loginLabel: {
    fontSize: 14,
    color: fintechColors.textMuted,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: fintechColors.primary,
  },
});
