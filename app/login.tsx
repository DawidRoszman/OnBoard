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
import { AuthError, login } from '@/services/auth-service';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasValidPasswordLength = password.length >= MIN_PASSWORD_LENGTH;
  const canSubmit =
    username.trim().length > 0 &&
    hasValidPasswordLength &&
    !isSubmitting;

  async function handleLogin() {
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await login(username.trim(), password);
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

  function handleRecoverAccount() {
    router.push('/recover');
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
            <Text style={styles.brandSubtitle}>Get on board!</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="user.name"
                placeholderTextColor={PLACEHOLDER_COLOR}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isSubmitting}
                accessibilityLabel="Username"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="********************"
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSubmitting}
                  accessibilityLabel="Password"
                />
                <Pressable
                  style={styles.visibilityButton}
                  onPress={() => setIsPasswordVisible((current) => !current)}
                  accessibilityLabel={
                    isPasswordVisible ? 'Hide password' : 'Show password'
                  }>
                  <Ionicons
                    name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                    size={14}
                    color={PLACEHOLDER_COLOR}
                  />
                </Pressable>
              </View>
              <Text style={styles.helperText}>{PASSWORD_HELPER_TEXT}</Text>
            </View>

            {errorMessage ? (
              <Text style={styles.errorText} accessibilityRole="alert">
                {errorMessage}
              </Text>
            ) : null}

            <View style={styles.actionsRow}>
              <Pressable
                onPress={handleRecoverAccount}
                disabled={isSubmitting}
                accessibilityRole="link">
                <Text style={styles.recoverLink}>Recover your account</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.loginButton,
                  !canSubmit && styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                disabled={!canSubmit}
                accessibilityRole="button"
                accessibilityLabel="Log In">
                {isSubmitting ? (
                  <ActivityIndicator color="#FEFEFF" size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Log In</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  recoverLink: {
    color: BRAND_COLOR,
    fontSize: 12,
    maxWidth: 133,
  },
  loginButton: {
    backgroundColor: BRAND_COLOR,
    borderRadius: 4,
    height: 36,
    minWidth: 71,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#FEFEFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
