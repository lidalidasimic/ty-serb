import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { getLessonBySlug } from "@/data/lessons";
import { canOpenLesson } from "@/lib/access-control";
import { getCurrentUser } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ContentRouteProps = {
  params: Promise<{ slug: string; path: string[] }>;
};

const mimeTypes: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".m4a": "audio/mp4",
  ".webm": "audio/webm",
};

const lessonTwoAudio = new Set([
  "lesson-02-01-intro.m4a", "lesson-02-02-passport.m4a", "lesson-02-03-professions.m4a",
  "lesson-02-04-comic.m4a", "lesson-02-05-new-words.m4a", "lesson-02-06-translation.m4a",
  "lesson-02-07-why-biti.m4a", "lesson-02-08-biti-forms.m4a", "lesson-02-09-ovo-to-ono.m4a",
]);

function isAllowedFile(lessonNumber: number, file: string) {
  if (lessonNumber === 2) {
    return ["index.html", "styles.css", "lesson.js"].includes(file)
      || /^images\/lesson-02-comic-0[1-7]\.jpg$/.test(file)
      || /^images\/lesson-02-professions-0[12]\.png$/.test(file)
      || /^images\/lesson-02-demonstrative-(?:ovo|to)\.png$/.test(file)
      || (file.startsWith("audio/") && lessonTwoAudio.has(file.slice(6)));
  }
  return ["index.html", "styles.css", "lesson.js", "assets/lucide.min.js"].includes(file)
    || /^assets\/slide-(?:[1-9]|26|29)-1\.png$/.test(file)
    || /^audio\/section-0[1-9]\.(?:mp3|wav|ogg|m4a|webm)$/.test(file);
}

export async function GET(request: NextRequest, { params }: ContentRouteProps) {
  const { slug, path: parts } = await params;
  const lesson = getLessonBySlug(slug);
  const privateHeaders = { "Cache-Control": "private, no-store" };

  if (!lesson || (lesson.number !== 2 && lesson.number !== 18)) {
    return NextResponse.json({ error: "Материал не найден" }, { status: 404, headers: privateHeaders });
  }

  const user = await getCurrentUser();
  if (!canOpenLesson(user, lesson)) {
    return NextResponse.json(
      { error: "Нужно войти и получить доступ к уроку" },
      { status: user ? 403 : 401, headers: privateHeaders },
    );
  }

  const file = parts.join("/");
  if (!isAllowedFile(lesson.number, file)) {
    return NextResponse.json({ error: "Материал не найден" }, { status: 404, headers: privateHeaders });
  }

  let content: Buffer;
  try {
    const folder = lesson.number === 2 ? "lesson-02" : "lesson-18";
    content = await readFile(path.join(process.cwd(), "lesson-content", folder, file));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return NextResponse.json({ error: "Материал пока не добавлен" }, { status: 404, headers: privateHeaders });
  }

  const headers: Record<string, string> = {
    ...privateHeaders,
    "Content-Type": mimeTypes[path.extname(file)],
    "X-Content-Type-Options": "nosniff",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Content-Security-Policy": "frame-ancestors 'self'",
    "Accept-Ranges": "bytes",
  };
  const range = request.headers.get("range");
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    const start = match?.[1] ? Number(match[1]) : Math.max(0, content.length - Number(match?.[2]));
    const end = match?.[1] && match[2] ? Math.min(Number(match[2]), content.length - 1) : content.length - 1;
    if (!match || (!match[1] && !match[2]) || !Number.isSafeInteger(start) || !Number.isSafeInteger(end)
      || start < 0 || start >= content.length || end < start) {
      return new NextResponse(null, { status: 416, headers: { ...headers, "Content-Range": `bytes */${content.length}` } });
    }
    const body = content.subarray(start, end + 1);
    return new NextResponse(new Uint8Array(body), {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${content.length}`, "Content-Length": String(body.length) },
    });
  }

  return new NextResponse(new Uint8Array(content), { headers: { ...headers, "Content-Length": String(content.length) } });
}
