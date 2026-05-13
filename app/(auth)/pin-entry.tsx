import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  Vibration,
  View,
} from "react-native";
import { KeyboardScrollScreen } from "../../components/ui/layout";
import {
  fintechColors,
  fintechSpacing,
} from "../../components/ui/fintech";
import { useUser } from "../../context/UserContext";
import { AuthHelpers } from "../../services/AuthHelpers";

const MAX_ATTEMPTS = 5;
const PIN_LENGTH = 4;
const KEYPAD_ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "backspace"],
] as const;
const AUTH_COPY = {
  title: "Enter your code",
  reset: "Forgot code?",
};

export default function PinEntryScreen() {
  const [pin, setPin] = useState<string[]>(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const router = useRouter();
  const { user } = useUser();
  const { height } = useWindowDimensions();
  const isCompact = height < 740;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const pinExists = await AuthHelpers.pinExists();
        if (!pinExists) {
          router.replace("/(auth)/login");
          return;
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    };
    void checkAuth();
  }, [router]);

  const fullName = useMemo(() => {
    const first = user?.firstName || user?.FirstName || "";
    const last = user?.lastName || user?.LastName || "";
    const emailName = user?.email ? String(user.email).split("@")[0] : "";
    return [first, last].filter(Boolean).join(" ") || emailName || "Account User";
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

  const maskedIdentity = phone || user?.email || "Secure device login";

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
        `${MAX_ATTEMPTS - nextAttempts} app PIN attempts remaining.`,
      );
    } catch {
      Alert.alert("Error", "Failed to verify your app PIN. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinInput = (value: string) => {
    if (isLoading) return;
    const cleaned = value.replace(/\D/g, "").slice(0, PIN_LENGTH);
    const next = Array.from({ length: PIN_LENGTH }, (_, index) => cleaned[index] || "");
    setPin(next);
    if (cleaned.length === PIN_LENGTH) {
      void handleSubmit(cleaned);
    }
  };

  const appendDigit = (digit: string) => {
    if (isLoading) return;
    const current = pin.join("");
    if (current.length >= PIN_LENGTH) return;
    handlePinInput(`${current}${digit}`);
  };

  const removeDigit = () => {
    if (isLoading) return;
    const current = pin.join("");
    handlePinInput(current.slice(0, -1));
  };

  if (isLoading && !pin.some(Boolean)) {
    return (
      <KeyboardScrollScreen contentStyle={styles.loadingScreen}>
        <View style={styles.loadingOrb}>
          <ActivityIndicator size="small" color={fintechColors.surface} />
        </View>
        <Text style={styles.loadingBrand}>JubaPay</Text>
        <Text style={styles.loadingText}>Preparing secure sign-in</Text>
      </KeyboardScrollScreen>
    );
  }

  return (
    <KeyboardScrollScreen contentStyle={styles.container}>
      <View style={styles.chromeRow} />

      <View style={[styles.content, isCompact && styles.contentCompact]}>
        <View style={styles.topCluster}>
          <TouchableOpacity
            style={[styles.identityCard, isCompact && styles.identityCardKeyboard]}
            activeOpacity={0.92}
            onPress={() => {}}
          >
            <View style={styles.identityAvatar}>
              <Text style={styles.identityAvatarText}>{initials}</Text>
            </View>
            <View style={styles.identityCopy}>
              <Text style={styles.identityName} numberOfLines={1}>
                {fullName}
              </Text>
              <Text style={styles.identityMeta} numberOfLines={1}>
                {maskedIdentity}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={[styles.pinPanel, isCompact && styles.pinPanelKeyboard]}>
            <Text style={[styles.title, styles.codeTitle, isCompact && styles.titleCompact]}>
              {AUTH_COPY.title}
            </Text>
            <View style={styles.pinGrid}>
              {pin.map((digit, index) => {
                const isFilled = Boolean(digit);
                const isActive = !isFilled && index === Math.min(pin.filter(Boolean).length, PIN_LENGTH - 1);
                return (
                  <View
                    key={index}
                    style={[
                      styles.pinBox,
                      isCompact && styles.pinBoxCompact,
                      isFilled && styles.pinBoxFilled,
                      isActive && styles.pinBoxActive,
                    ]}
                  >
                    {isFilled ? <View style={styles.pinDot} /> : null}
                  </View>
                );
              })}
            </View>
          </View>

          <View style={[styles.helperRow, isCompact && styles.helperRowKeyboard]}>
            <TouchableOpacity
              style={styles.helperAction}
              onPress={() => router.push("/(auth)/ResetPinScreen")}
              activeOpacity={0.82}
            >
              <Text style={styles.helperActionText}>{AUTH_COPY.reset}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.keypad}>
          {KEYPAD_ROWS.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.keypadRow}>
              {row.map((key, keyIndex) => {
                if (!key) {
                  return <View key={`empty-${rowIndex}-${keyIndex}`} style={styles.keypadSpacer} />;
                }

                if (key === "backspace") {
                  return (
                    <TouchableOpacity
                      key={key}
                      style={styles.keypadKey}
                      onPress={removeDigit}
                      activeOpacity={0.75}
                    >
                      <Ionicons name="backspace-outline" size={22} color={fintechColors.textMuted} />
                    </TouchableOpacity>
                  );
                }

                return (
                  <TouchableOpacity
                    key={key}
                    style={styles.keypadKey}
                    onPress={() => appendDigit(key)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.keypadKeyText}>{key}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </KeyboardScrollScreen>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingOrb: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: fintechColors.primaryStrong,
    shadowColor: fintechColors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 4,
  },
  loadingBrand: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: "800",
    color: fintechColors.primaryStrong,
    letterSpacing: 0.2,
  },
  loadingText: {
    marginTop: 6,
    fontSize: 12,
    color: fintechColors.textMuted,
  },
  container: {
    flexGrow: 1,
    paddingTop: fintechSpacing.xs,
    paddingBottom: fintechSpacing.md,
    justifyContent: "space-between",
    backgroundColor: fintechColors.surface,
  },
  chromeRow: {
    minHeight: 12,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  contentCompact: {
    paddingBottom: 8,
  },
  topCluster: {
    alignItems: "center",
    gap: 18,
    paddingTop: 42,
  },
  title: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "800",
    color: fintechColors.text,
    textAlign: "center",
  },
  codeTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "500",
    color: fintechColors.textSubtle,
  },
  titleCompact: {
    fontSize: 14,
    lineHeight: 18,
  },
  identityCard: {
    alignItems: "center",
    gap: 10,
    paddingHorizontal: fintechSpacing.sm,
    paddingVertical: 0,
    backgroundColor: "transparent",
  },
  identityCardKeyboard: {
    paddingVertical: 0,
  },
  identityAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFF1E7",
    alignItems: "center",
    justifyContent: "center",
  },
  identityAvatarText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#D97706",
  },
  identityCopy: {
    alignItems: "center",
    gap: 3,
  },
  identityName: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "500",
    color: fintechColors.text,
    textAlign: "center",
  },
  identityMeta: {
    fontSize: 14,
    lineHeight: 16,
    color: fintechColors.textMuted,
    textAlign: "center",
  },
  pinPanel: {
    alignItems: "center",
    gap: 12,
    paddingHorizontal: fintechSpacing.sm,
    paddingVertical: fintechSpacing.xs,
    backgroundColor: "transparent",
  },
  pinPanelKeyboard: {
    paddingVertical: 0,
    gap: fintechSpacing.xs,
  },
  pinGrid: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  pinBox: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: fintechColors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  pinBoxCompact: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  pinBoxActive: {
    backgroundColor: fintechColors.primarySoft,
    borderWidth: 2,
    borderColor: "#6D4CFF",
  },
  pinBoxFilled: {
    backgroundColor: "#6D4CFF",
  },
  pinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  helperRow: {
    justifyContent: "center",
    marginTop: -2,
  },
  helperRowKeyboard: {
    marginTop: -6,
  },
  helperAction: {
    minHeight: 24,
    backgroundColor: "transparent",
    paddingHorizontal: 4,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  helperActionText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6D4CFF",
  },
  keypad: {
    marginTop: -22,
    marginBottom: 34,
    paddingBottom: 6,
    gap: 16,
    alignItems: "stretch",
  },
  keypadRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 22,
  },
  keypadKey: {
    width: 74,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  keypadSpacer: {
    width: 74,
    height: 54,
  },
  keypadKeyText: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "500",
    color: fintechColors.text,
  },
});
