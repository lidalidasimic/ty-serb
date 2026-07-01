import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  FileText,
  MessageCircle,
  Presentation,
  Send,
  Users,
} from "lucide-react";
import { LessonCard } from "@/components/LessonCard";
import { getPublicLessons } from "@/data/lessons";
import { testimonials } from "@/data/testimonials";
import { canOpenProtectedMaterials } from "@/lib/access-control";
import { getCurrentUser } from "@/lib/supabase-server";

const courseFlow = [
  {
    icon: Presentation,
    title: "Презентации",
    text: "Каждый урок открывается в понятной визуальной презентации: буквы, фразы, грамматика и примеры собраны в одном месте.",
  },
  {
    icon: FileText,
    title: "Домашние задания",
    text: "После занятия студент получает закрепление: упражнения, письменную практику и ссылки на рабочие материалы.",
  },
  {
    icon: MessageCircle,
    title: "Практика и разговор",
    text: "Курс строится вокруг живых ситуаций: представиться, спросить, объяснить, договориться и понять ответ.",
  },
];

const audience = [
  "переезд в Сербию",
  "общение с местными",
  "работа/учёба",
  "системное изучение языка",
];

export default async function HomePage() {
  const user = await getCurrentUser();
  const canViewProtectedLessons = canOpenProtectedMaterials(user);
  const lessons = getPublicLessons();
  const featuredLessons = lessons.slice(0, 3);
  const readyCount = lessons.filter((lesson) => lesson.status === "готово").length;

  return (
    <>
      <section className="border-b-2 border-ink bg-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-4xl">
            <div className="mb-8 inline-flex items-center gap-2 border-2 border-ink bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.16em]">
              <BookOpenCheck size={17} className="text-serbian-blue" aria-hidden />
              Ты-Серб курс
            </div>
            <h1 className="text-4xl font-black leading-tight text-ink sm:text-6xl lg:text-7xl">
              Сербский язык для русскоговорящих
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-ink/75 sm:text-xl">
              Практический сербский для жизни, переезда, общения и культуры:
              понятные уроки, разговорные ситуации, домашние задания и
              аккуратная система без перегруза.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/lessons"
                className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg border-2 border-ink bg-serbian-red px-6 py-4 font-black text-white transition hover:bg-ink"
              >
                Смотреть уроки
                <ArrowRight size={20} aria-hidden />
              </Link>
              <Link
                href="/contact"
                className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg border-2 border-ink bg-white px-6 py-4 font-black text-ink transition hover:border-serbian-blue hover:text-serbian-blue"
              >
                Записаться в группу
                <Users size={20} aria-hidden />
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-3 border-t-2 border-ink pt-6 sm:grid-cols-3">
            <div>
              <p className="text-3xl font-black text-serbian-blue">{lessons.length}</p>
              <p className="mt-1 text-sm font-bold text-ink/65">уроков в базе</p>
            </div>
            <div>
              <p className="text-3xl font-black text-serbian-red">{readyCount}</p>
              <p className="mt-1 text-sm font-bold text-ink/65">готово сейчас</p>
            </div>
            <div>
              <p className="text-3xl font-black text-ink">A0-A1+</p>
              <p className="mt-1 text-sm font-bold text-ink/65">стартовый маршрут</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 max-w-2xl">
            <p className="font-black uppercase tracking-[0.18em] text-serbian-red">
              формат
            </p>
            <h2 className="mt-2 text-3xl font-black text-ink sm:text-4xl">
              Как устроен курс
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {courseFlow.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-lg border-2 border-ink bg-white p-6"
                >
                  <Icon size={34} className="text-serbian-blue" aria-hidden />
                  <h3 className="mt-5 text-2xl font-black">{item.title}</h3>
                  <p className="mt-3 leading-7 text-ink/72">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y-2 border-ink bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[320px_1fr] lg:items-start">
          <div className="grid gap-6 sm:grid-cols-[160px_1fr] sm:items-center lg:block">
            <Image
              src="/images/portrait.jpg"
              alt="Лидия, преподаватель сербского языка"
              width={224}
              height={224}
              className="size-40 rounded-full border-4 border-serbian-blue object-cover sm:size-40 lg:size-56"
            />
            <div className="lg:mt-6">
            <p className="font-black uppercase tracking-[0.18em] text-serbian-blue">
              преподаватель
            </p>
            <h2 className="mt-2 text-3xl font-black text-ink sm:text-4xl">
              Обо мне
            </h2>
            </div>
          </div>
          <div className="border-l-4 border-serbian-red pl-5 text-lg leading-8 text-ink/75">
            Здравствуйте! Меня зовут Лидия. Я носитель сербского языка и уже
            несколько лет преподаю сербский русскоязычным ученикам. Через мои
            занятия прошло более 100 человек: взрослые, подростки, переезжающие
            в Сербию, студенты и те, кому язык нужен для жизни, работы или
            общения. На уроках мы не просто учим грамматику, а сразу учимся
            говорить: строить фразы, задавать вопросы, понимать живую речь и
            постепенно собирать систему языка без хаоса. Я использую собственные
            материалы: комиксы, интерактивные упражнения, диалоги, визуальные
            схемы и задания. Объясняю понятно, спокойно и по делу. Помогаю с
            сербским с нуля, разговорной практикой, грамматикой, подготовкой к
            жизни и учёбе в Сербии. Также могу помогать с английским, физикой,
            математикой и химией. Занятия проходят онлайн. После урока ученик
            получает материалы и домашнее задание.
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="font-black uppercase tracking-[0.18em] text-serbian-red">
              кому подойдет
            </p>
            <h2 className="mt-2 text-3xl font-black text-ink sm:text-4xl">
              Для кого курс
            </h2>
            <p className="mt-4 leading-8 text-ink/72">
              Курс помогает русскоговорящим студентам перейти от “понимаю
              отдельные слова” к уверенной бытовой коммуникации и системному
              изучению языка.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {audience.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-lg border-2 border-ink bg-white p-4 font-black"
              >
                <CheckCircle2
                  size={22}
                  className="shrink-0 text-serbian-blue"
                  aria-hidden
                />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y-2 border-ink bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 max-w-2xl">
            <p className="font-black uppercase tracking-[0.18em] text-serbian-blue">
              ученики
            </p>
            <h2 className="mt-2 text-3xl font-black text-ink sm:text-4xl">
              Отзывы учеников
            </h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {testimonials.map((testimonial, index) => (
              <article
                key={testimonial.name}
                className="rounded-lg border-2 border-ink bg-white p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-xl font-black text-ink">{testimonial.name}</h3>
                  <p
                    className={`text-lg tracking-[0.16em] ${
                      index % 2 === 0 ? "text-serbian-red" : "text-serbian-blue"
                    }`}
                    aria-label="5 из 5"
                  >
                    {testimonial.stars}
                  </p>
                </div>
                <p className="mt-4 leading-7 text-ink/75">{testimonial.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t-2 border-ink bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="font-black uppercase tracking-[0.18em] text-serbian-blue">
                библиотека
              </p>
              <h2 className="mt-2 text-3xl font-black text-ink sm:text-4xl">
                Первые уроки
              </h2>
            </div>
            <Link
              href="/lessons"
              className="hidden font-black text-serbian-red underline decoration-4 underline-offset-4 sm:inline"
            >
              Все уроки
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {featuredLessons.map((lesson) => (
              <LessonCard
                key={lesson.slug}
                lesson={lesson}
                isLocked={lesson.number !== 1 && !canViewProtectedLessons}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t-2 border-ink bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="font-black uppercase tracking-[0.18em] text-serbian-red">
              контакты
            </p>
            <h2 className="mt-2 text-3xl font-black text-ink sm:text-4xl">
              Написать и следить за курсом
            </h2>
            <p className="mt-4 leading-8 text-ink/72">
              Для записи, вопросов по урокам и новостей курса можно написать
              напрямую или подписаться на канал.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href="https://t.me/LidiaSimich"
              target="_blank"
              rel="noreferrer"
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg border-2 border-ink bg-serbian-blue px-6 py-4 font-black text-white transition hover:bg-ink"
            >
              <MessageCircle size={20} aria-hidden />
              @LidiaSimich
            </a>
            <a
              href="https://t.me/tyserb"
              target="_blank"
              rel="noreferrer"
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg border-2 border-ink bg-white px-6 py-4 font-black text-serbian-red transition hover:border-serbian-red"
            >
              <Send size={20} aria-hidden />
              Telegram-канал
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
