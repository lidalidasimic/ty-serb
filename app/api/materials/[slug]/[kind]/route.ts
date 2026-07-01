import { NextRequest, NextResponse } from "next/server";
import { getLessonBySlug } from "@/data/lessons";
import { canOpenLesson } from "@/lib/access-control";
import { getCurrentUser, logActivity } from "@/lib/supabase-server";

type MaterialRouteProps = {
  params: Promise<{
    slug: string;
    kind: "gamma" | "worksheet" | "homework" | "telegram";
  }>;
};

export async function GET(request: NextRequest, { params }: MaterialRouteProps) {
  const { slug, kind } = await params;
  const lesson = getLessonBySlug(slug);

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const user = await getCurrentUser();
  if (!canOpenLesson(user, lesson)) {
    await logActivity({
      userId: user?.id ?? null,
      lessonSlug: lesson.slug,
      actionType: `material_denied_${kind}`,
    });

    return NextResponse.redirect(new URL("/access", request.url));
  }

  const targetUrl =
    kind === "gamma"
      ? lesson.gammaLink
      : kind === "worksheet"
        ? lesson.worksheetLink
        : kind === "homework"
          ? lesson.homeworkLink
          : lesson.telegramPostLink;

  if (!targetUrl) {
    return NextResponse.json({ error: "Material is not available yet" }, { status: 404 });
  }

  await logActivity({
    userId: user?.id ?? null,
    lessonSlug: lesson.slug,
    actionType: `material_opened_${kind}`,
  });

  return NextResponse.redirect(targetUrl);
}
