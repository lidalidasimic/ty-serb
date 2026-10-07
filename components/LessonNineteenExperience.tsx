export default function LessonNineteenExperience() {
  return (
    <section id="lesson-19-start" className="bg-white">
      <header className="mx-auto max-w-6xl px-5 py-7 sm:px-6">
        <h1 className="text-2xl font-extrabold leading-tight text-black sm:text-3xl">
          Лекция 19. Миссия РТН-2
        </h1>
        <p className="mt-2 text-base text-gray-600" lang="sr-Cyrl">Полинин рођендан</p>
      </header>
      <iframe
        src="/api/lesson-content/polinin-rodjendan/index.html"
        title="Лекция 19. Миссия РТН-2: Полинин рођендан"
        className="block h-[calc(100dvh-88px)] min-h-[620px] w-full border-0"
      />
    </section>
  );
}
