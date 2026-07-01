"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, setAccessStatus } from "@/lib/supabase-server";
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
