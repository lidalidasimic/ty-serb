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

export type PublicLesson = Omit<
  Lesson,
  "gammaLink" | "homeworkLink" | "telegramPostLink" | "worksheetLink" | "extraNotes"
>;

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
    gammaLink: "https://tyserb2-b6m5fmp.gamma.site/",
    homeworkLink: "https://example.com/homework/lesson-2",
    telegramPostLink: "https://t.me/tyserb/38",
    worksheetLink: "",
    vocabulary: ["ја", "ти", "име", "Русија", "Србија", "студент"],
    grammarFocus: ["глагол бити в настоящем времени", "личные местоимения"],
    extraNotes: "Хороший урок для карточек с вопросами и быстрых парных диалогов.",
  },
  {
    number: 3,
    slug: "rod-muzhskoy-zhenskiy-sredniy",
    title: "Лекция 3. Множественное число. Национальности.",
    level: "A1",
    topic: "Множественное число существительных и притяжательные местоимения",
    status: "готово",
    description:
      "Разбираем, как образуется множественное число в сербском, какие изменения происходят в словах и как работают притяжательные местоимения.",
    gammaLink: "https://tyserb3-cnpu7yp.gamma.site/",
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
    gammaLink: "https://tyserb4-xa7cc2c.gamma.site/",
    homeworkLink: "https://example.com/homework/lesson-4",
    telegramPostLink: "https://t.me/tyserb/63",
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
    gammaLink: "https://tyserb5-mo4jyut.gamma.site/",
    homeworkLink: "https://example.com/homework/lesson-5",
    telegramPostLink: "https://t.me/tyserb/55",
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
    gammaLink: "https://tyserb6-j9tv6dl.gamma.site/",
    homeworkLink: "https://example.com/homework/lesson-6",
    telegramPostLink: "https://t.me/tyserb/62",
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
    gammaLink: "https://tyserb7-7pl8bdp.gamma.site/",
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
    gammaLink: "https://tyserb8-xcueii1.gamma.site/",
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
    gammaLink: "https://tyserb9-34pxgmk.gamma.site/",
    homeworkLink: "",
    telegramPostLink: "https://t.me/tyserb/65",
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
    gammaLink: "https://tyserb10-s1fpfoe.gamma.site/",
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
    gammaLink: "https://tyserb11-xywikv6.gamma.site/",
    homeworkLink: "",
    telegramPostLink: "https://t.me/tyserb",
    worksheetLink: "",
    vocabulary: [],
    grammarFocus: [],
    extraNotes: "",
  },
  {
    number: 12,
    slug: "ucimo-srpski-12",
    title: "Лекция 12. Хобби. Где живешь?",
    level: "A1+",
    topic: "Практика сербского языка",
    status: "готово",
    description:
      "Продолжаем курс сербского языка: закрепляем лексику, грамматику и разговорные навыки на практических примерах.",
    gammaLink: "https://tyserb12-s3d0dzl.gamma.site/",
    homeworkLink: "",
    telegramPostLink: "https://t.me/tyserb",
    worksheetLink: "",
    vocabulary: [],
    grammarFocus: [],
    extraNotes: "",
  },
  {
    number: 13,
    slug: "ucimo-srpski-13",
    title: "Лекция 13. Соседи. Порядковые числительные. Времена года.",
    level: "A1+",
    topic: "Соседи, порядковые числительные, времена года",
    status: "готово",
    description:
      "Продолжаем курс сербского языка: говорим о соседях, учимся использовать порядковые числительные и повторяем времена года.",
    gammaLink: "https://tyserb13-haquin9.gamma.site/",
    homeworkLink: "",
    telegramPostLink: "https://t.me/tyserb",
    worksheetLink: "",
    vocabulary: [],
    grammarFocus: [],
    extraNotes: "",
  },
  {
    number: 14,
    slug: "ucimo-srpski-14",
    title:
      "Лекция 14. Ресторан. Модальные глаголы. Аккузатив: местоимения, прилагательные, числительные.",
    level: "A1+",
    topic: "Ресторан, модальные глаголы, аккузатив",
    status: "готово",
    description:
      "Учимся говорить в ресторане, разбираем модальные глаголы и тренируем аккузатив с местоимениями, прилагательными и числительными.",
    gammaLink: "https://tyserb14-387dpm2.gamma.site/",
    homeworkLink: "",
    telegramPostLink: "https://t.me/tyserb",
    worksheetLink: "",
    vocabulary: [],
    grammarFocus: [],
    extraNotes: "",
  },
  {
    number: 15,
    slug: "ucimo-srpski-15",
    title: "Лекция 15. Еда. Пекарня. Магазин. Инструментал. Рецепты.",
    level: "A1+",
    topic: "Еда, пекарня, магазин, инструментал, рецепты",
    status: "готово",
    description:
      "Говорим о еде, пекарне и магазине, знакомимся с инструменталом и учимся обсуждать рецепты на сербском.",
    gammaLink: "https://tyserb15-zxncep5.gamma.site/",
    homeworkLink: "",
    telegramPostLink: "https://t.me/tyserb",
    worksheetLink: "",
    vocabulary: [],
    grammarFocus: [],
    extraNotes: "",
  },
  {
    number: 16,
    slug: "trag-iz-golupca",
    title: "Лекция 16. Детектив. Генитив.",
    level: "A1+",
    topic: "Детектив, генитив",
    status: "готово",
    description:
      "Продолжаем курс сербского языка в формате детективной истории и разбираем генитив на практических примерах.",
    gammaLink: "https://tyserb16-40k5myl.gamma.site/",
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

export function toPublicLesson(lesson: Lesson): PublicLesson {
  const {
    gammaLink,
    homeworkLink,
    telegramPostLink,
    worksheetLink,
    extraNotes,
    ...publicLesson
  } = lesson;

  return publicLesson;
}

export function getPublicLessons() {
  return lessons.map(toPublicLesson);
}
