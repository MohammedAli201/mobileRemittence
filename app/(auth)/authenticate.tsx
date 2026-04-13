import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { fintechColors, fintechSpacing } from '../../components/ui/fintech';
import { Screen } from '../../components/ui/layout';

export default function AuthenticateScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/(auth)/pin-entry');
  }, [router]);

  return (
    <Screen contentStyle={styles.loadingScreen}>
      <ActivityIndicator size="large" color={fintechColors.primary} />
      <Text style={styles.loadingBrand}>JubaPay</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  loadingBrand: {
    marginTop: fintechSpacing.sm,
    fontSize: 18,
    fontWeight: '800',
    color: fintechColors.primary,
    letterSpacing: 0.2,
  },
});
