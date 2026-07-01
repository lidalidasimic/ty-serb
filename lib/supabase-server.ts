import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isAdminEmail, type AccessStatus, type AppUser } from "@/lib/access-control";

const accessTokenCookie = "ty_serb_access_token";
const refreshTokenCookie = "ty_serb_refresh_token";

type SupabaseUserResponse = {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    contact?: string;
  };
};

type SupabaseSessionResponse = {
  access_token?: string;
  refresh_token?: string;
  user?: SupabaseUserResponse;
  error?: string;
  error_description?: string;
  msg?: string;
};

export type Profile = {
  id: string;
  email: string;
  name: string | null;
  contact: string | null;
  access_status: AccessStatus;
  created_at: string;
  last_login_at: string | null;
};

export type ActivityEvent = {
  id: string;
  user_id: string | null;
  lesson_slug: string | null;
  action_type: string;
  created_at: string;
};

function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }
  return url.replace(/\/$/, "");
}

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function getAnonKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return key;
}

function getServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }
  return key;
}

async function supabaseAuthFetch(path: string, init: RequestInit = {}) {
  const response = await fetch(`${getSupabaseUrl()}${path}`, {
    ...init,
    headers: {
      apikey: getAnonKey(),
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error_description ?? data.msg ?? data.error ?? "Supabase request failed");
  }

  return data;
}

async function supabaseAdminFetch(path: string, init: RequestInit = {}) {
  const response = await fetch(`${getSupabaseUrl()}${path}`, {
    ...init,
    headers: {
      apikey: getServiceRoleKey(),
      Authorization: `Bearer ${getServiceRoleKey()}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Supabase admin request failed");
  }

  return response.json().catch(() => null);
}

async function setSessionCookies(session: SupabaseSessionResponse) {
  if (!session.access_token || !session.refresh_token) {
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set(accessTokenCookie, session.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  cookieStore.set(refreshTokenCookie, session.refresh_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function clearSessionCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(accessTokenCookie);
  cookieStore.delete(refreshTokenCookie);
}

export async function getAccessTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(accessTokenCookie)?.value ?? null;
}

export async function signInWithPassword(email: string, password: string) {
  const session = (await supabaseAuthFetch("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })) as SupabaseSessionResponse;

  await setSessionCookies(session);
  await ensureProfile(session.user, "pending");
  await updateLastLogin(session.user?.id);
  await logActivity({
    userId: session.user?.id ?? null,
    actionType: "login",
  });
}

export async function signUpWithPassword(input: {
  email: string;
  password: string;
  name: string;
  contact: string;
}) {
  const session = (await supabaseAuthFetch("/auth/v1/signup", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      data: {
        name: input.name,
        contact: input.contact,
      },
    }),
  })) as SupabaseSessionResponse;

  await setSessionCookies(session);
  await ensureProfile(session.user, "pending", input.name, input.contact);
  await logActivity({
    userId: session.user?.id ?? null,
    actionType: "register",
  });
}

async function ensureProfile(
  user?: SupabaseUserResponse,
  defaultStatus: AccessStatus = "pending",
  name?: string,
  contact?: string,
) {
  if (!user?.id || !user.email) {
    return;
  }

  const existing = await getProfile(user.id);
  if (existing) {
    return;
  }

  await supabaseAdminFetch("/rest/v1/profiles", {
    method: "POST",
    body: JSON.stringify({
      id: user.id,
      email: user.email,
      name: name || user.user_metadata?.name || null,
      contact: contact || user.user_metadata?.contact || null,
      access_status: isAdminEmail(user.email) ? "approved" : defaultStatus,
    }),
  });
}

async function updateLastLogin(userId?: string) {
  if (!userId) {
    return;
  }

  await supabaseAdminFetch(`/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: JSON.stringify({ last_login_at: new Date().toISOString() }),
  });
}

export async function getProfile(userId: string) {
  const rows = (await supabaseAdminFetch(
    `/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=*`,
  )) as Profile[];

  return rows[0] ?? null;
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const accessToken = await getAccessTokenFromCookies();
  if (!accessToken) {
    return null;
  }

  try {
    const authUser = (await supabaseAuthFetch("/auth/v1/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })) as SupabaseUserResponse;

    if (!authUser.id || !authUser.email) {
      return null;
    }

    await ensureProfile(authUser);
    const profile = await getProfile(authUser.id);
    const admin = isAdminEmail(authUser.email);

    return {
      id: authUser.id,
      email: authUser.email,
      name: profile?.name ?? authUser.user_metadata?.name ?? null,
      contact: profile?.contact ?? authUser.user_metadata?.contact ?? null,
      accessStatus: admin ? "approved" : profile?.access_status ?? "pending",
      isAdmin: admin,
    };
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    redirect("/login?next=/admin");
  }
  return user;
}

export async function createAccessRequest(user: AppUser, contact: string) {
  await supabaseAdminFetch("/rest/v1/access_requests", {
    method: "POST",
    body: JSON.stringify({
      user_id: user.id,
      contact: contact || user.contact,
      status: "pending",
    }),
  });

  await logActivity({
    userId: user.id,
    actionType: "access_requested",
  });
}

export async function setAccessStatus(params: {
  userId: string;
  status: AccessStatus;
  adminUserId: string;
}) {
  await supabaseAdminFetch(`/rest/v1/profiles?id=eq.${encodeURIComponent(params.userId)}`, {
    method: "PATCH",
    body: JSON.stringify({ access_status: params.status }),
  });

  await logActivity({
    userId: params.userId,
    actorUserId: params.adminUserId,
    actionType: `access_${params.status}`,
  });
}

export async function listProfiles(status?: string, search?: string) {
  const filters = [`select=*`, `order=created_at.desc`];
  if (status && status !== "all") {
    filters.push(`access_status=eq.${encodeURIComponent(status)}`);
  }
  if (search) {
    const term = encodeURIComponent(`*${search}*`);
    filters.push(`or=(email.ilike.${term},name.ilike.${term},contact.ilike.${term})`);
  }

  return (await supabaseAdminFetch(`/rest/v1/profiles?${filters.join("&")}`)) as Profile[];
}

export async function listRecentActivity() {
  return (await supabaseAdminFetch(
    "/rest/v1/activity_events?select=*&order=created_at.desc&limit=500",
  )) as ActivityEvent[];
}

export async function logActivity(params: {
  userId: string | null;
  actorUserId?: string | null;
  lessonSlug?: string | null;
  actionType: string;
}) {
  if (!isSupabaseConfigured()) {
    return;
  }

  try {
    await supabaseAdminFetch("/rest/v1/activity_events", {
      method: "POST",
      body: JSON.stringify({
        user_id: params.userId,
        actor_user_id: params.actorUserId ?? null,
        lesson_slug: params.lessonSlug ?? null,
        action_type: params.actionType,
      }),
    });
  } catch {
    // Logging must never break normal access decisions.
  }
}
