import { StyleSheet, View } from 'react-native';

import { AdminFormField } from '@/components/admin/admin-form-field';
import { FORM_WIDTH } from '@/constants/auth-ui';
import type {
  ProfileFormErrors,
  ProfileFormFieldName,
} from '@/constants/profile-form-validation';
import type { UpdateProfilePayload } from '@/services/profile-service';

type ProfileEditFormProps = {
  formValues: UpdateProfilePayload;
  fieldErrors: ProfileFormErrors;
  blurredFields: Partial<Record<ProfileFormFieldName, boolean>>;
  onFieldChange: (fieldName: ProfileFormFieldName, value: string) => void;
  onFieldBlur: (fieldName: ProfileFormFieldName) => void;
};

type TextField = {
  name: ProfileFormFieldName;
  placeholder: string;
};

const TEXT_FIELDS: TextField[] = [
  { name: 'firstName', placeholder: 'Enter first name' },
  { name: 'lastName', placeholder: 'Enter last name' },
  { name: 'email', placeholder: 'Enter email address' },
  { name: 'phone', placeholder: 'Enter phone number' },
  { name: 'address', placeholder: 'Enter location' },
];

export function ProfileEditForm({
  formValues,
  fieldErrors,
  blurredFields,
  onFieldChange,
  onFieldBlur,
}: ProfileEditFormProps) {
  function getVisibleFieldError(
    fieldName: ProfileFormFieldName,
  ): string | undefined {
    if (!blurredFields[fieldName]) {
      return undefined;
    }

    return fieldErrors[fieldName];
  }

  return (
    <View style={styles.form}>
      {TEXT_FIELDS.map((field) => (
        <AdminFormField
          key={field.name}
          placeholder={field.placeholder}
          value={formValues[field.name]}
          onChangeText={(value) => onFieldChange(field.name, value)}
          onBlur={() => onFieldBlur(field.name)}
          errorMessage={getVisibleFieldError(field.name)}
          autoCapitalize={field.name === 'email' ? 'none' : 'words'}
          keyboardType={
            field.name === 'email'
              ? 'email-address'
              : field.name === 'phone'
                ? 'phone-pad'
                : 'default'
          }
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    width: FORM_WIDTH,
    alignSelf: 'center',
    gap: 16,
  },
});
