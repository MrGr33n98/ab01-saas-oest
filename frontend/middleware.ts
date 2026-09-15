import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE = "NEXT_LOCALE";

/**
 * Lightweight locale routing:
 * - /en/* → English marketing mirror (rewrite optional)
 * - Cookie NEXT_LOCALE for app shell
 * Does not force-prefix all app routes (API stays locale-agnostic).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const res = NextResponse.next();

  // Skip static / api
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return res;
  }

  const cookieLocale = request.cookies.get(COOKIE)?.value;
  if (pathname.startsWith("/en")) {
    res.cookies.set(COOKIE, "en", { path: "/", maxAge: 31536000 });
  } else if (!cookieLocale) {
    const accept = request.headers.get("accept-language") || "";
    const preferEn = accept.toLowerCase().startsWith("en");
    res.cookies.set(COOKIE, preferEn ? "en" : "pt-BR", {
      path: "/",
      maxAge: 31536000,
    });
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
