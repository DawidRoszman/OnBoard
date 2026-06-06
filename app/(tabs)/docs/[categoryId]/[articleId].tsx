import { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { withReturnTo } from '@/lib/back-navigation';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppNavBar } from '@/components/app-navbar';
import { DocsBackButton } from '@/components/docs/docs-back-button';
import { DocsHelpActions } from '@/components/docs/docs-help-actions';
import { DocsMentorCard } from '@/components/docs/docs-mentor-card';
import { BACKGROUND_COLOR, MESSAGE_COLOR } from '@/constants/auth-ui';
import { DOCS_HORIZONTAL_PADDING, DOCS_SUBTITLE } from '@/constants/docs-ui';
import { getArticleById } from '@/data/docs';

const MENTOR_PROFILE_ROUTE = '/(tabs)/mentor';

export default function DocsArticleScreen() {
  const router = useRouter();
  const { categoryId, articleId } = useLocalSearchParams<{
    categoryId?: string;
    articleId?: string;
  }>();

  const article =
    articleId && categoryId
      ? getArticleById(articleId)
      : undefined;

  const isValidArticle =
    article !== undefined && article.categoryId === categoryId;

  function openMentorProfile() {
    if (!categoryId || !articleId) {
      router.push(MENTOR_PROFILE_ROUTE as Href);
      return;
    }

    router.push(
      withReturnTo(
        MENTOR_PROFILE_ROUTE,
        `/(tabs)/docs/${categoryId}/${articleId}`,
      ),
    );
  }

  if (!isValidArticle || !article.sections) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppNavBar title="Docs" leftAction={<DocsBackButton />} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Article not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppNavBar title={article.title} leftAction={<DocsBackButton />} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.articleTitle}>
            {article.id === 'your-first-week'
              ? 'Important steps for a successful start'
              : article.title}
          </Text>
          {article.readTimeMinutes ? (
            <View style={styles.readTimeRow}>
              <Ionicons name="time-outline" size={24} color={DOCS_SUBTITLE} />
              <Text style={styles.readTimeText}>
                {article.readTimeMinutes} min read
              </Text>
            </View>
          ) : null}
        </View>

        {article.intro ? (
          <Text style={styles.introText}>{article.intro}</Text>
        ) : null}

        {article.sections.map((section) => (
          <View key={section.id} style={styles.section}>
            <View style={styles.sectionHeader}>
              {section.iconName ? (
                <Ionicons
                  name={section.iconName as never}
                  size={24}
                  color={MESSAGE_COLOR}
                />
              ) : null}
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>

            {section.paragraphs?.map((paragraph) => (
              <Text key={paragraph} style={styles.bodyText}>
                {paragraph}
              </Text>
            ))}

            {section.listItems ? (
              <View style={styles.list}>
                {section.listItems.map((item) => (
                  <View key={item} style={styles.listItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bodyText}>{item}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {section.paragraphsAfterList?.map((paragraph) => (
              <Text key={paragraph} style={styles.bodyText}>
                {paragraph}
              </Text>
            ))}

            {section.tip ? (
              <Text style={styles.bodyText}>
                <Text style={styles.tipLabel}>Tip: </Text>
                {section.tip}
              </Text>
            ) : null}

            {section.mentorCard ? (
              <DocsMentorCard
                name={section.mentorCard.name}
                message={section.mentorCard.message}
                buttonLabel={section.mentorCard.buttonLabel}
                onPress={openMentorProfile}
              />
            ) : null}
          </View>
        ))}

        <DocsHelpActions />
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
    paddingBottom: 40,
    gap: 24,
  },
  header: {
    gap: 8,
  },
  articleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: MESSAGE_COLOR,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  readTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  readTimeText: {
    fontSize: 16,
    fontWeight: '300',
    color: DOCS_SUBTITLE,
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
    color: MESSAGE_COLOR,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: MESSAGE_COLOR,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    color: MESSAGE_COLOR,
  },
  tipLabel: {
    fontWeight: '700',
  },
  list: {
    gap: 4,
  },
  listItem: {
    flexDirection: 'row',
    gap: 8,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 16,
    color: MESSAGE_COLOR,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 14,
    color: DOCS_SUBTITLE,
  },
});
