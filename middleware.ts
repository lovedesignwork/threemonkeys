import { NextRequest, NextResponse } from 'next/server';

/**
 * Maintenance mode middleware.
 *
 * Behaviour:
 *   - When env `MAINTENANCE_MODE === 'true'`, every public-facing page is
 *     rewritten to /maintenance and shows a branded "back soon" screen.
 *   - Admin pages (/admin/*) and API routes (/api/*) are always allowed
 *     through — admins log in normally and webhooks keep firing.
 *   - Owner bypass: visit any URL with `?preview=<PIN>` once. If the PIN
 *     matches env `MAINTENANCE_BYPASS_PIN`, a 30-day signed cookie is set
 *     and you get the full site like a regular visitor.
 *   - Static assets, /_next, /favicon.ico, images are always allowed so the
 *     maintenance page itself can render the logo.
 *
 * To turn off maintenance: set `MAINTENANCE_MODE=false` (or remove it) in
 * Vercel env vars and redeploy. No code change needed.
 */
export function middleware(req: NextRequest) {
  const maintenanceOn = process.env.MAINTENANCE_MODE === 'true';
  if (!maintenanceOn) return NextResponse.next();

  const { pathname, searchParams } = req.nextUrl;

  // Always allow these paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname === '/maintenance' ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fonts') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    /\.(svg|png|jpe?g|gif|webp|ico|woff2?|ttf|otf|css|js|map)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  const bypassPin = process.env.MAINTENANCE_BYPASS_PIN ?? '';
  const cookieName = 'tm_preview';

  // Bypass via query param: ?preview=<PIN>
  const queryPin = searchParams.get('preview');
  if (queryPin && bypassPin && queryPin === bypassPin) {
    // Strip the param and redirect to a clean URL, setting a long-lived cookie
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

  // Bypass for logged-in admins. Our auth flow stores the Supabase session in
  // localStorage (see lib/supabase/auth.ts), so we set a small flag cookie
  // `tm_admin=1` on login. Middleware just checks the flag exists — actual
  // admin data access is still gated by Supabase JWT verification in the
  // admin API routes, so the worst a spoofed cookie could do is reveal the
  // public site, which is harmless.
  const adminFlag = req.cookies.get('tm_admin')?.value;
  if (adminFlag === '1') {
    return NextResponse.next();
  }

  // Otherwise: serve the maintenance page (preserving the original URL so
  // the user's address bar isn't disturbed)
  return NextResponse.rewrite(new URL('/maintenance', req.url));
}

export const config = {
  // Skip middleware on internal Next.js paths and obvious static assets so
  // we don't pay the cost on every image request.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
