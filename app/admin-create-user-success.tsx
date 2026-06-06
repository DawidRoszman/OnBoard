import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BACKGROUND_COLOR,
  BRAND_COLOR,
  FORM_WIDTH,
  LABEL_COLOR,
  MESSAGE_COLOR,
} from '@/constants/auth-ui';

export default function AdminCreateUserSuccessScreen() {
  const router = useRouter();
  const { username, temporaryPassword } = useLocalSearchParams<{
    username?: string;
    temporaryPassword?: string;
  }>();
  const [hasCopiedCredentials, setHasCopiedCredentials] = useState(false);

  function handleGoBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)/schedule');
  }

  async function handleCopyCredentials() {
    const credentialLines = [
      username ? `Username: ${username}` : null,
      temporaryPassword ? `Temporary password: ${temporaryPassword}` : null,
    ].filter((line): line is string => line !== null);

    if (credentialLines.length === 0) {
      return;
    }

    await Clipboard.setStringAsync(credentialLines.join('\n'));
    setHasCopiedCredentials(true);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.navBar}>
        <Pressable
          style={styles.navBackButton}
          onPress={handleGoBack}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={20} color={BRAND_COLOR} />
        </Pressable>
      </View>

      <View style={styles.container}>
        <View style={styles.brandBlock}>
          <Text style={styles.brandTitle}>OnBoard</Text>
          <Text style={styles.brandSubtitle}>Create new user</Text>
        </View>

        <Text style={styles.message}>
          New user has been created. Share these credentials with the user for
          their first login.
        </Text>

        {username ? (
          <View style={styles.credentialsBlock}>
            <Text style={styles.credentialLabel}>Username</Text>
            <Text style={styles.credentialValue}>{username}</Text>
          </View>
        ) : null}

        {temporaryPassword ? (
          <View style={styles.credentialsBlock}>
            <Text style={styles.credentialLabel}>Temporary password</Text>
            <Text style={styles.credentialValue}>{temporaryPassword}</Text>
          </View>
        ) : null}

        <View style={styles.actionsRow}>
          <Pressable
            style={styles.primaryButton}
            onPress={handleCopyCredentials}
            accessibilityRole="button"
            accessibilityLabel="Copy credentials">
            <Text style={styles.primaryButtonText}>
              {hasCopiedCredentials ? 'Copied' : 'Copy credentials'}
            </Text>
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
  navBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  navBackButton: {
    width: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
    paddingHorizontal: 61,
    paddingTop: 8,
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
    marginBottom: 20,
  },
  credentialsBlock: {
    width: FORM_WIDTH,
    alignSelf: 'center',
    marginBottom: 12,
    gap: 4,
  },
  credentialLabel: {
    color: LABEL_COLOR,
    fontSize: 12,
    fontWeight: '500',
  },
  credentialValue: {
    color: MESSAGE_COLOR,
    fontSize: 16,
    fontWeight: '600',
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
