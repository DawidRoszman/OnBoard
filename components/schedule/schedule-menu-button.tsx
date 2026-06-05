import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BACKGROUND_COLOR,
  BORDER_COLOR,
  BRAND_COLOR,
  HELPER_COLOR,
  LABEL_COLOR,
} from '@/constants/auth-ui';
import { clearAuthSession, getAuthUser } from '@/services/auth-session';

const DRAWER_WIDTH = Math.min(320, Dimensions.get('window').width * 0.82);
const ANIMATION_DURATION_MS = 260;

export function ScheduleMenuButton() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const currentUser = getAuthUser();
  const isAdmin = Boolean(currentUser?.isAdmin);
  const translateX = useSharedValue(DRAWER_WIDTH);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    translateX.value = withTiming(0, { duration: ANIMATION_DURATION_MS });
    overlayOpacity.value = withTiming(1, { duration: ANIMATION_DURATION_MS });
  }, [isMenuOpen, overlayOpacity, translateX]);

  function finishClose() {
    setIsMenuOpen(false);
  }

  function closeMenu() {
    translateX.value = withTiming(
      DRAWER_WIDTH,
      { duration: ANIMATION_DURATION_MS },
      (isFinished) => {
        if (isFinished) {
          runOnJS(finishClose)();
        }
      },
    );
    overlayOpacity.value = withTiming(0, { duration: ANIMATION_DURATION_MS });
  }

  function openMenu() {
    translateX.value = DRAWER_WIDTH;
    overlayOpacity.value = 0;
    setIsMenuOpen(true);
  }

  function openCreateUser() {
    closeMenu();
    router.push('/admin-create-user');
  }

  function handleLogout() {
    closeMenu();
    clearAuthSession();
    router.replace('/login');
  }

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const drawerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <>
      <Pressable
        style={styles.menuButton}
        onPress={openMenu}
        accessibilityRole="button"
        accessibilityLabel="Open menu">
        <Ionicons name="menu" size={20} color={BRAND_COLOR} />
      </Pressable>

      <Modal
        visible={isMenuOpen}
        transparent
        animationType="none"
        onRequestClose={closeMenu}>
        <View style={styles.modalRoot}>
          <Animated.View style={[styles.overlay, overlayAnimatedStyle]}>
            <Pressable style={styles.overlayPressable} onPress={closeMenu} />
          </Animated.View>

          <Animated.View
            style={[
              styles.drawer,
              drawerAnimatedStyle,
              {
                paddingTop: insets.top + 16,
                paddingBottom: insets.bottom + 16,
              },
            ]}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Menu</Text>
              <Pressable
                style={styles.closeButton}
                onPress={closeMenu}
                accessibilityRole="button"
                accessibilityLabel="Close menu">
                <Ionicons name="close" size={22} color={LABEL_COLOR} />
              </Pressable>
            </View>

            {currentUser?.displayName ? (
              <Text style={styles.userName}>{currentUser.displayName}</Text>
            ) : null}

            <View style={styles.menuItems}>
              {isAdmin ? (
                <Pressable
                  style={styles.menuItem}
                  onPress={openCreateUser}
                  accessibilityRole="button"
                  accessibilityLabel="Create user">
                  <Ionicons name="person-add-outline" size={20} color={BRAND_COLOR} />
                  <Text style={styles.menuItemText}>Create user</Text>
                </Pressable>
              ) : null}

              <Pressable
                style={styles.menuItem}
                onPress={handleLogout}
                accessibilityRole="button"
                accessibilityLabel="Log out">
                <Ionicons name="log-out-outline" size={20} color={BRAND_COLOR} />
                <Text style={styles.menuItemText}>Log out</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    width: 36,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  modalRoot: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  overlayPressable: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: BACKGROUND_COLOR,
    borderLeftWidth: 1,
    borderLeftColor: BORDER_COLOR,
    shadowColor: '#000000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    paddingHorizontal: 20,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  drawerTitle: {
    color: LABEL_COLOR,
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    color: HELPER_COLOR,
    fontSize: 14,
    marginBottom: 24,
  },
  menuItems: {
    gap: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  menuItemText: {
    color: LABEL_COLOR,
    fontSize: 16,
    fontWeight: '500',
  },
});
