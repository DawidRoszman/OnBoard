export const PROFILE_LANGUAGE_LABELS = {
  en: 'English',
  pl: 'Polski',
} as const;

export type ProfileLanguage = keyof typeof PROFILE_LANGUAGE_LABELS;

export function getProfileLanguageLabel(language?: string): string {
  if (language === 'pl') {
    return PROFILE_LANGUAGE_LABELS.pl;
  }

  return PROFILE_LANGUAGE_LABELS.en;
}

export function isPolishLanguage(language?: string): boolean {
  return language === 'pl';
}

export function getToggledProfileLanguage(language?: string): ProfileLanguage {
  return isPolishLanguage(language) ? 'en' : 'pl';
}
