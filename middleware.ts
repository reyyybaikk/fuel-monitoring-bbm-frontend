 // middleware.ts – Global Next.js middleware for auth handling
 import { NextResponse } from 'next/server';
 import type { NextRequest } from 'next/server';
 export function middleware(request: NextRequest) {
   const token = request.cookies.get('auth_token')?.value;
   const pathname = request.nextUrl.pathname;
   // Allow the refresh-token endpoint to be accessed without a valid auth token
   if (pathname.startsWith('/api/auth/refresh')) {
     return NextResponse.next();
   }
   // If a token exists, let the request continue (including the login page)
   if (token) {
     return NextResponse.next();
   }
   // No token – redirect to login unless we are already on the login page
   // Exclude static assets, API routes and favicon from redirect
   if (!pathname.startsWith('/login') && !pathname.startsWith('/api')) {
     if (
       pathname.startsWith('/_next/') ||
       pathname.startsWith('/favicon.ico')
     ) {
       return NextResponse.next();
     }
     const url = request.nextUrl.clone();
     url.pathname = '/login';
     return NextResponse.redirect(url);
   }
   return NextResponse.next();
 }
 export const config = {
   // Apply to every route except static assets, API routes, and favicon
   matcher: '/((?!_next/static|_next/image|api|favicon.ico).*)',
 };
