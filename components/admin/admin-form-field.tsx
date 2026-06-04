import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { ADMIN_FORM_ERROR_COLOR } from '@/constants/admin-form-validation';
import {
  BORDER_COLOR,
  LABEL_COLOR,
  PLACEHOLDER_COLOR,
} from '@/constants/auth-ui';

type AdminFormFieldProps = TextInputProps & {
  errorMessage?: string;
};

export function AdminFormField({
  errorMessage,
  style,
  ...rest
}: AdminFormFieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={PLACEHOLDER_COLOR}
        {...rest}
      />
      {errorMessage ? (
        <Text style={styles.errorText} accessibilityRole="alert">
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: 6,
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
    color: ADMIN_FORM_ERROR_COLOR,
    fontSize: 12,
    lineHeight: 16,
  },
});
