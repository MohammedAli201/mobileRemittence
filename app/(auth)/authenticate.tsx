import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet } from 'react-native';
import { fintechColors } from '../../components/ui/fintech';

export default function AuthenticateScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/(auth)/pin-entry');
  }, [router]);

  return (
    <SafeAreaView style={styles.loadingScreen}>
      <ActivityIndicator size="large" color={fintechColors.primary} />
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
});
