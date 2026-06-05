import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BACKGROUND_COLOR, BRAND_COLOR, MESSAGE_COLOR } from '@/constants/auth-ui';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>OnBoard</Text>
        <Text style={styles.description}>
          Homepage placeholder. The full home experience will be added in a later iteration.
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
