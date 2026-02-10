'use client';

import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import type { LinkProps } from 'next/link';
import AppLink from '@/components/shared/AppLink';

type MobileLinkProps = React.ComponentProps<typeof AppLink> & {
  disablePrefix?: boolean;
};

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

const shouldPrefix = (href: string) => {
  if (!href.startsWith('/')) return false;
  if (href.startsWith('/m')) return false;
  if (href.startsWith('/api')) return false;
  if (href.startsWith('/_next')) return false;
  if (href.startsWith('/favicon')) return false;
  if (href.startsWith('/?ui=desktop') || href.includes('ui=desktop')) return false;
  return true;
};

const withMobilePrefix = (href: LinkProps['href']): LinkProps['href'] => {
  if (typeof href === 'string') {
    if (isExternalHref(href) || !shouldPrefix(href)) return href;
    return href === '/' ? '/m' : `/m${href}`;
  }

  if (!href.pathname || !shouldPrefix(href.pathname)) return href;
  return {
    ...href,
    pathname: href.pathname === '/' ? '/m' : `/m${href.pathname}`,
  };
};

const MobileLink = React.forwardRef<HTMLAnchorElement, MobileLinkProps>(
  ({ href, disablePrefix = false, ...props }, ref) => {
    const pathname = usePathname();
    const hrefString = useMemo(() => toHrefString(href), [href]);

    const resolvedHref = useMemo(() => {
      if (disablePrefix) return href;
      if (!pathname?.startsWith('/m')) return href;
      if (!hrefString) return href;
      return withMobilePrefix(href);
    }, [disablePrefix, href, hrefString, pathname]);

    return <AppLink ref={ref} href={resolvedHref} {...props} />;
  }
);

MobileLink.displayName = 'MobileLink';

export default MobileLink;
