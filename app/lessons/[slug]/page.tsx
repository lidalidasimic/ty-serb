import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock3, ExternalLink, FileText, Send } from "lucide-react";
import { getLessonBySlug, lessons } from "@/data/lessons";

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

  const isReady = lesson.status === "готово";
  const hasWorksheet = lesson.worksheetLink.trim().length > 0;

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
                href={lesson.gammaLink}
                target="_blank"
                rel="noreferrer"
                className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-ink bg-plum px-4 py-3 font-black text-white shadow-[3px_3px_0_#202124] transition hover:-translate-y-0.5"
              >
                Открыть презентацию
                <ExternalLink size={18} aria-hidden />
              </a>
              {hasWorksheet ? (
                <a
                  href={lesson.worksheetLink}
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
                href={lesson.telegramPostLink}
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
