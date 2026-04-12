import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  FintechKeyValueRow,
  FintechPrimaryButton,
  FintechSecondaryButton,
  fintechColors,
} from "../../components/ui/fintech";
import { useUser } from "../../context/UserContext";
import { TransactionService } from "../../services/apiClient";
import {
  createTransferRecipientPayload,
  getCountryNameFromCode,
  normalizeCountryCode,
} from "../../services/remittance";
import { getTransferDraft } from "../../services/transferDraft";

type PaymentSession = {
  clientSecret?: string;
  paymentIntentId: string | null;
  transferId?: string;
  checkoutUrl?: string;
};

type PendingConfirmationRecord = {
  paymentIntentId: string;
  transferId?: string;
  payload: Record<string, unknown>;
  recipientName: string;
  createdAt: string;
};

const PENDING_TRANSFER_CONFIRMATION_KEY = "pending_transfer_confirmation_v1";

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
  error instanceof Error ? error.message : "Something went wrong. Please try again.";

const roundTo = (value: number, decimals: number) => {
  const factor = 10 ** decimals;
  return Math.round((Number(value || 0) + Number.EPSILON) * factor) / factor;
};

const getRecipientName = (firstName: string, lastName: string) =>
  [firstName, lastName].filter(Boolean).join(" ").trim();

const getPaymentIntentIdFromClientSecret = (clientSecret: string) =>
  clientSecret.split("_secret_")[0] || null;

const formatMoney = (amount: number, currency: string) =>
  `${Number(amount || 0).toFixed(2)} ${currency}`;

const unwrapPaymentSessionPayload = (data: any) =>
  data?.Data ||
  data?.data ||
  data?.result ||
  data?.Result ||
  data;

