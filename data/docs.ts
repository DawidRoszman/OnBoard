export type DocsArticleSection = {
  id: string;
  iconName?: string;
  title: string;
  paragraphs?: string[];
  paragraphsAfterList?: string[];
  listItems?: string[];
  tip?: string;
  mentorCard?: {
    name: string;
    message: string;
    buttonLabel: string;
  };
};

export type DocsArticle = {
  id: string;
  categoryId: string;
  title: string;
  subtitle: string;
  readTimeMinutes?: number;
  isRecommended?: boolean;
  sectionGroup?: string;
  intro?: string;
  sections?: DocsArticleSection[];
};

export type DocsCategory = {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
};

export type DocsBrowseGroup = {
  id: string;
  title: string;
  articleIds: string[];
};

const YOUR_FIRST_WEEK_SECTIONS: DocsArticleSection[] = [
  {
    id: 'mentor',
    iconName: 'person',
    title: 'Meet your mentor',
    paragraphs: [
      'Get in touch with your assigned mentor. They will guide you through your first tasks and help you understand how things work in practice.',
    ],
    listItems: [
      'Introduce yourself',
      'Schedule a short intro call',
      'Ask about your first tasks',
      'Clarify expectations for your role',
    ],
    tip: "Don't hesitate to ask even small questions. That's the purpose of this step.",
    mentorCard: {
      name: 'Elon Piżmo',
      message:
        "I'm here if you need anything.\nFeel free to reach out anytime!",
      buttonLabel: 'Say hi to your mentor',
    },
  },
  {
    id: 'workspace',
    iconName: 'desktop-outline',
    title: 'Set up your workspace',
    paragraphs: [
      'Make sure your tools and access are ready before you start working.',
    ],
    listItems: [
      'Activate your company account',
      'Set up email access',
      'Connect to VPN',
      'Test login to main systems',
    ],
    paragraphsAfterList: [
      "If something doesn't work, contact IT Support immediately.",
    ],
  },
  {
    id: 'expect',
    iconName: 'trending-up',
    title: 'What to expect',
    paragraphs: [
      'Your first days are designed to help you gradually settle into the company, not to overwhelm you with information.',
      'You may feel like there is a lot to learn at the beginning - tools, people, processes. But that is completely normal. Most of it will become clear through daily work rather than studying documentation upfront.',
      'The goal is not to know everything immediately, but to understand where to find information and who to ask when something is unclear.',
      "You'll start with simple tasks, get familiar with your team, and slowly build confidence in how things are done here.",
      'Take your time, ask questions, and focus on learning step by step.',
    ],
  },
];

export const DOCS_CATEGORIES: DocsCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting started',
    subtitle: 'Everything you need for your first days',
    iconName: 'rocket-outline',
  },
  {
    id: 'work-basics',
    title: 'Work Basics',
    subtitle: 'Everything you need for daily work',
    iconName: 'briefcase-outline',
  },
  {
    id: 'procedures',
    title: 'Procedures',
    subtitle: 'Step-by-step guides for common tasks',
    iconName: 'list-outline',
  },
  {
    id: 'company',
    title: 'Company',
    subtitle: 'Our values, rules and policies',
    iconName: 'business-outline',
  },
  {
    id: 'it-tools',
    title: 'IT & Tools',
    subtitle: 'Software, access, and setup guides',
    iconName: 'laptop-outline',
  },
  {
    id: 'hr',
    title: 'HR',
    subtitle: 'Leave, benefits, and policies',
    iconName: 'people-outline',
  },
];

export const DOCS_ARTICLES: DocsArticle[] = [
  {
    id: 'vpn-setup',
    categoryId: 'it-tools',
    title: 'VPN Setup',
    subtitle: 'How to connect to the company network',
  },
  {
    id: 'leave-request',
    categoryId: 'hr',
    title: 'Leave Request',
    subtitle: 'How to request time off',
  },
  {
    id: 'software-access',
    categoryId: 'it-tools',
    title: 'Software Access',
    subtitle: 'Install and activate required tools',
  },
  {
    id: 'your-first-week',
    categoryId: 'getting-started',
    title: 'Your First Week',
    subtitle: 'Important steps for a successful start',
    readTimeMinutes: 5,
    isRecommended: true,
    intro:
      'Welcome to your first week!\n\nThis page helps you complete the key setup steps, understand your environment, and start working effectively.',
    sections: YOUR_FIRST_WEEK_SECTIONS,
  },
  {
    id: 'workspace-setup',
    categoryId: 'getting-started',
    title: 'Workspace setup',
    subtitle: 'Tools and accounts you need to work',
    isRecommended: true,
  },
  {
    id: 'key-contacts',
    categoryId: 'getting-started',
    title: 'Key contacts',
    subtitle: 'Who to reach out to in your first days',
  },
  {
    id: 'office-tour',
    categoryId: 'getting-started',
    title: 'Office tour',
    subtitle: 'Find your way around the workplace',
  },
  {
    id: 'company-policies',
    categoryId: 'company',
    title: 'Company Policies',
    subtitle: 'Rules and guidelines',
    sectionGroup: 'company',
  },
  {
    id: 'code-of-conduct',
    categoryId: 'company',
    title: 'Code of Conduct',
    subtitle: 'Workplace standards',
    sectionGroup: 'company',
  },
  {
    id: 'security-guidelines',
    categoryId: 'company',
    title: 'Security Guidelines',
    subtitle: 'Data protection rules',
    sectionGroup: 'company',
  },
  {
    id: 'email-setup',
    categoryId: 'it-tools',
    title: 'Email Setup',
    subtitle: 'Configure work email',
    sectionGroup: 'it-tools',
  },
  {
    id: 'software-installation',
    categoryId: 'it-tools',
    title: 'Software Installation',
    subtitle: 'Required applications',
    sectionGroup: 'it-tools',
  },
];

