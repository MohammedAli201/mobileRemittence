import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { CardField, useStripe } from "@stripe/stripe-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FintechPrimaryButton, fintechColors } from "../../components/ui/fintech";
import { useUser } from "../../context/UserContext";
import { TransactionService } from "../../services/apiClient";
import {
  createTransferRecipientPayload,
  normalizeCountryCode,
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

export default function StripePaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
      receivingCountry: transactionData.receivingCountry,
      provider: transactionData.provider,
      service: transactionData.service,
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
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) + 4 }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color="#2B2B2B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.providerBar}>
          <Text style={styles.providerLeft}>JubaPay</Text>
          <View style={styles.providerRight}>
            <Ionicons name="lock-closed" size={12} color="#7C7C7C" />
            <Text style={styles.providerRightText}>Secure payment for JubaPay</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 160 + Math.max(insets.bottom, 8) }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.amountText}>{params.amount || `${transactionData.totalAmount.toFixed(2)} ${transactionData.sendCurrency}`}</Text>
              <Text style={styles.orderText}>Order Number : {orderNumber}</Text>
            </View>
            <TouchableOpacity style={styles.languageBadge} activeOpacity={0.8}>
              <Text style={styles.languageText}>EN</Text>
              <Ionicons name="chevron-down" size={14} color="#444" />
            </TouchableOpacity>
          </View>

          <View style={styles.cardShell}>
            <View style={styles.cardFieldWrap}>
              <Text style={styles.inputLabel}>Card details</Text>
              <CardField
                postalCodeEnabled={false}
                placeholders={{ number: "Card number" }}
                cardStyle={styles.cardFieldStyle}
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
                  placeholderTextColor="#9AA0AA"
                  style={styles.nameInput}
                  autoCapitalize="words"
                />
                <Ionicons name="checkmark" size={18} color="#14B86A" />
              </View>
            </View>
          </View>

          <View style={styles.saveRow}>
            <Switch
              value={saveCard}
              onValueChange={setSaveCard}
              trackColor={{ false: "#E6E8ED", true: "#BFDBFE" }}
              thumbColor="#FFFFFF"
            />
            <Text style={styles.saveLabel}>Save this card for future use</Text>
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 8) + 8 }]}>
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
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
    borderColor: "#E5E7EB",
    paddingVertical: 10,
    marginBottom: 18,
    gap: 12,
  },
  providerLeft: {
    fontSize: 12,
    color: "#8A8F98",
  },
  providerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
  },
  providerRightText: {
    fontSize: 12,
    color: "#777",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    gap: 18,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  amountText: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
  },
  orderText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3F3F46",
  },
  languageBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  languageText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
  cardShell: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ECEFF3",
    padding: 12,
    gap: 12,
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardFieldWrap: {
    backgroundColor: "#F4F5F8",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 4,
  },
  inputLabel: {
    fontSize: 12,
    color: "#7C8390",
    marginBottom: 8,
  },
  cardField: {
    width: "100%",
    height: 42,
  },
  cardFieldStyle: {
    backgroundColor: "#F4F5F8",
    textColor: "#111827",
    placeholderColor: "#9AA0AA",
    borderRadius: 8,
    fontSize: 18,
  },
  nameFieldWrap: {
    backgroundColor: "#F4F5F8",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
  },
  nameInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  nameInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    paddingVertical: 0,
  },
  saveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  saveLabel: {
    fontSize: 15,
    color: "#505966",
  },
  footer: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    paddingTop: 12,
    gap: 10,
  },
  disabledButton: {
    backgroundColor: "#F6D7B7",
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  brandText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    color: "#635BFF",
  },
  loadingWrap: {
    alignItems: "center",
    paddingVertical: 16,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
  },
});
