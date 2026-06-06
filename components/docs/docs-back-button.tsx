import { AppBackButton } from '@/components/app-back-button';
import { docsRoutes } from '@/lib/docs-navigation';

export function DocsBackButton() {
  return <AppBackButton fallbackRoute={docsRoutes.root} />;
}
