import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  fintechColors,
  FintechInlineMessage,
  FintechPrimaryButton,
  FintechRecipientRow,
  FintechReviewList,
  FintechScreenHeader,
  FintechSectionCard,
  FintechStatusPill,
  FintechTrustNotice,
  formatMoney,
  formatMoneyParts,
  fintechSpacing,
} from "../../components/ui/fintech";
import { FixedFooterScreen, useResponsiveMetrics } from "../../components/ui/layout";
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

const flagAssets: Record<string, number> = {
  no: require("../../assets/flags/no.png"),
  so: require("../../assets/flags/so.png"),
  ke: require("../../assets/flags/ke.png"),
  et: require("../../assets/flags/et.png"),
  ug: require("../../assets/flags/ug.png"),
  tz: require("../../assets/flags/tz.png"),
  xx: require("../../assets/flags/xx.png"),
};

const flagMap: Record<string, { asset: number }> = {
  Norway: { asset: flagAssets.no },
  Somalia: { asset: flagAssets.so },
  Kenya: { asset: flagAssets.ke },
  Ethiopia: { asset: flagAssets.et },
  Uganda: { asset: flagAssets.ug },
  Tanzania: { asset: flagAssets.tz },
};

const PENDING_TRANSFER_CONFIRMATION_KEY = "pending_transfer_confirmation_v1";

type PaymentSession = {
  clientSecret?: string;
  paymentIntentId?: string | null;
  transferId?: string;
  checkoutUrl?: string;
};

