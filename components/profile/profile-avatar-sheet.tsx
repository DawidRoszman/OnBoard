import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MESSAGE_COLOR } from '@/constants/auth-ui';
import { PROFILE_SUBTITLE_COLOR } from '@/constants/profile-ui';

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
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
        <SafeAreaView edges={['bottom']} style={styles.sheetSafeArea}>
          <View style={styles.sheet}>
            <Pressable
              style={styles.actionRow}
              onPress={onUploadPress}
              accessibilityRole="button"
              accessibilityLabel="Choose photo from library">
              <Text style={styles.actionText}>Upload Avatar</Text>
              <Text style={styles.actionHint}>Choose from photo library</Text>
            </Pressable>
            {hasAvatar ? (
              <Pressable
                style={styles.actionRow}
                onPress={onRemovePress}
                accessibilityRole="button"
                accessibilityLabel="Remove avatar">
                <Text style={[styles.actionText, styles.removeActionText]}>
                  Remove Avatar
                </Text>
              </Pressable>
            ) : null}
            <Pressable
              style={styles.cancelRow}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cancel">
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetSafeArea: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  sheet: {
    paddingTop: 8,
  },
  actionRow: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E8E8',
    gap: 4,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: MESSAGE_COLOR,
    textAlign: 'center',
  },
  actionHint: {
    fontSize: 12,
    color: PROFILE_SUBTITLE_COLOR,
    textAlign: 'center',
  },
  removeActionText: {
    color: '#FF616D',
  },
  cancelRow: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: PROFILE_SUBTITLE_COLOR,
    textAlign: 'center',
  },
});
