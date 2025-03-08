import type { NavigationItem } from '../NavBar/NavBar';
import { routes } from 'wasp/client/router';
import { BlogUrl, DocsUrl } from '../../../shared/common';

export const appNavigationItems: NavigationItem[] = [
  { name: 'AdStream AI (Demo App)', to: routes.DemoAppRoute.to },
  { name: '(AWS S3 File Upload)', to: routes.FileUploadRoute.to },
  { name: 'Pricing', to: routes.PricingPageRoute.to },
  // { name: 'Documentation', to: DocsUrl },
  // { name: 'Blog', to: BlogUrl },
];
