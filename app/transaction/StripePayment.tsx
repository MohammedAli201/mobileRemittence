import { Ionicons } from "@expo/vector-icons";
import { CardField, useStripe } from "@stripe/stripe-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  FintechPrimaryButton,
  fintechColors,
  fintechRadius,
  fintechSpacing,
} from "../../components/ui/fintech";
import { FixedFooterScreen } from "../../components/ui/layout";
import { useUser } from "../../context/UserContext";
import { getTransferDraft } from "../../services/transferDraft";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong. Please try again.";

const getRecipientName = (firstName: string, lastName: string) =>
  [firstName, lastName].filter(Boolean).join(" ").trim();

const formatPaymentMethod = (value?: string) => {
  const normalized = (value || "").trim().toLowerCase();
  if (!normalized) return "Card";
  if (normalized === "visa") return "Visa";
  if (normalized === "mastercard") return "Mastercard";
  if (normalized === "card") return "Card";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const cardFieldStyle = {
  backgroundColor: "#FFFFFF",
  textColor: "#0D1B2A",
  placeholderColor: "#8FA5BD",
  borderRadius: 0,
  fontSize: 16,
};

export default function StripePaymentScreen() {
  const router = useRouter();
  const { confirmPayment } = useStripe();
  const { user } = useUser();
  const params = useLocalSearchParams<{
    clientSecret?: string;
    paymentIntentId?: string;
    transferId?: string;
    amount?: string;
    recipient?: string;
  }>();
  const transactionData = getTransferDraft();

  const [cardholderName, setCardholderName] = useState(
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "",
  );
  const [cardComplete, setCardComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  const orderNumber = useMemo(
    () => (params.transferId || "").slice(0, 8).toUpperCase() || "PENDING",
    [params.transferId],
  );
  const recipientName =
    params.recipient ||
    getRecipientName(transactionData.recipient.firstName, transactionData.recipient.lastName) ||
    "Recipient";
  const formattedTotal =
    params.amount ||
    `${Number(transactionData.totalAmount || 0).toFixed(2)} ${transactionData.sendCurrency || "NOK"}`;

  const handlePay = async () => {
    if (!params.clientSecret) {
      Alert.alert("Payment unavailable", "Client secret is missing.");
      return;
    }
    if (!cardComplete) {
      Alert.alert("Card details required", "Enter complete card details.");
      return;
    }

    setLoading(true);
    try {
      const { error, paymentIntent } = await confirmPayment(params.clientSecret, {
        paymentMethodType: "Card",
        paymentMethodData: {
          billingDetails: {
            name: cardholderName || getRecipientName(user?.firstName || "", user?.lastName || ""),
            email: user?.email || undefined,
          },
        },
      });

      if (error) throw new Error(error.message);

      const paymentIntentStatus = String(paymentIntent?.status || "").toLowerCase();
      if (!paymentIntent || paymentIntentStatus !== "succeeded") {
        throw new Error(
          `Card payment is not completed yet (status: ${paymentIntent?.status || "unknown"}).`,
        );
      }

      const nextPaymentIntentId =
        paymentIntent?.id || params.paymentIntentId || params.clientSecret.split("_secret_")[0];

      const senderName =
        [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
        user?.email ||
        "Account holder";
      const resolvedRecipientName =
        params.recipient ||
        getRecipientName(transactionData.recipient.firstName, transactionData.recipient.lastName);
      const createdAt = new Date().toISOString();

      router.replace({
        pathname: "/transaction/PaymentStatusScreen",
        params: {
          transactionId: params.transferId || nextPaymentIntentId,
          sender: senderName,
          recipient: resolvedRecipientName,
          createdAt,
          status: "pending",
          title: "Card Payment Successful",
          message: "Card payment succeeded. Transfer is being finalized.",
          orderNumber,
          amount:
            params.amount ||
            `${transactionData.totalAmount.toFixed(2)} ${transactionData.sendCurrency}`,
          paymentMethod: formatPaymentMethod(transactionData.paymentMethod),
          receiptReady: "false",
        },
      });
    } catch (error) {
      router.replace({
        pathname: "/transaction/PaymentStatusScreen",
        params: {
          status: "failure",
          title: "Payment Failed",
          message: getErrorMessage(error),
          orderNumber,
          amount:
            params.amount ||
            `${transactionData.totalAmount.toFixed(2)} ${transactionData.sendCurrency}`,
          paymentMethod: formatPaymentMethod(transactionData.paymentMethod),
          clientSecret: params.clientSecret || "",
          paymentIntentId: params.paymentIntentId || "",
          transferId: params.transferId || "",
          recipient:
            params.recipient ||
            getRecipientName(
              transactionData.recipient.firstName,
              transactionData.recipient.lastName,
            ),
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FixedFooterScreen
      contentStyle={styles.container}
      footer={
        loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={fintechColors.primary} />
            <Text style={styles.loadingText}>Processing payment…</Text>
          </View>
        ) : (
          <>
            <FintechPrimaryButton
              label={`Pay ${formattedTotal}`.trim()}
              onPress={handlePay}
              disabled={!cardComplete || !params.clientSecret}
              style={styles.payButton}
              textStyle={styles.payButtonText}
            />
            <View style={styles.hintRow}>
              <Ionicons name="shield-checkmark-outline" size={12} color={fintechColors.textSubtle} />
              <Text style={styles.hintText}>Encrypted by Stripe · Never stored</Text>
            </View>
          </>
        )
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={20} color={fintechColors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="lock-closed" size={12} color={fintechColors.primaryStrong} />
          <Text style={styles.headerTitle}>Secure payment</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Amount block */}
      <View style={styles.amountBlock}>
        <Text style={styles.amountEyebrow}>Total to pay</Text>
        <Text style={styles.amountValue}>{formattedTotal}</Text>
        <Text style={styles.amountTo} numberOfLines={1}>
          To {recipientName}
        </Text>
      </View>

      {/* Unified card input */}
      <View style={styles.inputCard}>
        <Text style={styles.inputCardLabel}>Card details</Text>

        <View style={styles.inputField}>
          <CardField
            postalCodeEnabled={false}
            placeholders={{ number: "•••• •••• •••• ••••" }}
            cardStyle={cardFieldStyle}
            style={styles.cardField}
            onCardChange={(details) => setCardComplete(Boolean(details.complete))}
          />
        </View>

        <View style={styles.inputDivider} />

        <View style={styles.inputField}>
          <TextInput
            value={cardholderName}
            onChangeText={setCardholderName}
            placeholder="Name on card"
            placeholderTextColor="#8FA5BD"
            style={styles.nameInput}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>
      </View>

      <Text style={styles.refText}>Reference: {orderNumber}</Text>
    </FixedFooterScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: fintechSpacing.xs,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: fintechSpacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: fintechColors.text,
  },
  headerSpacer: { width: 40 },

  amountBlock: {
    alignItems: "center",
    paddingBottom: fintechSpacing.xl,
    gap: 4,
  },
  amountEyebrow: {
    fontSize: 12,
    fontWeight: "600",
    color: fintechColors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  amountValue: {
    fontSize: 40,
    fontWeight: "800",
    color: fintechColors.text,
    letterSpacing: -0.5,
  },
  amountTo: {
    fontSize: 14,
    color: fintechColors.textMuted,
    fontWeight: "500",
  },

  inputCard: {
    backgroundColor: fintechColors.surface,
    borderRadius: fintechRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: fintechColors.border,
    overflow: "hidden",
    shadowColor: "#10243E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  inputCardLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: fintechColors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    paddingHorizontal: fintechSpacing.md,
    paddingTop: fintechSpacing.md,
    paddingBottom: fintechSpacing.xs,
  },
  inputField: {
    paddingHorizontal: fintechSpacing.md,
    paddingVertical: fintechSpacing.xs,
    backgroundColor: fintechColors.surface,
    minHeight: 52,
    justifyContent: "center",
  },
  cardField: {
    width: "100%",
    height: 46,
  },
  inputDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: fintechColors.border,
    marginHorizontal: fintechSpacing.md,
  },
  nameInput: {
    fontSize: 15,
    fontWeight: "500",
    color: fintechColors.text,
    paddingVertical: 6,
  },

  refText: {
    fontSize: 11,
    color: fintechColors.textMuted,
    textAlign: "center",
    marginTop: fintechSpacing.xs,
  },

  payButton: {
    minHeight: 54,
    borderRadius: 18,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: "800",
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingTop: 2,
  },
  hintText: {
    fontSize: 11,
    color: fintechColors.textMuted,
  },
  loadingWrap: {
    alignItems: "center",
    paddingVertical: fintechSpacing.md,
    gap: fintechSpacing.sm,
  },
  loadingText: {
    fontSize: 14,
    color: fintechColors.textMuted,
  },
});
