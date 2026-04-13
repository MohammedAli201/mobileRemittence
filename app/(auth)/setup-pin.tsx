import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { KeyboardScrollScreen } from "../../components/ui/layout";
import {
  FintechHeroCard,
  FintechInlineMessage,
  FintechPrimaryButton,
  FintechScreenHeader,
  FintechSecondaryButton,
  FintechStatusPill,
  FintechTextField,
  fintechColors,
  fintechSpacing,
} from "../../components/ui/fintech";
import { useUser } from "../../context/UserContext";
import { AuthHelpers } from "../../services/AuthHelpers";

const PIN_LENGTH = 4;

export default function SetupPinScreen() {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const router = useRouter();
  const { preferred } = useLocalSearchParams<{ preferred?: string }>();
  const { user, userRegistrationData } = useUser();

  const selectedMethod = useMemo(
    () => (preferred === "biometric" ? "biometric" : "pin"),
    [preferred],
  );

  const pinsMatch =
    pin.length === PIN_LENGTH &&
    confirmPin.length === PIN_LENGTH &&
    pin === confirmPin;
  const hasMismatch = confirmPin.length === PIN_LENGTH && pin !== confirmPin;

  useEffect(() => {
    if (user?.id && user?.email) {
      setIsReady(true);
      return;
    }

    Alert.alert(
      "Session required",
      "Sign in again before setting up quick login.",
    );
    router.replace("/(auth)/login");
  }, [router, user?.email, user?.id]);

  const handleSubmit = async () => {
    if (!isReady || !user?.email) return;

    if (!userRegistrationData?.password?.trim()) {
      Alert.alert(
        "Session required",
        "Your login password is missing. Please sign in again.",
        [{ text: "OK", onPress: () => router.replace("/(auth)/login") }],
      );
      return;
    }

    if (!/^\d{4}$/.test(pin) || !/^\d{4}$/.test(confirmPin)) {
      Alert.alert("Invalid PIN", "PIN must be exactly 4 digits.");
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert("PIN mismatch", "Both PIN entries must match.");
      return;
    }

    setIsLoading(true);
    try {
      await AuthHelpers.enableQuickLogin(
        user.email,
        pin,
        userRegistrationData.password,
      );
      Alert.alert(
        selectedMethod === "biometric" ? "Quick login enabled" : "PIN enabled",
        selectedMethod === "biometric"
          ? "Biometric unlock is ready. Your PIN remains as backup."
          : "Your PIN is ready for future sign-ins.",
        [
          {
            text: "Continue",
            onPress: () => router.replace("/transaction/RecentTransactions"),
          },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        "Setup failed",
        error?.message || "Could not save your PIN. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isReady) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={fintechColors.primary} />
        <Text style={styles.loadingBrand}>JubaPay</Text>
      </View>
    );
  }

  return (
    <KeyboardScrollScreen contentStyle={styles.scrollContainer}>
          <FintechScreenHeader
            eyebrow="Set PIN"
            title="Create your quick login PIN"
            subtitle="Keep it short, private, and easy to remember."
            right={
              <FintechStatusPill
                icon="lock-closed-outline"
                label="4 digits"
                tone="info"
              />
            }
            titleStyle={styles.headerTitle}
            subtitleStyle={styles.headerSubtitle}
          />

          <FintechHeroCard
            title={
              selectedMethod === "biometric"
                ? "PIN backup required"
                : "PIN required"
            }
            subtitle={
              selectedMethod === "biometric"
                ? "Biometric unlock still keeps a PIN backup for recovery."
                : "Use this PIN the next time you open the app."
            }
          >
            <View style={styles.form}>
              <FintechTextField
                label="New PIN"
                icon="keypad-outline"
                placeholder="4 digits"
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
                value={pin}
                onChangeText={(value) => setPin(value.replace(/\D/g, ""))}
              />
              <FintechTextField
                label="Confirm PIN"
                icon="shield-outline"
                placeholder="Repeat PIN"
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
                value={confirmPin}
                onChangeText={(value) =>
                  setConfirmPin(value.replace(/\D/g, ""))
                }
                error={hasMismatch ? "PIN entries do not match." : undefined}
              />
            </View>
          </FintechHeroCard>

          <FintechInlineMessage
            tone={pinsMatch ? "success" : "info"}
            text={
              pinsMatch
                ? "Your PIN is ready to save."
                : "Choose a 4-digit PIN and enter it twice."
            }
          />

          <View style={styles.actions}>
            <FintechPrimaryButton
              onPress={handleSubmit}
              loading={isLoading}
              disabled={!pinsMatch || isLoading}
            >
              Save quick login
            </FintechPrimaryButton>
            <FintechSecondaryButton
              label="Back"
              onPress={() => router.replace("/(auth)/enable-quick-login")}
            />
          </View>
    </KeyboardScrollScreen>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: fintechColors.background,
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
  actions: {
    gap: fintechSpacing.sm,
  },
});
