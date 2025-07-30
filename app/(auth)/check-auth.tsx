import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { useUser } from '../../context/UserContext';
import AuthService from '../../services/AuthHelpers';

export default function CheckAuthScreen() {
  const router = useRouter();
  const { user } = useUser(); // user.id is required for checking PIN

  useEffect(() => {
    const checkAuth = async () => {
      if (!user?.id) {
        router.replace('/(auth)/login');
        // await AsyncStorage.setItem('hasQuickLogin', 'true');

        return;
      }
      Alert.alert('Login Failed', user.id);

const pinExists = await AuthService.pinExists();
      if (pinExists) {
        router.replace('/(auth)/authenticate');
      } else {
        router.replace('/(auth)/setup-pin'); // 👈 required setup path
      }
    };

    checkAuth();
  }, [user]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
