import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppLoadingState } from '@/components/app-loading-state';
import { BACKGROUND_COLOR } from '@/constants/auth-ui';

const LOADING_DURATION_MS = 1000;

export default function LoadingScreen() {
  const router = useRouter();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      router.replace('/(tabs)/schedule');
    }, LOADING_DURATION_MS);

    return () => clearTimeout(timeoutId);
  }, [router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <AppLoadingState message="Getting on board" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
});
