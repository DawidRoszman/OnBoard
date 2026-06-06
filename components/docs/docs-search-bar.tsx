import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import {
  DOCS_PLACEHOLDER,
  DOCS_SEARCH_BG,
} from '@/constants/docs-ui';
import { MESSAGE_COLOR } from '@/constants/auth-ui';

type DocsSearchBarProps = {
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
};

export function DocsSearchBar({
  value,
  placeholder,
  onChangeText,
  onClear,
}: DocsSearchBarProps) {
  const hasQuery = value.trim().length > 0;

  return (
    <View style={styles.container}>
      <Ionicons name="search" size={16} color={MESSAGE_COLOR} />
      <TextInput
        style={styles.input}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={DOCS_PLACEHOLDER}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel={placeholder}
      />
      {hasQuery && onClear ? (
        <Pressable
          onPress={onClear}
          accessibilityRole="button"
          accessibilityLabel="Clear search">
          <Ionicons name="close-circle-outline" size={20} color={DOCS_PLACEHOLDER} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: DOCS_SEARCH_BG,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: MESSAGE_COLOR,
    padding: 0,
  },
});
