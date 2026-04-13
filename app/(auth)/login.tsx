import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardScrollScreen, Screen } from "../../components/ui/layout";
import {
  FintechHeroCard,
  FintechInlineMessage,
  FintechPrimaryButton,
  FintechScreenHeader,
  FintechStatusPill,
  FintechTextField,
  FintechTrustRow,
  fintechColors,
  fintechSpacing,
} from "../../components/ui/fintech";
import { useUser } from "../../context/UserContext";
import AuthHelpers from "../../services/AuthHelpers";

export default function Login() {
  const router = useRouter();
  const { login, isLoading: authLoading } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [secureEntry, setSecureEntry] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const pinExists = await AuthHelpers.pinExists();
        if (pinExists) {
          router.replace("/(auth)/pin-entry");
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
      Alert.alert(
        "Missing details",
        "Enter your email and password to continue.",
      );
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      Alert.alert("Invalid email", "Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const signedInUser = await login(trimmedEmail, password);

      if (
        signedInUser.stepUpVerificationRequired ||
        !signedInUser.isTrustedDevice
      ) {
        router.replace("/(auth)/enable-quick-login");
      } else {
        router.replace("/transaction/RecentTransactions");
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Sign in failed. Please try again.";
      Alert.alert("Sign in failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth || authLoading) {
    return (
      <Screen contentStyle={styles.loadingScreen}>
        <ActivityIndicator size="large" color={fintechColors.primary} />
        <Text style={styles.loadingBrand}>JubaPay</Text>
      </Screen>
    );
  }

  return (
    <KeyboardScrollScreen contentStyle={styles.scrollContainer}>
          <FintechScreenHeader
            eyebrow="Secure sign in"
            title="Welcome back"
            subtitle="Sign in to continue your transfers."
            right={
              <FintechStatusPill
                icon="shield-checkmark-outline"
                label="Protected"
                tone="info"
              />
            }
            titleStyle={styles.headerTitle}
            subtitleStyle={styles.headerSubtitle}
          />

          <FintechHeroCard
            title="Access your account"
            subtitle="Use your email and password. Enable quick login after sign-in."
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
                right={
                  <TouchableOpacity
                    onPress={() => setSecureEntry((prev) => !prev)}
                  >
                    <Ionicons
                      name={secureEntry ? "eye-off-outline" : "eye-outline"}
                      size={18}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                }
              />
            </View>
          </FintechHeroCard>

          <FintechInlineMessage text="You will review pricing and recipient details before payment." />

          <View style={styles.footer}>
            <FintechPrimaryButton
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
            >
              <Text style={styles.primaryText}>Sign in</Text>
            </FintechPrimaryButton>

            <TouchableOpacity
              style={styles.registerRow}
              onPress={() => router.push("/(auth)/register")}
              activeOpacity={0.8}
            >
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
    </KeyboardScrollScreen>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    justifyContent: "center",
    alignItems: "center",
    gap: 0,
  },
  loadingBrand: {
    marginTop: fintechSpacing.sm,
    fontSize: 18,
    fontWeight: "800",
    color: fintechColors.primary,
    letterSpacing: 0.2,
  },
  scrollContainer: {
    justifyContent: "space-between",
    gap: fintechSpacing.lg,
  },
  headerTitle: {
    fontSize: 20,
    lineHeight: 24,
  },
  headerSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  form: {
    gap: fintechSpacing.md,
  },
  footer: {
    gap: fintechSpacing.lg,
  },
  trustBlock: {
    paddingHorizontal: fintechSpacing.xxs,
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: fintechSpacing.xs,
  },
  registerLabel: {
    fontSize: 14,
    color: fintechColors.textMuted,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: "700",
    color: fintechColors.primary,
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
