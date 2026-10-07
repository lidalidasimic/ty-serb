import { NextResponse } from "next/server";
import { getCurrentUser, listApprovedLessonFeedback, saveLessonFeedback } from "@/lib/supabase-server";

const recentSubmissions = new Map<string, number>();
const lessonTwoSlug = "kak-predstavitsya";
const lessonTwoSections = new Set(["intro", "reading", "vocabulary", "comic", "grammar", "comparison", "practice", "phrases", "homework", "recap"].map(id => `l2-${id}`));
const lessonThreeSlug = "rod-muzhskoy-zhenskiy-sredniy";
const lessonThreeSections = new Set(["intro", "comic", "countries", "taxi", "plural", "words", "possessives", "practice", "recap", "homework"].map(id => `l3-${id}`));
const lessonNineteenSlug = "polinin-rodjendan";
const lessonNineteenSections = new Set(["comic", "heroes", "words", "grammar", "timeline", "transform", "negative", "questions", "reading", "gifts", "quiz", "homework"].map(id => `l19-${id}`));
const lessonSiteOrigins = new Set(["https://ty-serb-lesson-two.lixi141210.chatgpt.site", "https://ty-serb-lesson-three.lixi141210.chatgpt.site"]);

function responseHeaders(request: Request) {
  const headers: Record<string, string> = { "Cache-Control": "private, no-store", Vary: "Origin" };
  const origin = request.headers.get("origin");
  if (origin && lessonSiteOrigins.has(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

export async function OPTIONS(request: Request) {
  if (!lessonSiteOrigins.has(request.headers.get("origin") || "")) return new NextResponse(null, { status: 403 });
  return new NextResponse(null, { status: 204, headers: {
    ...responseHeaders(request), "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "600",
  } });
}

export async function GET(request: Request) {
  const section = new URL(request.url).searchParams.get("section")?.slice(0, 40) || "";
  if (!section) return NextResponse.json({ items: [] });
  try { return NextResponse.json({ items: await listApprovedLessonFeedback(section) }); }
  catch { return NextResponse.json({ items: [] }); }
}

export async function POST(request: Request) {
  const headers = responseHeaders(request);
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin && !lessonSiteOrigins.has(origin)) {
    return NextResponse.json({ error: "Недопустимый источник сообщения" }, { status: 403, headers });
  }
  try {
    const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const now = Date.now();
    if (now - (recentSubmissions.get(address) ?? 0) < 15_000) {
      return NextResponse.json({ error: "Подождите немного перед следующим сообщением" }, { status: 429, headers });
    }
    const body = await request.json();
    const lessonSlug = String(body.lessonSlug ?? "").slice(0, 100);
    const section = String(body.section ?? "").slice(0, 40);
    const name = String(body.name ?? "").trim().slice(0, 80);
    const message = String(body.message ?? "").trim().slice(0, 1500);
    const kind = body.kind === "introduction" ? "introduction" : "feedback";
    if (!["azbuka-i-proiznoshenie", lessonTwoSlug, lessonThreeSlug, lessonNineteenSlug].includes(lessonSlug) || !section || message.length < 2
      || (lessonSlug === lessonTwoSlug && (!lessonTwoSections.has(section) || kind !== "feedback"))
      || (lessonSlug === lessonThreeSlug && (!lessonThreeSections.has(section) || kind !== "feedback"))
      || (lessonSlug === lessonNineteenSlug && (!lessonNineteenSections.has(section) || kind !== "feedback"))) {
      return NextResponse.json({ error: "Некорректное сообщение" }, { status: 400, headers });
    }

    const user = await getCurrentUser();
    await saveLessonFeedback({ userId: user?.id ?? null, lessonSlug, section, name, message, kind });
    recentSubmissions.set(address, now);
    return NextResponse.json({ ok: true }, { headers });
  } catch (error) {
    console.error("lesson-feedback save failed", error);
    return NextResponse.json({ error: "Не получилось сохранить сообщение. Попробуй ещё раз." }, { status: 500, headers });
  }
}
