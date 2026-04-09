import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware to protect authenticated routes.
 * Redirects unauthenticated users to /login.
 * Also ensures cart_id cookie exists for cart persistence.
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get("__Secure-next-auth.session-token");
  const { pathname } = request.nextUrl;

  // Protected routes: /account/*
  if (pathname.startsWith("/account")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Ensure cart_id cookie exists for cart persistence
  if (!request.cookies.has("cart_id")) {
    const response = NextResponse.next();
    response.cookies.set("cart_id", crypto.randomUUID(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/cart/:path*", "/checkout/:path*"],
};
