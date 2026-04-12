import { usePathname, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useUser } from '../context/UserContext';
import AuthService from '../services/AuthHelpers';

export default function AppResumeLock() {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const { user, isLoading } = useUser();
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = async (nextState: AppStateStatus) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextState;

      const returnedToForeground =
        (previousState === 'background' || previousState === 'inactive') &&
        nextState === 'active';

      if (!returnedToForeground || isLoading || !user?.id) {
        return;
      }

      const insideAuthFlow = segments[0] === '(auth)';
      const alreadyOnUnlockScreen =
        pathname === '/(auth)/authenticate' || pathname === '/(auth)/pin-entry';

      if (insideAuthFlow || alreadyOnUnlockScreen) {
        return;
      }

      const pinExists = await AuthService.pinExists();
      if (!pinExists) {
        return;
      }

      router.replace('/(auth)/authenticate');
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [isLoading, pathname, router, segments, user?.id]);

  return null;
}
