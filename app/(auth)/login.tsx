import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { useUser } from '../../context/UserContext';
import AuthHelpers from '../../services/AuthHelpers';

export default function Login() {
  const router = useRouter();
  const { login, isLoading: authLoading } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureEntry, setSecureEntry] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const pinExists = await AuthHelpers.pinExists();
        if (pinExists) {
          router.replace('/(auth)/pin-entry');
          return;
        }
      } catch {
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, [router]);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      Alert.alert('Missing details', 'Enter your email and password to continue.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      Alert.alert('Invalid email', 'Enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const signedInUser = await login(trimmedEmail, password);

      if (signedInUser.stepUpVerificationRequired || !signedInUser.isTrustedDevice) {
        router.replace('/(auth)/enable-quick-login');
      } else {
        router.replace('/transaction/RecentTransactions');
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Sign in failed. Please try again.';
      Alert.alert('Sign in failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth || authLoading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={fintechColors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.container}>
          <FintechScreenHeader
            eyebrow="Secure Sign In"
            title="Welcome back"
            subtitle="Fast sign in, clear costs, secure transfers."
            right={<FintechStatusPill icon="shield-checkmark-outline" label="Protected" tone="info" />}
          />

          <FintechHeroCard
            title="Access your account"
            subtitle="Use your email and password. Quick login can be enabled right after sign-in."
          >
            <View style={styles.form}>
              <FintechTextField
                label="Email"
                icon="mail-outline"
                placeholder="you@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
              <FintechTextField
                label="Password"
                icon="lock-closed-outline"
                placeholder="Enter password"
                secureTextEntry={secureEntry}
                value={password}
                onChangeText={setPassword}
                right={(
                  <TouchableOpacity onPress={() => setSecureEntry((prev) => !prev)}>
                    <Ionicons
                      name={secureEntry ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                )}
              />
            </View>
          </FintechHeroCard>

          <FintechInlineMessage
            text="You will review the exchange rate, fees, and recipient amount before any payment is taken."
          />

          <View style={styles.footer}>
            <FintechPrimaryButton onPress={handleLogin} loading={loading} disabled={loading}>
              <Text style={styles.primaryText}>Sign in</Text>
            </FintechPrimaryButton>

            <TouchableOpacity style={styles.registerRow} onPress={() => router.push('/(auth)/register')} activeOpacity={0.8}>
              <Text style={styles.registerLabel}>New here?</Text>
              <Text style={styles.registerLink}>Create account</Text>
            </TouchableOpacity>

            <View style={styles.trustBlock}>
              <FintechTrustRow
                icon="finger-print-outline"
                title="Quick unlock available"
                text="PIN and biometrics can be added after your first secure sign-in."
              />
            </View>
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
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: fintechColors.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 16,
  },
  form: {
    gap: 14,
  },
  footer: {
    gap: 16,
  },
  trustBlock: {
    paddingHorizontal: 4,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  registerLabel: {
    fontSize: 14,
    color: fintechColors.textMuted,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: fintechColors.primary,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
