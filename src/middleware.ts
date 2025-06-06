import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path matches invitation code pattern (5 characters, alphanumeric, no confusing chars)
  const invitationCodeRegex = /^\/([23456789abcdefghjkmnpqrstuvwxyz]{5})$/;
  const match = pathname.match(invitationCodeRegex);
  
  if (match) {
    const invitationCode = match[1];
    
    // Redirect to homepage with code parameter
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('code', invitationCode);
    
    return NextResponse.redirect(url);
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
     * - admin (admin panel)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|admin).*)',
  ],
};
