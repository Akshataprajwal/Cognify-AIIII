import { NextRequest, NextResponse } from "next/server";

// Routes that require authentication
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/projects",
  "/ai-workspace",
  "/settings",
  "/billing",
  "/history",
  "/admin",
  "/templates",
];

// Routes that require admin role
const ADMIN_ONLY = ["/admin"];

// Routes only for unauthenticated users (redirect logged-in users away)
const AUTH_ONLY = ["/login", "/register", "/forgot-password"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Read the JWT token from the cognify-auth cookie or the localStorage serialized value.
  // Because Next.js middleware runs on the Edge, we use a cookie named "cognify-token"
  // that we set from the client after login (via a thin cookie setter).
  const token = req.cookies.get("cognify-token")?.value;
  const userRole = req.cookies.get("cognify-role")?.value;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const isAdmin = ADMIN_ONLY.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const isAuthOnly = AUTH_ONLY.some((p) => pathname.startsWith(p));

  if (isProtected && !token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdmin && userRole !== "ADMIN") {
    const unauthorizedUrl = req.nextUrl.clone();
    unauthorizedUrl.pathname = "/unauthorized";
    return NextResponse.redirect(unauthorizedUrl);
  }

  if (isAuthOnly && token) {
    const dashboardUrl = req.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - public folder
     * - API routes
     */
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
