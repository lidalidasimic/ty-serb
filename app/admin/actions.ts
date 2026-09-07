"use server";

import { revalidatePath } from "next/cache";
import { moderateLessonFeedback, requireAdmin, setAccessStatus } from "@/lib/supabase-server";
import type { AccessStatus } from "@/lib/access-control";

export async function updateAccessStatusAction(formData: FormData) {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const status = String(formData.get("status") ?? "") as AccessStatus;

  if (!["pending", "approved", "rejected", "revoked"].includes(status)) {
    throw new Error("Invalid access status");
  }

  await setAccessStatus({
    userId,
    status,
    adminUserId: admin.id,
  });

  revalidatePath("/admin");
}

export async function moderateFeedbackAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (!id || (decision !== "approved" && decision !== "hidden")) throw new Error("Invalid moderation request");
  await moderateLessonFeedback(id, decision);
  revalidatePath("/admin");
}
