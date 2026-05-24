import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

/**
 * Composed middleware:
 *   1. Maintenance gate (env MAINTENANCE_MODE === 'true').
 *   2. next-intl locale routing for everything else (/, /th, /cn, …).
 *
 * Admin pages (/admin/*) and API routes (/api/*) are not localised and
 * are also exempt from maintenance mode for logged-in admins.
 *
 * To turn off maintenance: set MAINTENANCE_MODE=false (or remove it) in
 * Vercel env vars and redeploy. No code change needed.
 */
export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // ────────────────────────────────────────────────
  // Non-localised paths bypass next-intl entirely.
  // ────────────────────────────────────────────────
  const isAdminOrApi =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname === '/maintenance';

  // ────────────────────────────────────────────────
  // 1. Maintenance gate
  // ────────────────────────────────────────────────
  const maintenanceOn = process.env.MAINTENANCE_MODE === 'true';
  if (maintenanceOn) {
    const isAllowedPath =
      isAdminOrApi ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/images') ||
      pathname.startsWith('/fonts') ||
      pathname === '/favicon.ico' ||
      pathname === '/robots.txt' ||
      pathname === '/sitemap.xml' ||
      /\.(svg|png|jpe?g|gif|webp|ico|woff2?|ttf|otf|css|js|map)$/i.test(pathname);

    if (!isAllowedPath) {
      const bypassPin = process.env.MAINTENANCE_BYPASS_PIN ?? '';
      const cookieName = 'tm_preview';

      // Bypass via query param: ?preview=<PIN>
      const queryPin = searchParams.get('preview');
      if (queryPin && bypassPin && queryPin === bypassPin) {
        const cleanUrl = req.nextUrl.clone();
        cleanUrl.searchParams.delete('preview');
        const res = NextResponse.redirect(cleanUrl);
        res.cookies.set(cookieName, bypassPin, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });
        return res;
      }

      // Bypass via existing cookie
      const cookieValue = req.cookies.get(cookieName)?.value;
      if (cookieValue && bypassPin && cookieValue === bypassPin) {
        return NextResponse.next();
      }

      // Bypass for logged-in admins.
      const adminFlag = req.cookies.get('tm_admin')?.value;
      if (adminFlag === '1') {
        return NextResponse.next();
      }

      // Otherwise: serve the maintenance page.
      return NextResponse.rewrite(new URL('/maintenance', req.url));
    }
  }

  // ────────────────────────────────────────────────
  // 2. Locale routing — skip for admin/api
  // ────────────────────────────────────────────────
  if (isAdminOrApi) {
    return NextResponse.next();
  }

  return intlMiddleware(req);
}

export const config = {
  // Match everything except internal Next.js paths and obvious static
  // assets. The function itself further filters admin/api/static.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)'],
};
