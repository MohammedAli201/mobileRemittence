import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  FintechPricingSummaryCard,
  FintechPrimaryButton,
  FintechScreenHeader,
  FintechSectionCard,
  FintechStickyActionArea,
  fintechColors,
  fintechSpacing,
} from '../../components/ui/fintech';
import { KeyboardScrollScreen, useScreenInsets } from '../../components/ui/layout';
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
const fallbackCurrencies: Record<string, string> = { Norway: 'NOK', Somalia: 'USD', Kenya: 'KES', Uganda: 'UGX', Tanzania: 'TZS', Ethiopia: 'ETB' };
const formatMoney = (amount: number, currency: string) => `${Number(amount || 0).toFixed(2)} ${currency}`;
const formatInputMoney = (amount: number) => (!Number.isFinite(amount) || amount === 0 ? '0' : Math.abs(amount % 1) < 0.001 ? String(Math.trunc(amount)) : amount.toFixed(2));
const sanitizeNumericInput = (value: string) => {
  const cleaned = value.replace(/[^0-9.,]/g, '').replace(',', '.');
  if ((cleaned.match(/\./g) || []).length > 1) return null;
  return cleaned;
};
const flagAssets: Record<string, number> = {
  no: require('../../assets/flags/no.png'),
  so: require('../../assets/flags/so.png'),
  ke: require('../../assets/flags/ke.png'),
  et: require('../../assets/flags/et.png'),
  ug: require('../../assets/flags/ug.png'),
  tz: require('../../assets/flags/tz.png'),
  xx: require('../../assets/flags/xx.png'),
};
const flagMap: Record<string, { label: string; asset: number }> = {
  Norway: { label: 'NO', asset: flagAssets.no },
  Somalia: { label: 'SO', asset: flagAssets.so },
  Kenya: { label: 'KE', asset: flagAssets.ke },
  Ethiopia: { label: 'ET', asset: flagAssets.et },
  Uganda: { label: 'UG', asset: flagAssets.ug },
  Tanzania: { label: 'TZ', asset: flagAssets.tz },
};

