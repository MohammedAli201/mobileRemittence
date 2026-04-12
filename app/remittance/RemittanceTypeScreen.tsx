import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FintechProgress, fintechColors } from '../../components/ui/fintech';
import { getTransferDraft, mergeTransferDraft } from '../../services/transferDraft';

type CountryOption = {
  id: string;
  name: string;
  currency: string;
  flag: 'somalia' | 'kenya' | 'ethiopia' | 'uganda';
};

const countryOptions: CountryOption[] = [
  { id: 'somalia', name: 'Somalia', currency: 'USD', flag: 'somalia' },
  { id: 'kenya', name: 'Kenya', currency: 'KES', flag: 'kenya' },
  { id: 'ethiopia', name: 'Ethiopia', currency: 'ETB', flag: 'ethiopia' },
  { id: 'uganda', name: 'Uganda', currency: 'UGX', flag: 'uganda' },
];

export default function RemittanceTypeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const transactionData = getTransferDraft();
  const initialCountry =
    countryOptions.find((item) => item.name === transactionData.receivingCountry)?.id || 'somalia';
  const [selectedCountry, setSelectedCountry] = useState(initialCountry);

  const sendingLabel = useMemo(() => {
    const amount = Number(transactionData.sendAmount || 100).toFixed(2);
    const currency = transactionData.sendCurrency || 'USD';
    return `Sending ${amount} ${currency}`;
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
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) + 8 }]}>
        <FintechProgress step={1} total={5} label="Step 1: Destination country" />

        <Text style={styles.screenLabel}>Send money</Text>
        <Text style={styles.title}>Choose destination</Text>

        <View style={styles.countryList}>
          {countryOptions.map((country) => {
            const active = selectedCountry === country.id;

            return (
              <TouchableOpacity
                key={country.id}
                style={[styles.countryRow, active && styles.countryRowActive]}
                onPress={() => setSelectedCountry(country.id)}
                activeOpacity={0.9}
              >
                <View style={styles.countryLeft}>
                  <CountryFlag kind={country.flag} />
                  <View>
                    <Text style={[styles.countryName, active && styles.countryNameActive]}>{country.name}</Text>
                    <Text style={styles.countryMeta}>{country.currency}</Text>
                  </View>
                </View>
                <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
                  {active ? <View style={styles.radioInner} /> : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 8) + 8 }]}>
          <Text style={styles.footerAmount}>{sendingLabel}</Text>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleContinue}
            activeOpacity={0.9}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function CountryFlag({ kind }: { kind: CountryOption['flag'] }) {
  if (kind === 'somalia') {
    return (
      <View style={[styles.flagCircle, styles.flagSomalia]}>
        <Text style={styles.flagStar}>★</Text>
      </View>
    );
  }

  if (kind === 'kenya') {
    return (
      <View style={[styles.flagCircle, styles.flagKenya]}>
        <View style={styles.flagKenyaDark} />
        <View style={styles.flagKenyaRed} />
        <View style={styles.flagKenyaDark} />
      </View>
    );
  }

  if (kind === 'ethiopia') {
    return (
      <View style={[styles.flagCircle, styles.flagEthiopia]}>
        <View style={styles.flagEthiopiaGreen} />
        <View style={styles.flagEthiopiaYellow} />
        <View style={styles.flagEthiopiaRed} />
      </View>
    );
  }

  return (
    <View style={[styles.flagCircle, styles.flagUganda]}>
      <View style={styles.flagUgandaBlack} />
      <View style={styles.flagUgandaYellow} />
      <View style={styles.flagUgandaRed} />
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
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    marginTop: 24,
    marginBottom: 18,
  },
  screenLabel: {
    marginTop: 18,
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 18,
  },
  countryList: {
    flex: 1,
    gap: 12,
  },
  countryRow: {
    minHeight: 82,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  countryRowActive: {
    borderColor: '#BFDBFE',
    backgroundColor: '#F8FBFF',
  },
  countryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  countryName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  countryNameActive: {
    color: '#2563EB',
  },
  countryMeta: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 3,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#D3D8DF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: '#2563EB',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#EEF2F7',
    paddingTop: 12,
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  footerAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  nextButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  flagCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E4E4E4',
  },
  flagSomalia: {
    backgroundColor: '#3B86DA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagStar: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  flagKenya: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-evenly',
  },
  flagKenyaDark: {
    height: 8,
    backgroundColor: '#1F1F1F',
  },
  flagKenyaRed: {
    height: 8,
    backgroundColor: '#C93838',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#FFFFFF',
  },
  flagEthiopia: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-evenly',
  },
  flagEthiopiaGreen: {
    height: 8,
    backgroundColor: '#269B57',
  },
  flagEthiopiaYellow: {
    height: 8,
    backgroundColor: '#E2C94A',
  },
  flagEthiopiaRed: {
    height: 8,
    backgroundColor: '#D64E4E',
  },
  flagUganda: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-evenly',
  },
  flagUgandaBlack: {
    height: 8,
    backgroundColor: '#1F1F1F',
  },
  flagUgandaYellow: {
    height: 8,
    backgroundColor: '#F2D04D',
  },
  flagUgandaRed: {
    height: 8,
    backgroundColor: '#D14141',
  },
});
