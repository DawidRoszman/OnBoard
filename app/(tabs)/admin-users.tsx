import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBackButton } from '@/components/app-back-button';
import { AppNavBar } from '@/components/app-navbar';
import {
  BACKGROUND_COLOR,
  MESSAGE_COLOR,
} from '@/constants/auth-ui';

const USERS = [
  {
    id: 'john-test',
    name: 'John Test',
    role: 'Software Developer',
  },
];

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type UserActionButtonProps = {
  iconName: IoniconName;
  label: string;
};

function UserActionButton({ iconName, label }: UserActionButtonProps) {
  return (
    <Pressable
      style={styles.actionButton}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <Ionicons name={iconName} size={14} color={MESSAGE_COLOR} />
      <Text style={styles.actionButtonText}>{label}</Text>
    </Pressable>
  );
}

export default function AdminUsersScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const visibleUsers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return USERS;
    }

    return USERS.filter((user) =>
      `${user.name} ${user.role}`.toLowerCase().includes(normalizedQuery),
    );
  }, [searchQuery]);

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

        <View style={styles.userList}>
          {visibleUsers.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <Image
                source={require('@/assets/images/admin-user-avatar.png')}
                style={styles.avatar}
                resizeMode="cover"
                accessibilityLabel={`${user.name} avatar`}
              />

              <View style={styles.userText}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user.name}
                </Text>
                <Text style={styles.userRole} numberOfLines={1}>
                  {user.role}
                </Text>
              </View>

              <View style={styles.userActions}>
                <UserActionButton iconName="time-outline" label="Edit Schedule" />
                <UserActionButton iconName="create-outline" label="Edit Profile" />
              </View>
            </View>
          ))}
        </View>
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
  userList: {
    marginTop: 12,
    gap: 10,
  },
  userCard: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 9,
    backgroundColor: '#F2FFF3',
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
  },
  userText: {
    width: 88,
    flexShrink: 0,
  },
  userName: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  userRole: {
    marginTop: 3,
    color: '#8F9098',
    fontSize: 10,
  },
  userActions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    minHeight: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 0.5,
    borderColor: MESSAGE_COLOR,
    borderRadius: 3,
    paddingHorizontal: 5,
  },
  actionButtonText: {
    color: MESSAGE_COLOR,
    fontSize: 10,
  },
});
