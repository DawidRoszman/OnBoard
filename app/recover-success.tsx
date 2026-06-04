import { Stack, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BACKGROUND_COLOR,
  BRAND_COLOR,
  FORM_WIDTH,
  MESSAGE_COLOR,
} from '@/constants/auth-ui';

export default function RecoverSuccessScreen() {
  const router = useRouter();

  function handleGoBack() {
    router.replace('/login');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.brandBlock}>
          <Text style={styles.brandTitle}>OnBoard</Text>
          <Text style={styles.brandSubtitle}>Account recovery</Text>
        </View>

        <Text style={styles.message}>
          If this email address is associated with an account, you will receive a
          password reset link shortly.
        </Text>

        <View style={styles.actionsRow}>
          <Pressable
            style={styles.primaryButton}
            onPress={handleGoBack}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <Text style={styles.primaryButtonText}>Go back</Text>
          </Pressable>
        </View>
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
    backgroundColor: BACKGROUND_COLOR,
    paddingHorizontal: 61,
    paddingTop: 48,
  },
  brandBlock: {
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: 34,
    width: FORM_WIDTH,
  },
  brandTitle: {
    color: BRAND_COLOR,
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 56,
  },
  brandSubtitle: {
    color: BRAND_COLOR,
    fontSize: 20,
    fontWeight: '400',
    marginTop: 4,
    textAlign: 'center',
  },
  message: {
    width: FORM_WIDTH,
    alignSelf: 'center',
    color: MESSAGE_COLOR,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  actionsRow: {
    width: FORM_WIDTH,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
  },
  primaryButton: {
    backgroundColor: BRAND_COLOR,
    borderRadius: 4,
    height: 36,
    minWidth: 71,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FEFEFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
