import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fintechColors } from '../../components/ui/fintech';
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
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()} activeOpacity={0.85}>
            <Ionicons name="chevron-back" size={18} color="#A0A7B4" />
          </TouchableOpacity>
          <Text style={styles.title}>Select Country</Text>
          <View style={styles.iconButtonPlaceholder} />
        </View>

        <Text style={styles.subtitle}>Choose where the transfer is going.</Text>

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
            style={[styles.nextButton, !selectedCountry && styles.nextButtonDisabled]}
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
        <Ionicons name="star" size={12} color="#FFFFFF" />
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
    marginBottom: 14,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4B453A',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3A362B',
  },
  iconButtonPlaceholder: {
    width: 32,
    height: 32,
  },
  title: {
    flex: 1,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    color: '#F8F6F0',
    textAlign: 'center',
    marginBottom: 0,
  },
  subtitle: {
    fontSize: 13,
    color: '#C9C1B2',
    marginBottom: 14,
  },
  countryList: {
    flex: 1,
    gap: 12,
  },
  countryRow: {
    minHeight: 82,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4B453A',
    backgroundColor: '#3A362B',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countryRowActive: {
    borderColor: '#F4DF78',
    backgroundColor: '#4A4334',
  },
  countryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  countryName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8F6F0',
  },
  countryNameActive: {
    color: '#F4DF78',
  },
  countryMeta: {
    fontSize: 13,
    color: '#C9C1B2',
    marginTop: 3,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#7A7263',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: '#F4DF78',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F4DF78',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#4B453A',
    paddingTop: 12,
    gap: 10,
    backgroundColor: '#2F2B23',
  },
  footerAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8F6F0',
  },
  nextButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F4DF78',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.55,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2F2B23',
  },
  flagCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#5D5647',
  },
  flagSomalia: {
    backgroundColor: '#3B86DA',
    alignItems: 'center',
    justifyContent: 'center',
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