type PendingConfirmationRecord = {
  payloadVersion?: number;
  paymentIntentId?: string | null;
  transferId?: string;
  recipientName?: string;
  createdAt?: string;
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

const unwrapPaymentSessionPayload = (data: any) =>
  data?.Data || data?.data || data?.result || data?.Result || data;

const compactDebugValue = (value: unknown) => {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const isPendingConfirmationRecordValid = (
  value: unknown,
): value is PendingConfirmationRecord => {
  if (!value || typeof value !== "object") return false;
  const record = value as PendingConfirmationRecord;
  if (record.payloadVersion !== 3) return false;
  if (!record.transferId && !record.paymentIntentId) return false;
  return true;
};

const normalizeProviderForApi = (provider: string, service: string) => {
  const value = (provider || "").trim().toLowerCase();
  if (
    service === "MobileMoney" &&
    (value.includes("hormuud") || value.includes("evc"))
  ) {
    return "EVC";
  }
  if (service === "MobileMoney" && value.includes("premier")) return "Premier";
  if (service === "MobileMoney" && value.includes("dahab")) return "e-Dahab";
  if (service === "BankTransfer" && value.includes("salam")) return "Salam Bank";
  if (service === "CashCollection" && value.includes("juba")) return "JUBA EXPRESS";
  return provider || "";
};

export default function MoneyTransferScreen() {
  const transactionData = getTransferDraft();
  const { user, logout } = useUser();
  const router = useRouter();
  const { isSmallPhone } = useResponsiveMetrics();
  const [loading, setLoading] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);
  const [paymentSession, setPaymentSession] = useState<PaymentSession | null>(null);
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
      const parsed = JSON.parse(raw);
      if (!isPendingConfirmationRecordValid(parsed)) {
        await AsyncStorage.removeItem(PENDING_TRANSFER_CONFIRMATION_KEY);
        return null;
      }
      return parsed;
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
    if (payload?.exp && Date.now() >= payload.exp * 1000) {
      throw new Error("Session expired. Please log in again.");
    }

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

    if (clientSecret) {
      return {
        clientSecret,
        paymentIntentId: getPaymentIntentIdFromClientSecret(clientSecret),
        transferId,
        checkoutUrl,
      };
    }

    if (checkoutUrl) {
      return { paymentIntentId: null, transferId, checkoutUrl };
    }

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
      if (message !== paymentSetupError) {
        Alert.alert("Payment Setup Failed", message);
      }
      setPaymentReady(false);
    } finally {
      setLoading(false);
    }
  };

  const confirmTransferAfterPayment = async (
    record?: PendingConfirmationRecord,
  ) => {
    const payload = record
      ? { transactionId: record.transferId || record.paymentIntentId }
      : buildTransferPayload();
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
        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
        }
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
        pathname: "/transaction/PaymentStatusScreen",
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
          status: "success",
          title: "Payment Successful",
          message:
            "Your payment has been confirmed and your transfer is marked as paid.",
          orderNumber: (
            pendingConfirmationRecord.transferId ||
            pendingConfirmationRecord.paymentIntentId ||
            "PENDING"
          )
            .slice(0, 8)
            .toUpperCase(),
          amount: totalLabel,
          paymentMethod: transactionData.paymentMethod || "Card",
          receiptReady: "true",
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
        if (!canOpen) {
          throw new Error("Cannot open checkout URL on this device.");
        }
        await persistPendingConfirmation({
          payloadVersion: 3,
          paymentIntentId:
            paymentSession.paymentIntentId ||
            paymentSession.transferId ||
            `${Date.now()}`,
          transferId: paymentSession.transferId,
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
    ) {
      return;
    }
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
  const recipientPhoneLabel =
    transactionData.recipient.phoneNumber || "Phone not available";
  const corridorLabel = `${sendCountryName} to ${receiveCountryName}`;
  const deliveryLabel =
    transactionData.provider || transactionData.service || "Delivery method";
  const recipientMetaLabel = [
    transactionData.recipient.relationshipToSender,
    transactionData.recipient.city,
  ]
    .filter(Boolean)
    .join(" • ") || undefined;
  const exchangeRateLabel = `1 ${transactionData.sendCurrency || "NOK"} = ${Number(
    transactionData.exchangeRate || 0,
  ).toFixed(4)} ${transactionData.receiveCurrency || "USD"}`;
  const sendAmountParts = formatMoneyParts(
    transactionData.sendAmount,
    transactionData.sendCurrency || "NOK",
  );
  const recipientGetsParts = formatMoneyParts(
    transactionData.receiveAmount,
    transactionData.receiveCurrency || "USD",
  );
  const sendFlag = flagMap[sendCountryName]?.asset || flagAssets.xx;
  const receiveFlag = flagMap[receiveCountryName]?.asset || flagAssets.xx;

  return (
    <FixedFooterScreen
      contentStyle={styles.container}
      footer={
        <View style={styles.footer}>
          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={fintechColors.primary} />
              <Text style={styles.loadingText}>
                {isConfirmingTransfer
                  ? "Confirming transfer"
                  : "Preparing payment"
                }
              </Text>
            </View>
          ) : (
            <FintechPrimaryButton
              label={
                confirmationPending
                  ? "Retry transfer confirmation"
                  : "Continue to secure payment"
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
          )}
        </View>
      }
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.85}
      >
        <Ionicons name="chevron-back" size={18} color={fintechColors.text} />
      </TouchableOpacity>

      <FintechScreenHeader
        title="Review transfer"
        titleStyle={styles.headerTitle}
        subtitle={isSmallPhone ? "Everything you need before payment." : "Everything you need before secure payment."}
        subtitleStyle={styles.headerSubtitle}
      />

      <View style={styles.mainContent}>
        <View style={styles.heroCard}>
          <View style={styles.heroMetaRow}>
            <FintechStatusPill
              icon="swap-horizontal-outline"
              label={corridorLabel}
              tone="info"
              style={styles.corridorPill}
            />
            <Text style={styles.heroMetaText}>{deliveryLabel}</Text>
          </View>

          <View style={styles.heroAmountsRow}>
            <View style={styles.heroAmountPanel}>
              <View style={styles.heroAmountHead}>
                <Image source={sendFlag} style={styles.flagImage} />
                <Text style={styles.heroLabel}>You send</Text>
              </View>
              <Text style={styles.heroAmountValue}>{sendAmountParts.value}</Text>
            </View>

            <View style={styles.heroAmountPanel}>
              <View style={[styles.heroAmountHead, styles.heroAmountHeadRight]}>
                <Image source={receiveFlag} style={styles.flagImage} />
                <Text style={[styles.heroLabel, styles.heroLabelStrong]}>Recipient gets</Text>
              </View>
              <Text style={[styles.heroAmountValue, styles.heroAmountValueRight]}>
                {recipientGetsParts.value}
              </Text>
            </View>
          </View>
        </View>

        <FintechSectionCard style={styles.recipientSectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionEyebrow}>Recipient</Text>
            <Text style={styles.sectionMeta}>Delivery details</Text>
          </View>
          <FintechRecipientRow
            title={recipientName || "Missing recipient name"}
            subtitle={recipientPhoneLabel}
            detail={recipientMetaLabel}
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
            titleStyle={styles.recipientTitle}
            subtitleStyle={styles.recipientSubtitle}
            detailStyle={styles.recipientDetail}
            style={styles.recipientCard}
          />
        </FintechSectionCard>

        <FintechSectionCard style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionEyebrow}>Payment details</Text>
            <Text style={styles.sectionMeta}>Before secure payment</Text>
          </View>
          <FintechReviewList
            items={[
              { label: "You send", value: sendAmountLabel },
              { label: "Fee", value: feeLabel },
              { label: "Total to pay", value: totalLabel },
              { label: "Exchange rate", value: exchangeRateLabel, valueTone: "muted" },
              { label: "Recipient gets", value: recipientGetsLabel, valueTone: "success" },
            ]}
          />
        </FintechSectionCard>

        {confirmationPending ? (
          <FintechTrustNotice
            tone="warning"
            title="Payment submitted, confirmation pending"
            text="Retry confirmation below if the status does not update."
          />
        ) : null}

        {paymentSetupError && !loading ? (
          <FintechInlineMessage
            tone="danger"
            title="Cannot continue to payment"
            text={paymentSetupError}
          />
        ) : null}
      </View>
    </FixedFooterScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: fintechSpacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  mainContent: {
    flex: 1,
    justifyContent: "space-between",
    gap: fintechSpacing.sm,
    marginTop: fintechSpacing.xs,
  },
  headerTitle: { fontSize: 21, lineHeight: 25, fontWeight: "800" },
  headerSubtitle: { maxWidth: 300 },
  heroCard: {
    padding: fintechSpacing.md,
    gap: fintechSpacing.md,
    borderWidth: 1,
    borderColor: "#16263A",
    borderRadius: 24,
    backgroundColor: "#0E1A2B",
    shadowColor: "#08111D",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 6,
  },
  heroMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: fintechSpacing.sm,
  },
  corridorPill: {
    borderColor: "rgba(147,183,255,0.28)",
    backgroundColor: "rgba(229,239,255,0.1)",
  },
  heroMetaText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
    color: "#C9D6E6",
  },
  heroAmountsRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: fintechSpacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    paddingTop: fintechSpacing.sm,
  },
  heroAmountPanel: {
    flex: 1,
    minHeight: 74,
    minWidth: 0,
    borderRadius: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    paddingVertical: 4,
    justifyContent: "space-between",
    gap: 6,
  },
  heroAmountHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroAmountHeadRight: {
    justifyContent: "flex-end",
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#8FA5BD",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  heroLabelStrong: {
    color: fintechColors.surface,
  },
  heroAmountValue: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "800",
    color: fintechColors.surface,
  },
  heroAmountValueRight: {
    textAlign: "right",
  },
  flagImage: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  sectionCard: {
    gap: fintechSpacing.sm,
    borderRadius: 22,
    borderColor: "#DCE5ED",
    backgroundColor: "#FFFFFF",
    shadowColor: "#10243E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  recipientSectionCard: {
    gap: fintechSpacing.sm,
    borderRadius: 22,
    borderColor: "#DCE5ED",
    backgroundColor: "#FFFFFF",
    shadowColor: "#10243E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: fintechSpacing.sm,
  },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: fintechColors.textSubtle,
    textTransform: "uppercase",
    letterSpacing: 0.55,
  },
  sectionMeta: {
    fontSize: 12,
    lineHeight: 16,
    color: fintechColors.textMuted,
  },
  recipientCard: {
    minHeight: 72,
    paddingVertical: fintechSpacing.sm,
    borderRadius: 18,
    borderColor: "#E2EAF1",
    backgroundColor: "#FFFFFF",
  },
  recipientTitle: { fontSize: 12, lineHeight: 16, fontWeight: "600" },
  recipientSubtitle: { fontSize: 11, lineHeight: 15 },
  recipientDetail: { marginTop: 1, fontSize: 11, lineHeight: 15 },
  footer: {
    paddingTop: fintechSpacing.xs,
  },
  loadingWrap: { alignItems: "center", paddingVertical: 8 },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: fintechColors.textMuted,
    textAlign: "center",
  },
  compactButton: { minHeight: 52 },
  compactButtonText: { fontSize: 15, fontWeight: "800" },
});
