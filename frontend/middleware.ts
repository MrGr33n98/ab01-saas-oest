import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE = "NEXT_LOCALE";

/**
 * Lightweight locale routing & prefix rewrite:
 * - /en and /en/* → Rewrites internally to /* while setting NEXT_LOCALE=en cookie
 * - Retains cookie NEXT_LOCALE for app shell
 * - Prevents 404 on prefixed category and operator routes
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static / api / public files
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // If path starts with /en, rewrite internally to the root route and set locale cookie to 'en'
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = request.nextUrl.clone();
    const stripped = pathname.replace(/^\/en/, "") || "/";
    url.pathname = stripped;

    const res = NextResponse.rewrite(url);
    res.cookies.set(COOKIE, "en", {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });
    return res;
  }

  const res = NextResponse.next();
  const cookieLocale = request.cookies.get(COOKIE)?.value;

  if (!cookieLocale) {
    const accept = request.headers.get("accept-language") || "";
    const preferEn = accept.toLowerCase().startsWith("en");
    res.cookies.set(COOKIE, preferEn ? "en" : "pt-BR", {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
