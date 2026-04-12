import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text } from 'react-native';
import { fintechColors } from '../../components/ui/fintech';

export default function AuthenticateScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/(auth)/pin-entry');
  }, [router]);

  return (
    <SafeAreaView style={styles.loadingScreen}>
      <ActivityIndicator size="large" color={fintechColors.primary} />
      <Text style={styles.loadingBrand}>JubaPay</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: fintechColors.background,
  },
  loadingBrand: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: '800',
    color: fintechColors.primary,
    letterSpacing: 0.2,
  },
});
