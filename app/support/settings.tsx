import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { FintechScreenHeader, FintechSectionCard, fintechColors, fintechSpacing } from '../../components/ui/fintech';
import { ScrollScreen } from '../../components/ui/layout';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <ScrollScreen contentStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.85}>
        <Ionicons name="chevron-back" size={18} color={fintechColors.text} />
      </TouchableOpacity>

        <FintechScreenHeader
          eyebrow="PaySii"
          title="Settings"
          subtitle="Manage your preferences."
        />

        <FintechSectionCard style={styles.card}>
          <Text style={styles.label}>Notifications</Text>
          <Text style={styles.value}>Coming soon (placeholder)</Text>
        </FintechSectionCard>

      <FintechSectionCard style={styles.card}>
        <Text style={styles.label}>Language</Text>
        <Text style={styles.value}>English (EN) placeholder</Text>
      </FintechSectionCard>
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: fintechSpacing.sm, gap: fintechSpacing.md },
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
  card: { gap: fintechSpacing.xs },
  label: { fontSize: 12, fontWeight: '700', color: fintechColors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 },
  value: { fontSize: 14, fontWeight: '700', color: fintechColors.text },
});
