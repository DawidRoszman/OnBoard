import { StyleSheet, Text, TextInput, type TextInputProps } from 'react-native';

import {
  BORDER_COLOR,
  LABEL_COLOR,
  PLACEHOLDER_COLOR,
} from '@/constants/auth-ui';

type FormTextFieldProps = TextInputProps & {
  label?: string;
};

export function FormTextField({ label, style, ...rest }: FormTextFieldProps) {
  return (
    <>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={PLACEHOLDER_COLOR}
        {...rest}
      />
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    color: LABEL_COLOR,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
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
});
