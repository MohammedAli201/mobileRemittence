import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import {
  fintechColors,
  FintechInlineMessage,
  FintechPricingSummaryCard,
  FintechPrimaryButton,
  FintechProgress,
  FintechRecipientRow,
  FintechScreenHeader,
  FintechSectionCard,
  FintechSectionHeader,
  FintechStickyActionArea,
  FintechTrustRow,
  fintechSpacing,
} from "../../components/ui/fintech";
import { Screen } from "../../components/ui/layout";
import { useUser } from "../../context/UserContext";
import { TransactionService } from "../../services/apiClient";
import {
  createTransferRecipientPayload,
  getCountryNameFromCode,
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

const decodeJWT = (token: string) => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const normalizedPayload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      "=",
    );
    return JSON.parse(atob(paddedPayload));
  } catch {
    return null;
  }
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
const roundTo = (value: number, decimals: number) =>
  Math.round((Number(value || 0) + Number.EPSILON) * 10 ** decimals) /
  10 ** decimals;
const getRecipientName = (firstName: string, lastName: string) =>
  [firstName, lastName].filter(Boolean).join(" ").trim();
const getPaymentIntentIdFromClientSecret = (clientSecret: string) =>
  clientSecret.split("_secret_")[0] || null;
const formatMoney = (amount: number, currency: string) =>
  `${Number(amount || 0).toFixed(2)} ${currency}`;
const unwrapPaymentSessionPayload = (data: any) =>
  data?.Data || data?.data || data?.result || data?.Result || data;
