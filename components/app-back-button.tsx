import { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';
import { Pressable } from 'react-native';

import { BRAND_COLOR } from '@/constants/auth-ui';
import { useOriginAwareBack } from '@/lib/back-navigation';

type AppBackButtonProps = {
  fallbackRoute: Href | string;
};

export function AppBackButton({ fallbackRoute }: AppBackButtonProps) {
  const { goBack } = useOriginAwareBack();

  return (
    <Pressable
      onPress={() => goBack(fallbackRoute as Href)}
      accessibilityRole="button"
      accessibilityLabel="Go back">
      <Ionicons name="chevron-back" size={24} color={BRAND_COLOR} />
    </Pressable>
  );
}
