import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware to protect authenticated routes.
 * Redirects unauthenticated users to /login.
 *
 * The cart_id cookie is owned by the cart store (use-cart.ts), which sets it
 * to a real Medusa cart ID. Do not seed it here — a random value would
 * shadow the client cookie and break cart persistence.
 */
export function middleware(request: NextRequest) {
  // Cookie name is host-prefixed in production (HTTPS) only.
  const token =
    request.cookies.get("__Secure-next-auth.session-token") ??
    request.cookies.get("next-auth.session-token");
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/account") && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Clean up legacy cart_id cookies seeded by an old version of this
  // middleware (random UUIDs, httpOnly — unfixable from client JS).
  const cartId = request.cookies.get("cart_id");
  if (cartId && !cartId.value.startsWith("cart_")) {
    const response = NextResponse.next();
    response.cookies.delete("cart_id");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/cart/:path*", "/checkout/:path*", "/products/:path*", "/"],
};
