"use server";

import { redirect } from "next/navigation";
import { signUpWithPassword } from "@/lib/supabase-server";

function getRegisterErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";

  if (message.toLowerCase().includes("user already registered")) {
    return "Такой email уже зарегистрирован. Попробуйте войти.";
  }

  if (message.toLowerCase().includes("password")) {
    return "Пароль должен быть не короче 8 символов.";
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

  return message || "Не получилось зарегистрироваться. Проверьте данные и попробуйте ещё раз.";
}

export async function registerAction(formData: FormData) {
  try {
    await signUpWithPassword({
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
      name: String(formData.get("name") ?? "").trim(),
      contact: String(formData.get("contact") ?? "").trim(),
      rememberMe: formData.get("rememberMe") === "on",
    });
  } catch (error) {
    const message = getRegisterErrorMessage(error);
    redirect(`/register?error=${encodeURIComponent(message)}`);
  }

  redirect("/access");
}
