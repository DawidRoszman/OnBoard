import { Modal, Pressable, StyleSheet, Text } from 'react-native';

import { MESSAGE_COLOR } from '@/constants/auth-ui';

type ProfileAvatarSheetProps = {
  isVisible: boolean;
  hasAvatar: boolean;
  onClose: () => void;
  onUploadPress: () => void;
  onRemovePress: () => void;
};

export function ProfileAvatarSheet({
  isVisible,
  hasAvatar,
  onClose,
  onUploadPress,
  onRemovePress,
}: ProfileAvatarSheetProps) {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <Pressable
            style={styles.actionRow}
            onPress={onUploadPress}
            accessibilityRole="button"
            accessibilityLabel="Upload avatar">
            <Text style={styles.actionText}>Upload Avatar</Text>
          </Pressable>
          {hasAvatar ? (
            <Pressable
              style={styles.actionRow}
              onPress={onRemovePress}
              accessibilityRole="button"
              accessibilityLabel="Remove avatar">
              <Text style={styles.actionText}>Remove Avatar</Text>
            </Pressable>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 32,
    paddingTop: 8,
  },
  actionRow: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E8E8',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: MESSAGE_COLOR,
    textAlign: 'center',
  },
});
