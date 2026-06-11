import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PROFILE_AVATAR_FALLBACK_COLOR } from '@/constants/profile-ui';

type UserAvatarProps = {
  displayName: string;
  firstName?: string;
  lastName?: string;
  avatarUri?: string;
  size?: number;
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

export function UserAvatar({
  displayName,
  firstName,
  lastName,
  avatarUri,
  size = 45,
}: UserAvatarProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const normalizedAvatarUri = avatarUri?.trim() ?? '';
  const hasAvatar = Boolean(normalizedAvatarUri);
  const shouldShowPhoto = hasAvatar && !hasImageError;
  const initials = getInitials(displayName, firstName, lastName);
  const borderRadius = size / 2;
  const fontSize = Math.round(size * 0.36);

  useEffect(() => {
    setHasImageError(false);
  }, [normalizedAvatarUri]);

  if (shouldShowPhoto) {
    return (
      <Image
        source={{ uri: normalizedAvatarUri }}
        style={[styles.avatarImage, { width: size, height: size, borderRadius }]}
        contentFit="cover"
        accessibilityLabel={`${displayName} avatar`}
        onError={() => setHasImageError(true)}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatarFallback,
        { width: size, height: size, borderRadius },
      ]}
      accessibilityLabel={`${displayName} avatar`}>
      <Text style={[styles.avatarInitials, { fontSize }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarImage: {
    backgroundColor: '#E8E8E8',
  },
  avatarFallback: {
    backgroundColor: PROFILE_AVATAR_FALLBACK_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
