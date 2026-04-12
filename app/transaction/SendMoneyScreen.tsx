import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TransactionService } from '../../services/apiClient';
import { getTransferDraft, mergeTransferDraft } from '../../services/transferDraft';

type ExchangeData = {
  ExchangeRate: number;
  Margin: number;
  EffectiveRate: number;
  ProviderName: string | null;
  QuoteFee: number;
  QuoteTotalAmount: number;
  QuoteSendAmount: number;
  QuoteReceiveAmount: number;
};

type InputMode = 'send' | 'receive';

const MINIMUM_SEND_AMOUNT = 1;

const fallbackCurrencies: Record<string, string> = {
  Norway: 'NOK',
  Somalia: 'USD',
  Kenya: 'KES',
  Uganda: 'UGX',
  Tanzania: 'TZS',
};

const formatSummaryMoney = (amount: number, currency: string) =>
  `${Number(amount || 0).toFixed(2)} ${currency}`;

const formatInputMoney = (amount: number) => {
  if (!Number.isFinite(amount)) return '0';
  if (amount === 0) return '0';
  if (Math.abs(amount % 1) < 0.001) return String(Math.trunc(amount));
  return amount.toFixed(2);
};

const sanitizeNumericInput = (value: string) => {
  const cleaned = value.replace(/[^0-9.,]/g, '').replace(',', '.');
  if ((cleaned.match(/\./g) || []).length > 1) return null;
  return cleaned;
};

