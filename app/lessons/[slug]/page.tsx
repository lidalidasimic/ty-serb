import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Send,
} from "lucide-react";
import { getLessonBySlug, lessons } from "@/data/lessons";
import { canOpenLesson } from "@/lib/access-control";
import { getCurrentUser, logActivity } from "@/lib/supabase-server";

type LessonPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return lessons.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({ params }: LessonPageProps) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);

  if (!lesson) {
    return {
      title: "Урок не найден | Ты-Серб курс",
    };
  }

  return {
    title: `${lesson.title} | Ты-Серб курс`,
    description: lesson.description,
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);

  if (!lesson) {
    notFound();
  }

  const user = await getCurrentUser();
  const canAccessLesson = canOpenLesson(user, lesson);

  if (!canAccessLesson) {
    await logActivity({
      userId: user?.id ?? null,
      lessonSlug: lesson.slug,
      actionType: "lesson_denied",
    });

    return (
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl border-2 border-ink bg-white p-6 shadow-comic sm:p-10">
          <p className="font-black uppercase tracking-[0.18em] text-serbian-red">
            закрытая лекция
          </p>
          <h1 className="mt-3 text-4xl font-black">
            Доступ к материалам ожидает подтверждения
          </h1>
          <p className="mt-4 leading-7 text-ink/70">
            Первая лекция открыта как демо. Для остальных материалов нужно войти и
            получить ручное подтверждение доступа.
          </p>
          <Link
            href={user ? "/access" : `/login?next=/lessons/${lesson.slug}`}
            className="focus-ring mt-8 inline-flex rounded-lg border-2 border-ink bg-serbian-blue px-5 py-3 font-black text-white shadow-[3px_3px_0_#202124]"
          >
            {user ? "Запросить доступ" : "Войти и запросить доступ"}
          </Link>
        </div>
      </section>
    );
  }

  await logActivity({
    userId: user?.id ?? null,
    lessonSlug: lesson.slug,
    actionType: "lesson_opened",
  });

  const isReady = lesson.status === "готово";
  const hasWorksheet = lesson.worksheetLink.trim().length > 0;
  const currentLessonIndex = lessons.findIndex((item) => item.slug === lesson.slug);
  const previousLesson =
    currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : undefined;
  const nextLesson =
    currentLessonIndex >= 0 ? lessons[currentLessonIndex + 1] : undefined;

  return (
    <>
      <section className="border-b-2 border-ink bg-white/72 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/lessons"
            className="focus-ring inline-flex items-center gap-2 rounded-lg border-2 border-ink bg-white px-4 py-2 font-black shadow-[3px_3px_0_#202124]"
          >
            <ArrowLeft size={18} aria-hidden />
            Все уроки
          </Link>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
            <div>
              <p className="font-black uppercase tracking-[0.18em] text-coral">
                Урок {lesson.number} · {lesson.level}
              </p>
              <h1 className="mt-3 text-4xl font-black leading-tight text-ink sm:text-5xl">
                {lesson.title}
              </h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-ink/72">
                {lesson.description}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {previousLesson ? (
                  <Link
                    href={`/lessons/${previousLesson.slug}`}
                    className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg border-2 border-ink bg-white px-5 py-3 font-black text-serbian-blue shadow-[3px_3px_0_#202124] transition hover:-translate-y-0.5"
                  >
                    <ArrowLeft size={18} aria-hidden />
                    Предыдущая лекция
                  </Link>
                ) : null}
                {nextLesson ? (
                  <Link
                    href={`/lessons/${nextLesson.slug}`}
                    className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg border-2 border-ink bg-serbian-red px-5 py-3 font-black text-white shadow-[3px_3px_0_#202124] transition hover:-translate-y-0.5"
                  >
                    Следующая лекция
                    <ArrowRight size={18} aria-hidden />
                  </Link>
                ) : null}
              </div>
            </div>
            <div className="rounded-lg border-2 border-ink bg-white p-5 shadow-comic">
              <span
                className={`inline-flex items-center gap-2 rounded-lg border-2 border-ink px-3 py-1 text-sm font-black ${
                  isReady ? "bg-mint/35" : "bg-white"
                }`}
              >
                {isReady ? (
                  <CheckCircle2 size={16} aria-hidden />
                ) : (
                  <Clock3 size={16} aria-hidden />
                )}
                {lesson.status}
              </span>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-ink/70">
                тема
              </p>
              <p className="mt-2 text-2xl font-black">{lesson.topic}</p>
              <a
                href={`/api/materials/${lesson.slug}/gamma`}
                target="_blank"
                rel="noreferrer"
                className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-ink bg-plum px-4 py-3 font-black text-white shadow-[3px_3px_0_#202124] transition hover:-translate-y-0.5"
              >
                Открыть презентацию
                <ExternalLink size={18} aria-hidden />
              </a>
              {hasWorksheet ? (
                <a
                  href={`/api/materials/${lesson.slug}/worksheet`}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-ink bg-white px-4 py-3 font-black shadow-[3px_3px_0_#202124] transition hover:-translate-y-0.5"
                >
                  <FileText size={18} aria-hidden />
                  PDF worksheet
                </a>
              ) : (
                <div
                  className="mt-3 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border-2 border-ink bg-ink/10 px-4 py-3 font-black text-ink/55"
                  aria-disabled="true"
                >
                  <FileText size={18} aria-hidden />
                  PDF worksheet скоро
                </div>
              )}
              <a
                href={`/api/materials/${lesson.slug}/telegram`}
                target="_blank"
                rel="noreferrer"
                className="focus-ring mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-ink bg-white px-4 py-3 font-black text-serbian-blue shadow-[3px_3px_0_#202124] transition hover:-translate-y-0.5"
              >
                <Send size={18} aria-hidden />
                Telegram-пост
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
