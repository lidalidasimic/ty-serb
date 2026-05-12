"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, Presentation } from "lucide-react";
import type { Lesson } from "@/data/lessons";

type LessonCardProps = {
  lesson: Lesson;
};

export function LessonCard({ lesson }: LessonCardProps) {
  const isReady = lesson.status === "готово";

  return (
    <article className="group flex h-full flex-col rounded-lg border-2 border-ink bg-white p-5 shadow-comic transition hover:-translate-y-1">
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="rounded-lg border-2 border-ink bg-sunflower px-3 py-1 text-sm font-black">
          Урок {lesson.number}
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-lg border-2 border-ink px-3 py-1 text-sm font-black ${
            isReady ? "bg-mint/30" : "bg-paper"
          }`}
        >
          {isReady ? (
            <CheckCircle2 size={15} aria-hidden />
          ) : (
            <Clock3 size={15} aria-hidden />
          )}
          {lesson.status}
        </span>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="rounded-lg bg-plum/10 px-3 py-1 text-xs font-black text-plum">
          {lesson.level}
        </span>
        <span className="rounded-lg bg-coral/10 px-3 py-1 text-xs font-black text-coral">
          {lesson.topic}
        </span>
      </div>
      <div className="space-y-3">
        <h2 className="text-2xl font-black leading-tight text-ink">{lesson.title}</h2>
        <p className="text-sm leading-6 text-ink/72">{lesson.description}</p>
      </div>
      <div className="mt-auto pt-6">
        <Link
          href={`/lessons/${lesson.slug}`}
          className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-ink bg-plum px-4 py-3 font-black text-white shadow-[3px_3px_0_#202124] transition group-hover:bg-coral"
        >
          <Presentation size={18} aria-hidden />
          Открыть урок
          <ArrowRight size={18} aria-hidden />
        </Link>
      </div>
    </article>
  );
}
