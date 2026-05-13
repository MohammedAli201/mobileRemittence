import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FintechScreenHeader, fintechColors, fintechSpacing } from '../../components/ui/fintech';
import { ScrollScreen } from '../../components/ui/layout';

const SETTINGS = [
  { label: 'Notifications', value: 'Coming soon' },
  { label: 'Language', value: 'English (EN)' },
];

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <ScrollScreen contentStyle={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.75} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="chevron-back" size={22} color={fintechColors.text} />
      </TouchableOpacity>

      <FintechScreenHeader eyebrow="JubaPay" title="Settings" subtitle="Manage your preferences." />

      <View>
        {SETTINGS.map((item, index) => (
          <View key={item.label} style={[styles.row, index > 0 && styles.rowDivider]}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.value}>{item.value}</Text>
          </View>
        ))}
      </View>
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: fintechSpacing.sm, gap: fintechSpacing.lg },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  row: {
    paddingVertical: fintechSpacing.md,
    gap: 4,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: fintechColors.border,
  },
  label: { fontSize: 12, fontWeight: '700', color: fintechColors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 },
  value: { fontSize: 15, fontWeight: '600', color: fintechColors.text },
});
