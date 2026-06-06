import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppNavBar } from '@/components/app-navbar';
import { DocsBackButton } from '@/components/docs/docs-back-button';
import { DocsHelpActions } from '@/components/docs/docs-help-actions';
import { DocsHorizontalCard } from '@/components/docs/docs-horizontal-card';
import { DocsSearchBar } from '@/components/docs/docs-search-bar';
import { DocsSection } from '@/components/docs/docs-section';
import { BACKGROUND_COLOR, MESSAGE_COLOR } from '@/constants/auth-ui';
import { DOCS_HORIZONTAL_PADDING } from '@/constants/docs-ui';
import {
  getArticlesByCategory,
  getCategoryById,
  hasArticleDetail,
  searchDocs,
} from '@/data/docs';
import { docsRoutes } from '@/lib/docs-navigation';

export default function DocsCategoryScreen() {
  const router = useRouter();
  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();
  const [searchQuery, setSearchQuery] = useState('');

  const category = categoryId ? getCategoryById(categoryId) : undefined;
  const articles = categoryId ? getArticlesByCategory(categoryId) : [];
  const recommended = articles.filter((article) => article.isRecommended);
  const otherArticles = articles.filter((article) => !article.isRecommended);

  const searchResults = useMemo(
    () => (categoryId ? searchDocs(searchQuery, { categoryId }) : []),
    [categoryId, searchQuery],
  );

  const hasSearchQuery = searchQuery.trim().length > 0;

  function openArticle(articleId: string) {
    if (!categoryId) {
      return;
    }

    router.push(docsRoutes.article(categoryId, articleId));
  }

  if (!category) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppNavBar title="Docs" leftAction={<DocsBackButton />} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Category not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppNavBar title={category.title} leftAction={<DocsBackButton />} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <DocsSearchBar
          value={searchQuery}
          placeholder={`Find in ${category.title}`}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
        />

        {hasSearchQuery ? (
          <View style={styles.results}>
            {searchResults.length === 0 ? (
              <Text style={styles.emptyText}>No documents match your search.</Text>
            ) : (
              searchResults.map((group) => (
                <DocsSection key={group.id} title={group.title}>
                  <View style={styles.cardList}>
                    {group.items.map((article) => (
                      <DocsHorizontalCard
                        key={article.id}
                        title={article.title}
                        subtitle={article.subtitle}
                        onPress={() =>
                          hasArticleDetail(article)
                            ? openArticle(article.id)
                            : undefined
                        }
                      />
                    ))}
                  </View>
                </DocsSection>
              ))
            )}
          </View>
        ) : (
          <>
            {recommended.length > 0 ? (
              <DocsSection
                title="Recommended"
                titleAccessory={
                  <Ionicons name="star" size={24} color={MESSAGE_COLOR} />
                }>
                <View style={styles.cardList}>
                  {recommended.map((article) => (
                    <DocsHorizontalCard
                      key={article.id}
                      title={article.title}
                      subtitle={article.subtitle}
                      onPress={() =>
                        hasArticleDetail(article)
                          ? openArticle(article.id)
                          : undefined
                      }
                    />
                  ))}
                </View>
              </DocsSection>
            ) : null}

            {otherArticles.length > 0 ? (
              <DocsSection title="Other articles">
                <View style={styles.cardList}>
                  {otherArticles.map((article) => (
                    <DocsHorizontalCard
                      key={article.id}
                      title={article.title}
                      subtitle={article.subtitle}
                      onPress={() =>
                        hasArticleDetail(article)
                          ? openArticle(article.id)
                          : undefined
                      }
                    />
                  ))}
                </View>
              </DocsSection>
            ) : null}

            <DocsHelpActions />
          </>
        )}
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
  results: {
    gap: 24,
  },
  cardList: {
    gap: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 14,
    color: '#93998D',
    textAlign: 'center',
  },
});
