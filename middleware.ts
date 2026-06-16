import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('admin_session');
  const isAuthenticated = session && session.value === 'authenticated';

  // 1. Protect /admin routes
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  if (isAdminRoute && !isAuthenticated) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }
  
  // 2. Protect login route if already authenticated
  const isLoginRoute = request.nextUrl.pathname.startsWith('/login');
  if (isLoginRoute && isAuthenticated) {
    const url = new URL('/admin', request.url);
    return NextResponse.redirect(url);
  }

  // 3. Protect API routes (Only POST/PUT/DELETE should be protected, GET is public)
  const isProtectedApi = 
    request.nextUrl.pathname.startsWith('/api/config') || 
    request.nextUrl.pathname.startsWith('/api/guests') ||
    request.nextUrl.pathname.startsWith('/api/upload');
                         
  if (isProtectedApi && request.method !== 'GET') {
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  
  // 4. Protect specific API methods (DELETE on wishes is protected, POST is public)
  if (request.nextUrl.pathname.startsWith('/api/wishes') && request.method === 'DELETE') {
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/api/:path*'],
};
