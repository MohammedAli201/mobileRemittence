import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import {
  FintechChoiceCard,
  FintechHeroCard,
  FintechPrimaryButton,
  FintechScreenHeader,
  FintechStatusPill,
  FintechTrustRow,
  fintechColors,
} from '../../components/ui/fintech';

type QuickLoginMethod = 'pin' | 'biometric';

export default function EnableQuickLoginScreen() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<QuickLoginMethod>('pin');

  const handleContinue = () => {
    router.replace({
      pathname: '/(auth)/setup-pin',
      params: { preferred: selectedMethod },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FintechScreenHeader
          eyebrow="Quick Login"
          title="Set up faster access"
          subtitle="Choose your preferred unlock method for future sessions."
          right={<FintechStatusPill icon="time-outline" label="30 sec setup" tone="info" />}
        />

        <FintechHeroCard
          title="Keep repeat sign-ins simple"
          subtitle="You will still confirm transfers and payments before money moves."
        >
          <View style={styles.options}>
            <FintechChoiceCard
              icon="keypad-outline"
              title="PIN only"
              subtitle="Reliable on every device."
              selected={selectedMethod === 'pin'}
              onPress={() => setSelectedMethod('pin')}
            />
            <FintechChoiceCard
              icon="finger-print-outline"
              title="Biometric + PIN"
              subtitle="Fastest unlock with PIN backup."
              selected={selectedMethod === 'biometric'}
              onPress={() => setSelectedMethod('biometric')}
            />
          </View>
        </FintechHeroCard>

        <FintechTrustRow
          icon="shield-checkmark-outline"
          title="Built for safe repeat access"
          text="This only affects device login. Sensitive transfer actions still require standard review."
        />

        <FintechPrimaryButton onPress={handleContinue}>
          Continue
        </FintechPrimaryButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: fintechColors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
    gap: 18,
  },
  options: {
    gap: 12,
  },
});
