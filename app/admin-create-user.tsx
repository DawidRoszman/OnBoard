import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
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
  LABEL_COLOR,
  PLACEHOLDER_COLOR,
} from '@/constants/auth-ui';
import {
  AdminError,
  createUser,
  type CreateUserPayload,
} from '@/services/admin-service';

type AdminFieldName = keyof CreateUserPayload;

type AdminField = {
  name: AdminFieldName;
  placeholder: string;
};

const ADMIN_FIELDS: AdminField[] = [
  { name: 'firstName', placeholder: 'Enter first name' },
  { name: 'lastName', placeholder: 'Enter last name' },
  { name: 'email', placeholder: 'Enter email address' },
  { name: 'phone', placeholder: 'Enter phone number' },
  { name: 'dateOfBirth', placeholder: 'Enter date of birth' },
  { name: 'address', placeholder: 'Enter address' },
  { name: 'occupation', placeholder: 'Select occupation' },
];

const EMPTY_FORM_VALUES: CreateUserPayload = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  address: '',
  occupation: '',
};

function getTrimmedFormValues(formValues: CreateUserPayload): CreateUserPayload {
  return {
    firstName: formValues.firstName.trim(),
    lastName: formValues.lastName.trim(),
    email: formValues.email.trim(),
    phone: formValues.phone.trim(),
    dateOfBirth: formValues.dateOfBirth.trim(),
    address: formValues.address.trim(),
    occupation: formValues.occupation.trim(),
  };
}

function isValidEmail(value: string): boolean {
  return value.includes('@') && value.includes('.');
}

export default function AdminCreateUserScreen() {
  const router = useRouter();
  const [formValues, setFormValues] =
    useState<CreateUserPayload>(EMPTY_FORM_VALUES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const trimmedFormValues = getTrimmedFormValues(formValues);
  const hasFilledFields = Object.values(trimmedFormValues).every(
    (value) => value.length > 0,
  );
  const hasValidEmail = isValidEmail(trimmedFormValues.email);
  const isFormComplete = hasFilledFields && hasValidEmail;
  const shouldDisableSubmit = !isFormComplete || isSubmitting;

  function handleChange(fieldName: AdminFieldName, value: string) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [fieldName]: value,
    }));
  }

  async function handleCreateUser() {
    if (shouldDisableSubmit) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await createUser(trimmedFormValues);
      router.replace('/admin-create-user-success');
    } catch (error) {
      if (error instanceof AdminError) {
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
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.navBar}>
          <Pressable
            style={styles.navBackButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={20} color={BRAND_COLOR} />
          </Pressable>
          <Text style={styles.navTitle}>Admin Panel</Text>
          <View style={styles.navSideRight}>
            <Ionicons name="menu" size={20} color={BRAND_COLOR} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.screenTitle}>Create new user</Text>

          <View style={styles.form}>
            {ADMIN_FIELDS.map((field) => (
              <TextInput
                key={field.name}
                style={styles.input}
                value={formValues[field.name]}
                onChangeText={(value) => handleChange(field.name, value)}
                placeholder={field.placeholder}
                placeholderTextColor={PLACEHOLDER_COLOR}
                keyboardType={field.name === 'email' ? 'email-address' : 'default'}
                autoCapitalize={field.name === 'email' ? 'none' : 'sentences'}
                autoCorrect={false}
                editable={!isSubmitting}
                accessibilityLabel={field.placeholder}
              />
            ))}

            {errorMessage ? (
              <Text style={styles.errorText} accessibilityRole="alert">
                {errorMessage}
              </Text>
            ) : null}

            <View style={styles.actionsRow}>
              <Pressable
                style={[
                  styles.primaryButton,
                  shouldDisableSubmit && styles.primaryButtonDisabled,
                ]}
                onPress={handleCreateUser}
                disabled={shouldDisableSubmit}
                accessibilityRole="button"
                accessibilityLabel="Create user">
                {isSubmitting ? (
                  <ActivityIndicator color="#FEFEFF" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>Create user</Text>
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
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
  navBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  navBackButton: {
    width: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  navSideRight: {
    width: 36,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  navTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2024',
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 61,
    paddingBottom: 32,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: LABEL_COLOR,
    textAlign: 'center',
    marginBottom: 24,
  },
  form: {
    width: FORM_WIDTH,
    alignSelf: 'center',
    gap: 20,
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
  errorText: {
    color: '#B91C1C',
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  primaryButton: {
    backgroundColor: BRAND_COLOR,
    borderRadius: 4,
    height: 36,
    minWidth: 104,
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
