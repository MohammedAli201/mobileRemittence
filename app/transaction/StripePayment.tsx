import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { CardField, useStripe } from "@stripe/stripe-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FintechPrimaryButton, fintechColors, fintechRadius, fintechSpacing } from "../../components/ui/fintech";
import { KeyboardScrollScreen } from "../../components/ui/layout";
import { useUser } from "../../context/UserContext";
import { TransactionService } from "../../services/apiClient";
import {
  createTransferRecipientPayload,
  normalizeCountryCode,
  TransferService,
} from "../../services/remittance";
import { getTransferDraft } from "../../services/transferDraft";

const deliveryMethodMap: Record<string, string> = {
  MobileMoney: "wallet",
  BankTransfer: "bank",
  CashCollection: "cash",
};

const countryCodeMap: Record<string, string> = {
  Norway: "NO",
  Somalia: "SO",
  Kenya: "KE",
  Ethiopia: "ET",
  Uganda: "UG",
  Tanzania: "TZ",
  NO: "NO",
  SO: "SO",
  KE: "KE",
  ET: "ET",
  UG: "UG",
  TZ: "TZ",
};

const roundTo = (value: number, decimals: number) => {
  const factor = 10 ** decimals;
  return Math.round((Number(value || 0) + Number.EPSILON) * factor) / factor;
};

