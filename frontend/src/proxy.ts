import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const MOBILE_PREFIX = '/m';
const UI_COOKIE = 'ww-ui';

const isMobileUserAgent = (ua: string) =>
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua);

export default function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

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

    if (uiParam === 'mobile') {
      if (!pathname.startsWith(MOBILE_PREFIX)) {
        responseUrl.pathname = `${MOBILE_PREFIX}${pathname}`;
      }
    } else if (pathname.startsWith(MOBILE_PREFIX)) {
      const stripped = pathname.slice(MOBILE_PREFIX.length) || '/';
      responseUrl.pathname = stripped;
    }

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
    url.pathname = `${MOBILE_PREFIX}${pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'],
};
