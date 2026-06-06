import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';

import { BRAND_COLOR } from '@/constants/auth-ui';
import { docsRoutes } from '@/lib/docs-navigation';

export function DocsBackButton() {
  const router = useRouter();

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(docsRoutes.root);
  }

  return (
    <Pressable
      onPress={handleBack}
      accessibilityRole="button"
      accessibilityLabel="Go back">
      <Ionicons name="chevron-back" size={24} color={BRAND_COLOR} />
    </Pressable>
  );
}
