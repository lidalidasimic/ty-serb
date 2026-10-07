import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";

const comic = "/api/lesson-content/ucimo-srpski-11/comic.png";

const words = [
  ["некако", "как-то"],
  ["неко", "кто-то"],
  ["придеви", "прилагательные"],
  ["магла", "туман"],
  ["брисати", "стирать"],
  ["речи", "слова"],
  ["којима", "которыми"],
  ["свет", "мир"],
  ["онда", "тогда"],
  ["вратити", "вернуть"],
  ["брз", "быстрый"],
  ["чаробно", "волшебно"],
  ["опет", "снова"],
  ["јачи", "сильнее"],
];

const comicWords = [
  ["нешто није у реду", "что-то не так"],
  ["сиво", "серо"],
  ["торба", "сумка"],
  ["пас", "собака"],
  ["обична магија", "обычная магия"],
  ["описујемо", "описываем"],
  ["шарен", "разноцветный"],
  ["улице су широке", "улицы широкие"],
  ["спасен", "спасён"],
];

const adjectiveRows = [
  ["леп", "лепа", "лепо"],
  ["мали", "мала", "мало"],
  ["велики", "велика", "велико"],
  ["добар", "добра", "добро"],
  ["нов", "нова", "ново"],
  ["стар", "стара", "старо"],
  ["јак", "јака", "јако"],
  ["смешан", "смешна", "смешно"],
  ["паметан", "паметна", "паметно"],
  ["брз", "брза", "брзо"],
  ["зелен", "зелена", "зелено"],
  ["црвен", "црвена", "црвено"],
];

const lessonRoute = [
  ["01", "Слова", "#words"],
  ["02", "Комикс", "#comic"],
  ["03", "Грамматика", "#grammar"],
  ["04", "Практика", "#practice"],
  ["05", "Мини-тест", "#test"],
  ["06", "Домашнее", "#homework"],
  ["07", "LearningApps", "#apps"],
];

