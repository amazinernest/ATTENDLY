import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "classmark-super-secure-jwt-session-secret-key-32chars-minimum"
);

const SESSION_COOKIE_NAME = "classmark_session";

// Routes that strictly require lecturer authentication
const protectedPrefixes = ["/dashboard", "/courses", "/settings", "/students"];

// Routes for unauthenticated users (redirect to dashboard if already logged in)
const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  let isValidSession = false;

  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, JWT_SECRET);
      if (payload && payload.userId) {
        isValidSession = true;
      }
    } catch {
      isValidSession = false;
    }
  }

  // 1. Check protected routes
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isProtected) {
    if (!isValidSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);

      const response = NextResponse.redirect(loginUrl);
      if (sessionCookie) {
        // Clear invalid/expired cookie
        response.cookies.delete(SESSION_COOKIE_NAME);
      }
      return response;
    }
  }

  // 2. Redirect already authenticated lecturers away from auth pages to /dashboard
  const isAuthRoute = authRoutes.some((route) => pathname === route);
  if (isAuthRoute && isValidSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes (/api/*)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - attendance/* (public student check-in pages)
     * - public assets (.png, .jpg, .svg, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|attendance/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