const compactDebugValue = (value: unknown) => {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const normalizeProviderForApi = (provider: string, service: string) => {
  const value = (provider || "").trim().toLowerCase();
  if (
    service === "MobileMoney" &&
    (value.includes("hormuud") || value.includes("evc"))
  )
    return "EVC";
  if (service === "MobileMoney" && value.includes("premier")) return "Premier";
  if (service === "MobileMoney" && value.includes("dahab")) return "e-Dahab";
  if (service === "BankTransfer" && value.includes("salam"))
    return "Salam Bank";
  if (service === "CashCollection" && value.includes("juba"))
    return "JUBA EXPRESS";
  return provider || "";
};

export default function MoneyTransferScreen() {
  const transactionData = getTransferDraft();
  const { user, logout } = useUser();
  const router = useRouter();
  const { height } = useWindowDimensions();
  const [loading, setLoading] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);
  const [paymentSession, setPaymentSession] = useState<PaymentSession | null>(
    null,
  );
  const [isConfirmingTransfer, setIsConfirmingTransfer] = useState(false);
  const [confirmationPending, setConfirmationPending] = useState(false);
  const [pendingConfirmationRecord, setPendingConfirmationRecord] =
    useState<PendingConfirmationRecord | null>(null);
  const latestSetupKeyRef = useRef<string | null>(null);

  const recipientName = getRecipientName(
    transactionData.recipient.firstName,
    transactionData.recipient.lastName,
  );
  const paymentSetupError = !user?.token
    ? "Authentication required"
    : !transactionData.quoteId
      ? "Quote is missing"
      : !transactionData.paymentMethod
        ? "Payment method is missing"
        : !transactionData.sendCurrency
          ? "Send currency is missing"
          : !transactionData.receiveCurrency
            ? "Receive currency is missing"
            : transactionData.sendAmount <= 0
              ? "Send amount must be greater than zero"
              : transactionData.totalAmount <= 0
                ? "Total amount must be greater than zero"
                : !recipientName
                  ? "Recipient name is missing"
                  : !transactionData.recipient.phoneNumber
                    ? "Recipient phone number is missing"
                    : !transactionData.recipient.countryOfCitizenship
                      ? "Recipient citizenship is missing"
                      : !transactionData.service
                        ? "Transfer service is missing"
                        : !transactionData.provider
                          ? "Provider is missing"
                          : null;

  const paymentSetupKey = paymentSetupError
    ? null
    : JSON.stringify({
        quoteId: transactionData.quoteId,
        sendAmount: transactionData.sendAmount,
        receiveAmount: transactionData.receiveAmount,
        totalAmount: transactionData.totalAmount,
        paymentMethod: transactionData.paymentMethod,
        provider: transactionData.provider,
        recipientId: transactionData.recipient.id,
      });

  const buildTransferPayload = () => {
    if (paymentSetupError) throw new Error(paymentSetupError);
    if (!user?.token) throw new Error("Authentication required");

    const recipientPayload = createTransferRecipientPayload({
      ...transactionData.recipient,
      receivingCountry: normalizeCountryCode(
        transactionData.receivingCountry || "SO",
      ),
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
      paymentMethod:
        transactionData.paymentMethod === "visa" ||
        transactionData.paymentMethod === "mastercard"
          ? "Card"
          : transactionData.paymentMethod,
      provider: normalizeProviderForApi(
        transactionData.provider,
        transactionData.service,
      ),
      useBonus: transactionData.useBonus || false,
      idempotencyKey: `${transactionData.quoteId}-${Date.now()}`,
    };
  };

  const loadPendingConfirmation = async () => {
    const raw = await AsyncStorage.getItem(PENDING_TRANSFER_CONFIRMATION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PendingConfirmationRecord;
    } catch {
      await AsyncStorage.removeItem(PENDING_TRANSFER_CONFIRMATION_KEY);
      return null;
    }
  };

  const persistPendingConfirmation = async (
    record: PendingConfirmationRecord,
  ) => {
    await AsyncStorage.setItem(
      PENDING_TRANSFER_CONFIRMATION_KEY,
      JSON.stringify(record),
    );
    setPendingConfirmationRecord(record);
    setConfirmationPending(true);
  };

  const clearPendingConfirmation = async () => {
    await AsyncStorage.removeItem(PENDING_TRANSFER_CONFIRMATION_KEY);
    setPendingConfirmationRecord(null);
    setConfirmationPending(false);
  };

  const createPaymentSession = async () => {
    const requestBody = buildTransferPayload();
    const authToken = user?.token;
    if (!authToken) throw new Error("Authentication required");
    const payload = decodeJWT(authToken);
    if (payload?.exp && Date.now() >= payload.exp * 1000)
      throw new Error("Session expired. Please log in again.");

    const rawData = await TransactionService.createPaymentSession(requestBody);
    const data = unwrapPaymentSessionPayload(rawData);
    const clientSecret =
      data?.ClientSecret ||
      data?.clientSecret ||
      data?.PaymentIntent ||
      data?.paymentIntent ||
      data?.PaymentIntentClientSecret ||
      data?.paymentIntentClientSecret;
    const checkoutUrl =
      data?.checkoutUrl ||
      data?.CheckoutUrl ||
      data?.paymentUrl ||
      data?.PaymentUrl ||
      data?.paymentURL ||
      data?.PaymentURL ||
      data?.url ||
      data?.Url ||
      data?.redirectUrl ||
      data?.RedirectUrl ||
      data?.redirectURL ||
      data?.RedirectURL ||
      data?.redirectUri ||
      data?.RedirectUri ||
      data?.redirectURI ||
      data?.RedirectURI ||
      data?.paymentLink ||
      data?.PaymentLink ||
      data?.hostedCheckoutUrl ||
      data?.HostedCheckoutUrl;
    const transferId =
      data?.transactionId ||
      data?.TransactionId ||
      data?.transferId ||
      data?.TransferId ||
      data?.Id;

    if (clientSecret)
      return {
        clientSecret,
        paymentIntentId: getPaymentIntentIdFromClientSecret(clientSecret),
        transferId,
        checkoutUrl,
      };
    if (checkoutUrl) return { paymentIntentId: null, transferId, checkoutUrl };

    throw new Error(
      transferId
        ? `Transfer was created, but the server did not return a checkout URL or payment client secret. Response: ${compactDebugValue(data)}`
        : "No payment method received from server",
    );
  };

  const initializePaymentFlow = async () => {
    try {
      setLoading(true);
      const nextPaymentSession = await createPaymentSession();
      setPaymentSession(nextPaymentSession);
      setPaymentReady(true);
    } catch (error) {
      const message = getErrorMessage(error);
      if (message.toLowerCase().includes("unauthorized")) await logout();
      if (message !== paymentSetupError)
        Alert.alert("Payment Setup Failed", message);
      setPaymentReady(false);
    } finally {
      setLoading(false);
    }
  };

  const confirmTransferAfterPayment = async (
    record?: PendingConfirmationRecord,
  ) => {
    const payload = record
      ? {
          ...record.payload,
          PaymentIntentId: record.paymentIntentId,
          TransferId: record.transferId,
          PaymentStatus: "Succeeded",
        }
      : {
          ...buildTransferPayload(),
          PaymentIntentId: paymentSession?.paymentIntentId,
          TransferId: paymentSession?.transferId,
          PaymentStatus: "Succeeded",
        };
    return TransactionService.confirmTransferAfterPayment(payload);
  };

  const retryTransferConfirmation = async (
    record?: PendingConfirmationRecord,
  ) => {
    let lastError: unknown = null;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        await confirmTransferAfterPayment(record);
        await clearPendingConfirmation();
        return;
      } catch (error) {
        lastError = error;
        if (attempt < 3)
          await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
      }
    }
    throw lastError;
  };

  const handleRetryConfirmation = async () => {
    if (!pendingConfirmationRecord) {
      Alert.alert("Retry unavailable", "No pending confirmation was found.");
      return;
    }

    try {
      setLoading(true);
      setIsConfirmingTransfer(true);
      await retryTransferConfirmation(pendingConfirmationRecord);
      router.replace({
        pathname: "/transaction/ReceiptScreen",
        params: {
          transactionId:
            pendingConfirmationRecord.transferId ||
            pendingConfirmationRecord.paymentIntentId,
          sender:
            [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
            user?.email ||
            "Account holder",
          recipient: pendingConfirmationRecord.recipientName,
          createdAt: pendingConfirmationRecord.createdAt,
          status: "Success",
        },
      });
    } catch (error) {
      Alert.alert("Confirmation Failed", getErrorMessage(error));
    } finally {
      setLoading(false);
      setIsConfirmingTransfer(false);
    }
  };

  const presentPayment = async () => {
    if (paymentSetupError) {
      Alert.alert("Payment setup blocked", paymentSetupError);
      return;
    }
    if (!paymentReady) {
      await initializePaymentFlow();
      return;
    }
    try {
      setLoading(true);
      if (paymentSession?.checkoutUrl) {
        const canOpen = await Linking.canOpenURL(paymentSession.checkoutUrl);
        if (!canOpen)
          throw new Error("Cannot open checkout URL on this device.");
        await persistPendingConfirmation({
          paymentIntentId:
            paymentSession.paymentIntentId ||
            paymentSession.transferId ||
            `${Date.now()}`,
          transferId: paymentSession.transferId,
          payload: buildTransferPayload(),
          recipientName,
          createdAt: new Date().toISOString(),
        });
        await Linking.openURL(paymentSession.checkoutUrl);
        return;
      }
      if (paymentSession?.clientSecret) {
        router.push({
          pathname: "/transaction/StripePayment",
          params: {
            clientSecret: paymentSession.clientSecret,
            paymentIntentId: paymentSession.paymentIntentId || "",
            transferId: paymentSession.transferId || "",
            amount: totalLabel,
            recipient: recipientName,
          },
        });
        return;
      }
      throw new Error("Payment method is not ready.");
    } catch (error) {
      Alert.alert("Payment Failed", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paymentSetupError) {
      latestSetupKeyRef.current = null;
      setPaymentReady(false);
      setPaymentSession(null);
      return;
    }
    if (confirmationPending || pendingConfirmationRecord) return;
    if (
      paymentSetupKey &&
      latestSetupKeyRef.current === paymentSetupKey &&
      (paymentReady || paymentSession)
    )
      return;
    latestSetupKeyRef.current = paymentSetupKey;
    void initializePaymentFlow();
  }, [
    confirmationPending,
    paymentReady,
    paymentSession,
    paymentSetupError,
    paymentSetupKey,
    pendingConfirmationRecord,
  ]);

  useEffect(() => {
    if (!isConfirmingTransfer) return undefined;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true,
    );
    return () => subscription.remove();
  }, [isConfirmingTransfer]);

  useEffect(() => {
    let isMounted = true;
    const restorePendingConfirmation = async () => {
      const storedRecord = await loadPendingConfirmation();
      if (!isMounted || !storedRecord) return;
      setPendingConfirmationRecord(storedRecord);
      setConfirmationPending(true);
      setPaymentSession({
        clientSecret: "",
        paymentIntentId: storedRecord.paymentIntentId,
        transferId: storedRecord.transferId,
      });
    };
    void restorePendingConfirmation();
    return () => {
      isMounted = false;
    };
  }, []);

  const sendCountryName = getCountryNameFromCode(
    transactionData.sendCountry || "NO",
  );
  const receiveCountryName = getCountryNameFromCode(
    transactionData.receivingCountry || "SO",
  );
  const feeLabel = formatMoney(
    transactionData.fees,
    transactionData.sendCurrency,
  );
  const totalLabel = formatMoney(
    transactionData.totalAmount,
    transactionData.sendCurrency,
  );
  const recipientGetsLabel = formatMoney(
    transactionData.receiveAmount,
    transactionData.receiveCurrency,
  );
  const sendAmountLabel = formatMoney(
    transactionData.sendAmount,
    transactionData.sendCurrency,
  );
  const shouldAllowScroll = true;

  return (
    <Screen contentStyle={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.85}
      >
        <Ionicons name="chevron-back" size={18} color={fintechColors.text} />
      </TouchableOpacity>

        <FintechProgress
          step={6}
          total={6}
          label="Final checkout"
          style={styles.progress}
        />
        <FintechScreenHeader
          title="Confirm payment"
          subtitle="Review the essentials."
          titleStyle={styles.headerTitle}
          subtitleStyle={styles.headerSubtitle}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={shouldAllowScroll}
        >
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Recipient gets</Text>
            <View style={styles.amountRow}>
              <Text style={styles.amountValue}>
                {Number(transactionData.receiveAmount || 0).toFixed(2)}
              </Text>
              <View style={styles.amountCurrency}>
                <Text style={styles.amountCurrencyText}>
                  {transactionData.receiveCurrency || "USD"}
                </Text>
              </View>
            </View>
            <Text style={styles.amountMeta}>
              {receiveCountryName} • Estimated delivery in minutes
            </Text>
          </View>

          <FintechSectionCard>
            <FintechSectionHeader
              title="Recipient"
              note="Saved details."
              titleStyle={styles.sectionTitle}
              noteStyle={styles.sectionNote}
            />
            <FintechRecipientRow
              title={recipientName || "Missing recipient name"}
              subtitle={transactionData.recipient.phoneNumber}
              detail={
                transactionData.recipient.city ||
                transactionData.recipient.relationshipToSender ||
                undefined
              }
              provider={transactionData.provider || transactionData.service}
              initials={(recipientName || "R")
                .split(/\s+/)
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
              accentColor={
                transactionData.recipient.avatarColor ||
                fintechColors.primaryStrong
              }
              onPress={() => router.back()}
            />
          </FintechSectionCard>

          <FintechPricingSummaryCard
            title="Transfer summary"
            items={[
              { label: "You send", value: sendAmountLabel },
              { label: "Recipient gets", value: recipientGetsLabel, tone: "success" },
              { label: "Fee", value: feeLabel },
            ]}
            totalLabel="Total to pay"
            totalValue={totalLabel}
          />

          {confirmationPending ? (
            <FintechInlineMessage
              tone="warning"
              title="Payment submitted, confirmation still pending"
              text="If the status has not updated, retry confirmation below."
            />
          ) : null}

          {paymentSetupError && !loading ? (
            <FintechInlineMessage
              tone="danger"
              title="Checkout blocked"
              text={paymentSetupError}
            />
          ) : null}
      </ScrollView>

      <FintechStickyActionArea style={styles.footer}>
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={fintechColors.primary} />
            <Text style={styles.loadingText}>
              {isConfirmingTransfer
                ? "Confirming your transfer safely..."
                : "Preparing secure checkout..."}
            </Text>
          </View>
        ) : (
          <>
            <FintechPrimaryButton
              label={
                confirmationPending ? "Retry confirmation" : "Confirm payment"
              }
              onPress={
                confirmationPending ? handleRetryConfirmation : presentPayment
              }
              style={styles.compactButton}
              textStyle={styles.compactButtonText}
              disabled={
                loading ||
                isConfirmingTransfer ||
                (confirmationPending && !pendingConfirmationRecord)
              }
            />
          </>
        )}
      </FintechStickyActionArea>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: fintechSpacing.sm,
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
  progress: { marginTop: fintechSpacing.sm, marginBottom: fintechSpacing.sm },
  scrollView: { flex: 1, marginTop: fintechSpacing.xs },
  scrollContent: { flexGrow: 1, gap: fintechSpacing.sm, paddingBottom: fintechSpacing.md },
  headerTitle: { fontSize: 20, lineHeight: 24 },
  headerSubtitle: { fontSize: 12, lineHeight: 16 },
  amountCard: {
    backgroundColor: fintechColors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: fintechColors.border,
    padding: fintechSpacing.md,
    gap: fintechSpacing.xs,
  },
  amountLabel: { fontSize: 11, fontWeight: "700", color: fintechColors.textMuted, textTransform: "uppercase", letterSpacing: 0.6 },
  amountRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: fintechSpacing.sm },
  amountValue: { flex: 1, fontSize: 22, fontWeight: "800", color: fintechColors.text },
  amountCurrency: { paddingHorizontal: fintechSpacing.sm, paddingVertical: fintechSpacing.xs, borderRadius: 12, backgroundColor: fintechColors.surfaceStrong, borderWidth: 1, borderColor: fintechColors.border },
  amountCurrencyText: { fontSize: 12, fontWeight: "800", color: fintechColors.text },
  amountMeta: { fontSize: 12, color: fintechColors.textMuted },
  sectionTitle: { fontSize: 13 },
  sectionNote: { fontSize: 11, lineHeight: 14 },
  footer: {
    paddingTop: fintechSpacing.md,
    borderTopWidth: 1,
    borderTopColor: fintechColors.border,
  },
  loadingWrap: { alignItems: "center", paddingVertical: 8 },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: fintechColors.textMuted,
    textAlign: "center",
  },
  compactButton: { minHeight: 48, borderRadius: 14 },
  compactButtonText: { fontSize: 14 },
});
