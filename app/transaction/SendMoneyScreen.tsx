import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  FintechExchangeRateRow,
  FintechInlineMessage,
  FintechPrimaryButton,
  FintechScreenHeader,
  FintechSectionCard,
  FintechStickyActionArea,
  FintechTransactionSummaryCard,
  formatMoney,
  fintechColors,
  fintechSpacing,
} from '../../components/ui/fintech';
import { Screen, useResponsiveMetrics, useScreenInsets } from '../../components/ui/layout';
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
  Ethiopia: 'ETB',
};

const formatInputMoney = (amount: number) =>
  !Number.isFinite(amount) || amount === 0
    ? '0'
    : Math.abs(amount % 1) < 0.001
      ? String(Math.trunc(amount))
      : amount.toFixed(2);

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
  const { top, bottom } = useScreenInsets();
  const { isSmallPhone } = useResponsiveMetrics();
  const transactionData = getTransferDraft();

  const fromCountry = transactionData.sendCountry || 'Norway';
  const deliveryCountry = transactionData.receivingCountry || 'Somalia';
  const fromCurrency = transactionData.sendCurrency || fallbackCurrencies[fromCountry] || 'NOK';
  const toCurrency = transactionData.receiveCurrency || fallbackCurrencies[deliveryCountry] || 'USD';
  const recipientName = [transactionData.recipient.firstName, transactionData.recipient.lastName]
    .filter(Boolean)
    .join(' ');
  const isRepeatFlow = transactionData.entryPoint === 'repeat_send';
  const hasRecipient = Boolean(recipientName || transactionData.recipient.phoneNumber);

  const suggestedAmounts = useMemo(() => {
    if (!isRepeatFlow) return [];
    const baseAmount = Number(transactionData.sendAmount || 0);
    if (baseAmount <= 0) return [];

    const roundedBase = Math.round(baseAmount);
    return Array.from(new Set([baseAmount, roundedBase, roundedBase + 100])).filter(
      (value) => value >= MINIMUM_SEND_AMOUNT,
    ).slice(0, 3);
  }, [isRepeatFlow, transactionData.sendAmount]);

  const [sendAmount, setSendAmount] = useState(
    transactionData.sendAmount ? String(transactionData.sendAmount) : '',
  );
  const [receiveAmount, setReceiveAmount] = useState(
    transactionData.receiveAmount ? String(transactionData.receiveAmount.toFixed(2)) : '',
  );
  const [inputMode, setInputMode] = useState<InputMode>('send');
  const [loading, setLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
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
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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
          EffectiveRate: Number(
            data.effectiveRate ||
              data.EffectiveRate ||
              data.exchangeRate ||
              data.ExchangeRate ||
              1,
          ),
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
          Alert.alert(
            'Quote unavailable',
            'Could not refresh the latest rate right now. The previous values are still shown.',
          );
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
  const fromFlag = flagMap[fromCountry] || {
    label: fromCountry.slice(0, 2).toUpperCase(),
    asset: flagAssets.xx,
  };
  const toFlag = flagMap[deliveryCountry] || {
    label: deliveryCountry.slice(0, 2).toUpperCase(),
    asset: flagAssets.xx,
  };

  const handleContinue = () => {
    if (!isFormValid) return;
    router.push(
      isRepeatFlow && hasRecipient
        ? '/transaction/PaymentMethodScreen'
        : '/recipient/RecipientListScreen',
    );
  };

  const content = (
    <View style={styles.mainContent}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.85}>
        <Ionicons name="chevron-back" size={18} color={fintechColors.text} />
      </TouchableOpacity>

      <FintechScreenHeader
        eyebrow="Amount"
        title="Set the transfer amount"
        style={styles.header}
      />

      {isRepeatFlow && hasRecipient ? (
        <FintechSectionCard style={styles.repeatRecipientCard}>
          <View style={styles.repeatRecipientHeader}>
            <View style={styles.repeatRecipientIcon}>
              <Ionicons name="repeat" size={16} color={fintechColors.primary} />
            </View>
            <View style={styles.repeatRecipientCopy}>
              <Text style={styles.repeatRecipientLabel}>Repeat transfer</Text>
              <Text style={styles.repeatRecipientName}>{recipientName || 'Saved recipient'}</Text>
              <Text style={styles.repeatRecipientMeta}>
                {[transactionData.recipient.phoneNumber, deliveryCountry, transactionData.provider || transactionData.service]
                  .filter(Boolean)
                  .join(' - ')}
              </Text>
            </View>
          </View>

          {suggestedAmounts.length ? (
            <View style={styles.amountSuggestionsRow}>
              {suggestedAmounts.map((amount) => {
                const active = Number(calculatedSendAmount.toFixed(2)) === Number(amount.toFixed(2));
                return (
                  <TouchableOpacity
                    key={amount}
                    style={[
                      styles.amountSuggestionChip,
                      active && styles.amountSuggestionChipActive,
                    ]}
                    onPress={() => {
                      setSendAmount(formatInputMoney(amount));
                      setInputMode('send');
                    }}
                    activeOpacity={0.9}
                  >
                    <Text
                      style={[
                        styles.amountSuggestionText,
                        active && styles.amountSuggestionTextActive,
                      ]}
                    >
                      {formatMoney(amount, fromCurrency)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}
        </FintechSectionCard>
      ) : null}

      <View style={styles.cardsColumn}>
        <FintechSectionCard style={[styles.amountCard, inputMode === 'send' && styles.amountCardActive]}>
          <View style={[styles.amountHeader, isSmallPhone && styles.amountHeaderStack]}>
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
          <View style={[styles.inputRow, isSmallPhone && styles.inputRowWrap]}>
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

        <FintechExchangeRateRow
          label="Exchange rate"
          value={`1 ${fromCurrency} = ${Number(
            exchangeData.EffectiveRate || exchangeData.ExchangeRate || 1,
          ).toFixed(4)} ${toCurrency}`}
          style={styles.exchangeCard}
        />

        <FintechSectionCard style={[styles.amountCard, inputMode === 'receive' && styles.amountCardActive]}>
          <View style={[styles.amountHeader, isSmallPhone && styles.amountHeaderStack]}>
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
              <Text style={styles.amountLabel}>Recipient gets</Text>
            </View>
          </View>
          <View style={[styles.inputRow, isSmallPhone && styles.inputRowWrap]}>
            <TextInput
              value={receiveAmount}
              onChangeText={(value) => handleAmountChange(value, 'receive')}
              onFocus={() => setInputMode('receive')}
              keyboardType="decimal-pad"
              placeholder={formatInputMoney(calculatedReceiveAmount)}
              placeholderTextColor={fintechColors.textSubtle}
              style={styles.amountInput}
            />
            <View style={styles.currencyChip}>
              <Text style={styles.currencyChipText}>{toCurrency}</Text>
            </View>
          </View>
        </FintechSectionCard>

        <FintechTransactionSummaryCard
          title="Amount summary"
          items={[
            { label: 'You send', value: formatMoney(calculatedSendAmount, fromCurrency) },
            { label: 'Fee', value: formatMoney(feeAmount, fromCurrency) },
            { label: 'Recipient gets', value: formatMoney(calculatedReceiveAmount, toCurrency), valueTone: 'success' },
          ]}
          totalLabel="Total to pay"
          totalValue={formatMoney(totalToPay, fromCurrency)}
          style={styles.summaryCard}
        />
      </View>

      {isRepeatFlow && hasRecipient ? (
        <FintechInlineMessage
          tone="success"
          title="Ready for confirmation"
          text="Your saved recipient is already selected. Continue to final review before payment."
        />
      ) : null}
    </View>
  );

  return (
    <Screen contentStyle={styles.screenContent}>
      <View style={styles.shell}>
        {Platform.OS === 'ios' ? (
          <KeyboardAvoidingView
            style={styles.keyboardWrap}
            behavior="padding"
            keyboardVerticalOffset={Math.max(top - fintechSpacing.sm, 0)}
          >
            {content}
          </KeyboardAvoidingView>
        ) : (
          <View style={styles.keyboardWrap}>{content}</View>
        )}

        {!keyboardVisible ? (
          <FintechStickyActionArea style={[styles.footer, { paddingBottom: Math.max(bottom - fintechSpacing.md, fintechSpacing.sm) }]}>
            <FintechPrimaryButton
              label={isRepeatFlow && hasRecipient ? 'Choose payment method' : 'Continue to recipient'}
              onPress={handleContinue}
              disabled={!isFormValid}
              style={styles.ctaButton}
              textStyle={styles.ctaButtonText}
            />
          </FintechStickyActionArea>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
    paddingBottom: 0,
    gap: 0,
  },
  keyboardWrap: {
    flex: 1,
  },
  shell: {
    flex: 1,
    minHeight: 0,
  },
  mainContent: {
    flex: 1,
    gap: fintechSpacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginTop: fintechSpacing.xs,
  },
  cardsColumn: {
    gap: fintechSpacing.xs,
  },
  amountCard: {
    gap: fintechSpacing.xs,
    paddingVertical: fintechSpacing.sm,
    paddingHorizontal: fintechSpacing.md,
    borderColor: fintechColors.borderStrong,
  },
  amountCardActive: {
    borderColor: fintechColors.primary,
  },
  repeatRecipientCard: {
    gap: fintechSpacing.sm,
    paddingVertical: fintechSpacing.sm,
  },
  repeatRecipientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: fintechSpacing.sm,
  },
  repeatRecipientIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: fintechColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repeatRecipientCopy: {
    flex: 1,
    gap: 2,
  },
  repeatRecipientLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: fintechColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  repeatRecipientName: {
    fontSize: 15,
    fontWeight: '800',
    color: fintechColors.text,
  },
  repeatRecipientMeta: {
    fontSize: 12,
    color: fintechColors.textMuted,
  },
  amountSuggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: fintechSpacing.xs,
  },
  amountSuggestionChip: {
    minHeight: 34,
    borderRadius: 17,
    paddingHorizontal: fintechSpacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: fintechColors.border,
    backgroundColor: fintechColors.surfaceStrong,
  },
  amountSuggestionChipActive: {
    backgroundColor: fintechColors.primarySoft,
    borderColor: fintechColors.primary,
  },
  amountSuggestionText: {
    fontSize: 12,
    fontWeight: '700',
    color: fintechColors.text,
  },
  amountSuggestionTextActive: {
    color: fintechColors.primaryStrong,
  },
  amountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: fintechSpacing.xs,
  },
  amountHeaderStack: {
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  amountHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: fintechSpacing.sm,
  },
  amountHeaderCopy: {
    gap: 1,
  },
  amountHeaderRight: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: fintechColors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  currencyCode: {
    fontSize: 18,
    fontWeight: '800',
    color: fintechColors.text,
  },
  countryName: {
    fontSize: 12,
    color: fintechColors.textMuted,
  },
  flagBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: fintechColors.border,
  },
  flagImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: fintechSpacing.sm,
    minHeight: 48,
  },
  inputRowWrap: {
    flexWrap: 'nowrap',
  },
  amountInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
    color: fintechColors.text,
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  currencyChip: {
    minWidth: 68,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: fintechColors.surfaceStrong,
    borderWidth: 1,
    borderColor: fintechColors.border,
  },
  currencyChipText: {
    fontSize: 13,
    fontWeight: '800',
    color: fintechColors.text,
  },
  exchangeCard: {
    borderRadius: 18,
    paddingVertical: fintechSpacing.sm,
  },
  summaryCard: {
    borderRadius: 20,
    borderColor: fintechColors.borderStrong,
  },
  footer: {
    paddingTop: fintechSpacing.md,
  },
  ctaButton: {
    minHeight: 56,
    borderRadius: 18,
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
