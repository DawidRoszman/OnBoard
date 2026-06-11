import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBackButton } from '@/components/app-back-button';
import { AppNavBar } from '@/components/app-navbar';
import { UserAvatar } from '@/components/user-avatar';
import {
  BACKGROUND_COLOR,
  MESSAGE_COLOR,
} from '@/constants/auth-ui';
import { withReturnTo } from '@/lib/back-navigation';
import {
  AdminError,
  listUsers,
  type AdminUserSummary,
} from '@/services/admin-service';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type UserActionButtonProps = {
  iconName: IoniconName;
  label: string;
  onPress?: () => void;
};

function UserActionButton({ iconName, label, onPress }: UserActionButtonProps) {
  return (
    <Pressable
      style={styles.actionButton}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <Ionicons name={iconName} size={14} color={MESSAGE_COLOR} />
      <Text style={styles.actionButtonText}>{label}</Text>
    </Pressable>
  );
}

export default function AdminUsersScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasLoadedUsersRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const shouldShowLoading = !hasLoadedUsersRef.current;

      async function loadUsers() {
        if (shouldShowLoading) {
          setIsLoading(true);
        }

        try {
          const data = await listUsers();

          if (isMounted) {
            setUsers(data);
            setErrorMessage(null);
            hasLoadedUsersRef.current = true;
          }
        } catch (error) {
          if (isMounted) {
            setErrorMessage(
              error instanceof AdminError
                ? error.message
                : 'Failed to load users. Please try again.',
            );
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      }

      loadUsers();

      return () => {
        isMounted = false;
      };
    }, []),
  );

  const visibleUsers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return users;
    }

    return users.filter((user) =>
      `${user.displayName} ${user.occupation}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [searchQuery, users]);

  function openEditSchedule(user: AdminUserSummary) {
    const scheduleRoute = `/(tabs)/admin-users/${user.id}/schedule?userName=${encodeURIComponent(user.displayName)}`;

    router.push(withReturnTo(scheduleRoute, '/(tabs)/admin-users'));
  }

  function openEditProfile(user: AdminUserSummary) {
    const profileEditRoute = `/(tabs)/admin-users/${user.id}/profile/edit`;

    router.push(withReturnTo(profileEditRoute, '/(tabs)/admin-users'));
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppNavBar
        title="Users"
        leftAction={<AppBackButton fallbackRoute="/(tabs)" />}
      />

      <View style={styles.content}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#2F3036" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            placeholder="Find users"
            placeholderTextColor="#8F9098"
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Find users"
          />
        </View>

        {isLoading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color={MESSAGE_COLOR} />
          </View>
        ) : errorMessage ? (
          <View style={styles.centeredState}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : (
          <View style={styles.userList}>
            {visibleUsers.map((user) => (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.userHeader}>
                  <UserAvatar
                    displayName={user.displayName}
                    firstName={user.firstName}
                    lastName={user.lastName}
                    avatarUri={user.avatarUri}
                    size={45}
                  />

                  <View style={styles.userText}>
                    <Text style={styles.userName} numberOfLines={1}>
                      {user.displayName}
                    </Text>
                    <Text style={styles.userRole} numberOfLines={2}>
                      {user.occupation}
                    </Text>
                  </View>

                  <Ionicons
                    name="ellipsis-horizontal"
                    size={20}
                    color={MESSAGE_COLOR}
                  />
                </View>

                <View style={styles.userActions}>
                  <UserActionButton
                    iconName="time-outline"
                    label="Edit Schedule"
                    onPress={() => openEditSchedule(user)}
                  />
                  <UserActionButton
                    iconName="create-outline"
                    label="Edit Profile"
                    onPress={() => openEditProfile(user)}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  searchBar: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 24,
    backgroundColor: '#F8F9FE',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    padding: 0,
    color: MESSAGE_COLOR,
    fontSize: 14,
    lineHeight: 20,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    color: MESSAGE_COLOR,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  userList: {
    marginTop: 12,
    gap: 10,
  },
  userCard: {
    gap: 12,
    borderRadius: 9,
    backgroundColor: '#F2FFF3',
    padding: 12,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userText: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  userRole: {
    marginTop: 3,
    color: '#8F9098',
    fontSize: 12,
    lineHeight: 16,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 0.5,
    borderColor: MESSAGE_COLOR,
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  actionButtonText: {
    color: MESSAGE_COLOR,
    fontSize: 13,
    fontWeight: '500',
  },
});
