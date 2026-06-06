import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  DOCS_HELP_BUTTON_BG,
} from '@/constants/docs-ui';
import { BRAND_COLOR, MESSAGE_COLOR } from '@/constants/auth-ui';
import { docsRoutes } from '@/lib/docs-navigation';

export function DocsHelpActions() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Need more help?</Text>
      <Pressable
        style={styles.primaryButton}
        onPress={() => router.push(docsRoutes.all)}
        accessibilityRole="button"
        accessibilityLabel="Browse all docs">
        <Ionicons name="documents-outline" size={20} color="#F2FFF3" />
        <Text style={styles.primaryButtonText}>Browse all docs</Text>
      </Pressable>
      <Text style={styles.orText}>or</Text>
      <Pressable
        style={styles.secondaryButton}
        accessibilityRole="button"
        accessibilityLabel="Contact your mentor">
        <Ionicons name="chatbubble-ellipses-outline" size={20} color={MESSAGE_COLOR} />
        <Text style={styles.secondaryButtonText}>Contact your mentor</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
  },
  title: {
    alignSelf: 'flex-start',
    fontSize: 24,
    fontWeight: '700',
    color: MESSAGE_COLOR,
    letterSpacing: 0.2,
  },
  primaryButton: {
    width: 254,
    height: 48,
    borderRadius: 4,
    backgroundColor: BRAND_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 28,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#F2FFF3',
  },
  orText: {
    fontSize: 18,
    fontWeight: '600',
    color: MESSAGE_COLOR,
  },
  secondaryButton: {
    width: 254,
    height: 48,
    borderRadius: 4,
    backgroundColor: DOCS_HELP_BUTTON_BG,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 28,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: MESSAGE_COLOR,
  },
});
