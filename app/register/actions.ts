"use server";

import { redirect } from "next/navigation";
import { signUpWithPassword } from "@/lib/supabase-server";

export async function registerAction(formData: FormData) {
  await signUpWithPassword({
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    name: String(formData.get("name") ?? "").trim(),
    contact: String(formData.get("contact") ?? "").trim(),
  });

  redirect("/access");
}
