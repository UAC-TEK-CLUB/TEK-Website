import { NextResponse, type NextRequest } from "next/server";

const VISITOR_COOKIE = "tek_visitor_id";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/profile",
  "/meetings",
  "/proposals",
  "/bulletin",
  "/gallery",
  "/messages",
  "/admin",
];

const OFFICER_PREFIX = "/admin";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const requiresAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (requiresAuth) {
    const sessionCookie =
      req.cookies.get("authjs.session-token") ??
      req.cookies.get("__Secure-authjs.session-token") ??
      req.cookies.get("next-auth.session-token");
    if (!sessionCookie) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const res = NextResponse.next();

  if (!pathname.startsWith("/api") && !pathname.startsWith("/_next")) {
    const existing = req.cookies.get(VISITOR_COOKIE);
    if (!existing) {
      const newId = crypto.randomUUID();
      res.cookies.set(VISITOR_COOKIE, newId, {
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 90,
      });
    }
  }

  if (pathname.startsWith(OFFICER_PREFIX)) {
    const sessionCookie =
      req.cookies.get("authjs.session-token") ??
      req.cookies.get("__Secure-authjs.session-token");
    if (!sessionCookie) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|query_compiler_bg\\.wasm|.*\\.(?:png|jpg|svg|ico|wasm)).*)",
  ],
};
