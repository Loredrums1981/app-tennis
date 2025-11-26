import { NextResponse } from 'next/server';

export function middleware(req) {
  const session = req.cookies.get('sb-access-token')?.value;

  const isAuthPage = req.nextUrl.pathname.startsWith('/auth');

  // Se NON loggato → blocca accesso a pagine protette
  if (!session && !isAuthPage) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // Se loggato e prova ad andare su /auth → manda alla dashboard
  if (session && isAuthPage) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Applica il middleware a TUTTE le pagine tranne la homepage pubblica
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|$).*)'],
};
