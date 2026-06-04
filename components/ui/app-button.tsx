import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { BRAND_COLOR } from '@/constants/auth-ui';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

export function AppButton({
  label,
  onPress,
  isDisabled = false,
  isLoading = false,
  style,
  accessibilityLabel,
}: AppButtonProps) {
  const shouldDisable = isDisabled || isLoading;

  return (
    <Pressable
      style={[styles.button, shouldDisable && styles.buttonDisabled, style]}
      onPress={onPress}
      disabled={shouldDisable}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}>
      {isLoading ? (
        <ActivityIndicator color="#FEFEFF" size="small" />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: BRAND_COLOR,
    borderRadius: 4,
    height: 36,
    minWidth: 71,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  label: {
    color: '#FEFEFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
