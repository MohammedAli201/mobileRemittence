import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  Vibration,
  View,
} from "react-native";
import { KeyboardScrollScreen } from "../../components/ui/layout";
import {
  FintechPinDots,
  FintechScreenHeader,
  fintechColors,
  fintechSpacing,
} from "../../components/ui/fintech";
import { useUser } from "../../context/UserContext";
import { AuthHelpers } from "../../services/AuthHelpers";

const MAX_ATTEMPTS = 5;

export default function PinEntryScreen() {
  const [pin, setPin] = useState<string[]>(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState("Biometrics");
  const inputRef = useRef<TextInput>(null);
  const router = useRouter();
  const { user } = useUser();
  const { height } = useWindowDimensions();
  const isCompact = height < 700;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const [pinExists, bioAvailable, label] = await Promise.all([
          AuthHelpers.pinExists(),
          AuthHelpers.isBiometricAvailable(),
          AuthHelpers.getBiometricLabel(),
        ]);
        setBiometricAvailable(bioAvailable);
        setBiometricLabel(label);
        if (!pinExists) {
          router.replace("/(auth)/login");
          return;
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const fullName = useMemo(() => {
    const first = user?.firstName || user?.FirstName || "";
    const last = user?.lastName || user?.LastName || "";
    const emailName = user?.email ? String(user.email).split("@")[0] : "";
    return (
      [first, last].filter(Boolean).join(" ") || emailName || "Account User"
    );
  }, [user]);

  const phone = useMemo(
    () =>
      user?.phoneNumber ||
      user?.PhoneNumber ||
      user?.phone ||
      user?.Phone ||
      "",
    [user],
  );
  const initials = useMemo(
    () =>
      fullName
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "AU",
    [fullName],
  );

  const resetPinState = () => setPin(["", "", "", ""]);

  const handleSubmit = async (pinCode: string) => {
    setIsLoading(true);
    try {
      const valid = await AuthHelpers.authenticateWithPin(pinCode);
      if (valid) {
        router.replace("/transaction/RecentTransactions");
        return;
      }
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      resetPinState();
      Vibration.vibrate(100);
      if (nextAttempts >= MAX_ATTEMPTS) {
        await AuthHelpers.clearPin();
        Alert.alert(
          "Too many attempts",
          "Quick login was removed for security. Sign in again with your password.",
          [{ text: "OK", onPress: () => router.replace("/(auth)/login") }],
        );
        return;
      }
      Alert.alert(
        "Incorrect PIN",
        `${MAX_ATTEMPTS - nextAttempts} attempts remaining.`,
      );
    } catch {
      Alert.alert("Error", "Failed to verify PIN. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinInput = (value: string) => {
    if (isLoading) return;
    const cleaned = value.replace(/\D/g, "").slice(0, 4);
    const padded = cleaned.padEnd(4, "");
    const next = padded.split("");
    setPin(next);
    if (cleaned.length === 4) {
      handleSubmit(cleaned);
    }
  };

  const handleBiometricAuth = async () => {
    setIsLoading(true);
    const success = await AuthHelpers.authenticateWithBiometrics();
    setIsLoading(false);
    if (success) {
      router.replace("/transaction/RecentTransactions");
      return;
    }
    Alert.alert(
      "Authentication failed",
      `We could not unlock with ${biometricLabel}.`,
    );
  };

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  if (isLoading && !pin.some(Boolean)) {
    return (
      <KeyboardScrollScreen contentStyle={styles.loadingScreen}>
        <ActivityIndicator size="large" color={fintechColors.primary} />
        <Text style={styles.loadingBrand}>JubaPay</Text>
      </KeyboardScrollScreen>
    );
  }

  return (
    <KeyboardScrollScreen contentStyle={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/(auth)/login")}
          activeOpacity={0.85}
        >
          <Ionicons name="chevron-back" size={18} color={fintechColors.text} />
        </TouchableOpacity>

        <View style={[styles.content, isCompact && styles.contentCompact]}>
          <View style={styles.topSection}>
            <FintechScreenHeader
              eyebrow="Welcome back"
              title="Enter your PIN"
              subtitle="Use your PIN to continue."
              titleStyle={[styles.headerTitle, isCompact && styles.headerTitleCompact]}
              subtitleStyle={[styles.headerSubtitle, isCompact && styles.headerSubtitleCompact]}
            />

            <View style={[styles.identityRow, isCompact && styles.identityRowCompact]}>
              <View style={[styles.avatar, isCompact && styles.avatarCompact]}>
                <Text style={[styles.avatarText, isCompact && styles.avatarTextCompact]}>{initials}</Text>
              </View>
              <View style={styles.identityText}>
                <Text style={[styles.nameText, isCompact && styles.nameTextCompact]} numberOfLines={1}>
                  {fullName}
                </Text>
                {phone ? <Text style={styles.phoneText}>{phone}</Text> : null}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.pinArea, isCompact && styles.pinAreaCompact]}
              activeOpacity={0.9}
              onPress={() => inputRef.current?.focus()}
            >
              <Text style={styles.pinTitle}>PIN</Text>
              <FintechPinDots value={pin} style={styles.pinRow} />
              <View style={styles.linkRow}>
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/ResetPinScreen")}
                  activeOpacity={0.8}
                >
                  <Text style={styles.forgotText}>Recover PIN</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.replace("/(auth)/login")}
                  activeOpacity={0.8}
                >
                  <Text style={styles.altText}>Use another account</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>

          {biometricAvailable ? (
            <TouchableOpacity
              style={styles.bioGhost}
              onPress={handleBiometricAuth}
              activeOpacity={0.88}
            >
              <Ionicons
                name="finger-print-outline"
                size={18}
                color={fintechColors.primary}
              />
              <Text style={styles.bioGhostText}>Use {biometricLabel}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <TextInput
          ref={inputRef}
          value={pin.join("")}
          onChangeText={handlePinInput}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoFocus
          style={styles.hiddenInput}
        />
    </KeyboardScrollScreen>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingBrand: {
    marginTop: fintechSpacing.sm,
    fontSize: 18,
    fontWeight: "800",
    color: fintechColors.primary,
    letterSpacing: 0.2,
  },
  container: {
    flexGrow: 1,
    paddingTop: fintechSpacing.sm,
    paddingBottom: fintechSpacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: fintechSpacing.sm,
  },
  contentCompact: {
    paddingBottom: fintechSpacing.xs,
  },
  topSection: {
    gap: fintechSpacing.md,
  },
  identityRowCompact: {
    padding: fintechSpacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: fintechColors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: fintechColors.surface,
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: fintechSpacing.md,
    padding: fintechSpacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: fintechColors.border,
    backgroundColor: fintechColors.surface,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: fintechColors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarCompact: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarText: { fontSize: 16, fontWeight: "800", color: fintechColors.primary },
  avatarTextCompact: {
    fontSize: 14,
  },
  identityText: { flex: 1, gap: fintechSpacing.xxs },
  nameText: { fontSize: 14, fontWeight: "700", color: fintechColors.text },
  nameTextCompact: {
    fontSize: 13,
  },
  phoneText: { fontSize: 11, color: fintechColors.textMuted },
  pinArea: { alignItems: "center", gap: fintechSpacing.sm },
  pinAreaCompact: {
    gap: fintechSpacing.xs,
  },
  pinTitle: { fontSize: 12, fontWeight: "700", color: fintechColors.textMuted, letterSpacing: 0.6 },
  pinRow: { justifyContent: "center" },
  linkRow: { flexDirection: "row", gap: fintechSpacing.lg },
  forgotText: { fontSize: 13, color: fintechColors.primary, fontWeight: "700" },
  altText: { fontSize: 13, color: fintechColors.textMuted, fontWeight: "600" },
  headerTitle: { fontSize: 20, lineHeight: 24 },
  headerTitleCompact: { fontSize: 18, lineHeight: 22 },
  headerSubtitle: { fontSize: 13, lineHeight: 18, color: fintechColors.textMuted },
  headerSubtitleCompact: { fontSize: 12, lineHeight: 16 },
  keypad: { gap: fintechSpacing.sm, paddingBottom: fintechSpacing.xs },
  keypadCompact: {
    gap: fintechSpacing.sm,
  },
  bioGhost: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: fintechSpacing.sm,
    paddingHorizontal: fintechSpacing.md,
    paddingVertical: fintechSpacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: fintechColors.border,
    backgroundColor: fintechColors.surface,
  },
  bioGhostText: {
    fontSize: 13,
    fontWeight: "700",
    color: fintechColors.primary,
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    height: 0,
    width: 0,
  },
});
