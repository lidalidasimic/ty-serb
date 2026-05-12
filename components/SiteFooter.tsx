import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t-2 border-ink bg-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm font-bold text-ink/70 sm:flex-row sm:items-center sm:justify-between">
        <p>Ты-Серб курс. Сербский шаг за шагом.</p>
        <div className="flex gap-4">
          <Link className="hover:text-coral" href="/lessons">
            Уроки
          </Link>
          <Link className="hover:text-coral" href="/contact">
            Контакты
          </Link>
        </div>
      </div>
    </footer>
  );
}
