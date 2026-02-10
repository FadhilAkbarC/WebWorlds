'use client';

import React, { useCallback, useMemo } from 'react';
import Link, { type LinkProps } from 'next/link';
import { useRouter } from 'next/navigation';

export type PrefetchMode = 'hover' | 'none';

type AppLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> &
  LinkProps & {
    prefetchOn?: PrefetchMode;
  };

const toHrefString = (href: LinkProps['href']) => {
  if (typeof href === 'string') return href;
  try {
    return href.toString();
  } catch {
    return '';
  }
};

const shouldPrefetch = (hrefString: string) => hrefString.startsWith('/');

const AppLink = React.forwardRef<HTMLAnchorElement, AppLinkProps>(
  ({ prefetchOn = 'none', onPointerEnter, onFocus, onTouchStart, href, ...props }, ref) => {
    const router = useRouter();
    const hrefString = useMemo(() => toHrefString(href), [href]);

    const handlePrefetch = useCallback(() => {
      if (prefetchOn === 'none') return;
      if (!hrefString || !shouldPrefetch(hrefString)) return;
      router.prefetch(hrefString);
    }, [prefetchOn, hrefString, router]);

    return (
      <Link
        ref={ref}
        href={href}
        prefetch={false}
        onPointerEnter={(event) => {
          onPointerEnter?.(event);
          handlePrefetch();
        }}
        onFocus={(event) => {
          onFocus?.(event);
          handlePrefetch();
        }}
        onTouchStart={(event) => {
          onTouchStart?.(event);
          handlePrefetch();
        }}
        {...props}
      />
    );
  }
);

AppLink.displayName = 'AppLink';

export default AppLink;
