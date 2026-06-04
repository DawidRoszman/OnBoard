import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BACKGROUND_COLOR, BRAND_COLOR } from '@/constants/auth-ui';

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
      <View style={styles.container}>
        <Text style={styles.message}>Getting on board</Text>
        <ActivityIndicator color={BRAND_COLOR} size="small" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  message: {
    color: BRAND_COLOR,
    fontSize: 20,
    fontWeight: '400',
  },
});
