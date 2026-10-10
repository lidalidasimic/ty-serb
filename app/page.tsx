import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpenCheck,
  CheckCircle2,
  Layers,
  MessageCircle,
  MessageCircleQuestion,
  MessagesSquare,
  MousePointerClick,
  NotebookPen,
  Presentation,
  Send,
} from "lucide-react";
import { CourseTariffs } from "@/components/CourseTariffs";
import { LessonCard } from "@/components/LessonCard";
import { getPublicLessons } from "@/data/lessons";
import { testimonials } from "@/data/testimonials";
import { canOpenProtectedMaterials } from "@/lib/access-control";
import { getCurrentUser } from "@/lib/supabase-server";
import "./home.css";

export const metadata: Metadata = {
  title: "Ты-Серб · Сербский для жизни",
  description:
    "Интерактивная платформа сербского языка для русскоговорящих. Уроки, задания, разговорная практика и поддержка Лидии.",
};

const courseFlow = [
  { icon: Presentation, title: "Уроки", text: "Понятные объяснения, фразы и грамматика с примерами из жизни." },
  { icon: MousePointerClick, title: "Интерактивные задания", text: "Закрепляйте материал сразу: пробуйте, проверяйте и возвращайтесь к сложному." },
  { icon: NotebookPen, title: "Домашние задания", text: "Переносите новые слова и конструкции в собственные фразы." },
  { icon: MessagesSquare, title: "Практика разговора", text: "Учитесь знакомиться, спрашивать и понимать ответы. Живые занятия в Премиум и VIP." },
  { icon: MessageCircleQuestion, title: "Обратная связь", text: "Задавайте вопросы в окнах обратной связи на платформе и разбирайтесь вместе со мной." },
];

const audience = [
  { title: "Планируете переезд в Сербию", text: "Подготовьтесь к первым разговорам и бытовым ситуациям." },
  { title: "Уже живёте в Сербии", text: "Общайтесь с соседями, коллегами и людьми вокруг увереннее." },
  { title: "Хотите общаться и находить друзей", text: "Выражайте свои мысли и лучше понимайте живую сербскую речь." },
  { title: "Интересуетесь языком и культурой", text: "Изучайте сербский последовательно, с практикой и обратной связью." },
];

const featuredReviewNames = new Set(["Елена", "Ирина", "Светлана"]);

function Review({ testimonial }: { testimonial: (typeof testimonials)[number] }) {
  return (
    <article className="review">
      <div className="review-top"><h3>{testimonial.name}</h3><span className="stars" role="img" aria-label="5 из 5">{testimonial.stars}</span></div>
      <p>{testimonial.text}</p>
    </article>
  );
}

