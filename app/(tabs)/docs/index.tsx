import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppNavBar } from '@/components/app-navbar';
import { DocsHorizontalCard } from '@/components/docs/docs-horizontal-card';
import { DocsSearchBar } from '@/components/docs/docs-search-bar';
import { DocsSection } from '@/components/docs/docs-section';
import { DocsVerticalCard } from '@/components/docs/docs-vertical-card';
import { BACKGROUND_COLOR, BRAND_COLOR } from '@/constants/auth-ui';
import { DOCS_HORIZONTAL_PADDING } from '@/constants/docs-ui';
import {
  getArticleById,
  getEssentialCategories,
  getGridCategories,
  getRecentlyViewedArticles,
  hasArticleDetail,
  searchDocs,
} from '@/data/docs';
import { docsRoutes } from '@/lib/docs-navigation';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export default function DocsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const recentlyViewed = getRecentlyViewedArticles();
  const essentials = getEssentialCategories();
  const categories = getGridCategories();

  const searchResults = useMemo(
    () => searchDocs(searchQuery),
    [searchQuery],
  );

  const hasSearchQuery = searchQuery.trim().length > 0;

  function openCategory(categoryId: string) {
    router.push(docsRoutes.category(categoryId));
  }

  function openArticle(categoryId: string, articleId: string) {
    router.push(docsRoutes.article(categoryId, articleId));
  }

  function handleEssentialPress(categoryId: string) {
    openCategory(categoryId);
  }

  function handleArticlePress(categoryId: string, articleId: string) {
    const article = getArticleById(articleId);
    if (article && hasArticleDetail(article)) {
      openArticle(categoryId, articleId);
      return;
    }

    openCategory(categoryId);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppNavBar title="Docs" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <DocsSearchBar
          value={searchQuery}
          placeholder="Search for the document"
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
                            ? openArticle(article.categoryId, article.id)
                            : openCategory(article.categoryId)
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
            <DocsSection title="Recently viewed">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recentRow}>
                {recentlyViewed.map((article) => (
                  <DocsVerticalCard
                    key={article.id}
                    title={article.title}
                    subtitle={article.subtitle}
                    variant="large"
                    onPress={() =>
                      handleArticlePress(article.categoryId, article.id)
                    }
                  />
                ))}
              </ScrollView>
            </DocsSection>

            <DocsSection title="Essentials">
              <View style={styles.cardList}>
                {essentials.map((category) => (
                  <DocsHorizontalCard
                    key={category.id}
                    title={category.title}
                    subtitle={category.subtitle}
                    onPress={() => handleEssentialPress(category.id)}
                  />
                ))}
              </View>
            </DocsSection>

            <DocsSection title="Categories">
              <View style={styles.categoryGrid}>
                {categories.map((category) => (
                  <DocsVerticalCard
                    key={category.id}
                    title={category.title}
                    iconName={category.iconName as IoniconName}
                    onPress={() => openCategory(category.id)}
                  />
                ))}
              </View>
            </DocsSection>

            <DocsSection title="Browse all docs">
              <Pressable
                style={styles.exploreButton}
                onPress={() => router.push(docsRoutes.all)}
                accessibilityRole="button"
                accessibilityLabel="Explore everything">
                <Text style={styles.exploreButtonText}>Explore everything</Text>
                <Text style={styles.exploreArrow}>→</Text>
              </Pressable>
            </DocsSection>
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
    gap: 28,
  },
  results: {
    gap: 24,
  },
  cardList: {
    gap: 8,
  },
  recentRow: {
    gap: 16,
    paddingRight: 8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  exploreButton: {
    alignSelf: 'center',
    width: 264,
    minHeight: 72,
    borderRadius: 4,
    backgroundColor: BRAND_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 4,
  },
  exploreButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#F2FFF3',
    textDecorationLine: 'underline',
  },
  exploreArrow: {
    fontSize: 18,
    color: '#F2FFF3',
    letterSpacing: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#93998D',
    textAlign: 'center',
    paddingVertical: 24,
  },
});
