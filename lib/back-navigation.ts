import type { Href } from 'expo-router';
import { useLocalSearchParams, useRouter } from 'expo-router';

const SCHEDULE_ROOT = '/(tabs)/schedule' as Href;

export function withReturnTo(targetRoute: string, returnToRoute: string): Href {
  const separator = targetRoute.includes('?') ? '&' : '?';
  return `${targetRoute}${separator}returnTo=${encodeURIComponent(returnToRoute)}` as Href;
}

function getTabKey(path: string): string {
  const normalized = path.replace(/\/$/, '') || '/';

  if (normalized === '/' || normalized === '/(tabs)') {
    return 'index';
  }

  const withoutGroup = normalized.replace(/^\/\(tabs\)/, '');
  const [segment] = withoutGroup.split('/').filter(Boolean);

  return segment ?? 'index';
}

function isCrossTabReturn(returnToPath: string, fallbackPath: string): boolean {
  return getTabKey(returnToPath) !== getTabKey(fallbackPath);
}

export function useOriginAwareBack() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();

  function goBack(fallbackRoute: Href) {
    if (returnTo) {
      const destination = returnTo as string;

      if (isCrossTabReturn(destination, fallbackRoute as string)) {
        if (router.canDismiss()) {
          router.dismiss();
        } else if (getTabKey(fallbackRoute as string) === 'schedule') {
          router.replace(SCHEDULE_ROOT);
        }

        router.navigate(destination as Href);
        return;
      }

      router.dismissTo(returnTo as Href);
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(fallbackRoute);
  }

  return { goBack, returnTo };
}
