import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet } from 'react-native';
import { fintechColors } from '../../components/ui/fintech';
import { useUser } from '../../context/UserContext';
import AuthService from '../../services/AuthHelpers';

export default function CheckAuthScreen() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (isLoading) return;

    const routeUser = async () => {
      const pinExists = await AuthService.pinExists();

      if (!user?.id) {
        router.replace('/(auth)/login');
        return;
      }

      if (pinExists) {
        router.replace('/(auth)/pin-entry');
        return;
      }

      router.replace('/(auth)/enable-quick-login');
    };

    routeUser();
  }, [isLoading, router, user?.id]);

  return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator size="large" color={fintechColors.primary} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: fintechColors.background,
  },
});