export const DOCS_RECENTLY_VIEWED_IDS = [
  'vpn-setup',
  'leave-request',
  'software-access',
];

export const DOCS_ESSENTIAL_CATEGORY_IDS = [
  'getting-started',
  'work-basics',
  'procedures',
  'company',
];

export const DOCS_GRID_CATEGORY_IDS = [
  'procedures',
  'work-basics',
  'company',
  'it-tools',
  'hr',
  'getting-started',
];

export const DOCS_BROWSE_GROUPS: DocsBrowseGroup[] = [
  {
    id: 'company',
    title: 'Company',
    articleIds: ['company-policies', 'code-of-conduct', 'security-guidelines'],
  },
  {
    id: 'it-tools',
    title: 'IT & Tools',
    articleIds: ['email-setup', 'software-installation', 'vpn-setup'],
  },
];

export function getArticleById(articleId: string): DocsArticle | undefined {
  return DOCS_ARTICLES.find((article) => article.id === articleId);
}

export function getCategoryById(categoryId: string): DocsCategory | undefined {
  return DOCS_CATEGORIES.find((category) => category.id === categoryId);
}

export function getArticlesByCategory(categoryId: string): DocsArticle[] {
  return DOCS_ARTICLES.filter((article) => article.categoryId === categoryId);
}

export function getRecentlyViewedArticles(): DocsArticle[] {
  return DOCS_RECENTLY_VIEWED_IDS.map((id) => getArticleById(id)).filter(
    (article): article is DocsArticle => article !== undefined,
  );
}

export function getEssentialCategories(): DocsCategory[] {
  return DOCS_ESSENTIAL_CATEGORY_IDS.map((id) => getCategoryById(id)).filter(
    (category): category is DocsCategory => category !== undefined,
  );
}

export function getGridCategories(): DocsCategory[] {
  return DOCS_GRID_CATEGORY_IDS.map((id) => getCategoryById(id)).filter(
    (category): category is DocsCategory => category !== undefined,
  );
}

export type DocsSearchResultGroup = {
  id: string;
  title: string;
  items: DocsArticle[];
};

export function searchDocs(query: string, scope?: { categoryId?: string }): DocsSearchResultGroup[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  const matchesQuery = (article: DocsArticle, category?: DocsCategory) => {
    const haystack = [
      article.title,
      article.subtitle,
      category?.title ?? '',
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  };

  const scopedArticles = scope?.categoryId
    ? getArticlesByCategory(scope.categoryId)
    : DOCS_ARTICLES;

  const matchedArticles = scopedArticles.filter((article) =>
    matchesQuery(article, getCategoryById(article.categoryId)),
  );

  if (scope?.categoryId) {
    const category = getCategoryById(scope.categoryId);
    if (!category || matchedArticles.length === 0) {
      return [];
    }

    return [{ id: scope.categoryId, title: category.title, items: matchedArticles }];
  }

  const essentials = matchedArticles.filter((article) =>
    DOCS_ESSENTIAL_CATEGORY_IDS.includes(article.categoryId),
  );

  const byCategory = new Map<string, DocsArticle[]>();

  for (const article of matchedArticles) {
    if (DOCS_ESSENTIAL_CATEGORY_IDS.includes(article.categoryId)) {
      continue;
    }

    const existing = byCategory.get(article.categoryId) ?? [];
    existing.push(article);
    byCategory.set(article.categoryId, existing);
  }

  const groups: DocsSearchResultGroup[] = [];

  if (essentials.length > 0) {
    groups.push({ id: 'essentials', title: 'Essentials', items: essentials });
  }

  for (const [categoryId, items] of byCategory.entries()) {
    const category = getCategoryById(categoryId);
    if (!category) {
      continue;
    }

    groups.push({ id: categoryId, title: category.title, items });
  }

  return groups;
}

export function hasArticleDetail(article: DocsArticle): boolean {
  return Boolean(article.sections?.length || article.intro);
}
