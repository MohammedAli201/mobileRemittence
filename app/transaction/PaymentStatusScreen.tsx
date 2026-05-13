import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  FintechPrimaryButton,
  FintechSecondaryButton,
  fintechColors,
  fintechSpacing,
} from "../../components/ui/fintech";
import { Screen, useResponsiveMetrics } from "../../components/ui/layout";

const getParamValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const formatPaymentMethod = (value?: string) => {
  const normalized = (value || "").trim().toLowerCase();

  if (!normalized) return "Visa";
  if (normalized === "visa") return "Visa";
  if (normalized === "mastercard") return "Mastercard";
  if (normalized === "card") return "Card";

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const colors = {
  page: fintechColors.background,
  headerStart: fintechColors.primaryStrong,
  headerEnd: fintechColors.primary,
  accent: fintechColors.success,
  accentSoft: fintechColors.successSoft,
  textStrong: fintechColors.text,
  textMuted: fintechColors.textMuted,
  card: fintechColors.surface,
  border: fintechColors.border,
  outline: fintechColors.primary,
  shadow: fintechColors.shadow,
  headerGlass: "rgba(255,255,255,0.12)",
  headerGlassBorder: "rgba(255,255,255,0.18)",
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function PaymentStatusScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isSmallPhone } = useResponsiveMetrics();

  const rawStatus = (getParamValue(params.status) || "success")
    .toLowerCase()
    .trim();
  const isFailure = rawStatus === "failure";
  const isSuccess = rawStatus === "success";
  const isPending = !isSuccess && !isFailure;
  const receiptReady =
    (getParamValue(params.receiptReady) || "true").toLowerCase() === "true" &&
    isSuccess;

  const statusTitle =
    getParamValue(params.title) ||
    (isFailure
      ? "Payment Failed!!"
      : isPending
        ? "Payment Under Process!!"
        : "Payment Successful");
  const statusMessage =
    getParamValue(params.message) ||
    (isFailure
      ? "We could not complete your payment."
      : isPending
        ? "Your payment is being processed."
        : "Your payment has been received successfully.");

  const showCardSuccessVisual =
    isPending &&
    statusTitle.toLowerCase().includes("card payment successful");

  const statusAccent = isFailure
    ? fintechColors.danger
    : showCardSuccessVisual
      ? fintechColors.success
      : isPending
      ? fintechColors.warning
      : fintechColors.success;
  const headerGradientColors = isFailure
    ? [fintechColors.danger, fintechColors.primaryStrong]
    : showCardSuccessVisual
      ? [colors.headerStart, colors.headerEnd]
      : isPending
      ? [fintechColors.warning, fintechColors.primaryStrong]
      : [colors.headerStart, colors.headerEnd];
  const statusIconName = isFailure
    ? "close"
    : showCardSuccessVisual
      ? "checkmark"
      : isPending
      ? "time-outline"
      : "checkmark";

  const orderNumber = getParamValue(params.orderNumber) || "AB4054FB";
  const amount = getParamValue(params.amount) || "201.00 NOK";
  const paymentMethod = formatPaymentMethod(
    getParamValue(params.paymentMethod),
  );
  const transactionId = getParamValue(params.transactionId);
  const sender = getParamValue(params.sender);
  const recipient = getParamValue(params.recipient);
  const createdAt = getParamValue(params.createdAt);

  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const pulseStyle = {
    transform: [
      {
        scale: pulseAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.06],
        }),
      },
    ],
    opacity: pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.7, 1],
    }),
  };

  const handleContinue = () => {
    router.replace("/transaction/RecentTransactions");
  };

  const handleViewReceipt = () => {
    if (transactionId && receiptReady) {
      router.push({
        pathname: "/transaction/ReceiptScreen",
        params: {
          transactionId,
          sender: sender || "Account holder",
          recipient: recipient || "Recipient",
          createdAt: createdAt || new Date().toISOString(),
          status: isSuccess ? "Success" : isFailure ? "Failure" : "Pending",
        },
      });
      return;
    }

    router.replace("/transaction/RecentTransactions");
  };

  return (
    <Screen contentStyle={styles.container}>
      <LinearGradient
        colors={headerGradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.brandWrap}>
            <View style={styles.logoMark}>
              <View style={styles.logoBar} />
              <View style={styles.logoDot} />
            </View>
            <Text style={styles.brandText}>JubaPay</Text>
          </View>
        </View>

        <Text style={styles.headerEyebrow}>PAYMENT STATUS</Text>
        <Text style={styles.headerTitle}>{statusTitle}</Text>
        <Text style={styles.headerSubtitle}>{statusMessage}</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.statusCard}>
          <View style={styles.statusTop}>
            <Animated.View style={[styles.iconHalo, pulseStyle]} />
            <View style={styles.iconShell}>
              <LinearGradient
                colors={["#EAFBF8", "#F8FFFE"]}
                style={styles.iconGradient}
              >
                <Ionicons
                  name={statusIconName}
                  size={30}
                  color={statusAccent}
                />
              </LinearGradient>
            </View>
          </View>

          <Text style={styles.statusTitle}>{statusTitle}</Text>
          <Text style={styles.statusSubtitle}>{statusMessage}</Text>
          <Text style={styles.helperText}>
            {receiptReady
              ? "You can view your receipt or continue."
              : "Continue to track the latest transfer status."}
          </Text>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <DetailRow label="Order Number" value={orderNumber} />
          <View style={styles.separator} />
          <DetailRow label="Amount" value={amount} />
          <View style={styles.separator} />
          <DetailRow label="Payment Method" value={paymentMethod} />
          <View style={styles.separator} />
          <DetailRow label="Status" value={isSuccess ? "Success" : isFailure ? "Failure" : "Pending"} />
        </View>

        <View style={[styles.actions, isSmallPhone && styles.actionsStack]}>
          {receiptReady ? (
            <FintechSecondaryButton
              label="View Receipt"
              onPress={handleViewReceipt}
              style={styles.secondaryButton}
              textStyle={styles.secondaryButtonText}
            />
          ) : null}
          <FintechPrimaryButton
            label="Continue"
            onPress={handleContinue}
            style={styles.primaryButton}
            textStyle={styles.primaryButtonText}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.page,
    paddingTop: 0,
    paddingHorizontal: 0,
    gap: 0,
  },
  header: {
    paddingHorizontal: fintechSpacing.lg,
    paddingTop: fintechSpacing.md,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.headerGlass,
    borderWidth: 1,
    borderColor: colors.headerGlassBorder,
  },
  brandWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoMark: {
    width: 18,
    height: 18,
    position: "relative",
    justifyContent: "flex-end",
  },
  logoBar: {
    position: "absolute",
    left: 2,
    bottom: 0,
    width: 8,
    height: 16,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    transform: [{ rotate: "14deg" }],
  },
  logoDot: {
    position: "absolute",
    right: 0,
    top: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  brandText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  headerEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
    color: "rgba(255,255,255,0.78)",
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.88)",
    maxWidth: '100%',
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: fintechSpacing.lg,
    paddingTop: fintechSpacing.md,
    paddingBottom: fintechSpacing.md,
    gap: fintechSpacing.md,
  },
  statusCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    paddingHorizontal: fintechSpacing.lg,
    paddingVertical: fintechSpacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  statusTop: {
    width: 76,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: fintechSpacing.sm,
  },
  iconHalo: {
    position: "absolute",
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.accentSoft,
  },
  iconShell: {
    width: 58,
    height: 58,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  iconGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: fintechColors.surfaceStrong,
  },
  statusTitle: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "900",
    color: colors.textStrong,
    textAlign: "center",
    marginBottom: 6,
  },
  statusSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 6,
  },
  helperText: {
    fontSize: 13,
    lineHeight: 18,
    color: fintechColors.primaryStrong,
    textAlign: "center",
    fontWeight: "600",
  },
  detailsCard: {
    backgroundColor: fintechColors.surface,
    borderRadius: 22,
    paddingHorizontal: fintechSpacing.lg,
    paddingVertical: fintechSpacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.textStrong,
    marginBottom: fintechSpacing.xs,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: fintechSpacing.md,
    paddingVertical: 12,
  },
  detailLabel: {
    flex: 1,
    fontSize: 13,
    color: colors.textMuted,
  },
  detailValue: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: "800",
    color: colors.textStrong,
    textAlign: "right",
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  actions: {
    flexDirection: "row",
    gap: fintechSpacing.sm,
    paddingTop: 2,
  },
  actionsStack: {
    flexDirection: 'column',
  },
  secondaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 18,
    backgroundColor: fintechColors.surface,
    borderWidth: 1.5,
    borderColor: colors.outline,
  },
  secondaryButtonText: {
    color: colors.outline,
    fontWeight: "800",
  },
  primaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 18,
    backgroundColor: fintechColors.primary,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});
