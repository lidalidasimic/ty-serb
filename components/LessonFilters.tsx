"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { LessonCard } from "@/components/LessonCard";
import type { PublicLesson } from "@/data/lessons";

type LessonFiltersProps = {
  lessons: PublicLesson[];
};

export default function LessonFilters({ lessons }: LessonFiltersProps) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("all");
  const [topic, setTopic] = useState("all");

  const levels = useMemo(
    () => Array.from(new Set(lessons.map((lesson) => lesson.level))),
    [lessons],
  );

  const topics = useMemo(
    () => Array.from(new Set(lessons.map((lesson) => lesson.topic))),
    [lessons],
  );

  const filteredLessons = lessons.filter((lesson) => {
    const searchText = [
      lesson.title,
      lesson.level,
      lesson.topic,
      lesson.description,
      lesson.status,
      ...lesson.vocabulary,
      ...lesson.grammarFocus,
    ]
      .join(" ")
      .toLowerCase();

    const matchesQuery = searchText.includes(query.trim().toLowerCase());
    const matchesLevel = level === "all" || lesson.level === level;
    const matchesTopic = topic === "all" || lesson.topic === topic;

    return matchesQuery && matchesLevel && matchesTopic;
  });

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 grid gap-3 rounded-lg border-2 border-ink bg-white p-4 shadow-comic md:grid-cols-[1fr_180px_260px]">
          <label className="relative block">
            <span className="sr-only">Поиск уроков</span>
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/45"
              size={20}
              aria-hidden
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="focus-ring w-full rounded-lg border-2 border-ink bg-paper px-11 py-3 font-bold"
              placeholder="Поиск по урокам, словам, грамматике"
              type="search"
            />
          </label>

          <label className="block">
            <span className="sr-only">Фильтр по уровню</span>
            <select
              value={level}
              onChange={(event) => setLevel(event.target.value)}
              className="focus-ring w-full rounded-lg border-2 border-ink bg-paper px-4 py-3 font-bold"
            >
              <option value="all">Все уровни</option>
              {levels.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="sr-only">Фильтр по теме</span>
            <select
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              className="focus-ring w-full rounded-lg border-2 border-ink bg-paper px-4 py-3 font-bold"
            >
              <option value="all">Все темы</option>
              {topics.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mb-4 flex items-center justify-between gap-4 text-sm font-black text-ink/65">
          <p>Найдено: {filteredLessons.length}</p>
          <p>{lessons.filter((lesson) => lesson.status === "готово").length} готово</p>
        </div>

        {filteredLessons.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredLessons.map((lesson) => (
              <LessonCard key={lesson.slug} lesson={lesson} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-ink bg-white p-8 text-center shadow-comic">
            <h2 className="text-2xl font-black">Ничего не найдено</h2>
            <p className="mt-2 text-ink/70">
              Попробуйте другой запрос, уровень или тему.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