function Section({
  id,
  eyebrow,
  title,
  children,
  tone = "cream",
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
  tone?: string;
}) {
  return (
    <section id={id} className={`section tone-${tone}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function CheckButton({ onClick, reset }: { onClick: () => void; reset?: () => void }) {
  return (
    <div className="actions">
      <button type="button" className="primary" onClick={onClick}>
        Проверить
      </button>
      {reset && (
        <button type="button" className="secondary" onClick={reset}>
          Попробовать ещё раз
        </button>
      )}
    </div>
  );
}

const wordTranslations = ["туман", "сильнее", "кто-то", "снова", "прилагательные", "как-то", "стирать", "мир", "которыми", "вернуть", "волшебно", "слова", "быстрый", "тогда"];
const comicTranslations = ["собака", "разноцветный", "сумка", "спасён", "обычная магия", "серо", "улицы широкие", "что-то не так", "описываем"];

type MatchLine = { word: string; translation: string; x1: number; y1: number; x2: number; y2: number };

function WordMatch({ items, translations, label }: { items: string[][]; translations: string[]; label: string }) {
  const [left, setLeft] = useState<string | null>(null);
  const [right, setRight] = useState<string | null>(null);
  const [pairs, setPairs] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [status, setStatus] = useState("");
  const grid = useRef<HTMLDivElement>(null);
  const leftButtons = useRef(new Map<string, HTMLButtonElement>());
  const rightButtons = useRef(new Map<string, HTMLButtonElement>());
  const [geometry, setGeometry] = useState({ width: 1, height: 1, lines: [] as MatchLine[] });

  useLayoutEffect(() => {
    const element = grid.current;
    if (!element) return;
    const measure = () => {
      const box = element.getBoundingClientRect();
      const lines = Object.entries(pairs).flatMap(([word, translation]) => {
        const source = leftButtons.current.get(word)?.getBoundingClientRect();
        const target = rightButtons.current.get(translation)?.getBoundingClientRect();
        return source && target ? [{ word, translation,
          x1: source.right - box.left + 2, y1: source.top - box.top + source.height / 2,
          x2: target.left - box.left - 2, y2: target.top - box.top + target.height / 2,
        }] : [];
      });
      setGeometry({ width: box.width, height: box.height, lines });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    [...leftButtons.current.values(), ...rightButtons.current.values()].forEach(button => observer.observe(button));
    measure();
    return () => observer.disconnect();
  }, [pairs]);

  const connect = (word: string, translation: string) => {
    setPairs(current => {
      const next = Object.fromEntries(Object.entries(current).filter(([key, value]) => key !== word && value !== translation));
      return { ...next, [word]: translation };
    });
    setLeft(null);
    setRight(null);
    setChecked(false);
    setStatus(`${word} — ${translation}`);
  };
  const pairClass = (word: string) => pairs[word]
    ? checked ? (pairs[word] === items.find(item => item[0] === word)?.[1] ? "correct" : "wrong") : "connected"
    : "";

  return (
    <div className="exercise word-match" role="group" aria-label={label}>
      <div className="match-grid" ref={grid}>
        <svg className="match-lines" viewBox={`0 0 ${geometry.width} ${geometry.height}`} aria-hidden="true">
          {geometry.lines.map(line => {
            const middle = (line.x1 + line.x2) / 2;
            const color = checked ? (items.find(item => item[0] === line.word)?.[1] === line.translation ? "var(--green)" : "var(--red)") : "var(--blue)";
            return <g key={line.word} style={{ color }}>
              <path data-match-line d={`M ${line.x1} ${line.y1} C ${middle} ${line.y1}, ${middle} ${line.y2}, ${line.x2} ${line.y2}`} />
              <circle cx={line.x1} cy={line.y1} r="4" />
              <circle cx={line.x2} cy={line.y2} r="4" />
            </g>;
          })}
        </svg>
        <div className="match-column">
          {items.map(([sr]) => (
            <button
              type="button"
              key={sr}
              ref={node => { if (node) leftButtons.current.set(sr, node); else leftButtons.current.delete(sr); }}
              aria-pressed={left === sr}
              title={pairs[sr] ? `${sr} — ${pairs[sr]}` : sr}
              onClick={() => {
                if (right) connect(sr, right);
                else { setLeft(left === sr ? null : sr); setRight(null); }
              }}
              className={`match ${left === sr ? "selected" : ""} ${pairClass(sr)}`}
            >
              {sr}
            </button>
          ))}
        </div>
        <div className="match-column">
          {translations.map(ru => {
            const source = Object.keys(pairs).find(word => pairs[word] === ru);
            return <button
              type="button"
              key={ru}
              ref={node => { if (node) rightButtons.current.set(ru, node); else rightButtons.current.delete(ru); }}
              aria-pressed={right === ru}
              title={source ? `${source} — ${ru}` : ru}
              onClick={() => {
                if (left) connect(left, ru);
                else { setRight(right === ru ? null : ru); setLeft(null); }
              }}
              className={`match translation ${right === ru ? "selected" : ""} ${source ? pairClass(source) : ""}`}
            >
              {ru}
            </button>;
          })}
        </div>
      </div>
      <p className="match-status" aria-live="polite">{status}</p>
      <CheckButton
        onClick={() => setChecked(true)}
        reset={() => {
          setPairs({});
          setLeft(null);
          setRight(null);
          setChecked(false);
          setStatus("Все пары сброшены.");
        }}
      />
      {checked && (
        <p className="feedback" role="status">
          Правильно: {items.filter(([a, b]) => pairs[a] === b).length} из {items.length}.
        </p>
      )}
    </div>
  );
}

function SelectExercise() {
  const qs = [
    ["Ова мачка је", ["леп", "лепа", "лепо"], "лепа"],
    ["Овај коњ је", ["јак", "јака", "јако"], "јак"],
    ["Ово место је", ["чаробан", "чаробна", "чаробно"], "чаробно"],
  ] as const;
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);

  return (
    <div className="exercise">
      <p className="instruction">Выбери форму, которая согласуется с существительным.</p>
      {qs.map((q, index) => (
        <div className="question" key={q[0]}>
          <strong>{q[0]}…</strong>
          <div className="chips">
            {q[1].map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => {
                  setAnswers((current) => ({ ...current, [index]: value }));
                  setChecked(false);
                }}
                className={`${answers[index] === value ? "active" : ""} ${
                  checked && answers[index] === value ? (value === q[2] ? "correct" : "wrong") : ""
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          {checked && answers[index] !== q[2] && <p className="hint">Правильно: {q[2]}</p>}
        </div>
      ))}
      <CheckButton
        onClick={() => setChecked(true)}
        reset={() => {
          setAnswers({});
          setChecked(false);
        }}
      />
    </div>
  );
}

