"use server";

import { redirect } from "next/navigation";
import { signInWithPassword, clearSessionCookies } from "@/lib/supabase-server";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/lessons");

  await signInWithPassword(email, password);
  redirect(next || "/lessons");
}

export async function logoutAction() {
  await clearSessionCookies();
  redirect("/");
}
