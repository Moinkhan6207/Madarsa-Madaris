import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const role = request.cookies.get('user_role')?.value;
  const { pathname } = request.nextUrl;

  // 1. Define segments
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isPlatformRoute = pathname.startsWith('/platform');
  const isTenantRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/setup') || pathname.startsWith('/pending');
  const isLandingRoute = pathname === '/';

  // 2. Auth Logic
  if (!token) {
    // If trying to access protected routes without token -> redirect to login
    if (isPlatformRoute || isTenantRoute) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'session_expired');
      return NextResponse.redirect(loginUrl);
    }
  } else {
    // If logged in and trying to access auth routes -> redirect to appropriate dashboard
    if (isAuthRoute) {
      if (role === 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/platform/tenants', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Role-based protection
    if (isPlatformRoute && role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // =============================================================================
  // 3. Subdomain & Public Route Preparation
  // =============================================================================
  const host = request.headers.get('host') || '';
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'madarsa-saas.com';
  
  const reservedPaths = ['login', 'register', 'dashboard', 'platform', 'api', 'public', 'setup', 'pending', '_next', 'favicon.ico', 'assets'];
  const segments = pathname.split('/').filter(Boolean);

  // A. Access via Subdomain (e.g., idara.saas.com/path)
  if (!isLocalhost && host !== mainDomain && !host.startsWith('www.')) {
    const subdomain = host.split('.')[0];
    const isPublicSegment = !isTenantRoute && !isPlatformRoute && !isAuthRoute;
    
    if (subdomain && isPublicSegment) {
       return NextResponse.rewrite(new URL(`/public/${subdomain}${pathname}`, request.url));
    }
  }

  // B. Access via Main Domain Path (e.g., saas.com/idara/path)
  if (segments.length > 0 && !reservedPaths.includes(segments[0])) {
    const tenantSlug = segments[0];
    const restOfPath = segments.slice(1).join('/');
    
    // Validate if it's not a direct public access already
    if (pathname.startsWith('/public')) return NextResponse.next();

    // Rewrite internally to /public/[tenantSlug]/[restOfPath]
    return NextResponse.rewrite(new URL(`/public/${tenantSlug}/${restOfPath}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
  ],
};
