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
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdminFormField } from '@/components/admin/admin-form-field';
import { ScheduleMenuButton } from '@/components/schedule/schedule-menu-button';
import { DateOfBirthField } from '@/components/admin/date-of-birth-field';
import { OccupationSelectField } from '@/components/admin/occupation-select-field';
import {
  type AdminFormErrors,
  type AdminFormFieldName,
  getAllFieldsBlurred,
  hasAdminFormErrors,
  validateAdminCreateUserForm,
  validateAdminFormField,
} from '@/constants/admin-form-validation';
import {
  BACKGROUND_COLOR,
  BRAND_COLOR,
  FORM_WIDTH,
  LABEL_COLOR,
} from '@/constants/auth-ui';
import {
  AdminError,
  createUser,
  type CreateUserPayload,
} from '@/services/admin-service';

type TextFieldName = Exclude<
  keyof CreateUserPayload,
  'dateOfBirth' | 'occupation'
>;

type TextField = {
  name: TextFieldName;
  placeholder: string;
};

const TEXT_FIELDS_BEFORE_DATE_OF_BIRTH: TextField[] = [
  { name: 'firstName', placeholder: 'Enter first name' },
  { name: 'lastName', placeholder: 'Enter last name' },
  { name: 'email', placeholder: 'Enter email address' },
  { name: 'phone', placeholder: 'Enter phone number' },
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

export default function AdminCreateUserScreen() {
  const router = useRouter();
  const [formValues, setFormValues] =
    useState<CreateUserPayload>(EMPTY_FORM_VALUES);
  const [fieldErrors, setFieldErrors] = useState<AdminFormErrors>({});
  const [blurredFields, setBlurredFields] = useState<
    Partial<Record<AdminFormFieldName, boolean>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function getVisibleFieldError(
    fieldName: AdminFormFieldName,
  ): string | undefined {
    if (!blurredFields[fieldName]) {
      return undefined;
    }

    return fieldErrors[fieldName];
  }

  function syncFieldError(
    fieldName: AdminFormFieldName,
    values: CreateUserPayload,
  ) {
    const fieldError = validateAdminFormField(fieldName, values);

    setFieldErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };

      if (fieldError) {
        nextErrors[fieldName] = fieldError;
      } else {
        delete nextErrors[fieldName];
      }

      return nextErrors;
    });
  }

  function handleFieldBlur(
    fieldName: AdminFormFieldName,
    values: CreateUserPayload = formValues,
  ) {
    setBlurredFields((currentBlurredFields) => ({
      ...currentBlurredFields,
      [fieldName]: true,
    }));
    syncFieldError(fieldName, values);
  }

  function handleTextFieldChange(fieldName: TextFieldName, value: string) {
    const nextValues = {
      ...formValues,
      [fieldName]: value,
    };

    setFormValues(nextValues);

    if (blurredFields[fieldName]) {
      syncFieldError(fieldName, nextValues);
    }
  }

  function commitFieldValue(
    fieldName: AdminFormFieldName,
    value: string,
  ) {
    const nextValues = {
      ...formValues,
      [fieldName]: value,
    };

    setFormValues(nextValues);
    setBlurredFields((currentBlurredFields) => ({
      ...currentBlurredFields,
      [fieldName]: true,
    }));
    syncFieldError(fieldName, nextValues);
  }

  function handleDateOfBirthChange(value: string) {
    const nextValues = {
      ...formValues,
      dateOfBirth: value,
    };

    setFormValues(nextValues);

    if (blurredFields.dateOfBirth) {
      syncFieldError('dateOfBirth', nextValues);
    }
  }

  async function handleCreateUser() {
    if (isSubmitting) {
      return;
    }

    const trimmedFormValues = getTrimmedFormValues(formValues);
    const validationErrors = validateAdminCreateUserForm(formValues);

    setBlurredFields(getAllFieldsBlurred());
    setFieldErrors(validationErrors);
    setErrorMessage(null);

    if (hasAdminFormErrors(validationErrors)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createUser(trimmedFormValues);
      router.replace({
        pathname: '/admin-create-user-success',
        params: {
          username: result.user.username,
          temporaryPassword: result.temporaryPassword,
        },
      });
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
            <ScheduleMenuButton />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.screenTitle}>Create new user</Text>

          <View style={styles.form}>
            {TEXT_FIELDS_BEFORE_DATE_OF_BIRTH.map((field) => (
              <AdminFormField
                key={field.name}
                value={formValues[field.name]}
                onChangeText={(value) => handleTextFieldChange(field.name, value)}
                onBlur={() => handleFieldBlur(field.name)}
                placeholder={field.placeholder}
                keyboardType={field.name === 'email' ? 'email-address' : 'default'}
                autoCapitalize={field.name === 'email' ? 'none' : 'sentences'}
                autoCorrect={false}
                editable={!isSubmitting}
                accessibilityLabel={field.placeholder}
                errorMessage={getVisibleFieldError(field.name)}
              />
            ))}

            <DateOfBirthField
              value={formValues.dateOfBirth}
              onChange={handleDateOfBirthChange}
              onCommit={(value) => commitFieldValue('dateOfBirth', value)}
              onBlur={() => handleFieldBlur('dateOfBirth')}
              isEditable={!isSubmitting}
              errorMessage={getVisibleFieldError('dateOfBirth')}
            />

            <AdminFormField
              value={formValues.address}
              onChangeText={(value) => handleTextFieldChange('address', value)}
              onBlur={() => handleFieldBlur('address')}
              placeholder="Enter address"
              autoCorrect={false}
              editable={!isSubmitting}
              accessibilityLabel="Enter address"
              errorMessage={getVisibleFieldError('address')}
            />

            <OccupationSelectField
              value={formValues.occupation}
              onCommit={(value) => commitFieldValue('occupation', value)}
              onBlur={() => handleFieldBlur('occupation')}
              isEditable={!isSubmitting}
              errorMessage={getVisibleFieldError('occupation')}
            />

            {errorMessage ? (
              <Text style={styles.submitErrorText} accessibilityRole="alert">
                {errorMessage}
              </Text>
            ) : null}

            <View style={styles.actionsRow}>
              <Pressable
                style={[
                  styles.primaryButton,
                  isSubmitting && styles.primaryButtonDisabled,
                ]}
                onPress={handleCreateUser}
                disabled={isSubmitting}
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
  submitErrorText: {
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
