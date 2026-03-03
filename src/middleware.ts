import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

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

// Routes that start with these prefixes are public
const publicPrefixes = ["/blog/", "/tools/", "/login/", "/api/auth/", "/api/pdf/", "/api/cron/", "/api/stripe/"];

function isPublicRoute(pathname: string): boolean {
  if (publicRoutes.includes(pathname)) return true;
  return publicPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Public routes: allow everyone
  if (isPublicRoute(pathname)) {
    // If logged in user visits /login, redirect to dashboard
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

  // Post-login: if onboarding not completed, redirect to onboarding
  // (except if already on onboarding page)
  if (
    !pathname.startsWith("/onboarding") &&
    !pathname.startsWith("/admin") &&
    !req.auth?.user?.onboardingCompleted
  ) {
    return NextResponse.redirect(
      new URL("/onboarding/personale", req.nextUrl)
    );
  }

  // Admin routes: require admin role
  if (pathname.startsWith("/admin") && req.auth?.user?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  // Dashboard incentivi requires azienda plan
  if (
    pathname.startsWith("/dashboard/incentivi") &&
    req.auth?.user?.currentPlan !== "azienda"
  ) {
    return NextResponse.redirect(new URL("/prezzi", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
