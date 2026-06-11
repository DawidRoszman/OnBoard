import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MESSAGE_COLOR } from '@/constants/auth-ui';
import {
  PROFILE_CARD_ROW_COLOR,
  PROFILE_ICON_COLUMN_WIDTH,
  PROFILE_ROW_RADIUS,
  PROFILE_SUBTITLE_COLOR,
} from '@/constants/profile-ui';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type ProfileSettingsRowProps = {
  iconName?: IoniconName;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export function ProfileSettingsRow({
  iconName,
  title,
  subtitle,
  trailing,
  onPress,
  accessibilityLabel,
}: ProfileSettingsRowProps) {
  const content = (
    <>
      <View style={styles.iconColumn}>
        {iconName ? (
          <Ionicons name={iconName} size={24} color={MESSAGE_COLOR} />
        ) : null}
      </View>
      <View style={styles.textColumn}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.trailingColumn}>
        {trailing ?? (
          onPress ? (
            <Ionicons name="chevron-forward" size={20} color={PROFILE_SUBTITLE_COLOR} />
          ) : null
        )}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={styles.row}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}>
        {content}
      </Pressable>
    );
  }

  return <View style={styles.row}>{content}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PROFILE_CARD_ROW_COLOR,
    borderRadius: PROFILE_ROW_RADIUS,
    minHeight: 72,
    paddingVertical: 12,
    paddingRight: 16,
  },
  iconColumn: {
    width: PROFILE_ICON_COLUMN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: MESSAGE_COLOR,
  },
  subtitle: {
    fontSize: 14,
    color: PROFILE_SUBTITLE_COLOR,
  },
  trailingColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 40,
  },
});