const compactDebugValue = (value: unknown) => {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

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

const normalizeProviderForApi = (provider: string, service: string) => {
  const value = (provider || "").trim().toLowerCase();
  if (service === "MobileMoney" && (value.includes("hormuud") || value.includes("evc"))) return "EVC";
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
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [loading, setLoading] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);
  const [paymentSession, setPaymentSession] = useState<PaymentSession | null>(null);
  const [isConfirmingTransfer, setIsConfirmingTransfer] = useState(false);
  const [confirmationPending, setConfirmationPending] = useState(false);
  const [pendingConfirmationRecord, setPendingConfirmationRecord] = useState<PendingConfirmationRecord | null>(null);
  const latestSetupKeyRef = useRef<string | null>(null);

  const recipientName = getRecipientName(
    transactionData.recipient.firstName,
    transactionData.recipient.lastName,
  );
  const paymentSetupError =
    !user?.token ? "Authentication required" :
    !transactionData.quoteId ? "Quote is missing" :
    !transactionData.paymentMethod ? "Payment method is missing" :
    !transactionData.sendCurrency ? "Send currency is missing" :
    !transactionData.receiveCurrency ? "Receive currency is missing" :
    transactionData.sendAmount <= 0 ? "Send amount must be greater than zero" :
    transactionData.totalAmount <= 0 ? "Total amount must be greater than zero" :
    !recipientName ? "Recipient name is missing" :
    !transactionData.recipient.phoneNumber ? "Recipient phone number is missing" :
    !transactionData.recipient.countryOfCitizenship ? "Recipient citizenship is missing" :
    !transactionData.service ? "Transfer service is missing" :
    !transactionData.provider ? "Provider is missing" :
    null;

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
    if (paymentSetupError) {
      throw new Error(paymentSetupError);
    }
    if (!user?.token) {
      throw new Error("Authentication required");
    }

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
      paymentMethod:
        transactionData.paymentMethod === "visa" || transactionData.paymentMethod === "mastercard"
          ? "Card"
          : transactionData.paymentMethod,
      provider: normalizeProviderForApi(transactionData.provider, transactionData.service),
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

  const persistPendingConfirmation = async (record: PendingConfirmationRecord) => {
    await AsyncStorage.setItem(PENDING_TRANSFER_CONFIRMATION_KEY, JSON.stringify(record));
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
    console.log("Payment session raw response", rawData);
    const data = unwrapPaymentSessionPayload(rawData);
    console.log("Payment session parsed response", data);
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
      return {
        paymentIntentId: null,
        transferId,
        checkoutUrl,
      };
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
      if (message.toLowerCase().includes("unauthorized")) {
        await logout();
      }
      if (message !== paymentSetupError) {
        Alert.alert("Payment Setup Failed", message);
      }
      setPaymentReady(false);
    } finally {
      setLoading(false);
    }
  };

  const confirmTransferAfterPayment = async (record?: PendingConfirmationRecord) => {
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

  const retryTransferConfirmation = async (record?: PendingConfirmationRecord) => {
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
        pathname: "/transaction/ReceiptScreen",
        params: {
          transactionId:
            pendingConfirmationRecord.transferId || pendingConfirmationRecord.paymentIntentId,
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
        if (!canOpen) {
          throw new Error("Cannot open checkout URL on this device.");
        }
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
  }, [confirmationPending, paymentReady, paymentSession, paymentSetupError, paymentSetupKey, pendingConfirmationRecord]);

  useEffect(() => {
    if (!isConfirmingTransfer) return undefined;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => true);
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

  const sendCountryName = getCountryNameFromCode(transactionData.sendCountry || "NO");
  const receiveCountryName = getCountryNameFromCode(transactionData.receivingCountry || "SO");
  const feeLabel = formatMoney(transactionData.fees, transactionData.sendCurrency);
  const totalLabel = formatMoney(transactionData.totalAmount, transactionData.sendCurrency);
  const recipientGetsLabel = formatMoney(transactionData.receiveAmount, transactionData.receiveCurrency);
  const sendAmountLabel = formatMoney(transactionData.sendAmount, transactionData.sendCurrency);
  const shouldAllowScroll = height < 760;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) + 8 }]}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="close" size={20} color="#2B2B2B" />
        </TouchableOpacity>

        <Text style={styles.screenLabel}>Review</Text>
        <Text style={styles.screenTitle}>Check transfer details</Text>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 128 + Math.max(insets.bottom, 8) }]}
          showsVerticalScrollIndicator={shouldAllowScroll}
          scrollEnabled={shouldAllowScroll}
        >
          <View style={styles.amountSummaryCard}>
            <View style={styles.amountSummaryRow}>
              <View style={styles.amountSummaryMeta}>
                <Text style={styles.amountSummaryLabel}>They get</Text>
                <Text style={[styles.amountSummaryValue, styles.amountSummaryValueReceive]}>
                  {Number(transactionData.receiveAmount || 0).toFixed(2).replace(".", ",")}
                </Text>
              </View>
              <View style={[styles.currencyBadge, styles.currencyBadgeReceive]}>
                <CountryFlag country={receiveCountryName} />
                <Text style={[styles.currencyBadgeText, styles.currencyBadgeTextReceive]}>
                  {transactionData.receiveCurrency || "USD"}
                </Text>
              </View>
            </View>

            <View style={styles.reviewDivider} />

            <View style={styles.amountSummaryRow}>
              <View style={styles.amountSummaryMeta}>
                <Text style={styles.amountSummaryLabel}>You send</Text>
                <Text style={styles.amountSummaryValue}>
                  {Number(transactionData.sendAmount || 0).toFixed(2).replace(".", ",")}
                </Text>
              </View>
              <View style={styles.currencyBadge}>
                <CountryFlag country={sendCountryName} />
                <Text style={styles.currencyBadgeText}>{transactionData.sendCurrency || "NOK"}</Text>
              </View>
            </View>
          </View>

          <View style={styles.reviewCard}>
            <Text style={styles.sectionTitle}>Recipient</Text>
            <View style={styles.reviewRow}>
              <View style={styles.personBadge}>
                <Text style={styles.personBadgeText}>{(recipientName || "R").slice(0, 1).toUpperCase()}</Text>
              </View>
              <View style={styles.reviewRowContent}>
                <Text style={styles.reviewValueStrong}>{recipientName || "Missing recipient name"}</Text>
                <Text style={styles.reviewSubtext}>{transactionData.recipient.phoneNumber}</Text>
              </View>
            </View>

            <View style={styles.reviewDivider} />

            <Text style={styles.sectionTitle}>Transfer details</Text>
            <View style={styles.detailsList}>
              <FintechKeyValueRow label="Destination" value={receiveCountryName} />
              <FintechKeyValueRow label="Method" value={transactionData.service || "Wallet"} />
              <FintechKeyValueRow label="Provider" value={transactionData.provider || "-"} />
            </View>

            <View style={styles.reviewDivider} />
            <Text style={styles.sectionTitle}>Pricing</Text>
            <View style={styles.detailsList}>
              <FintechKeyValueRow label="You send" value={sendAmountLabel.replace(".", ",")} />
              <FintechKeyValueRow
                label="Exchange rate"
                value={`1 ${transactionData.sendCurrency} = ${transactionData.exchangeRate.toFixed(4).replace(".", ",")} ${transactionData.receiveCurrency}`}
              />
              <FintechKeyValueRow
                label={`${transactionData.recipient.firstName || "Recipient"} gets`}
                value={recipientGetsLabel.replace(".", ",")}
              />
              <FintechKeyValueRow label="Fee" value={feeLabel.replace(".", ",")} />
            </View>

            <View style={styles.reviewDivider} />
            <View style={styles.totalInlineRow}>
              <Text style={styles.totalInlineLabel}>You pay</Text>
              <Text style={styles.totalInlineValue}>{totalLabel.replace(".", ",")}</Text>
            </View>
          </View>

          {paymentSetupError && !loading ? (
            <View style={styles.alertCardError}>
              <Ionicons name="alert-circle-outline" size={18} color={fintechColors.danger} />
              <Text style={styles.alertTextError}>{paymentSetupError}</Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={[styles.footerCard, { paddingBottom: Math.max(insets.bottom, 8) + 8 }]}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={fintechColors.primary} />
              <Text style={styles.loadingText}>
                {isConfirmingTransfer ? "Confirming your transfer..." : "Setting up secure payment..."}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.footerTop}>
                <Text style={styles.footerCaption}>Total to pay</Text>
                <Text style={styles.footerValue}>{totalLabel}</Text>
              </View>

              <View style={styles.buttonContainer}>
                {confirmationPending ? (
                  <FintechPrimaryButton
                    style={styles.warningButton}
                    onPress={handleRetryConfirmation}
                    disabled={loading || !pendingConfirmationRecord}
                  >
                    <Text style={styles.primaryButtonText}>Retry Confirmation</Text>
                  </FintechPrimaryButton>
                ) : (
                  <FintechPrimaryButton onPress={presentPayment} disabled={loading || isConfirmingTransfer}>
                    <Text style={styles.primaryButtonText}>Confirm & Pay</Text>
                  </FintechPrimaryButton>
                )}
              </View>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

function CountryFlag({ country }: { country: string }) {
  if (country === "Norway") {
    return (
      <View style={[styles.flagBox, styles.flagNorway]}>
        <View style={styles.flagNorwayVertical} />
        <View style={styles.flagNorwayHorizontal} />
      </View>
    );
  }

  if (country === "Somalia") {
    return (
      <View style={[styles.flagBox, styles.flagSomalia]}>
        <Ionicons name="star" size={9} color="#FFFFFF" />
      </View>
    );
  }

  return (
    <View style={[styles.flagBox, styles.flagDefault]}>
      <Text style={styles.flagText}>{country.slice(0, 2).toUpperCase()}</Text>
    </View>
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
  closeButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#F7F8FA",
    marginBottom: 10,
  },
  screenLabel: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 2,
  },
  screenTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    gap: 8,
  },
  amountSummaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    gap: 10,
  },
  amountSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  amountSummaryMeta: {
    flex: 1,
    gap: 4,
  },
  amountSummaryLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  amountSummaryValue: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "800",
    color: "#111827",
  },
  amountSummaryValueReceive: {
    color: "#0A7A42",
  },
  currencyBadge: {
    minWidth: 88,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
  },
  currencyBadgeReceive: {
    backgroundColor: "#E8F7EE",
  },
  currencyBadgeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  currencyBadgeTextReceive: {
    color: "#15803D",
  },
  amountCardValue: {
    flex: 1,
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },
  flagBox: {
    width: 24,
    height: 18,
    borderRadius: 4,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  flagNorway: {
    backgroundColor: "#ED3943",
  },
  flagNorwayVertical: {
    position: "absolute",
    left: 6,
    width: 5,
    height: "100%",
    backgroundColor: "#1E4D99",
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  flagNorwayHorizontal: {
    position: "absolute",
    top: 6,
    width: "100%",
    height: 4,
    backgroundColor: "#1E4D99",
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  flagSomalia: {
    backgroundColor: "#3B86DA",
  },
  flagDefault: {
    backgroundColor: "#D7E7F8",
  },
  flagText: {
    fontSize: 8,
    fontWeight: "700",
    color: "#21507C",
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    gap: 12,
  },
  reviewValueStrong: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    flexShrink: 1,
  },
  personBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E5ECF6",
    alignItems: "center",
    justifyContent: "center",
  },
  personBadgeText: {
    fontSize: 12,
    color: "#35517A",
    fontWeight: "600",
  },
  reviewDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  detailsList: {
    gap: 6,
  },
  reviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  reviewRowContent: {
    flex: 1,
    gap: 2,
  },
  reviewSubtext: {
    fontSize: 13,
    color: "#6B7280",
  },
  totalInlineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalInlineLabel: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "600",
  },
  totalInlineValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  alertCardError: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    padding: 14,
  },
  alertTextError: {
    flex: 1,
    fontSize: 14,
    color: fintechColors.danger,
    fontWeight: "500",
  },
  footerCard: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingTop: 10,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  footerTop: {
    gap: 4,
    marginBottom: 8,
  },
  footerCaption: {
    fontSize: 12,
    color: "#6B7280",
  },
  footerValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  buttonContainer: {
    gap: 6,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 14,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  warningButton: {
    backgroundColor: "#C2410C",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
