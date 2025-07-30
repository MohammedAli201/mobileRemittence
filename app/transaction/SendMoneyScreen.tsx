import React, { useEffect, useMemo, useState } from 'react';
import { useTransaction } from '../../context/TransactionContext';

import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { TransactionService } from '../../services/apiClient';
import currencyMap from '../CountryCurrencyCode.json';
import flagCodes from '../CountryFlagCodes.json';
import flagMap from '../flagMap';

export default function SendMoneyScreen() {
  const router = useRouter();
  const { transactionData, updateTransaction } = useTransaction();

  const fromCountry = 'Norway';
  const [deliveryService, setDeliveryService] = useState('Somalia.EVC');
  const [sendAmount, setSendAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');
  const [inputMode, setInputMode] = useState('send'); // 'send' or 'receive'
  const [onBehalf, setOnBehalf] = useState(false);
  const [loading, setLoading] = useState(false);

  const [exchangeData, setExchangeData] = useState({
    ExchangeRate: 0,
    Margin: 0,
    EffectiveRate: 0,
    FixedFee: 0, // Now this will be in the sender's currency
    MinimumFee: 0, // Now this will be in the sender's currency
    ProviderName: null,
  });

  const deliveryCountry = deliveryService.split('.')[0];
  const fromCurrency = currencyMap[fromCountry] || 'NOK';
  const toCurrency = currencyMap[deliveryCountry] || 'USD';

  const fromFlag = flagMap[flagCodes[fromCountry]?.toLowerCase()] || flagMap['us'];
  const toFlag = flagMap[flagCodes[deliveryCountry]?.toLowerCase()] || flagMap['us'];

  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (!fromCurrency || !toCurrency) return;

      setLoading(true);
      try {
        const data = await TransactionService.fetchExchangeRate(fromCurrency, toCurrency);

        if (!data || isNaN(Number(data.EffectiveRate))) throw new Error('Invalid API response');

        setExchangeData({
          ExchangeRate: Number(data.ExchangeRate),
          Margin: Number(data.Margin),
          EffectiveRate: Number(data.EffectiveRate),
          FixedFee: Number(data.FixedFee) || 2, // Default fee if not provided
          MinimumFee: Number(data.MinimumFee) || 0, // Default minimum fee if not provided
          ProviderName: data.ProviderName || null,
        });

       
      } catch (error) {
        console.warn('Exchange fetch failed:', error.message);
        Alert.alert('Notice', 'Could not fetch exchange rate. Default values will be used.');
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRate();
  }, [deliveryService]);

  const handleAmountChange = (text, field) => {
    // Remove any non-numeric characters except decimal point
    const cleanedText = text.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const decimalCount = cleanedText.split('.').length - 1;
    if (decimalCount > 1) return;
    
    // Prevent negative values
    if (cleanedText.startsWith('-')) return;
    
    if (field === 'send') {
      setSendAmount(cleanedText);
      setInputMode('send');
    } else {
      setReceiveAmount(cleanedText);
      setInputMode('receive');
    }
  };

  const { calculatedSendAmount, calculatedReceiveAmount, feeAmount, totalToPay } = useMemo(() => {
    const rate = Number(exchangeData.EffectiveRate);
    const exchange = Number(exchangeData.ExchangeRate);
    
    let numericSendAmount = 0;
    let numericReceiveAmount = 0;
    
    if (inputMode === 'send') {
      numericSendAmount = parseFloat(sendAmount) || 0;
      numericReceiveAmount = numericSendAmount * rate;
    } else {
      numericReceiveAmount = parseFloat(receiveAmount) || 0;
      numericSendAmount = numericReceiveAmount / rate;
    }
    
    // Calculate fee: Fixed fee for every 100 units of sender's currency
    const feeUnits = Math.floor(numericSendAmount / 100);
    let calculatedFeeAmount = feeUnits * exchangeData.FixedFee;
    
    // Ensure fee is not below minimum
    calculatedFeeAmount = Math.max(calculatedFeeAmount, exchangeData.MinimumFee);

    const calculatedTotalToPay = numericSendAmount + calculatedFeeAmount;

    return { 
      calculatedSendAmount: numericSendAmount,
      calculatedReceiveAmount: numericReceiveAmount,
      feeAmount: calculatedFeeAmount,
      totalToPay: calculatedTotalToPay
    };
  }, [sendAmount, receiveAmount, inputMode, exchangeData]);
useEffect(() => {
  updateTransaction({
    exchangeRate: exchangeData.ExchangeRate,
    fees: feeAmount,
    totalAmount: totalToPay,
    sendAmount: calculatedSendAmount,
    receiveAmount: calculatedReceiveAmount,
    sendCurrency: fromCurrency,
    receiveCurrency: toCurrency,
    sendCountry: fromCountry,
    receivingCountry: deliveryCountry,
    service: 'MobileMoney',
    providerName: exchangeData.ProviderName || '',
  });
}, [
  calculatedSendAmount,
  calculatedReceiveAmount,
  feeAmount,
  totalToPay,
  exchangeData,
  fromCurrency,
  toCurrency,
  fromCountry,
  deliveryCountry
]);

  const handleSendAmountFocus = () => {
    setInputMode('send');
  };

  const handleReceiveAmountFocus = () => {
    setInputMode('receive');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Send Money</Text>

      {!loading && (
        <Text style={styles.exchangeRateText}>
          1 {fromCurrency} = {exchangeData.EffectiveRate.toFixed(5)} {toCurrency}
        </Text>
      )}

      {/* From Country Input */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Image source={fromFlag} style={styles.flag} />
          <View>
            <Text style={styles.currency}>{fromCurrency}</Text>
            <Text style={styles.countryName}>{fromCountry}</Text>
          </View>
          <View style={{ flex: 1 }} />
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.hint}>You Send</Text>
            {loading ? (
              <ActivityIndicator size="small" color="#3498db" />
            ) : (
              <TextInput
                value={inputMode === 'send' ? sendAmount : calculatedSendAmount.toFixed(2)}
                onChangeText={(text) => handleAmountChange(text, 'send')}
                onFocus={handleSendAmountFocus}
                keyboardType="decimal-pad"
                placeholder="0.0"
                style={styles.amountInput}
              />
            )}
          </View>
        </View>
      </View>

      {/* Swap UI */}
      <View style={styles.swapWrapper}>
        <View style={styles.swapButton}>
          <Text style={styles.swapIcon}>⇅</Text>
        </View>
      </View>

      {/* To Country Display */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Image source={toFlag} style={styles.flag} />
          <View>
            <Text style={styles.currency}>{toCurrency}</Text>
            <Text style={styles.countryName}>{deliveryCountry}</Text>
          </View>
          <View style={{ flex: 1 }} />
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.hint}>They Receive</Text>
            {loading ? (
              <ActivityIndicator size="small" color="#3498db" />
            ) : (
              <TextInput
                value={inputMode === 'receive' ? receiveAmount : calculatedReceiveAmount.toFixed(2)}
                onChangeText={(text) => handleAmountChange(text, 'receive')}
                onFocus={handleReceiveAmountFocus}
                keyboardType="decimal-pad"
                placeholder="0.0"
                style={styles.amountInput}
              />
            )}
          </View>
        </View>
      </View>

      {/* Summary */}
      {!loading && (
        <View style={styles.summarySection}>
          <Text style={styles.summaryHeader}>Amount Summary</Text>
          <Text style={styles.promotionText}>Have a promotion code?</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>They Receive</Text>
            <Text style={styles.summaryValue}>{toCurrency} {calculatedReceiveAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>You Send</Text>
            <Text style={styles.summaryValue}>{fromCurrency} {calculatedSendAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Fees</Text>
            <Text style={styles.summaryValue}>{fromCurrency} {feeAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total To Pay</Text>
            <Text style={styles.summaryValue}>{fromCurrency} {totalToPay.toFixed(2)}</Text>
          </View>
        </View>
      )}

      {/* Switch */}
      <View style={styles.checkboxRow}>
        <Switch value={onBehalf} onValueChange={setOnBehalf} />
        <Text style={styles.checkboxText}>
          I am <Text style={{ fontWeight: 'bold' }}>NOT</Text> sending on behalf of others
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.continueBtn, (calculatedSendAmount <= 0) && { opacity: 0.5 }]}
        disabled={loading || calculatedSendAmount <= 0}
        onPress={() => {
          router.push("/recipient/RecipientListScreen")    
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.continueText}>Continue</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { fontSize: 20, fontWeight: '600', textAlign: 'center', marginBottom: 20 },
  exchangeRateText: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  card: { backgroundColor: '#f1f1f1', borderRadius: 10, padding: 12, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  flag: { width: 40, height: 30, resizeMode: 'contain', marginRight: 12 },
  currency: { fontSize: 14, fontWeight: 'bold' },
  countryName: { fontSize: 12, color: '#555' },
  hint: { fontSize: 12, color: '#888' },
  amountInput: {
    fontSize: 18,
    fontWeight: '600',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    width: 80,
    textAlign: 'right',
  },
  amount: { fontSize: 18, fontWeight: '600' },
  swapWrapper: { alignItems: 'center', marginVertical: 10 },
  swapButton: { backgroundColor: '#d1f0fc', padding: 10, borderRadius: 50 },
  swapIcon: { fontSize: 22, color: '#2980b9' },
  summarySection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  summaryHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  promotionText: { fontSize: 14, color: '#3498db', marginBottom: 15 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: { fontSize: 14, color: '#555' },
  summaryValue: { fontSize: 14, fontWeight: 'bold' },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  checkboxText: { marginLeft: 10, fontSize: 14 },
  continueBtn: {
    backgroundColor: '#2b6cb0',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  continueText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});