import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  FintechPrimaryButton,
  FintechScreenHeader,
  FintechStickyActionArea,
  fintechColors,
  fintechRadius,
  fintechSpacing,
} from '../../components/ui/fintech';
import { Screen } from '../../components/ui/layout';
import { getTransferDraft, mergeTransferDraft } from '../../services/transferDraft';

type CountryOption = { id: string; name: string; currency: string; flag: 'somalia' | 'kenya' | 'ethiopia' | 'uganda' };

const countryOptions: CountryOption[] = [
  { id: 'somalia', name: 'Somalia', currency: 'USD', flag: 'somalia' },
  { id: 'kenya', name: 'Kenya', currency: 'KES', flag: 'kenya' },
  { id: 'ethiopia', name: 'Ethiopia', currency: 'ETB', flag: 'ethiopia' },
  { id: 'uganda', name: 'Uganda', currency: 'UGX', flag: 'uganda' },
];

export default function RemittanceTypeScreen() {
  const router = useRouter();
  const transactionData = getTransferDraft();
  const initialCountry = countryOptions.find((item) => item.name === transactionData.receivingCountry)?.id || 'somalia';
  const [selectedCountry, setSelectedCountry] = useState(initialCountry);

  const sendingLabel = useMemo(() => {
    const amount = Number(transactionData.sendAmount || 100).toFixed(2);
    const currency = transactionData.sendCurrency || 'NOK';
    return `${amount} ${currency} ready to send`;
  }, [transactionData.sendAmount, transactionData.sendCurrency]);

  const handleContinue = () => {
    const selected = countryOptions.find((item) => item.id === selectedCountry) || countryOptions[0];
    mergeTransferDraft({
      receivingCountry: selected.name,
      receiveCurrency: selected.currency,
      provider: '',
      service: '',
      sendCountry: transactionData.sendCountry || 'Norway',
      sendCurrency: transactionData.sendCurrency || 'NOK',
    });
    router.push('/remittance/MobileMoneyScreen');
  };

  return (
    <Screen contentStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.85}>
        <Ionicons name="chevron-back" size={18} color={fintechColors.text} />
      </TouchableOpacity>

      <FintechScreenHeader
        eyebrow="Destination"
        title="Where is this transfer going?"
        subtitle="Choose the receiving country."
      />

      <ScrollView
        style={styles.countryList}
        contentContainerStyle={styles.countryListContent}
        showsVerticalScrollIndicator={false}
      >
        {countryOptions.map((country) => {
          const active = selectedCountry === country.id;
          return (
            <TouchableOpacity
              key={country.id}
              style={[styles.countryCard, active && styles.countryCardActive]}
              onPress={() => setSelectedCountry(country.id)}
              activeOpacity={0.92}
            >
              <View style={styles.countryLeft}>
                <CountryFlag kind={country.flag} />
                <View style={styles.countryCopy}>
                  <Text style={styles.countryName}>{country.name}</Text>
                  <Text style={styles.countryMeta}>Recipient receives in {country.currency}</Text>
                </View>
              </View>
              <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
                {active ? <View style={styles.radioInner} /> : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FintechStickyActionArea style={styles.footer}>
        <FintechPrimaryButton label="Continue" onPress={handleContinue} />
      </FintechStickyActionArea>
    </Screen>
  );
}

function CountryFlag({ kind }: { kind: CountryOption['flag'] }) {
  if (kind === 'somalia') {
    return <View style={[styles.flagCircle, styles.flagSomalia]}><Ionicons name="star" size={13} color="#FFFFFF" /></View>;
  }
  if (kind === 'kenya') {
    return <View style={[styles.flagCircle, styles.flagKenya]}><View style={styles.flagKenyaDark} /><View style={styles.flagKenyaRed} /><View style={styles.flagKenyaDark} /></View>;
  }
  if (kind === 'ethiopia') {
    return <View style={[styles.flagCircle, styles.flagEthiopia]}><View style={styles.flagEthiopiaGreen} /><View style={styles.flagEthiopiaYellow} /><View style={styles.flagEthiopiaRed} /></View>;
  }
  return <View style={[styles.flagCircle, styles.flagUganda]}><View style={styles.flagUgandaBlack} /><View style={styles.flagUgandaYellow} /><View style={styles.flagUgandaRed} /></View>;
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
  countryList: { flex: 1, marginTop: fintechSpacing.sm },
  countryListContent: { gap: fintechSpacing.sm, paddingBottom: fintechSpacing.md },
  countryCard: {
    minHeight: 76,
    borderRadius: fintechRadius.lg,
    borderWidth: 1,
    borderColor: fintechColors.border,
    backgroundColor: fintechColors.surface,
    paddingHorizontal: fintechSpacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countryCardActive: { borderColor: fintechColors.primary, backgroundColor: fintechColors.primarySoft },
  countryLeft: { flexDirection: 'row', alignItems: 'center', gap: fintechSpacing.sm, flex: 1 },
  countryCopy: { flex: 1, gap: fintechSpacing.xs },
  countryName: { fontSize: 16, fontWeight: '800', color: fintechColors.text },
  countryMeta: { fontSize: 13, color: fintechColors.textMuted },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: fintechColors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: { borderColor: fintechColors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: fintechColors.primary },
  footer: { paddingTop: fintechSpacing.md },
  flagCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  flagSomalia: { backgroundColor: '#3B86DA', alignItems: 'center', justifyContent: 'center' },
  flagKenya: { backgroundColor: '#FFFFFF', justifyContent: 'space-evenly' },
  flagKenyaDark: { height: 10, backgroundColor: '#1F1F1F' },
  flagKenyaRed: { height: 10, backgroundColor: '#C93838', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#FFFFFF' },
  flagEthiopia: { backgroundColor: '#FFFFFF', justifyContent: 'space-evenly' },
  flagEthiopiaGreen: { height: 10, backgroundColor: '#269B57' },
  flagEthiopiaYellow: { height: 10, backgroundColor: '#E2C94A' },
  flagEthiopiaRed: { height: 10, backgroundColor: '#D64E4E' },
  flagUganda: { backgroundColor: '#FFFFFF', justifyContent: 'space-evenly' },
  flagUgandaBlack: { height: 10, backgroundColor: '#1F1F1F' },
  flagUgandaYellow: { height: 10, backgroundColor: '#F2D04D' },
  flagUgandaRed: { height: 10, backgroundColor: '#D14141' },
});
