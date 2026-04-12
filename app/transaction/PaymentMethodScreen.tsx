import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fintechColors } from '../../components/ui/fintech';
import { getTransferDraft, mergeTransferDraft } from '../../services/transferDraft';

const VISA_LOGO = require('../../assets/visa_card.png');
const MASTERCARD_LOGO = require('../../assets/master_card.png');

const formatMoney = (amount: number, currency: string) =>
  `${currency} ${Number(amount || 0).toFixed(2)}`;

export default function PaymentMethodScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const transactionData = getTransferDraft();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(transactionData.paymentMethod || null);

  const paymentMethods = useMemo(
    () => [
      { id: 'mastercard', name: 'MasterCard', logo: MASTERCARD_LOGO },
      { id: 'visa', name: 'Visa', logo: VISA_LOGO },
    ],
    []
  );

  const handleContinue = () => {
    if (!selectedMethod) return;

    mergeTransferDraft({ paymentMethod: selectedMethod });
    router.push('/transaction/MoneyTransferScreen');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) + 8 }]}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()} activeOpacity={0.85}>
            <Ionicons name="chevron-back" size={18} color="#A0A7B4" />
          </TouchableOpacity>
          <Text style={styles.title}>Select Payment Method</Text>
          <View style={styles.iconButtonPlaceholder} />
        </View>

        <View style={styles.list}>
          {paymentMethods.map((method) => {
            const selected = selectedMethod === method.id;

            return (
              <TouchableOpacity
                key={method.id}
                style={[styles.methodCard, selected && styles.methodCardSelected]}
                onPress={() => setSelectedMethod(method.id)}
                activeOpacity={0.9}
              >
                <View style={styles.methodLeft}>
                  <Image source={method.logo} style={styles.logo} resizeMode="contain" />
                  <Text style={styles.methodName}>{method.name}</Text>
                </View>
                <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
                  {selected ? <View style={styles.radioInner} /> : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 8) + 8 }]}>
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total To Pay</Text>
              <Text style={styles.totalValue}>{formatMoney(transactionData.totalAmount, transactionData.sendCurrency)}</Text>
          </View>

          <TouchableOpacity
            style={[styles.payButton, !selectedMethod && styles.payButtonDisabled]}
            onPress={handleContinue}
            disabled={!selectedMethod}
            activeOpacity={0.9}
          >
            <Text style={styles.payButtonText}>Pay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2F2B23',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#2F2B23',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 16,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  iconButtonPlaceholder: {
    width: 32,
    height: 32,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#F8F6F0',
    textAlign: 'center',
  },
  list: {
    flex: 1,
    gap: 14,
  },
  methodCard: {
    minHeight: 92,
    borderRadius: 20,
    backgroundColor: '#3A362B',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#4B453A',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  methodCardSelected: {
    borderColor: '#F4DF78',
    backgroundColor: '#4A4334',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  logo: {
    width: 42,
    height: 28,
  },
  methodName: {
    fontSize: 20,
    color: '#F8F6F0',
    fontWeight: '600',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#D4D9E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: fintechColors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: fintechColors.primary,
  },
  footer: {
    paddingTop: 8,
    backgroundColor: '#2F2B23',
    gap: 14,
  },
  totalCard: {
    height: 64,
    borderRadius: 20,
    backgroundColor: '#3A362B',
    borderWidth: 1,
    borderColor: '#4B453A',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 15,
    color: '#C9C1B2',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8F6F0',
  },
  payButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F4DF78',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  payButtonDisabled: {
    opacity: 0.55,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F2B23',
  },
});