export default function SendMoneyScreen() {
  const router = useRouter();
  const { bottom } = useScreenInsets();
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
        const quoteAmount = inputMode === 'send' ? parsedActiveValue : Math.max(parsedActiveValue / rate, MINIMUM_SEND_AMOUNT);
        const data = await TransactionService.createQuote({ sendAmount: quoteAmount, sendCurrency: fromCurrency, receiveCurrency: toCurrency });
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

        mergeTransferDraft({ quoteId: data.quoteId || data.QuoteId || '' });
      } catch (error: any) {
        if (quoteRequestIdRef.current === requestId && error?.name !== 'AbortError') {
          Alert.alert('Quote unavailable', 'Could not refresh the latest rate right now. The previous values are still shown.');
        }
      } finally {
        if (quoteRequestIdRef.current === requestId) setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
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

  const { calculatedSendAmount, calculatedReceiveAmount, feeAmount, totalToPay } = useMemo(
    () => ({
      calculatedSendAmount: Number(parseFloat(sendAmount) || exchangeData.QuoteSendAmount || 0),
      calculatedReceiveAmount: Number(parseFloat(receiveAmount) || exchangeData.QuoteReceiveAmount || 0),
      feeAmount: Number(exchangeData.QuoteFee || 0),
      totalToPay: Number(exchangeData.QuoteTotalAmount || parseFloat(sendAmount) || 0),
    }),
    [exchangeData, receiveAmount, sendAmount],
  );

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
  }, [calculatedReceiveAmount, calculatedSendAmount, deliveryCountry, exchangeData, feeAmount, fromCountry, fromCurrency, toCurrency, totalToPay, transactionData.providerName, transactionData.service]);

  const isFormValid = calculatedSendAmount >= MINIMUM_SEND_AMOUNT && !loading;
  const fromFlag = flagMap[fromCountry] || { label: fromCountry.slice(0, 2).toUpperCase(), asset: flagAssets.xx };
  const toFlag = flagMap[deliveryCountry] || { label: deliveryCountry.slice(0, 2).toUpperCase(), asset: flagAssets.xx };

  return (
    <KeyboardScrollScreen contentStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.85}>
        <Ionicons name="chevron-back" size={18} color={fintechColors.text} />
      </TouchableOpacity>

      <FintechScreenHeader
        eyebrow="Amount"
        title="Set the transfer amount"
        subtitle="Choose how much to send and review the total."
      />

      <FintechSectionCard style={styles.amountCard}>
        <View style={styles.amountHeader}>
          <View style={styles.amountHeaderLeft}>
            <View style={styles.flagBadge}>
              <Image source={fromFlag.asset} style={styles.flagImage} />
            </View>
            <View style={styles.amountHeaderCopy}>
              <Text style={styles.currencyCode}>{fromCurrency}</Text>
              <Text style={styles.countryName}>{fromCountry}</Text>
            </View>
          </View>
          <View style={styles.amountHeaderRight}>
            <Text style={styles.amountLabel}>You send</Text>
          </View>
        </View>
        <View style={styles.inputRow}>
          <TextInput
            value={sendAmount}
            onChangeText={(value) => handleAmountChange(value, 'send')}
            onFocus={() => setInputMode('send')}
            keyboardType="decimal-pad"
            placeholder={formatInputMoney(calculatedSendAmount)}
            placeholderTextColor={fintechColors.textSubtle}
            style={styles.amountInput}
          />
          <View style={styles.currencyChip}>
            <Text style={styles.currencyChipText}>{fromCurrency}</Text>
          </View>
        </View>
      </FintechSectionCard>

      <View style={styles.ratePill}>
        <View style={styles.rateIcon}>
          <Text style={styles.rateIconText}>1</Text>
        </View>
        <Text style={styles.rateText}>
          {`1 ${fromCurrency} = ${Number(exchangeData.EffectiveRate || exchangeData.ExchangeRate || 1).toFixed(4)} ${toCurrency}`}
        </Text>
      </View>

      <FintechSectionCard style={styles.amountCard}>
        <View style={styles.amountHeader}>
          <View style={styles.amountHeaderLeft}>
            <View style={styles.flagBadge}>
              <Image source={toFlag.asset} style={styles.flagImage} />
            </View>
            <View style={styles.amountHeaderCopy}>
              <Text style={styles.currencyCode}>{toCurrency}</Text>
              <Text style={styles.countryName}>{deliveryCountry}</Text>
            </View>
          </View>
          <View style={styles.amountHeaderRight}>
            <Text style={styles.amountLabel}>They receive</Text>
          </View>
        </View>
        <View style={styles.inputRow}>
          <Text style={styles.amountValue}>{formatInputMoney(calculatedReceiveAmount)}</Text>
          <View style={styles.currencyChip}>
            <Text style={styles.currencyChipText}>{toCurrency}</Text>
          </View>
        </View>
      </FintechSectionCard>

      <FintechPricingSummaryCard
        title="Amount summary"
        items={[
          { label: 'They receive', value: formatMoney(calculatedReceiveAmount, toCurrency), tone: 'success' },
          { label: 'You send', value: formatMoney(calculatedSendAmount, fromCurrency) },
          { label: 'Fee', value: formatMoney(feeAmount, fromCurrency) },
        ]}
        totalLabel="Total to pay"
        totalValue={formatMoney(totalToPay, fromCurrency)}
        footerNote=""
      />

      <FintechStickyActionArea style={[styles.footer, { paddingBottom: bottom }]}>
        <FintechPrimaryButton label="Continue" onPress={() => router.push('/recipient/RecipientListScreen')} disabled={!isFormValid} />
      </FintechStickyActionArea>
    </KeyboardScrollScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: fintechSpacing.sm, paddingBottom: fintechSpacing.xxxl },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: fintechColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: fintechColors.surface,
  },
  amountCard: { gap: fintechSpacing.xs, paddingVertical: fintechSpacing.sm, paddingHorizontal: fintechSpacing.md },
  amountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: fintechSpacing.sm,
  },
  amountHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: fintechSpacing.sm },
  amountHeaderCopy: { gap: 2 },
  amountHeaderRight: { alignItems: 'flex-end' },
  amountLabel: { fontSize: 12, fontWeight: '700', color: fintechColors.textMuted },
  currencyCode: { fontSize: 16, fontWeight: '800', color: fintechColors.text },
  countryName: { fontSize: 12, color: fintechColors.textMuted },
  ratePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: fintechSpacing.sm,
    paddingHorizontal: fintechSpacing.md,
    paddingVertical: fintechSpacing.xs,
    borderRadius: 18,
    backgroundColor: fintechColors.surface,
    borderWidth: 1,
    borderColor: fintechColors.border,
  },
  rateIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: fintechColors.primarySoft,
  },
  rateIconText: { fontSize: 14, fontWeight: '800', color: fintechColors.primary },
  rateText: { fontSize: 12, fontWeight: '700', color: fintechColors.text },
  flagBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: fintechColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  inputLabel: { fontSize: 13, fontWeight: '700', color: fintechColors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: fintechSpacing.sm },
  amountInput: { flex: 1, fontSize: 24, lineHeight: 28, fontWeight: '800', color: fintechColors.text, paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false },
  amountValue: { flex: 1, fontSize: 24, lineHeight: 28, fontWeight: '800', color: fintechColors.text },
  currencyChip: {
    minWidth: 72,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: fintechColors.surfaceStrong,
    borderWidth: 1,
    borderColor: fintechColors.border,
  },
  currencyChipText: { fontSize: 13, fontWeight: '800', color: fintechColors.text },
  supportingText: { fontSize: 11, lineHeight: 14, color: fintechColors.textMuted },
  footer: { paddingTop: fintechSpacing.md, marginTop: fintechSpacing.xs },
});
