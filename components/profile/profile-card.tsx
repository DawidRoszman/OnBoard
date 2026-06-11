import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BRAND_COLOR } from '@/constants/auth-ui';
import {
  PROFILE_AVATAR_FALLBACK_COLOR,
  PROFILE_AVATAR_SIZE,
  PROFILE_BANNER_COLOR,
  PROFILE_CARD_RADIUS,
  PROFILE_EDIT_BUBBLE_SIZE,
  PROFILE_NAME_COLOR,
  PROFILE_ROLE_COLOR,
} from '@/constants/profile-ui';

type ProfileCardProps = {
  displayName: string;
  occupation: string;
  firstName?: string;
  lastName?: string;
  avatarUri?: string;
  hasEditBubble?: boolean;
  onEditAvatarPress?: () => void;
};

function getInitials(
  displayName: string,
  firstName?: string,
  lastName?: string,
): string {
  const firstInitial = firstName?.trim().charAt(0).toUpperCase() ?? '';
  const lastInitial = lastName?.trim().charAt(0).toUpperCase() ?? '';

  if (firstInitial || lastInitial) {
    return `${firstInitial}${lastInitial}`;
  }

  const parts = displayName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return '?';
  }

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

export function ProfileCard({
  displayName,
  occupation,
  firstName,
  lastName,
  avatarUri,
  hasEditBubble = false,
  onEditAvatarPress,
}: ProfileCardProps) {
  const hasAvatar = Boolean(avatarUri?.trim());
  const initials = getInitials(displayName, firstName, lastName);

  return (
    <View style={styles.card}>
      <View style={styles.banner}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarWrapper}>
            {hasAvatar ? (
              <Image
                source={{ uri: avatarUri }}
                style={styles.avatarImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            {hasEditBubble ? (
              <Pressable
                style={styles.editBubble}
                onPress={onEditAvatarPress}
                accessibilityRole="button"
                accessibilityLabel="Edit avatar">
                <Ionicons name="pencil" size={14} color={BRAND_COLOR} />
              </Pressable>
            ) : null}
          </View>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.role}>{occupation}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 24,
  },
  banner: {
    width: '100%',
    backgroundColor: PROFILE_BANNER_COLOR,
    borderRadius: PROFILE_CARD_RADIUS,
    paddingBottom: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    marginTop: 36,
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: PROFILE_AVATAR_SIZE,
    height: PROFILE_AVATAR_SIZE,
    borderRadius: PROFILE_AVATAR_SIZE / 2,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarFallback: {
    width: PROFILE_AVATAR_SIZE,
    height: PROFILE_AVATAR_SIZE,
    borderRadius: PROFILE_AVATAR_SIZE / 2,
    backgroundColor: PROFILE_AVATAR_FALLBACK_COLOR,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '700',
  },
  editBubble: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: PROFILE_EDIT_BUBBLE_SIZE,
    height: PROFILE_EDIT_BUBBLE_SIZE,
    borderRadius: PROFILE_EDIT_BUBBLE_SIZE / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  textContainer: {
    marginTop: 12,
    alignItems: 'center',
    gap: 4,
  },
  name: {
    fontSize: 30,
    fontWeight: '700',
    color: PROFILE_NAME_COLOR,
  },
  role: {
    fontSize: 18,
    fontWeight: '600',
    color: PROFILE_ROLE_COLOR,
  },
});
