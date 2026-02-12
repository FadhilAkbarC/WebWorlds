import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const MOBILE_PREFIX = '/mobile';
const LEGACY_MOBILE_PREFIX = '/m';
const UI_COOKIE = 'ww-ui';

const isMobileUserAgent = (ua: string) =>
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua);

const isLegacyMobilePath = (pathname: string) =>
  pathname === LEGACY_MOBILE_PREFIX || pathname.startsWith(`${LEGACY_MOBILE_PREFIX}/`);

const toMobilePath = (pathname: string) => {
  if (pathname.startsWith(MOBILE_PREFIX)) return pathname;
  if (isLegacyMobilePath(pathname)) {
    const suffix = pathname.slice(LEGACY_MOBILE_PREFIX.length) || '';
    return suffix ? `${MOBILE_PREFIX}${suffix}` : MOBILE_PREFIX;
  }
  return pathname === '/' ? MOBILE_PREFIX : `${MOBILE_PREFIX}${pathname}`;
};

const toDesktopPath = (pathname: string) => {
  if (pathname.startsWith(MOBILE_PREFIX)) {
    return pathname.slice(MOBILE_PREFIX.length) || '/';
  }
  if (isLegacyMobilePath(pathname)) {
    return pathname.slice(LEGACY_MOBILE_PREFIX.length) || '/';
  }
  return pathname;
};

export default function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (isLegacyMobilePath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = toMobilePath(pathname);
    return NextResponse.redirect(redirectUrl, 308);
  }

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith(MOBILE_PREFIX) ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/robots') ||
    pathname.startsWith('/sitemap') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const uiParam = searchParams.get('ui');
  if (uiParam === 'mobile' || uiParam === 'desktop') {
    const responseUrl = request.nextUrl.clone();
    responseUrl.searchParams.delete('ui');
    responseUrl.pathname = uiParam === 'mobile' ? toMobilePath(pathname) : toDesktopPath(pathname);

    const response = NextResponse.redirect(responseUrl);
    response.cookies.set(UI_COOKIE, uiParam, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });
    return response;
  }

  const uiCookie = request.cookies.get(UI_COOKIE)?.value;
  const isMobile =
    uiCookie === 'mobile' ||
    (uiCookie !== 'desktop' && isMobileUserAgent(request.headers.get('user-agent') || ''));

  if (isMobile) {
    const url = request.nextUrl.clone();
    url.pathname = toMobilePath(pathname);
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'],
};
