import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { HamburgerMenu } from '@/components/hamburger-menu';
import { BACKGROUND_COLOR } from '@/constants/auth-ui';

type AppNavBarProps = {
  title: string;
  leftAction?: ReactNode;
};

export function AppNavBar({ title, leftAction }: AppNavBarProps) {
  return (
    <View style={styles.navBar}>
      <View style={styles.navSide}>{leftAction}</View>
      <Text style={styles.navTitle} numberOfLines={1}>
        {title}
      </Text>
      <View style={[styles.navSide, styles.navSideRight]}>
        <HamburgerMenu />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    backgroundColor: BACKGROUND_COLOR,
  },
  navSide: {
    width: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  navSideRight: {
    alignItems: 'flex-end',
  },
  navTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2024',
    textAlign: 'center',
  },
});
