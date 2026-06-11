import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBackButton } from '@/components/app-back-button';
import {
  BACKGROUND_COLOR,
  BORDER_COLOR,
  BRAND_COLOR,
  FORM_WIDTH,
  HELPER_COLOR,
  LABEL_COLOR,
  PLACEHOLDER_COLOR,
} from '@/constants/auth-ui';
import { AuthError, recoverAccount } from '@/services/auth-service';

function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.includes('@') && trimmed.includes('.');
}

export default function RecoverScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasValidEmail = isValidEmail(email);
  const canSubmit = hasValidEmail && !isSubmitting;

  async function handleRecover() {
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await recoverAccount(email.trim());
      router.push('/recover-success');
    } catch (error) {
      if (error instanceof AuthError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          'Unable to reach the server. Start the mock API with npm run mock-api.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.topBar}>
        <AppBackButton fallbackRoute="/login" />
      </View>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.container}>
          <View style={styles.brandBlock}>
            <Text style={styles.brandTitle}>OnBoard</Text>
            <Text style={styles.brandSubtitle}>Account recovery</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="email@example.com"
                placeholderTextColor={PLACEHOLDER_COLOR}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isSubmitting}
                accessibilityLabel="Email"
              />
              <Text style={styles.helperText}>Enter your recovery email</Text>
            </View>

            {errorMessage ? (
              <Text style={styles.errorText} accessibilityRole="alert">
                {errorMessage}
              </Text>
            ) : null}

            <View style={styles.actionsRow}>
              <Pressable
                style={[
                  styles.primaryButton,
                  !canSubmit && styles.primaryButtonDisabled,
                ]}
                onPress={handleRecover}
                disabled={!canSubmit}
                accessibilityRole="button"
                accessibilityLabel="Recover account">
                {isSubmitting ? (
                  <ActivityIndicator color="#FEFEFF" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>Recover account</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  topBar: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
    paddingHorizontal: 61,
    paddingTop: 16,
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
  form: {
    width: FORM_WIDTH,
    alignSelf: 'center',
    gap: 14,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    color: LABEL_COLOR,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: LABEL_COLOR,
    backgroundColor: '#FFFFFF',
    minHeight: 37,
  },
  helperText: {
    color: HELPER_COLOR,
    fontSize: 12,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
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
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FEFEFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
