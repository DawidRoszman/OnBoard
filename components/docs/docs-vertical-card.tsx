import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  DOCS_CARD_RADIUS,
  DOCS_TILE_BG,
} from '@/constants/docs-ui';
import { MESSAGE_COLOR } from '@/constants/auth-ui';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type DocsVerticalCardProps = {
  title: string;
  subtitle?: string;
  iconName?: IoniconName;
  variant?: 'compact' | 'large';
  onPress?: () => void;
};

export function DocsVerticalCard({
  title,
  subtitle,
  iconName = 'document-text-outline',
  variant = 'compact',
  onPress,
}: DocsVerticalCardProps) {
  const isLarge = variant === 'large';

  return (
    <Pressable
      style={[styles.card, isLarge ? styles.cardLarge : styles.cardCompact]}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={title}>
      {isLarge ? (
        <>
          <View style={styles.largeImage}>
            <Ionicons name="image-outline" size={24} color="#B4DBFF" />
          </View>
          <View style={styles.largeContent}>
            <Text style={styles.largeTitle} numberOfLines={2}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={styles.largeSubtitle} numberOfLines={2}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </>
      ) : (
        <View style={styles.compactContent}>
          <Ionicons name={iconName} size={24} color={MESSAGE_COLOR} />
          <Text style={styles.compactTitle} numberOfLines={2}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: DOCS_TILE_BG,
    borderRadius: DOCS_CARD_RADIUS,
    overflow: 'hidden',
  },
  cardCompact: {
    width: 100,
    height: 100,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLarge: {
    width: 160,
    height: 160,
  },
  compactContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    flex: 1,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: MESSAGE_COLOR,
    textAlign: 'center',
  },
  largeImage: {
    flex: 1,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeContent: {
    padding: 16,
    gap: 4,
  },
  largeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2024',
  },
  largeSubtitle: {
    fontSize: 12,
    color: '#71727A',
    lineHeight: 16,
  },
});
