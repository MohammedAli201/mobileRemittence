import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  FintechChoiceCard,
  FintechPrimaryButton,
  FintechScreenHeader,
  FintechSectionCard,
  FintechSectionHeader,
  FintechStickyActionArea,
  fintechColors,
  fintechSpacing,
} from '../../components/ui/fintech';
import { Screen } from '../../components/ui/layout';
import { getTransferDraft, mergeTransferDraft } from '../../services/transferDraft';

type DeliveryProvider = {
  id: string;
  name: string;
  service: 'MobileMoney' | 'BankTransfer' | 'CashCollection';
  description?: string;
  available: boolean;
};

type CountryCatalog = { currency: string; mobile: DeliveryProvider[]; bank: DeliveryProvider[]; cash: DeliveryProvider[] };

const catalogs: Record<string, CountryCatalog> = {
  Somalia: {
    currency: 'USD',
    mobile: [
      { id: 'premier-wallet', name: 'Premier Wallet', service: 'MobileMoney', description: 'Fast mobile wallet delivery', available: true },
      { id: 'e-dahab', name: 'e-Dahab', service: 'MobileMoney', description: 'Popular for family support transfers', available: true },
      { id: 'hormuud-evc', name: 'Hormuud EVC Plus', service: 'MobileMoney', description: 'Delivered to the wallet balance', available: true },
    ],
    bank: [{ id: 'salam-bank', name: 'Salam Bank', service: 'BankTransfer', description: 'Deposit into recipient bank account', available: true }],
    cash: [{ id: 'juba-express', name: 'Juba Express', service: 'CashCollection', description: 'Pickup from trusted agent locations', available: true }],
  },
  Kenya: {
    currency: 'KES',
    mobile: [
      { id: 'mpesa', name: 'M-PESA', service: 'MobileMoney', description: 'Delivered to the M-PESA wallet', available: true },
      { id: 'airtel-kenya', name: 'Airtel Money', service: 'MobileMoney', description: 'Delivered to Airtel Money wallet', available: true },
    ],
    bank: [{ id: 'equity-bank', name: 'Equity Bank', service: 'BankTransfer', description: 'Bank deposit with account verification', available: true }],
    cash: [{ id: 'juba-express-kenya', name: 'Juba Express', service: 'CashCollection', description: 'Cash pickup at partner locations', available: true }],
  },
  Ethiopia: {
    currency: 'ETB',
    mobile: [{ id: 'telebirr', name: 'telebirr', service: 'MobileMoney', description: 'Delivered directly to telebirr', available: true }],
    bank: [{ id: 'salam-bank-ethiopia', name: 'Salam Bank', service: 'BankTransfer', description: 'Deposit into bank account', available: true }],
    cash: [{ id: 'juba-express-ethiopia', name: 'Juba Express', service: 'CashCollection', description: 'Pickup from supported agents', available: true }],
  },
  Uganda: {
    currency: 'UGX',
    mobile: [
      { id: 'airtel-uganda', name: 'Airtel Money', service: 'MobileMoney', description: 'Wallet delivery in minutes', available: true },
      { id: 'mtn-momo', name: 'MTN MoMo', service: 'MobileMoney', description: 'Sent to the MTN mobile wallet', available: true },
    ],
    bank: [{ id: 'salam-bank-uganda', name: 'Salam Bank', service: 'BankTransfer', description: 'Bank deposit with secure processing', available: true }],
    cash: [{ id: 'juba-express-uganda', name: 'Juba Express', service: 'CashCollection', description: 'Cash pickup at supported desks', available: true }],
  },
};

const sectionMeta = {
  mobile: { title: 'Mobile wallet', icon: 'phone-portrait-outline' as const },
  cash: { title: 'Cash pickup', icon: 'storefront-outline' as const },
  bank: { title: 'Bank deposit', icon: 'business-outline' as const },
};

