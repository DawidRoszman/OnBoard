import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BRAND_COLOR } from '@/constants/auth-ui';

type AppLoadingStateProps = {
  message: string;
};

export function AppLoadingState({ message }: AppLoadingStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      <ActivityIndicator color={BRAND_COLOR} size="small" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  message: {
    color: BRAND_COLOR,
    fontSize: 20,
    fontWeight: '400',
  },
});
