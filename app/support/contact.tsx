import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import {
  FintechScreenHeader,
  FintechSectionCard,
  fintechColors,
  fintechSpacing,
} from '../../components/ui/fintech';
import { ScrollScreen } from '../../components/ui/layout';

export default function ContactScreen() {
  const router = useRouter();

  return (
    <ScrollScreen contentStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.85}>
        <Ionicons name="chevron-back" size={18} color={fintechColors.text} />
      </TouchableOpacity>

      <FintechScreenHeader
        eyebrow="Support"
        title="Contact us"
        subtitle="We are here to help."
      />

      <FintechSectionCard style={styles.card}>
        <Text style={styles.label}>Phone</Text>
        <Text style={styles.value}>+47 000 00 000 (placeholder)</Text>
      </FintechSectionCard>

      <FintechSectionCard style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>support@jubapay.com (placeholder)</Text>
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
  value: { fontSize: 16, fontWeight: '700', color: fintechColors.text },
});
