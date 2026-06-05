import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppNavBar } from '@/components/app-navbar';
import { BACKGROUND_COLOR, MESSAGE_COLOR } from '@/constants/auth-ui';

export default function DocsScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppNavBar title="Docs" />
      <View style={styles.container}>
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
  },
  description: {
    color: MESSAGE_COLOR,
    fontSize: 14,
    lineHeight: 21,
  },
});
