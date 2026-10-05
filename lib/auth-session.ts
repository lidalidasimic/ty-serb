export const accessTokenCookie = "ty_serb_access_token";
export const refreshTokenCookie = "ty_serb_refresh_token";
export const rememberMeCookie = "ty_serb_remember_me";
const rememberMeMaxAge = 60 * 60 * 24 * 365 * 10;

export function sessionCookieOptions(rememberMe: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(rememberMe ? { maxAge: rememberMeMaxAge } : {}),
  };
}

export function shouldRefreshAccessToken(accessToken?: string) {
  if (!accessToken) return true;

  try {
    // The expiry is only a refresh hint. Supabase still verifies identity on the server.
    const payload = accessToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(payload)) as { exp?: number };
    return typeof exp !== "number" || exp * 1000 <= Date.now() + 60_000;
  } catch {
    return true;
  }
}
