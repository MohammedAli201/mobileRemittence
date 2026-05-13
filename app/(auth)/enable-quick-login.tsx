import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ScrollScreen } from "../../components/ui/layout";
import {
  FintechChoiceCard,
  FintechHeroCard,
  FintechPrimaryButton,
  FintechScreenHeader,
  FintechStatusPill,
  FintechTrustRow,
  fintechColors,
  fintechSpacing,
} from "../../components/ui/fintech";

type QuickLoginMethod = "pin" | "biometric";

export default function EnableQuickLoginScreen() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<QuickLoginMethod>("pin");

  const handleContinue = () => {
    router.replace({
      pathname: "/(auth)/setup-pin",
      params: { preferred: selectedMethod },
    });
  };

  return (
    <ScrollScreen contentStyle={styles.scrollContainer}>
        <FintechScreenHeader
          eyebrow="Quick Login"
          title="Set up faster access"
          subtitle="Choose your preferred unlock method for future sessions."
          right={
            <FintechStatusPill
              icon="time-outline"
              label="30 sec setup"
              tone="info"
            />
          }
          titleStyle={styles.headerTitle}
          subtitleStyle={styles.headerSubtitle}
        />

        <FintechHeroCard
          title="Keep repeat sign-ins simple"
          subtitle="You still confirm transfers and payments before money moves."
        >
          <View style={styles.options}>
            <FintechChoiceCard
              icon="keypad-outline"
              title="PIN only"
              subtitle="Reliable on every device."
              selected={selectedMethod === "pin"}
              onPress={() => setSelectedMethod("pin")}
            />
            <FintechChoiceCard
              icon="finger-print-outline"
              title="Biometric + PIN"
              subtitle="Fastest unlock with PIN backup."
              selected={selectedMethod === "biometric"}
              onPress={() => setSelectedMethod("biometric")}
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

        <TouchableOpacity
          onPress={() => router.replace("/transaction/RecentTransactions")}
          style={styles.skipButton}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    justifyContent: "space-between",
    gap: fintechSpacing.lg,
  },
  headerTitle: {
    fontSize: 20,
    lineHeight: 24,
  },
  headerSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  options: {
    gap: fintechSpacing.sm,
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: fintechSpacing.sm,
  },
  skipText: {
    fontSize: 14,
    color: fintechColors.textMuted,
    fontWeight: "500",
  },
});
