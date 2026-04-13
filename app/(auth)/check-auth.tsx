import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { fintechColors } from '../../components/ui/fintech';
import { Screen } from '../../components/ui/layout';
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
        router.replace('/(auth)/welcome');
        return;
      }

      if (pinExists) {
        router.replace('/(auth)/pin-entry');
        return;
      }

      router.replace('/(auth)/login');
    };

    routeUser();
  }, [isLoading, router, user?.id]);

  return (
    <Screen contentStyle={styles.container}>
      <ActivityIndicator size="large" color={fintechColors.primary} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 0,
  },
});
