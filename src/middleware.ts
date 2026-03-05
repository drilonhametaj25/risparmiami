import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  "/",
  "/login",
  "/registrati",
  "/blog",
  "/come-funziona",
  "/prezzi",
  "/guida-pdf",
  "/tools",
  "/privacy",
  "/termini",
  "/cookie",
  "/bonus-2026-elenco-completo",
  "/detrazioni-fiscali-2026",
  "/risparmio-bollette-luce-gas",
];

const publicPrefixes = ["/blog/", "/tools/", "/login/", "/api/auth/", "/api/pdf/", "/api/cron/", "/api/stripe/"];

function isPublicRoute(pathname: string): boolean {
  if (publicRoutes.includes(pathname)) return true;
  return publicPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check for session cookie (NextAuth database sessions)
  const sessionToken =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value;
  const isLoggedIn = !!sessionToken;

  // Public routes: allow everyone
  if (isPublicRoute(pathname)) {
    // If logged in user visits /login or /registrati, redirect to dashboard
    if (isLoggedIn && (pathname === "/login" || pathname === "/registrati")) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
    return NextResponse.next();
  }

  // Protected routes: require auth
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
