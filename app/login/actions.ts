"use server";

import { redirect } from "next/navigation";
import { signInWithPassword, clearSessionCookies } from "@/lib/supabase-server";

function getLoginErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";

  if (message.toLowerCase().includes("invalid login credentials")) {
    return "Неверный email или пароль.";
  }

  if (message.toLowerCase().includes("email not confirmed")) {
    return "Email ещё не подтверждён. Проверьте письмо от Supabase.";
  }

  if (message.includes("Missing NEXT_PUBLIC_SUPABASE_URL")) {
    return "На Vercel ещё не добавлен Project URL из Supabase.";
  }

  if (message.includes("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY")) {
    return "На Vercel ещё не добавлен anon public key из Supabase.";
  }

  if (message.includes("Missing SUPABASE_SERVICE_ROLE_KEY")) {
    return "На Vercel ещё не добавлен service_role key из Supabase.";
  }

  if (message.includes("profiles") || message.includes("activity_events")) {
    return "Supabase подключён, но SQL-миграция ещё не выполнена.";
  }

  return message || "Не получилось войти. Проверьте email и пароль.";
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/lessons");

  try {
    await signInWithPassword(email, password);
  } catch (error) {
    const message = getLoginErrorMessage(error);
    redirect(`/login?next=${encodeURIComponent(next)}&error=${encodeURIComponent(message)}`);
  }

  redirect(next || "/lessons");
}

export async function logoutAction() {
  await clearSessionCookies();
  redirect("/");
}