export default async function HomePage() {
  const user = await getCurrentUser();
  const canViewProtectedLessons = canOpenProtectedMaterials(user);
  const featuredLessons = getPublicLessons().slice(0, 3);
  const featuredReviews = testimonials.filter((review) => featuredReviewNames.has(review.name));
  const moreReviews = testimonials.filter((review) => !featuredReviewNames.has(review.name));

  return (
    <div className="course-home" id="home">
      <section className="hero wrap">
        <div className="eyebrow hero-label"><BookOpenCheck aria-hidden />Ты-Серб курс</div>
        <h1>Сербский язык для русскоговорящих</h1>
        <p className="lead">Интерактивные уроки сербского для жизни, переезда и общения. Начните с бесплатного первого урока.</p>
        <div className="actions">
          <Link className="button button-red" href="/lessons/azbuka-i-proiznoshenie" aria-describedby="demo-note"><BookOpenCheck aria-hidden />Попробовать первый урок бесплатно</Link>
          <Link className="button" href="#tariffs"><Layers aria-hidden />Смотреть тарифы</Link>
        </div>
        <p className="demo-note" id="demo-note">Без регистрации и оплаты. Можно начать с нуля.</p>
        <p className="outcome">После прохождения курса вы сможете общаться с людьми, находить друзей и решать повседневные задачи на сербском.</p>
        <div className="hero-facts">
          <div className="fact"><strong>С нуля</strong><span>понятный старт в сербском</span></div>
          <div className="fact"><strong>В своём темпе</strong><span>уроки и интерактивные задания</span></div>
          <div className="fact"><strong>С обратной связью</strong><span>поддержка на платформе</span></div>
        </div>
      </section>

      <section className="section format wrap" id="format">
        <div className="section-heading"><div><p className="eyebrow">Формат</p><h2>Как устроен курс</h2></div></div>
        <div className="format-grid">
          {courseFlow.map((item, index) => {
            const Icon = item.icon;
            return <div className="format-item" key={item.title}><div className="format-number"><span>{String(index + 1).padStart(2, "0")}</span><Icon aria-hidden /></div><h3>{item.title}</h3><p>{item.text}</p></div>;
          })}
        </div>
      </section>

      <section className="about wrap" id="about">
        <div className="about-inner">
          <div className="portrait">
            <Image src="/images/portrait.jpg" width={640} height={800} sizes="(max-width: 760px) 320px, 300px" alt="Лидия, преподаватель сербского языка" />
            <span className="portrait-caption"><MessageCircle aria-hidden />Учимо српски!</span>
          </div>
          <div className="about-text">
            <p className="eyebrow">Ваш преподаватель</p><h2 className="teacher-name">Здраво! Меня зовут Лидия</h2>
            <p>Я носитель сербского языка и уже несколько лет преподаю сербский русскоязычным ученикам. Через мои занятия прошло более 100 человек: взрослые, подростки и те, кому язык нужен для жизни, работы или общения.</p>
            <p>На уроках мы сразу учимся говорить: строить фразы, задавать вопросы и понимать живую речь. Я использую собственные материалы: комиксы, интерактивные упражнения, диалоги и визуальные схемы. Объясняю понятно, спокойно и по делу.</p>
            <div className="teacher-facts"><span><CheckCircle2 aria-hidden />Носитель языка</span><span><CheckCircle2 aria-hidden />Объяснения на русском</span><span><CheckCircle2 aria-hidden />Более 100 учеников</span></div>
          </div>
        </div>
      </section>

      <section className="section audience" id="audience">
        <div className="wrap">
          <p className="eyebrow">Кому подойдёт</p><h2>Для кого курс</h2>
          <p className="section-lead">Для тех, кому сербский нужен в настоящей жизни: от первого знакомства до повседневного общения.</p>
          <div className="audience-grid">{audience.map((item) => <div className="audience-item" key={item.title}><CheckCircle2 aria-hidden /><div><h3>{item.title}</h3><p>{item.text}</p></div></div>)}</div>
        </div>
      </section>

      <CourseTariffs />

      <section className="section reviews wrap" id="reviews">
        <div className="section-heading"><div><p className="eyebrow">Ученики</p><h2>Отзывы учеников</h2></div></div>
        <div className="reviews-grid">{featuredReviews.map((testimonial) => <Review key={testimonial.name} testimonial={testimonial} />)}</div>
        <details className="more-reviews"><summary>Ещё {moreReviews.length} отзывов</summary><div className="reviews-grid">{moreReviews.map((testimonial) => <Review key={testimonial.name} testimonial={testimonial} />)}</div></details>
      </section>

      <section className="section lessons" id="lessons">
        <div className="wrap">
          <div className="section-heading"><div><p className="eyebrow">Библиотека</p><h2>Первые уроки</h2></div><Link className="button" href="/lessons">Все уроки</Link></div>
          <div className="lessons-grid">{featuredLessons.map((lesson) => <LessonCard key={lesson.slug} lesson={lesson} isLocked={lesson.number !== 1 && !canViewProtectedLessons} />)}</div>
        </div>
      </section>

      <section className="contact wrap">
        <div className="contact-inner">
          <div><p className="eyebrow">На связи</p><h2>Есть вопросы? Напишите мне</h2><p>Помогу выбрать формат и разобраться с доступом к курсу.</p></div>
          <div className="contact-links"><a className="button" href="https://t.me/LidiaSimich" target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden />@LidiaSimich</a><a className="button" href="https://t.me/tyserb" target="_blank" rel="noopener noreferrer"><Send aria-hidden />Канал курса</a></div>
        </div>
      </section>
    </div>
  );
}
