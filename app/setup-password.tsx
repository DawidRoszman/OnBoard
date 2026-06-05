import { Ionicons } from '@expo/vector-icons';
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

import {
  BACKGROUND_COLOR,
  BORDER_COLOR,
  BRAND_COLOR,
  FORM_WIDTH,
  HELPER_COLOR,
  LABEL_COLOR,
  MIN_PASSWORD_LENGTH,
  PASSWORD_HELPER_TEXT,
  PLACEHOLDER_COLOR,
} from '@/constants/auth-ui';
import { AuthError, setupPassword } from '@/services/auth-service';
import {
  clearPendingTemporaryPassword,
  getAuthUser,
  getPendingTemporaryPassword,
  setAuthUser,
} from '@/services/auth-session';

export default function SetupPasswordScreen() {
  const router = useRouter();
  const currentUser = getAuthUser();
  const temporaryPassword = getPendingTemporaryPassword();
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isRepeatPasswordVisible, setIsRepeatPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasValidPasswordLength = newPassword.length >= MIN_PASSWORD_LENGTH;
  const hasMatchingPasswords =
    newPassword.length > 0 && newPassword === repeatPassword;
  const canSubmit =
    hasValidPasswordLength &&
    hasMatchingPasswords &&
    !isSubmitting &&
    Boolean(currentUser?.username) &&
    Boolean(temporaryPassword);

  async function handleSetupPassword() {
    if (!canSubmit || !currentUser?.username || !temporaryPassword) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await setupPassword(
        currentUser.username,
        temporaryPassword,
        newPassword,
        repeatPassword,
      );

      setAuthUser(result.user);
      clearPendingTemporaryPassword();
      router.replace('/loading');
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

  if (!currentUser?.username || !temporaryPassword) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackText}>
            Password setup session expired. Please log in again.
          </Text>
          <Pressable
            style={styles.primaryButton}
            onPress={() => router.replace('/login')}
            accessibilityRole="button"
            accessibilityLabel="Go to login">
            <Text style={styles.primaryButtonText}>Go to login</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.container}>
          <View style={styles.brandBlock}>
            <Text style={styles.brandTitle}>OnBoard</Text>
            <Text style={styles.brandSubtitle}>Set your password</Text>
          </View>

          <Text style={styles.introText}>
            Welcome, {currentUser.displayName}. Create your password to finish
            onboarding.
          </Text>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="********************"
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  secureTextEntry={!isNewPasswordVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSubmitting}
                  accessibilityLabel="New password"
                />
                <Pressable
                  style={styles.visibilityButton}
                  onPress={() => setIsNewPasswordVisible((current) => !current)}
                  accessibilityLabel={
                    isNewPasswordVisible ? 'Hide password' : 'Show password'
                  }>
                  <Ionicons
                    name={
                      isNewPasswordVisible ? 'eye-off-outline' : 'eye-outline'
                    }
                    size={14}
                    color={PLACEHOLDER_COLOR}
                  />
                </Pressable>
              </View>
              <Text style={styles.helperText}>{PASSWORD_HELPER_TEXT}</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Repeat Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={repeatPassword}
                  onChangeText={setRepeatPassword}
                  placeholder="********************"
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  secureTextEntry={!isRepeatPasswordVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSubmitting}
                  accessibilityLabel="Repeat password"
                />
                <Pressable
                  style={styles.visibilityButton}
                  onPress={() =>
                    setIsRepeatPasswordVisible((current) => !current)
                  }
                  accessibilityLabel={
                    isRepeatPasswordVisible ? 'Hide password' : 'Show password'
                  }>
                  <Ionicons
                    name={
                      isRepeatPasswordVisible
                        ? 'eye-off-outline'
                        : 'eye-outline'
                    }
                    size={14}
                    color={PLACEHOLDER_COLOR}
                  />
                </Pressable>
              </View>
              <Text style={styles.helperText}>Password must be the same</Text>
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
                onPress={handleSetupPassword}
                disabled={!canSubmit}
                accessibilityRole="button"
                accessibilityLabel="Set password">
                {isSubmitting ? (
                  <ActivityIndicator color="#FEFEFF" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>Set password</Text>
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
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
    paddingHorizontal: 61,
    paddingTop: 48,
  },
  fallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  fallbackText: {
    color: LABEL_COLOR,
    fontSize: 16,
    textAlign: 'center',
  },
  brandBlock: {
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: 24,
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
  introText: {
    width: FORM_WIDTH,
    alignSelf: 'center',
    color: LABEL_COLOR,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
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
  passwordRow: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 36,
  },
  visibilityButton: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
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
    minWidth: 120,
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
