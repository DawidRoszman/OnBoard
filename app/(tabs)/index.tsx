import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BACKGROUND_COLOR, BRAND_COLOR, MESSAGE_COLOR } from '@/constants/auth-ui';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>OnBoard</Text>
        <Text style={styles.description}>
          Homepage placeholder. The full home experience will be added in a later iteration.
        </Text>
        <Pressable
          style={styles.createUserButton}
          onPress={() => router.push('/admin-create-user')}
          accessibilityRole="button"
          accessibilityLabel="Create user">
          <Text style={styles.createUserButtonText}>Create user</Text>
        </Pressable>
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
  createUserButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    minWidth: 104,
    height: 36,
    borderRadius: 4,
    backgroundColor: BRAND_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  createUserButtonText: {
    color: '#FEFEFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