export default function SendMoneyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const transactionData = getTransferDraft();

  const fromCountry = transactionData.sendCountry || 'Norway';
  const deliveryCountry = transactionData.receivingCountry || 'Somalia';
  const fromCurrency = transactionData.sendCurrency || fallbackCurrencies[fromCountry] || 'NOK';
  const toCurrency = transactionData.receiveCurrency || fallbackCurrencies[deliveryCountry] || 'USD';

  const [sendAmount, setSendAmount] = useState(transactionData.sendAmount ? String(transactionData.sendAmount) : '');
  const [receiveAmount, setReceiveAmount] = useState(transactionData.receiveAmount ? String(transactionData.receiveAmount.toFixed(2)) : '');
  const [inputMode, setInputMode] = useState<InputMode>('send');
  const [loading, setLoading] = useState(false);
  const quoteRequestIdRef = useRef(0);

  const [exchangeData, setExchangeData] = useState<ExchangeData>({
    ExchangeRate: 0,
    Margin: 0,
    EffectiveRate: 0,
    ProviderName: null,
    QuoteFee: 0,
    QuoteTotalAmount: 0,
    QuoteSendAmount: 0,
    QuoteReceiveAmount: 0,
  });

  useEffect(() => {
    if (!fromCurrency || !toCurrency) return;

    const activeValue = inputMode === 'send' ? sendAmount : receiveAmount;
    const parsedActiveValue = parseFloat(activeValue);

    if (!activeValue || Number.isNaN(parsedActiveValue) || parsedActiveValue <= 0) {
      setExchangeData((current) => ({
        ...current,
        QuoteFee: 0,
        QuoteTotalAmount: 0,
        QuoteSendAmount: inputMode === 'send' ? 0 : current.QuoteSendAmount,
        QuoteReceiveAmount: inputMode === 'receive' ? 0 : current.QuoteReceiveAmount,
      }));
      return;
    }

    const requestId = ++quoteRequestIdRef.current;
    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);

        const rate = Number(exchangeData.EffectiveRate || exchangeData.ExchangeRate || 1) || 1;
        const quoteAmount =
          inputMode === 'send'
            ? parsedActiveValue
            : Math.max(parsedActiveValue / rate, MINIMUM_SEND_AMOUNT);

        const data = await TransactionService.createQuote({
          sendAmount: quoteAmount,
          sendCurrency: fromCurrency,
          receiveCurrency: toCurrency,
        });

        if (quoteRequestIdRef.current !== requestId) return;

        const nextSendAmount = Number(data.sendAmount || data.SendAmount || quoteAmount);
        const nextReceiveAmount = Number(data.receiveAmount || data.ReceiveAmount || 0);

        setExchangeData({
          ExchangeRate: Number(data.exchangeRate || data.ExchangeRate || 1),
          Margin: Number(data.margin || data.Margin || 0),
          EffectiveRate: Number(data.effectiveRate || data.EffectiveRate || data.exchangeRate || data.ExchangeRate || 1),
          ProviderName: data.providerName || data.ProviderName || null,
          QuoteFee: Number(data.fee || data.Fee || 0),
          QuoteTotalAmount: Number(data.totalAmount || data.TotalAmount || 0),
          QuoteSendAmount: nextSendAmount,
          QuoteReceiveAmount: nextReceiveAmount,
        });

        if (inputMode === 'send') {
          setReceiveAmount(formatInputMoney(nextReceiveAmount));
        } else {
          setSendAmount(formatInputMoney(nextSendAmount));
        }

        mergeTransferDraft({
          quoteId: data.quoteId || data.QuoteId || '',
        });
      } catch (error: any) {
        if (quoteRequestIdRef.current === requestId && error?.name !== 'AbortError') {
          Alert.alert('Quote unavailable', 'Could not refresh the latest rate. Default values are being used.');
        }
      } finally {
        if (quoteRequestIdRef.current === requestId) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [exchangeData.EffectiveRate, exchangeData.ExchangeRate, fromCurrency, inputMode, receiveAmount, sendAmount, toCurrency]);

  const handleAmountChange = (value: string, field: InputMode) => {
    const cleaned = sanitizeNumericInput(value);
    if (cleaned === null) return;

    if (field === 'send') {
      setSendAmount(cleaned);
      setInputMode('send');
    } else {
      setReceiveAmount(cleaned);
      setInputMode('receive');
    }
  };

  const { calculatedSendAmount, calculatedReceiveAmount, feeAmount, totalToPay } = useMemo(() => ({
    calculatedSendAmount: Number(parseFloat(sendAmount) || exchangeData.QuoteSendAmount || 0),
    calculatedReceiveAmount: Number(parseFloat(receiveAmount) || exchangeData.QuoteReceiveAmount || 0),
    feeAmount: Number(exchangeData.QuoteFee || 0),
    totalToPay: Number(exchangeData.QuoteTotalAmount || parseFloat(sendAmount) || 0),
  }), [exchangeData, receiveAmount, sendAmount]);

  useEffect(() => {
    mergeTransferDraft({
      exchangeRate: exchangeData.ExchangeRate || exchangeData.EffectiveRate || 1,
      fees: feeAmount,
      totalAmount: totalToPay,
      sendAmount: calculatedSendAmount,
      receiveAmount: calculatedReceiveAmount,
      receivingCountry: deliveryCountry,
      sendCountry: fromCountry,
      sendCurrency: fromCurrency,
      receiveCurrency: toCurrency,
      service: transactionData.service || 'MobileMoney',
      providerName: exchangeData.ProviderName || transactionData.providerName || '',
    });
  }, [
    calculatedReceiveAmount,
    calculatedSendAmount,
    deliveryCountry,
    exchangeData,
    feeAmount,
    fromCountry,
    fromCurrency,
    toCurrency,
    totalToPay,
    transactionData.providerName,
    transactionData.service,
  ]);

  const isFormValid = calculatedSendAmount >= MINIMUM_SEND_AMOUNT && !loading;
  const liveRate = Number(exchangeData.EffectiveRate || exchangeData.ExchangeRate || 1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 112 + Math.max(insets.bottom, 8) }]}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.85}>
            <Ionicons name="arrow-back" size={20} color="#222222" />
          </TouchableOpacity>

          <Text style={styles.screenLabel}>Sending to {deliveryCountry}</Text>

          <Text style={styles.title}>Transfer Amount</Text>

          <View style={styles.primaryReceiveCard}>
            <View style={styles.primaryReceiveContent}>
              <Text style={styles.primaryReceiveLabel}>They get</Text>
              <View style={styles.primaryReceiveAmountRow}>
                <TextInput
                  value={receiveAmount}
                  onChangeText={(value) => handleAmountChange(value, 'receive')}
                  onFocus={() => setInputMode('receive')}
                  keyboardType="decimal-pad"
                  placeholder={formatInputMoney(calculatedReceiveAmount)}
                  placeholderTextColor="#0A7A42"
                  style={styles.primaryReceiveInput}
                />
                <View style={styles.primaryReceiveCurrencyBadge}>
                  <CountryFlag country={deliveryCountry} />
                  <Text style={styles.primaryReceiveCurrency}>{toCurrency}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.amountStack}>
            <AmountCard
              country={fromCountry}
              currency={fromCurrency}
              label="You send"
              value={sendAmount}
              displayValue={formatInputMoney(calculatedSendAmount)}
              onChangeText={(value) => handleAmountChange(value, 'send')}
              onFocus={() => setInputMode('send')}
              compact
            />
          </View>

          <View style={styles.summaryPanel}>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Exchange rate</Text>
              <Text style={styles.costValue}>1 {fromCurrency} = {liveRate.toFixed(4)} {toCurrency}</Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Fee</Text>
              <Text style={styles.costValue}>{formatSummaryMoney(feeAmount, fromCurrency)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.costRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatSummaryMoney(totalToPay, fromCurrency)}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={[styles.footer, { bottom: Math.max(insets.bottom, 8) + 18 }]}>
          <TouchableOpacity
            style={[styles.nextButton, !isFormValid && styles.nextButtonDisabled]}
            onPress={() => router.push('/recipient/RecipientListScreen')}
            disabled={!isFormValid}
            activeOpacity={0.9}
          >
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.nextButtonText}>Confirm & Send</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function AmountCard({
  currency,
  country,
  label,
  value,
  displayValue,
  onChangeText,
  onFocus,
  compact,
}: {
  currency: string;
  country: string;
  label: string;
  value: string;
  displayValue: string;
  onChangeText: (value: string) => void;
  onFocus: () => void;
  compact?: boolean;
}) {
  return (
    <View style={[styles.amountCard, compact && styles.amountCardCompact]}>
      <View style={styles.amountCardHeader}>
        <Text style={styles.amountLabel}>{label}</Text>
        <Text style={styles.amountHint}>{country}</Text>
      </View>
      <View style={styles.amountInner}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          keyboardType="decimal-pad"
          placeholder={displayValue}
          placeholderTextColor="#181818"
          style={[styles.amountInput, compact && styles.amountInputCompact]}
        />
        <View style={styles.currencyBadge}>
          <CountryFlag country={country} />
          <Text style={styles.currencyCode}>{currency}</Text>
        </View>
      </View>
    </View>
  );
}

