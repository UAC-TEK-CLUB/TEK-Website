import { NextResponse, type NextRequest } from "next/server";
import { VISITOR_COOKIE } from "@/lib/constants";

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

/** Lab leader console — page-level guards also apply; middleware ensures login. */
const LAB_CONSOLE_PATH = /^\/labs\/[^/]+\/console/;

function getSessionCookie(req: NextRequest) {
  return (
    req.cookies.get("authjs.session-token") ??
    req.cookies.get("__Secure-authjs.session-token") ??
    req.cookies.get("next-auth.session-token")
  );
}

function redirectToLogin(req: NextRequest, pathname: string) {
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const requiresAuth =
    PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) || LAB_CONSOLE_PATH.test(pathname);

  if (requiresAuth && !getSessionCookie(req)) {
    return redirectToLogin(req, pathname);
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

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|query_compiler_bg\\.wasm|.*\\.(?:png|jpg|svg|ico|wasm)).*)",
  ],
};