function FillExercise() {
  const qs = [
    ["Коцкослав је", "коњ.", "јак"],
    ["Јасмина је", "мачка.", "лепа"],
    ["Лука је", "зец.", "брз"],
    ["Маша је", "гуска.", "смешна"],
    ["Омск је", "град.", "велики"],
  ];
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);

  return (
    <div className="exercise">
      <p className="instruction">Впиши подходящее прилагательное из комикса.</p>
      {qs.map((q, index) => {
        const isCorrect = (answers[index] || "").trim().toLowerCase() === q[2];
        return (
          <label className="fill" key={q[0]}>
            <span>{q[0]}</span>
            <input
              value={answers[index] || ""}
              onChange={(event) => {
                setAnswers((current) => ({ ...current, [index]: event.target.value }));
                setChecked(false);
              }}
              aria-label={`${q[0]} пропуск`}
            />
            <span>{q[1]}</span>
            {checked && <b className={isCorrect ? "ok" : "no"}>{isCorrect ? "✓" : `→ ${q[2]}`}</b>}
          </label>
        );
      })}
      <CheckButton
        onClick={() => setChecked(true)}
        reset={() => {
          setAnswers({});
          setChecked(false);
        }}
      />
    </div>
  );
}

function MiniTest() {
  const qs = [
    { q: "Что украли в истории?", o: ["боје", "придеве", "имена"], a: "придеве" },
    { q: "Как Полина описала Коцкослава?", o: ["Коцкослав је јак.", "Коцкослав је јака.", "Коцкослав је јако."], a: "Коцкослав је јак." },
    { q: "Выбери средний род слова зелен.", o: ["зелен", "зелена", "зелено"], a: "зелено" },
    { q: "Каким стал Омск в конце?", o: ["сив и тих", "леп и шарен", "мали и стар"], a: "леп и шарен" },
  ];
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [done, setDone] = useState(false);
  const score = qs.filter((q, index) => answers[index] === q.a).length;

  return (
    <div className="exercise test">
      {qs.map((q, index) => (
        <div className="question" key={q.q}>
          <strong>
            {index + 1}. {q.q}
          </strong>
          <div className="test-options">
            {q.o.map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => {
                  setAnswers((current) => ({ ...current, [index]: value }));
                  setDone(false);
                }}
                className={`${answers[index] === value ? "active" : ""} ${
                  done && answers[index] === value ? (value === q.a ? "correct" : "wrong") : ""
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          {done && answers[index] !== q.a && <p className="hint">Правильно: {q.a}</p>}
        </div>
      ))}
      <CheckButton
        onClick={() => setDone(true)}
        reset={() => {
          setAnswers({});
          setDone(false);
        }}
      />
      {done && (
        <div className="result">
          <span>{score}/{qs.length}</span>
          <p>
            {score === 4
              ? "Одлично! Урок пройден."
              : score >= 3
                ? "Очень хорошо! Исправь один ответ."
                : "Вернись к комиксу и таблице — затем попробуй ещё раз."}
          </p>
        </div>
      )}
    </div>
  );
}

function LearningApp({ id, title, description }: { id: string; title: string; description: string }) {
  const embedUrl = `https://learningapps.org/watch?v=${id}`;
  const watchUrl = `https://learningapps.org/watch?id=${id}`;

  return (
    <article className="learningapp">
      <div className="learningapp-head">
        <div>
          <span>LearningApps</span>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <a href={watchUrl} target="_blank" rel="noreferrer">
          Открыть отдельно
        </a>
      </div>
      <iframe src={embedUrl} title={`${title} — LearningApps`} loading="lazy" allow="autoplay; fullscreen" allowFullScreen />
    </article>
  );
}

export default function LessonEleven() {
  const lesson = useRef<HTMLDivElement>(null);
  const navigation = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ progress: 0, active: "top" });

  useEffect(() => {
    const element = lesson.current;
    const bar = navigation.current;
    const page = content.current;
    if (!element || !bar || !page) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const headerHeight = parseFloat(getComputedStyle(element).getPropertyValue("--lesson-top")) || 0;
      const navigationHeight = bar.getBoundingClientRect().height;
      element.style.setProperty("--lesson-nav-height", `${navigationHeight}px`);
      const box = page.getBoundingClientRect();
      const start = window.scrollY + box.top - headerHeight - navigationHeight;
      const end = window.scrollY + box.bottom - window.innerHeight;
      const progress = Math.round(Math.max(0, Math.min(1, (window.scrollY - start) / Math.max(1, end - start))) * 100);
      let active = "top";
      for (const [, , href] of lessonRoute) {
        if ((element.querySelector(href)?.getBoundingClientRect().top ?? Infinity) <= headerHeight + navigationHeight + 48) {
          active = href.slice(1);
        }
      }
      setPosition(current => current.progress === progress && current.active === active ? current : { progress, active });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(schedule);
    observer.observe(page);
    observer.observe(bar);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const target = document.getElementById(location.hash.slice(1));
    if (target && element.contains(target)) target.scrollIntoView();
    schedule();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="lesson-experience" ref={lesson}>
      <nav className="lesson-navigation" aria-label="Разделы урока 11" ref={navigation}>
        <div className="lesson-navigation-inner">
          <div className="lesson-progress-meta">
            <a href="#top">Урок 11</a>
            <span>{position.progress}%</span>
          </div>
          <div className="lesson-section-links">
            {lessonRoute.map(([number, label, href]) => (
              <a key={number} href={href} aria-current={position.active === href.slice(1) ? "location" : undefined}>
                {label}
              </a>
            ))}
          </div>
        </div>
        <div className="lesson-progress-track" role="progressbar" aria-label="Прогресс чтения урока" aria-valuemin={0} aria-valuemax={100} aria-valuenow={position.progress}>
          <div style={{ width: `${position.progress}%` }} />
        </div>
      </nav>

      <div id="top" className="page" ref={content}>
        <section className="hero">
          <div>
            <p className="badge">ЛЕКЦИЯ 11 · A1+</p>
            <h1>
              Прилагательные.
              <br />
              <em>Пропавшие слова</em>
            </h1>
            <p className="lead">
              Научимся описывать людей, животных и места, согласовывая прилагательные в мужском, женском и среднем роде.
            </p>
            <div className="hero-actions">
              <a className="primary start" href="#contents">
                Начать урок ↓
              </a>
              <a className="secondary start" href="/lessons">
                Каталог курса
              </a>
            </div>
          </div>
          <div className="hero-card" aria-label="Примеры вопросов к прилагательным">
            <span className="spark">✦</span>
            <p>Какав?</p>
            <p>Каква?</p>
            <p>Какво?</p>
            <b>леп · лепа · лепо</b>
          </div>
        </section>

        <Section id="contents" eyebrow="Маршрут" title="Что будет в уроке" tone="yellow">
          <div className="contents">
            {lessonRoute.map(([number, label, href]) => (
              <a key={number} href={href}>
                <b>{number}</b>
                <span>{label}</span>
              </a>
            ))}
          </div>
        </Section>

        <Section id="words" eyebrow="Словарь" title="Новые слова">
          <div className="vocab">
            {words.map(([sr, ru]) => (
              <div key={sr}>
                <strong>{sr}</strong>
                <span>{ru}</span>
              </div>
            ))}
          </div>
          <h3>Соедини слова с переводами</h3>
          <WordMatch items={words} translations={wordTranslations} label="Слова и переводы" />
        </Section>

        <Section id="comic" eyebrow="Читаем" title="Стрип: Ко је украо придеве?" tone="blue">
          <p className="intro">
            В Омске исчезли прилагательные — без них мир стал серым. Прочитай комикс и узнай, как Полина и друзья их
            вернули.
          </p>
          <figure className="comic">
            <a href={comic} target="_blank" rel="noreferrer">
              <img src={comic} alt="Комикс из восьми кадров: Полина и друзья возвращают пропавшие прилагательные в Омск" />
            </a>
            <figcaption>Оригинальный комикс урока 11. Нажми на изображение, чтобы открыть его крупнее.</figcaption>
          </figure>
          <div className="comic-words">
            <h3>Непонятные слова из комикса</h3>
            <div className="vocab compact">
              {comicWords.map(([sr, ru]) => (
                <div key={sr}>
                  <strong>{sr}</strong>
                  <span>{ru}</span>
                </div>
              ))}
            </div>
            <h3>Соедини слова с переводами</h3>
            <WordMatch items={comicWords} translations={comicTranslations} label="Слова из комикса и переводы" />
          </div>
        </Section>

        <Section id="grammar" eyebrow="Правило" title="Три рода прилагательных" tone="red">
          <p className="intro">
            Прилагательное отвечает на вопросы <b>какав?</b>, <b>каква?</b>, <b>какво?</b> и меняет окончание вместе с
            существительным.
          </p>
          <div className="rule-cards">
            <div>
              <span>Мушки род</span>
              <b>какав?</b>
              <p>
                Коцкослав је <mark>јак</mark>.
              </p>
            </div>
            <div>
              <span>Женски род</span>
              <b>каква?</b>
              <p>
                Јасмина је <mark>лепа</mark>.
              </p>
            </div>
            <div>
              <span>Средњи род</span>
              <b>какво?</b>
              <p>
                Место је <mark>чаробно</mark>.
              </p>
            </div>
          </div>
          <div className="table">
            <div className="tr head">
              <b>Мушки</b>
              <b>Женски</b>
              <b>Средњи</b>
            </div>
            {adjectiveRows.map((row) => (
              <div className="tr" key={row[0]}>
                {row.map((value) => (
                  <span key={value}>{value}</span>
                ))}
              </div>
            ))}
          </div>
        </Section>

        <Section id="practice" eyebrow="Практика" title="Закрепляем формы" tone="yellow">
          <h3>А. Повежи са јунаком</h3>
          <p className="intro">
            Вспомни героев: Коцкослав је <b>јак</b>, Јасмина је <b>лепа</b>, Лука је <b>брз</b>, Маша је <b>смешна</b>, а
            Омск је <b>чаробно место</b>.
          </p>
          <h3>Б. Изабери правилно</h3>
          <SelectExercise />
          <h3>В. Допуни реченицу</h3>
          <FillExercise />
        </Section>

        <Section id="test" eyebrow="Финал" title="Мини-тест">
          <MiniTest />
        </Section>

        <Section id="homework" eyebrow="Домашняя работа" title="Моји јунаци" tone="blue">
          <p className="intro">Напиши 6 реченица: Полина је… Коцкослав је… Јасмина је… Маша је… Лука је… Омск је…</p>
          <div className="homework-lines">
            {[1, 2, 3, 4, 5, 6].map((number) => (
              <span key={number}>{number}.</span>
            ))}
          </div>
          <div className="bonus">
            <b>Бонус</b>
            <p>
              Напиши 3 реченице о себи: <i>Ја сам паметна. Ја сам добра. Ја сам храбра.</i>
            </p>
          </div>
        </Section>

        <Section id="apps" eyebrow="LearningApps" title="Ещё две тренировки" tone="red">
          <p className="intro">
            Сначала потренируй прилагательные, потом проверь себя в игре.
          </p>
          <div className="learningapps-grid">
            <LearningApp id="pe514bjca26" title="Pridevi" description="Потренируй формы прилагательных." />
            <LearningApp id="ppi7p6qnj26" title="MILIONER 15" description="Проверь себя в игре «Миллионер»." />
          </div>
        </Section>

        <div className="lesson-footer">
          <div className="lesson-materials">
            <a href="/api/materials/ucimo-srpski-11/gamma" target="_blank" rel="noreferrer"><ExternalLink size={16} aria-hidden="true" />Презентация</a>
            <a href="/api/materials/ucimo-srpski-11/telegram" target="_blank" rel="noreferrer"><ExternalLink size={16} aria-hidden="true" />Telegram</a>
          </div>
          <nav aria-label="Переход между лекциями">
            <a href="/lessons/ucimo-srpski-10"><ArrowLeft size={18} aria-hidden="true" />Предыдущая лекция</a>
            <a href="/lessons">Все уроки</a>
            <a href="/lessons/ucimo-srpski-12">Следующая лекция<ArrowRight size={18} aria-hidden="true" /></a>
          </nav>
        </div>
      </div>

    </div>
  );
}