function CountryFlag({ country }: { country: string }) {
  if (country === 'Norway') {
    return (
      <View style={[styles.flagBox, styles.flagNorway]}>
        <View style={styles.flagNorwayVertical} />
        <View style={styles.flagNorwayHorizontal} />
      </View>
    );
  }

  if (country === 'Somalia') {
    return (
      <View style={[styles.flagBox, styles.flagSomalia]}>
        <Ionicons name="star" size={10} color="#FFFFFF" />
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
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#F7F8FA',
    marginBottom: 20,
  },
  screenLabel: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 8,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 24,
  },
  amountStack: {
    gap: 16,
    marginBottom: 20,
  },
  primaryReceiveCard: {
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    marginBottom: 16,
  },
  primaryReceiveContent: {
    width: '100%',
  },
  primaryReceiveLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  primaryReceiveAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  primaryReceiveInput: {
    flex: 1,
    padding: 0,
    fontSize: 31,
    lineHeight: 35,
    fontWeight: '800',
    color: '#0A7A42',
  },
  primaryReceiveCurrencyBadge: {
    minWidth: 92,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#E8F7EE',
  },
  primaryReceiveCurrency: {
    fontSize: 16,
    fontWeight: '700',
    color: '#15803D',
  },
  amountCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  amountCardCompact: {
    borderRadius: 20,
  },
  amountCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  amountHint: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  amountInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  amountInput: {
    flex: 1,
    padding: 0,
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
  },
  amountInputCompact: {
    fontSize: 34,
  },
  currencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 8,
  },
  currencyCode: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '700',
  },
  flagBox: {
    width: 24,
    height: 18,
    borderRadius: 4,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagNorway: {
    backgroundColor: '#ED3943',
  },
  flagNorwayVertical: {
    position: 'absolute',
    left: 6,
    width: 5,
    height: '100%',
    backgroundColor: '#1E4D99',
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  flagNorwayHorizontal: {
    position: 'absolute',
    top: 6,
    width: '100%',
    height: 4,
    backgroundColor: '#1E4D99',
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  flagSomalia: {
    backgroundColor: '#3B86DA',
  },
  flagDefault: {
    backgroundColor: '#D7E7F8',
  },
  flagText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#21507C',
  },
  footer: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
  },
  summaryPanel: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 14,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  costLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  costValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  totalLabel: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 22,
    color: '#111827',
    fontWeight: '800',
  },
  nextButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  nextButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