export default function MobileMoneyScreen() {
  const router = useRouter();
  const transactionData = getTransferDraft();
  const receivingCountry = transactionData.receivingCountry || 'Somalia';
  const countryCatalog = catalogs[receivingCountry] || catalogs.Somalia;
  const [selectedProviderId, setSelectedProviderId] = useState(transactionData.provider || '');

  const selectedProvider = useMemo(
    () => [...countryCatalog.mobile, ...countryCatalog.bank, ...countryCatalog.cash].find((item) => item.id === selectedProviderId) || null,
    [countryCatalog, selectedProviderId],
  );

  const handleContinue = () => {
    if (!selectedProvider) return;
    mergeTransferDraft({
      provider: selectedProvider.name,
      providerName: selectedProvider.name,
      receivingCountry,
      receiveCurrency: countryCatalog.currency,
      service: selectedProvider.service,
      sendCountry: transactionData.sendCountry || 'Norway',
      sendCurrency: transactionData.sendCurrency || 'NOK',
    });
    router.push('/transaction/SendMoneyScreen');
  };

  return (
    <Screen contentStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.85}>
        <Ionicons name="chevron-back" size={18} color={fintechColors.text} />
      </TouchableOpacity>

      <FintechScreenHeader
        eyebrow="Delivery"
        title="How should the money arrive"
        subtitle="Choose a payout option."
        style={styles.headerCompact}
      />

      <ScrollView
        style={styles.listWrap}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <SectionBlock
          title={sectionMeta.mobile.title}
          icon={sectionMeta.mobile.icon}
          items={countryCatalog.mobile}
          selectedProviderId={selectedProviderId}
          onSelect={setSelectedProviderId}
        />
        <SectionBlock
          title={sectionMeta.cash.title}
          icon={sectionMeta.cash.icon}
          items={countryCatalog.cash}
          selectedProviderId={selectedProviderId}
          onSelect={setSelectedProviderId}
        />
        <SectionBlock
          title={sectionMeta.bank.title}
          icon={sectionMeta.bank.icon}
          items={countryCatalog.bank}
          selectedProviderId={selectedProviderId}
          onSelect={setSelectedProviderId}
        />
      </ScrollView>

      <FintechStickyActionArea style={styles.footer}>
        <FintechPrimaryButton label="Continue" onPress={handleContinue} disabled={!selectedProvider} />
      </FintechStickyActionArea>
    </Screen>
  );
}

function SectionBlock({
  title,
  icon,
  items,
  selectedProviderId,
  onSelect,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  items: DeliveryProvider[];
  selectedProviderId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <FintechSectionCard style={styles.sectionCard}>
      <FintechSectionHeader
        title={title}
        right={
          <View style={styles.sectionIcon}>
            <Ionicons name={icon} size={18} color={fintechColors.primary} />
          </View>
        }
        titleStyle={styles.sectionTitleCompact}
      />
      <View style={styles.sectionList}>
        {items.map((item) => (
          <FintechChoiceCard
            key={item.id}
            title={item.name}
            subtitle={item.description}
            icon={icon}
            selected={selectedProviderId === item.id}
            onPress={() => item.available && onSelect(item.id)}
            style={[
              styles.choiceCard,
              !item.available ? styles.disabledCard : undefined,
            ]}
            titleStyle={styles.choiceTitle}
            subtitleStyle={styles.choiceSubtitle}
          />
        ))}
      </View>
    </FintechSectionCard>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: fintechSpacing.sm },
  headerCompact: { marginBottom: fintechSpacing.xs },
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
  listWrap: { flex: 1, marginTop: fintechSpacing.xs },
  listContent: { gap: fintechSpacing.sm, paddingBottom: fintechSpacing.md },
  sectionCard: { gap: fintechSpacing.xs, padding: fintechSpacing.sm },
  sectionIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: fintechColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitleCompact: { fontSize: 14 },
  sectionList: { gap: fintechSpacing.xs },
  choiceCard: { minHeight: 50, paddingVertical: fintechSpacing.xs },
  choiceTitle: { fontSize: 13 },
  choiceSubtitle: { fontSize: 11, lineHeight: 14 },
  disabledCard: { opacity: 0.55 },
  footer: { paddingTop: fintechSpacing.md },
});