const normalizeProviderForApi = (provider: string, service: string) => {
  const value = (provider || "").trim().toLowerCase();
  if (service === "MobileMoney" && (value.includes("hormuud") || value.includes("evc"))) return "EVC";
  if (service === "MobileMoney" && value.includes("premier")) return "Premier";
  if (service === "MobileMoney" && value.includes("dahab")) return "e-Dahab";
  if (service === "BankTransfer" && value.includes("salam")) return "Salam Bank";
  if (service === "CashCollection" && value.includes("juba")) return "JUBA EXPRESS";
  return provider || "";
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong. Please try again.";

const getRecipientName = (firstName: string, lastName: string) =>
  [firstName, lastName].filter(Boolean).join(" ").trim();

const PENDING_TRANSFER_CONFIRMATION_KEY = "pending_transfer_confirmation_v1";
const cardFieldStyle = {
  backgroundColor: fintechColors.surface,
  textColor: fintechColors.text,
  placeholderColor: fintechColors.textMuted,
  borderRadius: fintechRadius.md,
  fontSize: 16,
};

const paymentColors = {
  heading: fintechColors.text,
  subtext: fintechColors.textMuted,
  border: fintechColors.borderStrong,
  surface: fintechColors.surface,
  surfaceAlt: fintechColors.surfaceStrong,
  cta: fintechColors.primary,
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
  const [saveCard, setSaveCard] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  const orderNumber = useMemo(
    () => (params.transferId || "").slice(0, 8).toUpperCase() || "PENDING",
    [params.transferId],
  );

  const buildTransferConfirmationPayload = (paymentIntentId: string) => {
    const recipientPayload = createTransferRecipientPayload({
      ...transactionData.recipient,
      receivingCountry: normalizeCountryCode(transactionData.receivingCountry || "SO"),
      provider: transactionData.provider,
      service: (transactionData.service || "MobileMoney") as TransferService,
    });

    const sendingCountry =
      countryCodeMap[transactionData.sendCountry] ||
      normalizeCountryCode(transactionData.sendCountry || "NO");
    const receivingCountry =
      countryCodeMap[transactionData.receivingCountry] ||
      normalizeCountryCode(transactionData.receivingCountry || "SO");

    return {
      quoteId: transactionData.quoteId,
      sendAmount: roundTo(transactionData.sendAmount, 2),
      sendCurrency: transactionData.sendCurrency,
      receiveAmount: roundTo(transactionData.receiveAmount, 2),
      receiveCurrency: transactionData.receiveCurrency,
      fee: roundTo(transactionData.fees, 2),
      totalAmount: roundTo(transactionData.totalAmount, 2),
      exchangeRate: roundTo(transactionData.exchangeRate, 6),
      channel: "mobile",
      deliveryMethod: deliveryMethodMap[transactionData.service] || "wallet",
      sendingCountry,
      receivingCountry,
      destinationCountry: receivingCountry,
      firstName: recipientPayload.firstName,
      lastName: recipientPayload.lastName,
      phoneNumber: recipientPayload.phoneNumber,
      countryOfCitizenship: recipientPayload.countryOfCitizenship,
      address: recipientPayload.address || "Unknown",
      city: recipientPayload.city || "Unknown",
      service: recipientPayload.service,
      relationshipToSender: recipientPayload.relationshipToSender,
      paymentMethod: "Card",
      provider: normalizeProviderForApi(transactionData.provider, transactionData.service),
      useBonus: transactionData.useBonus || false,
      idempotencyKey: `${transactionData.quoteId}-${Date.now()}`,
      PaymentIntentId: paymentIntentId,
      TransferId: params.transferId || "",
      PaymentStatus: "Succeeded",
    };
  };

  const persistPendingConfirmation = async (
    paymentIntentId: string,
    confirmationPayload: Record<string, unknown>,
  ) => {
    const record = {
      paymentIntentId,
      transferId: params.transferId || "",
      payload: confirmationPayload,
      recipientName:
        params.recipient ||
        getRecipientName(transactionData.recipient.firstName, transactionData.recipient.lastName),
      createdAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(
      PENDING_TRANSFER_CONFIRMATION_KEY,
      JSON.stringify(record),
    );

    return record;
  };

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

      if (error) {
        throw new Error(error.message);
      }

      const nextPaymentIntentId =
        paymentIntent?.id || params.paymentIntentId || params.clientSecret.split("_secret_")[0];

      const confirmationPayload = buildTransferConfirmationPayload(nextPaymentIntentId);

      try {
        await TransactionService.confirmTransferAfterPayment(confirmationPayload);
      } catch (confirmationError) {
        await persistPendingConfirmation(nextPaymentIntentId, confirmationPayload);
        router.replace("/transaction/MoneyTransferScreen");
        Alert.alert(
          "Confirmation pending",
          "Payment succeeded, but transfer confirmation still needs to be completed. Use Retry Confirmation.",
        );
        return;
      }

      router.replace({
        pathname: "/transaction/ReceiptScreen",
        params: {
          transactionId: params.transferId || nextPaymentIntentId,
          sender:
            [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
            user?.email ||
            "Account holder",
          recipient: params.recipient || getRecipientName(transactionData.recipient.firstName, transactionData.recipient.lastName),
          createdAt: new Date().toISOString(),
          status: "Success",
        },
      });
    } catch (error) {
      Alert.alert("Payment Failed", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardScrollScreen contentStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={fintechColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.headerSpacer} />
      </View>

        <View style={styles.providerBar}>
          <Text style={styles.providerLeft}>JubaPay</Text>
          <View style={styles.providerRight}>
            <Ionicons name="lock-closed" size={12} color={fintechColors.textMuted} />
            <Text style={styles.providerRightText}>Secure payment for JubaPay</Text>
          </View>
        </View>

      <View style={styles.summaryRow}>
        <View>
          <Text style={styles.amountText}>{params.amount || `${transactionData.totalAmount.toFixed(2)} ${transactionData.sendCurrency}`}</Text>
          <Text style={styles.orderText}>Order Number : {orderNumber}</Text>
        </View>
        <TouchableOpacity style={styles.languageBadge} activeOpacity={0.8}>
          <Text style={styles.languageText}>EN</Text>
          <Ionicons name="chevron-down" size={14} color={fintechColors.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardShell}>
        <View style={styles.cardFieldWrap}>
          <Text style={styles.inputLabel}>Card details</Text>
          <CardField
            postalCodeEnabled={false}
            placeholders={{ number: "Card number" }}
            cardStyle={cardFieldStyle}
            style={styles.cardField}
            onCardChange={(details) => setCardComplete(Boolean(details.complete))}
          />
        </View>

        <View style={styles.nameFieldWrap}>
          <Text style={styles.inputLabel}>Name and surname on the card</Text>
          <View style={styles.nameInputRow}>
            <TextInput
              value={cardholderName}
              onChangeText={setCardholderName}
              placeholder="Cardholder name"
              placeholderTextColor={fintechColors.textSubtle}
              style={styles.nameInput}
              autoCapitalize="words"
            />
            <Ionicons name="checkmark" size={18} color={fintechColors.success} />
          </View>
        </View>
      </View>

      <View style={styles.saveRow}>
        <Switch
          value={saveCard}
          onValueChange={setSaveCard}
          trackColor={{ false: fintechColors.surfaceAlt, true: fintechColors.primarySoft }}
          thumbColor={fintechColors.text}
        />
        <Text style={styles.saveLabel}>Save this card for future use</Text>
      </View>

      <View style={styles.footer}>
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={fintechColors.primary} />
              <Text style={styles.loadingText}>JubaPay is processing payment...</Text>
            </View>
          ) : (
            <>
              <FintechPrimaryButton
                onPress={handlePay}
                disabled={!cardComplete || !params.clientSecret}
                style={!cardComplete ? styles.disabledButton : undefined}
              >
                <Text style={styles.payButtonText}>{`Pay ${params.amount || ""}`.trim()}</Text>
              </FintechPrimaryButton>
              <Text style={styles.brandText}>JubaPay</Text>
            </>
          )}
        </View>
    </KeyboardScrollScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: fintechSpacing.sm,
    gap: fintechSpacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: fintechSpacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: fintechColors.border,
    backgroundColor: fintechColors.surface,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: paymentColors.heading,
  },
  headerSpacer: {
    width: 36,
  },
  providerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: paymentColors.border,
    paddingVertical: fintechSpacing.sm,
    gap: fintechSpacing.sm,
  },
  providerLeft: {
    fontSize: 12,
    color: paymentColors.subtext,
  },
  providerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: fintechSpacing.xs,
    flexShrink: 1,
  },
  providerRightText: {
    fontSize: 12,
    color: paymentColors.subtext,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: fintechSpacing.md,
  },
  amountText: {
    fontSize: 22,
    fontWeight: "800",
    color: paymentColors.heading,
    marginBottom: fintechSpacing.xs,
  },
  orderText: {
    fontSize: 14,
    fontWeight: "600",
    color: paymentColors.subtext,
  },
  languageBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: fintechSpacing.xs,
    borderWidth: 1,
    borderColor: paymentColors.border,
    borderRadius: fintechRadius.md,
    paddingHorizontal: fintechSpacing.sm,
    paddingVertical: fintechSpacing.xs,
    backgroundColor: paymentColors.surface,
  },
  languageText: {
    fontSize: 14,
    fontWeight: "700",
    color: paymentColors.heading,
  },
  cardShell: {
    backgroundColor: paymentColors.surface,
    borderRadius: fintechRadius.lg,
    borderWidth: 1,
    borderColor: paymentColors.border,
    padding: fintechSpacing.md,
    gap: fintechSpacing.md,
    shadowColor: fintechColors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardFieldWrap: {
    backgroundColor: paymentColors.surfaceAlt,
    borderRadius: fintechRadius.md,
    borderWidth: 1,
    borderColor: paymentColors.border,
    paddingHorizontal: fintechSpacing.md,
    paddingTop: fintechSpacing.md,
    paddingBottom: fintechSpacing.xs,
  },
  inputLabel: {
    fontSize: 12,
    color: paymentColors.subtext,
    marginBottom: fintechSpacing.xs,
  },
  cardField: {
    width: "100%",
    height: 42,
  },
  nameFieldWrap: {
    backgroundColor: paymentColors.surfaceAlt,
    borderRadius: fintechRadius.md,
    borderWidth: 1,
    borderColor: paymentColors.border,
    paddingHorizontal: fintechSpacing.md,
    paddingTop: fintechSpacing.md,
    paddingBottom: fintechSpacing.sm,
  },
  nameInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: fintechSpacing.sm,
  },
  nameInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: paymentColors.heading,
    paddingVertical: 0,
  },
  saveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: fintechSpacing.sm,
  },
  saveLabel: {
    fontSize: 14,
    color: paymentColors.subtext,
  },
  footer: {
    paddingTop: fintechSpacing.md,
    gap: fintechSpacing.sm,
  },
  disabledButton: {
    backgroundColor: paymentColors.cta,
    opacity: 0.7,
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  brandText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    color: paymentColors.subtext,
  },
  loadingWrap: {
    alignItems: "center",
    paddingVertical: fintechSpacing.md,
    gap: fintechSpacing.sm,
  },
  loadingText: {
    fontSize: 14,
    color: paymentColors.subtext,
  },
});
