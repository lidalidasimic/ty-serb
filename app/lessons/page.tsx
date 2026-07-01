import LessonFilters from "@/components/LessonFilters";
import { PageHero } from "@/components/PageHero";
import { getPublicLessons } from "@/data/lessons";
import { canOpenProtectedMaterials } from "@/lib/access-control";
import { getCurrentUser } from "@/lib/supabase-server";

export default async function LessonsPage() {
  const user = await getCurrentUser();
  const canViewProtectedLessons = canOpenProtectedMaterials(user);
  const lessons = getPublicLessons();

  return (
    <>
      <PageHero
        eyebrow="уроки"
        title="Библиотека уроков Ты-Серб курс"
        description="Ищите уроки по теме, уровню и ключевым словам. Статус показывает, какие материалы уже готовы, а какие скоро появятся."
      />
      <LessonFilters lessons={lessons} canViewProtectedLessons={canViewProtectedLessons} />
    </>
  );
}
