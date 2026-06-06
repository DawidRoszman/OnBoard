import type { Href } from 'expo-router';

export const docsRoutes = {
  root: '/(tabs)/docs' as Href,
  all: '/(tabs)/docs/all' as Href,
  category: (categoryId: string) =>
    `/(tabs)/docs/${categoryId}` as Href,
  article: (categoryId: string, articleId: string) =>
    `/(tabs)/docs/${categoryId}/${articleId}` as Href,
};
