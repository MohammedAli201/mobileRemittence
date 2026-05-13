import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  FintechPaymentMethodCard,
  FintechPrimaryButton,
  FintechProgress,
  FintechScreenHeader,
  FintechAmount,
  FintechTrustBadge,
  FintechStickyActionArea,
  fintechColors,
  fintechSpacing,
} from '../../components/ui/fintech';
import { Screen } from '../../components/ui/layout';
import { getTransferDraft, mergeTransferDraft } from '../../services/transferDraft';

const VISA_LOGO = require('../../assets/visa_card.png');
const MASTERCARD_LOGO = require('../../assets/master_card.png');
export default function PaymentMethodScreen() {
  const router = useRouter();
  const transactionData = getTransferDraft();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(transactionData.paymentMethod || null);

  const paymentMethods = useMemo(
    () => [
      { id: 'mastercard', name: 'Pay with Mastercard', subtitle: 'Enter your Mastercard in secure payment', logo: MASTERCARD_LOGO },
      { id: 'visa', name: 'Pay with Visa', subtitle: 'Enter your Visa card in secure payment', logo: VISA_LOGO },
    ],
    [],
  );

  const handleContinue = () => {
    if (!selectedMethod) return;
    mergeTransferDraft({ paymentMethod: selectedMethod });
    router.push('/transaction/MoneyTransferScreen');
  };

  return (
    <Screen contentStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.85}>
        <Ionicons name="chevron-back" size={18} color={fintechColors.text} />
      </TouchableOpacity>

      <FintechProgress step={6} total={6} label="Payment method" style={styles.progress} />
      <FintechScreenHeader
        eyebrow="Payment"
        title="Choose payment method"
        subtitle="Select how you want to pay. Card details are entered in the secure payment step."
      />

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <FintechTrustBadge icon="lock-closed-outline" label="Encrypted card entry" tone="info" />
          <FintechTrustBadge icon="document-text-outline" label="Review before charge" tone="neutral" />
        </View>

        {paymentMethods.map((method) => (
          <FintechPaymentMethodCard
            key={method.id}
            title={method.name}
            subtitle={method.subtitle}
            selected={selectedMethod === method.id}
            onPress={() => setSelectedMethod(method.id)}
            trailing={<Image source={method.logo} style={styles.logo} resizeMode="contain" />}
          />
        ))}
      </ScrollView>

      <FintechStickyActionArea style={styles.footer}>
        <View style={styles.footerMeta}>
          <Text style={styles.footerCaption}>Total to pay</Text>
          <FintechAmount amount={transactionData.totalAmount} currency={transactionData.sendCurrency || 'NOK'} size="title" />
        </View>
        <FintechPrimaryButton label="Continue to payment" onPress={handleContinue} disabled={!selectedMethod} />
      </FintechStickyActionArea>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: fintechSpacing.sm },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progress: { marginTop: fintechSpacing.md, marginBottom: fintechSpacing.md },
  banner: { flexDirection: 'row', flexWrap: 'wrap', gap: fintechSpacing.xs, marginTop: fintechSpacing.xs, marginBottom: fintechSpacing.sm },
  list: { flex: 1, marginTop: fintechSpacing.xs },
  listContent: { gap: fintechSpacing.md, paddingBottom: fintechSpacing.md },
  logo: { width: 46, height: 28 },
  footer: { paddingTop: fintechSpacing.md },
  footerMeta: { gap: 2 },
  footerCaption: { fontSize: 12, fontWeight: '800', color: fintechColors.textSubtle, textTransform: 'uppercase', letterSpacing: 0.6 },
});
