import { useLocalSearchParams } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBackButton } from '@/components/app-back-button';
import { AppNavBar } from '@/components/app-navbar';
import { ProfileEditView } from '@/components/profile/profile-edit-view';
import { BACKGROUND_COLOR, LABEL_COLOR } from '@/constants/auth-ui';

function parseUserIdParam(userId: string | string[] | undefined): number | null {
  const rawValue = Array.isArray(userId) ? userId[0] : userId;
  const parsedUserId = Number(rawValue);

  if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
    return null;
  }

  return parsedUserId;
}

export default function AdminUserProfileEditScreen() {
  const { userId } = useLocalSearchParams<{ userId?: string }>();
  const parsedUserId = parseUserIdParam(userId);

  if (parsedUserId === null) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppNavBar
          title="Profile"
          leftAction={<AppBackButton fallbackRoute="/(tabs)/admin-users" />}
        />
        <View style={styles.centered}>
          <Text style={styles.errorText}>A valid user is required.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ProfileEditView
      userId={parsedUserId}
      fallbackRoute="/(tabs)/admin-users"
      shouldSyncSession={false}
    />
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    color: LABEL_COLOR,
    fontSize: 14,
    textAlign: 'center',
  },
});
