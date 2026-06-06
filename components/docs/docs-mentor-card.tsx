import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { MESSAGE_COLOR } from '@/constants/auth-ui';
import {
  DOCS_CARD_RADIUS,
  DOCS_MENTOR_BUTTON_BG,
  DOCS_MENTOR_CARD_BG,
} from '@/constants/docs-ui';

const AVATAR_SIZE = 72;

type DocsMentorCardProps = {
  name: string;
  message: string;
  buttonLabel: string;
};

export function DocsMentorCard({
  name,
  message,
  buttonLabel,
}: DocsMentorCardProps) {
  const messageLines = message.split('\n');

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.content}>
          <View style={styles.messageBlock}>
            {messageLines.map((line) => (
              <Text key={line} style={styles.messageLine}>
                {line}
              </Text>
            ))}
          </View>
          <Pressable
            style={styles.button}
            accessibilityRole="button"
            accessibilityLabel={buttonLabel}>
            <Ionicons name="chatbubble-outline" size={20} color={MESSAGE_COLOR} />
            <Text style={styles.buttonText}>{buttonLabel}</Text>
          </Pressable>
        </View>
        <View style={styles.profile}>
          <View style={styles.avatarCircle}>
            <Image
              source={require('@/assets/images/mentor-avatar.png')}
              style={styles.avatarImage}
              resizeMode="cover"
              accessibilityLabel={`${name} avatar`}
            />
          </View>
          <Text style={styles.name}>{name}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: DOCS_MENTOR_CARD_BG,
    borderRadius: DOCS_CARD_RADIUS,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  content: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    gap: 14,
    paddingTop: 7,
  },
  messageBlock: {
    gap: 0,
  },
  messageLine: {
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
    color: MESSAGE_COLOR,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    alignSelf: 'stretch',
    height: 43,
    backgroundColor: DOCS_MENTOR_BUTTON_BG,
    borderWidth: 1,
    borderColor: MESSAGE_COLOR,
    borderRadius: 4,
    paddingHorizontal: 10,
  },
  buttonText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: MESSAGE_COLOR,
    textAlign: 'center',
  },
  profile: {
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
    width: AVATAR_SIZE,
  },
  avatarCircle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.4 }],
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: MESSAGE_COLOR,
    textAlign: 'center',
  },
});
