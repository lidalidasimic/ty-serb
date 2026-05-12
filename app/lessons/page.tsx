import LessonFilters from "@/components/LessonFilters";
import { PageHero } from "@/components/PageHero";
import { lessons } from "@/data/lessons";

export default function LessonsPage() {
  return (
    <>
      <PageHero
        eyebrow="уроки"
        title="Библиотека уроков Ты-Серб курс"
        description="Ищите уроки по теме, уровню и ключевым словам. Статус показывает, какие материалы уже готовы, а какие скоро появятся."
      />
      <LessonFilters lessons={lessons} />
    </>
  );
}
