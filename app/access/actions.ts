"use server";

import { redirect } from "next/navigation";
import { createAccessRequest, getCurrentUser } from "@/lib/supabase-server";

export async function requestAccessAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/access");
  }

  await createAccessRequest(user, String(formData.get("contact") ?? "").trim());
  redirect("/access?requested=1");
}
