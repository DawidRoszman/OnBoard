import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { ADMIN_FORM_ERROR_COLOR } from '@/constants/admin-form-validation';

type AdminFormFieldShellProps = {
  children: ReactNode;
  errorMessage?: string;
  style?: StyleProp<ViewStyle>;
};

export function AdminFormFieldShell({
  children,
  errorMessage,
  style,
}: AdminFormFieldShellProps) {
  return (
    <View style={[styles.fieldGroup, style]}>
      {children}
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
  errorText: {
    color: ADMIN_FORM_ERROR_COLOR,
    fontSize: 12,
    lineHeight: 16,
  },
});
