import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DOCS_SECTION_TITLE_SIZE } from '@/constants/docs-ui';
import { MESSAGE_COLOR } from '@/constants/auth-ui';

type DocsSectionProps = {
  title: string;
  titleAccessory?: ReactNode;
  children: ReactNode;
};

export function DocsSection({ title, titleAccessory, children }: DocsSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        {titleAccessory}
        <Text style={styles.title}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontSize: DOCS_SECTION_TITLE_SIZE,
    fontWeight: '700',
    color: MESSAGE_COLOR,
    letterSpacing: 0.2,
  },
});
