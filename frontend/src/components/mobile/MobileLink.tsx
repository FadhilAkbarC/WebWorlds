'use client';

import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import type { LinkProps } from 'next/link';
import AppLink from '@/components/shared/AppLink';

type MobileLinkProps = React.ComponentProps<typeof AppLink> & {
  disablePrefix?: boolean;
};

const MOBILE_PREFIX = '/mobile';
const LEGACY_MOBILE_PREFIX = '/m';

const toHrefString = (href: LinkProps['href']) => {
  if (typeof href === 'string') return href;
  try {
    return href.toString();
  } catch {
    return '';
  }
};

const isExternalHref = (href: string) =>
  href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:');

const isMobilePath = (href: string) =>
  href.startsWith(MOBILE_PREFIX) || href.startsWith(LEGACY_MOBILE_PREFIX);

const shouldPrefix = (href: string) => {
  if (!href.startsWith('/')) return false;
  if (isMobilePath(href)) return false;
  if (href.startsWith('/api')) return false;
  if (href.startsWith('/_next')) return false;
  if (href.startsWith('/favicon')) return false;
  if (href.startsWith('/?ui=desktop') || href.includes('ui=desktop')) return false;
  return true;
};

const withMobilePrefix = (href: LinkProps['href']): LinkProps['href'] => {
  if (typeof href === 'string') {
    if (isExternalHref(href) || !shouldPrefix(href)) return href;
    return href === '/' ? MOBILE_PREFIX : `${MOBILE_PREFIX}${href}`;
  }

  if (!href.pathname || !shouldPrefix(href.pathname)) return href;
  return {
    ...href,
    pathname: href.pathname === '/' ? MOBILE_PREFIX : `${MOBILE_PREFIX}${href.pathname}`,
  };
};

const MobileLink = React.forwardRef<HTMLAnchorElement, MobileLinkProps>(
  ({ href, disablePrefix = false, ...props }, ref) => {
    const pathname = usePathname();
    const hrefString = useMemo(() => toHrefString(href), [href]);

    const resolvedHref = useMemo(() => {
      if (disablePrefix) return href;
      if (!pathname || !isMobilePath(pathname)) return href;
      if (!hrefString) return href;
      return withMobilePrefix(href);
    }, [disablePrefix, href, hrefString, pathname]);

    return <AppLink ref={ref} href={resolvedHref} {...props} />;
  }
);

MobileLink.displayName = 'MobileLink';

export default MobileLink;
