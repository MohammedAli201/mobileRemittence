import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  FintechChoiceCard,
  FintechPrimaryButton,
  FintechProgress,
  FintechScreenHeader,
  FintechSectionCard,
  FintechStatusPill,
  FintechStickyActionArea,
  fintechColors,
  fintechSpacing,
} from '../../components/ui/fintech';
import { Screen } from '../../components/ui/layout';
import { getTransferDraft, mergeTransferDraft } from '../../services/transferDraft';

const VISA_LOGO = require('../../assets/visa_card.png');
const MASTERCARD_LOGO = require('../../assets/master_card.png');
const formatMoney = (amount: number, currency: string) => `${Number(amount || 0).toFixed(2)} ${currency}`;

export default function PaymentMethodScreen() {
  const router = useRouter();
  const transactionData = getTransferDraft();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(transactionData.paymentMethod || null);

  const paymentMethods = useMemo(
    () => [
      { id: 'mastercard', name: 'MasterCard ending checkout', subtitle: 'Pay with your saved or new MasterCard', logo: MASTERCARD_LOGO },
      { id: 'visa', name: 'Visa ending checkout', subtitle: 'Pay with a Visa card in a secure checkout', logo: VISA_LOGO },
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
        title="Choose how you will pay"
        subtitle="Your final review comes next. The total and payment details will be shown again before checkout."
      />

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <FintechSectionCard style={styles.banner}>
          <View style={styles.statusRow}>
            <FintechStatusPill icon="lock-closed-outline" label="Secure checkout" tone="info" />
            <FintechStatusPill icon="card-outline" label="Card details handled in payment step" tone="neutral" />
          </View>
        </FintechSectionCard>

        {paymentMethods.map((method) => (
          <FintechChoiceCard
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
          <Text style={styles.footerValue}>{formatMoney(transactionData.totalAmount, transactionData.sendCurrency)}</Text>
        </View>
        <FintechPrimaryButton label="Continue" onPress={handleContinue} disabled={!selectedMethod} />
      </FintechStickyActionArea>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: fintechSpacing.sm },
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
  progress: { marginTop: fintechSpacing.md, marginBottom: fintechSpacing.md },
  banner: { marginTop: fintechSpacing.xs, marginBottom: fintechSpacing.sm },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: fintechSpacing.xs },
  list: { flex: 1, marginTop: fintechSpacing.xs },
  listContent: { gap: fintechSpacing.md, paddingBottom: fintechSpacing.md },
  logo: { width: 46, height: 28 },
  footer: { paddingTop: fintechSpacing.md },
  footerMeta: { gap: 2 },
  footerCaption: { fontSize: 12, fontWeight: '700', color: fintechColors.textSubtle, textTransform: 'uppercase', letterSpacing: 0.6 },
  footerValue: { fontSize: 18, fontWeight: '800', color: fintechColors.text },
});
