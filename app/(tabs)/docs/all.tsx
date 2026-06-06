import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppNavBar } from '@/components/app-navbar';
import { DocsBackButton } from '@/components/docs/docs-back-button';
import { DocsHorizontalCard } from '@/components/docs/docs-horizontal-card';
import { DocsSearchBar } from '@/components/docs/docs-search-bar';
import { DocsSection } from '@/components/docs/docs-section';
import { BACKGROUND_COLOR } from '@/constants/auth-ui';
import { DOCS_HORIZONTAL_PADDING } from '@/constants/docs-ui';
import { DOCS_BROWSE_GROUPS, getArticleById, hasArticleDetail } from '@/data/docs';
import { docsRoutes } from '@/lib/docs-navigation';
import { useMemo, useState } from 'react';

export default function DocsAllScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return DOCS_BROWSE_GROUPS;
    }

    return DOCS_BROWSE_GROUPS.map((group) => ({
      ...group,
      articleIds: group.articleIds.filter((articleId) => {
        const article = getArticleById(articleId);
        if (!article) {
          return false;
        }

        return `${article.title} ${article.subtitle} ${group.title}`
          .toLowerCase()
          .includes(query);
      }),
    })).filter((group) => group.articleIds.length > 0);
  }, [searchQuery]);

  function openArticle(categoryId: string, articleId: string) {
    router.push(docsRoutes.article(categoryId, articleId));
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppNavBar title="All documents" leftAction={<DocsBackButton />} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <DocsSearchBar
          value={searchQuery}
          placeholder="Search all documentation"
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
        />

        {filteredGroups.map((group) => (
          <DocsSection key={group.id} title={group.title}>
            <View style={styles.cardList}>
              {group.articleIds.map((articleId) => {
                const article = getArticleById(articleId);
                if (!article) {
                  return null;
                }

                return (
                  <DocsHorizontalCard
                    key={article.id}
                    title={article.title}
                    subtitle={article.subtitle}
                    onPress={() =>
                      hasArticleDetail(article)
                        ? openArticle(article.categoryId, article.id)
                        : undefined
                    }
                  />
                );
              })}
            </View>
          </DocsSection>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: DOCS_HORIZONTAL_PADDING,
    paddingBottom: 32,
    gap: 24,
  },
  cardList: {
    gap: 8,
  },
});
