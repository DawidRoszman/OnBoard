import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  DOCS_CARD_RADIUS,
  DOCS_IMAGE_BG,
  DOCS_IMAGE_ICON,
  DOCS_SUBTITLE,
  DOCS_TILE_BG,
} from '@/constants/docs-ui';
import { BRAND_COLOR, MESSAGE_COLOR } from '@/constants/auth-ui';

type DocsHorizontalCardProps = {
  title: string;
  subtitle: string;
  onPress?: () => void;
};

export function DocsHorizontalCard({
  title,
  subtitle,
  onPress,
}: DocsHorizontalCardProps) {
  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={title}>
      <View style={styles.imagePlaceholder}>
        <Ionicons name="image-outline" size={24} color={DOCS_IMAGE_ICON} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={12} color={BRAND_COLOR} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DOCS_TILE_BG,
    borderRadius: DOCS_CARD_RADIUS,
    overflow: 'hidden',
    minHeight: 66,
  },
  imagePlaceholder: {
    width: 80,
    alignSelf: 'stretch',
    backgroundColor: DOCS_IMAGE_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: MESSAGE_COLOR,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 12,
    color: DOCS_SUBTITLE,
  },
});
