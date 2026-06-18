export type Lesson = {
  number: number;
  slug: string;
  title: string;
  level: string;
  topic: string;
  status: "готово" | "скоро";
  description: string;
  gammaLink: string;
  homeworkLink: string;
  telegramPostLink: string;
  worksheetLink: string;
  vocabulary: string[];
  grammarFocus: string[];
  extraNotes: string;
};

export const lessons: Lesson[] = [
  {
    number: 1,
    slug: "azbuka-i-proiznoshenie",
    title: "Лекция 1. Знакомство. Про сербский. Школьный вокабуляр. Род.",
    level: "A0",
    topic: "Кириллица, латиница и звуки",
    status: "готово",
    description:
      "Знакомимся с сербским алфавитом, читаем простые слова и тренируем звуки, которые отличаются от русского.",
    gammaLink: "https://adorable-insect-f8yuabg.gamma.site/",
    homeworkLink: "https://adorable-insect-f8yuabg.gamma.site/",
    telegramPostLink: "https://t.me/tyserb/11",
    worksheetLink: "",
    vocabulary: ["здраво", "хвала", "молим", "да", "не", "добар дан"],
    grammarFocus: ["сербская кириллица и латиница", "правило: один звук — одна буква"],
    extraNotes:
      "Добавьте короткие аудио-примеры или ссылку на таблицу букв, когда материалы будут готовы.",
  },
  {
    number: 2,
    slug: "kak-predstavitsya",
    title: "Лекция 2. Профессии. Глагол biti.",
    level: "A1",
    topic: "Профессии, глагол JESAM / BITI, первые грамматические конструкции",
    status: "готово",
    description:
      "Курс продолжается: учимся говорить о профессии, строить простые фразы с глаголом «быть», читать диалоги и закреплять базовые конструкции.",
    gammaLink: "https://noteworthy-insect-b6m5fmp.gamma.site/",
    homeworkLink: "https://example.com/homework/lesson-2",
    telegramPostLink: "https://t.me/tyserb/15",
    worksheetLink: "",
    vocabulary: ["ја", "ти", "име", "Русија", "Србија", "студент"],
    grammarFocus: ["глагол бити в настоящем времени", "личные местоимения"],
    extraNotes: "Хороший урок для карточек с вопросами и быстрых парных диалогов.",
  },
  {
    number: 3,
    slug: "rod-muzhskoy-zhenskiy-sredniy",
    title: "Лекция 3. Множественное число. Национальности. Вопросы.",
    level: "A1",
    topic: "Множественное число существительных и притяжательные местоимения",
    status: "готово",
    description:
      "Разбираем, как образуется множественное число в сербском, какие изменения происходят в словах и как работают притяжательные местоимения.",
    gammaLink: "https://bony-snake-cnpu7yp.gamma.site/",
    homeworkLink: "https://example.com/homework/lesson-3",
    telegramPostLink: "https://t.me/example/103",
    worksheetLink: "",
    vocabulary: ["град", "жена", "море", "кафа", "телефон", "дете"],
    grammarFocus: ["мужской, женский и средний род", "типичные окончания существительных"],
    extraNotes: "Можно добавить мини-тест: выбрать род для 15 новых слов.",
  },
  {
    number: 4,
    slug: "prilagatelnye",
    title: "Лекция 4. Мост. Вопросы.",
    level: "A1",
    topic: "Описание людей и предметов",
    status: "готово",
    description:
      "Учимся согласовывать прилагательные с существительными и строить живые описания.",
    gammaLink: "https://4--xa7cc2c.gamma.site/",
    homeworkLink: "https://example.com/homework/lesson-4",
    telegramPostLink: "https://t.me/example/104",
    worksheetLink: "https://example.com/worksheets/lesson-4",
    vocabulary: ["леп", "добар", "нов", "стар", "велики", "мали"],
    grammarFocus: ["согласование по роду", "краткие описательные фразы"],
    extraNotes: "Добавьте картинки предметов, чтобы студенты описывали их на сербском.",
  },
  {
    number: 5,
    slug: "glagoly-nastoyashchee-vremya",
    title: "Лекция 5. Глаголы, числа, локатив местоимений.",
    level: "A1",
    topic: "Повседневные действия",
    status: "готово",
    description:
      "Собираем базовые глагольные формы и говорим о привычках, учебе и планах на день.",
    gammaLink: "https://ucimo-srpski-8-mo4jyut.gamma.site/",
    homeworkLink: "https://example.com/homework/lesson-5",
    telegramPostLink: "https://t.me/example/105",
    worksheetLink: "",
    vocabulary: ["радити", "учити", "говорити", "живети", "пити", "читати"],
    grammarFocus: ["настоящее время", "личные окончания глаголов"],
    extraNotes: "После урока удобно дать задание написать 6 предложений о своем дне.",
  },
  {
    number: 6,
    slug: "padezhi-pervoe-znakomstvo",
    title: "Лекция 6. Сегодня практикуем разговор.",
    level: "A1+",
    topic: "Сербские глаголы и их употребление",
    status: "готово",
    description:
      "Разбираем сербские глаголы, их формы и употребление в понятных примерах.",
    gammaLink: "https://serbian-verbs-kids-j9tv6dl.gamma.site/",
    homeworkLink: "https://example.com/homework/lesson-6",
    telegramPostLink: "https://t.me/example/106",
    worksheetLink: "",
    vocabulary: ["књига", "пријатељ", "школа", "кућа", "поклон", "пут"],
    grammarFocus: ["роль падежей в предложении", "именительный и винительный падежи"],
    extraNotes:
      "Этот урок лучше держать обзорным: цель — снять страх перед системой падежей.",
  },
  {
    number: 7,
    slug: "supergeroi",
    title: "Лекция 7. Локатив.",
    level: "A1+",
    topic: "Сербский язык на примере супергероев",
    status: "готово",
    description:
      "Закрепляем сербский язык с помощью ярких примеров, заданий и темы супергероев.",
    gammaLink: "https://ucimo-srpski-superheroji-7pl8bdp.gamma.site/",
    homeworkLink: "",
    telegramPostLink: "https://t.me/tyserb",
    worksheetLink: "",
    vocabulary: [],
    grammarFocus: [],
    extraNotes: "",
  },
  {
    number: 8,
    slug: "ucimo-srpski-8",
    title: "Лекция 8. Аккузатив.",
    level: "A1+",
    topic: "Продолжаем изучать сербский язык",
    status: "готово",
    description:
      "Продолжаем развивать словарный запас, понимание речи и навыки построения фраз.",
    gammaLink: "https://ucimo-srpski-10-xcueii1.gamma.site/",
    homeworkLink: "",
    telegramPostLink: "https://t.me/tyserb",
    worksheetLink: "",
    vocabulary: [],
    grammarFocus: [],
    extraNotes: "",
  },
  {
    number: 9,
    slug: "ucimo-srpski-9",
    title: "Лекция 9. У меня есть семья!",
    level: "A1+",
    topic: "Практика сербского языка",
    status: "готово",
    description:
      "Практикуем сербский язык, закрепляем изученные конструкции и учимся говорить увереннее.",
    gammaLink: "https://ucimo-srpski-9-34pxgmk.gamma.site/",
    homeworkLink: "",
    telegramPostLink: "https://t.me/tyserb",
    worksheetLink: "",
    vocabulary: [],
    grammarFocus: [],
    extraNotes: "",
  },
  {
    number: 10,
    slug: "ucimo-srpski-10",
    title: "Лекция 10. Указательные местоимения.",
    level: "A1+",
    topic: "Указательные местоимения",
    status: "готово",
    description:
      "Продолжаем изучать сербский язык, закреплять лексику и грамматику на практических заданиях.",
    gammaLink: "https://ucimo-srpski-12-s1fpfoe.gamma.site/",
    homeworkLink: "",
    telegramPostLink: "https://t.me/tyserb",
    worksheetLink: "",
    vocabulary: [],
    grammarFocus: [],
    extraNotes: "",
  },
  {
    number: 11,
    slug: "ucimo-srpski-11",
    title: "Лекция 11. Прилагательные.",
    level: "A1+",
    topic: "Прилагательные",
    status: "готово",
    description:
      "Продолжаем курс сербского языка и тренируем понимание, фразы и разговорную практику.",
    gammaLink: "https://ucimo-srpski-11-xywikv6.gamma.site/",
    homeworkLink: "",
    telegramPostLink: "https://t.me/tyserb",
    worksheetLink: "",
    vocabulary: [],
    grammarFocus: [],
    extraNotes: "",
  },
];

export function getLessonBySlug(slug: string) {
  return lessons.find((lesson) => lesson.slug === slug);
}
