import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BACKGROUND_COLOR, BRAND_COLOR, MESSAGE_COLOR } from '@/constants/auth-ui';

export default function DocsScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Docs</Text>
        <Text style={styles.description}>
          Documents and resources will appear here. This tab is a placeholder for upcoming UI/UX
          work.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 12,
  },
  title: {
    color: BRAND_COLOR,
    fontSize: 24,
    fontWeight: '700',
  },
  description: {
    color: MESSAGE_COLOR,
    fontSize: 14,
    lineHeight: 21,
  },
});
