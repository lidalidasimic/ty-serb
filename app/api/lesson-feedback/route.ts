import { NextResponse } from "next/server";
import { getCurrentUser, saveLessonFeedback } from "@/lib/supabase-server";

const recentSubmissions = new Map<string, number>();

export async function POST(request: Request) {
  try {
    const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const now = Date.now();
    if (now - (recentSubmissions.get(address) ?? 0) < 15_000) {
      return NextResponse.json({ error: "Подождите немного перед следующим сообщением" }, { status: 429 });
    }
    const body = await request.json();
    const lessonSlug = String(body.lessonSlug ?? "").slice(0, 100);
    const section = String(body.section ?? "").slice(0, 40);
    const name = String(body.name ?? "").trim().slice(0, 80);
    const message = String(body.message ?? "").trim().slice(0, 1500);
    if (lessonSlug !== "azbuka-i-proiznoshenie" || !section || message.length < 2) {
      return NextResponse.json({ error: "Некорректное сообщение" }, { status: 400 });
    }

    const user = await getCurrentUser();
    await saveLessonFeedback({ userId: user?.id ?? null, lessonSlug, section, name, message });
    recentSubmissions.set(address, now);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Не получилось сохранить сообщение" }, { status: 500 });
  }
}
