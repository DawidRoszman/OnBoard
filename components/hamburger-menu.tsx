import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { withReturnTo } from '@/lib/back-navigation';
import type { ComponentProps } from 'react';
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
  BRAND_COLOR,
  MESSAGE_COLOR,
} from '@/constants/auth-ui';
import { clearAuthSession, getAuthUser } from '@/services/auth-session';

type MenuItemProps = {
  iconName: ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress?: () => void;
};

const DRAWER_WIDTH = Math.min(310, Dimensions.get('window').width * 0.78);
const ANIMATION_DURATION_MS = 260;
const DRAWER_BACKGROUND_COLOR = '#FFFFFF';

export function HamburgerMenu() {
  const router = useRouter();
  const pathname = usePathname();
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

  function openUsers() {
    closeMenu();
    router.push(withReturnTo('/(tabs)/admin-users', pathname));
  }

  function openMentor() {
    closeMenu();
    router.push(withReturnTo('/(tabs)/mentor', pathname));
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
        <Ionicons name="menu" size={24} color={BRAND_COLOR} />
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
                <Ionicons name="close" size={24} color={MESSAGE_COLOR} />
              </Pressable>
            </View>

            <View style={styles.menuItems}>
              {isAdmin ? (
                <>
                  <MenuItem
                    iconName="person-add-outline"
                    label="Create user"
                    onPress={openCreateUser}
                  />
                  <MenuItem
                    iconName="people-outline"
                    label="Users"
                    onPress={openUsers}
                  />
                </>
              ) : null}

              <MenuItem
                iconName="school-outline"
                label="Your mentor"
                onPress={openMentor}
              />
              <MenuItem
                iconName="log-out-outline"
                label="Log out"
                onPress={handleLogout}
              />
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

function MenuItem({ iconName, label, onPress }: MenuItemProps) {
  return (
    <Pressable
      style={styles.menuItem}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? label : undefined}>
      <Ionicons name={iconName} size={25} color={BRAND_COLOR} />
      <Text style={styles.menuItemText}>{label}</Text>
    </Pressable>
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
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
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
    backgroundColor: DRAWER_BACKGROUND_COLOR,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 27,
    paddingHorizontal: 24,
  },
  drawerTitle: {
    color: MESSAGE_COLOR,
    fontSize: 20,
    fontWeight: '400',
  },
  closeButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItems: {
    gap: 7,
  },
  menuItem: {
    height: 43,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingLeft: 28,
    paddingRight: 24,
    backgroundColor: DRAWER_BACKGROUND_COLOR,
  },
  menuItemText: {
    color: MESSAGE_COLOR,
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 27,
  },
});
