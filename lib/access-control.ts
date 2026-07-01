import type { Lesson } from "@/data/lessons";

export type AccessStatus = "pending" | "approved" | "rejected" | "revoked";

export type AppUser = {
  id: string;
  email: string;
  name?: string | null;
  contact?: string | null;
  accessStatus: AccessStatus;
  isAdmin: boolean;
};

export function isDemoLesson(lesson: Pick<Lesson, "number">) {
  return lesson.number === 1;
}

export function canOpenProtectedMaterials(user: AppUser | null) {
  return Boolean(user?.isAdmin || user?.accessStatus === "approved");
}

export function canOpenLesson(user: AppUser | null, lesson: Pick<Lesson, "number">) {
  return isDemoLesson(lesson) || canOpenProtectedMaterials(user);
}

export function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null) {
  if (!email) {
    return false;
  }

  return getAdminEmails().includes(email.toLowerCase());
}
