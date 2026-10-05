import { NextResponse, type NextRequest } from "next/server";
import {
  accessTokenCookie,
  refreshTokenCookie,
  rememberMeCookie,
  sessionCookieOptions,
  shouldRefreshAccessToken,
} from "@/lib/auth-session";

export async function middleware(request: NextRequest) {
  const unchangedResponse = NextResponse.next();
  const refreshToken = request.cookies.get(refreshTokenCookie)?.value;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!refreshToken || !supabaseUrl || !anonKey ||
      !shouldRefreshAccessToken(request.cookies.get(accessTokenCookie)?.value)) {
    return unchangedResponse;
  }

  try {
    const refreshResponse = await fetch(`${supabaseUrl.replace(/\/$/, "")}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { apikey: anonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!refreshResponse.ok) return unchangedResponse;
    const session = await refreshResponse.json() as { access_token?: string; refresh_token?: string };
    if (!session.access_token || !session.refresh_token) return unchangedResponse;

    const rememberMe = request.cookies.get(rememberMeCookie)?.value === "1";
    const options = sessionCookieOptions(rememberMe);
    // Update this render's request and the browser together, before streaming begins.
    request.cookies.set(accessTokenCookie, session.access_token);
    request.cookies.set(refreshTokenCookie, session.refresh_token);
    const response = NextResponse.next({ request });
    response.cookies.set(accessTokenCookie, session.access_token, options);
    response.cookies.set(refreshTokenCookie, session.refresh_token, options);
    if (rememberMe) response.cookies.set(rememberMeCookie, "1", options);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch {
    // Keep refresh credentials during temporary network or Auth service failures.
    return unchangedResponse;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|m4a|mp3|woff|woff2)$).*)",
    "/api/:path*",
  ],
};
