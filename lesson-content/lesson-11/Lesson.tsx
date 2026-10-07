import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, CircleCheck, ExternalLink, RotateCcw } from "lucide-react";
import { Audio, Feedback } from "./LessonTools";
import { canCompleteStep, invalidateExercise, isStep, normalizeAnswer, progressKey, restoreProgress, steps, type StepId } from "./workflow";

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

function Section({
  id,
  eyebrow,
  title,
  children,
  tone = "cream",
  active,
  ending,
}: {
  id: StepId;
  eyebrow: string;
  title: string;
  children: ReactNode;
  tone?: string;
  active: StepId;
  ending: ReactNode;
}) {
  return (
    <section id={id} data-lesson-step={id} hidden={active !== id} className={`section tone-${tone}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 tabIndex={-1}>{title}</h2>
      <Audio step={id} />
      {children}
      {ending}
      <Feedback step={id} />
    </section>
  );
}

function CheckButton({ onClick, reset }: { onClick: () => void; reset?: () => void }) {
  return (
    <div className="actions">
      <button type="button" className="primary" onClick={onClick}>
        <Check size={18} aria-hidden />Проверить
      </button>
      {reset && (
        <button type="button" className="secondary" onClick={reset}>
          <RotateCcw size={18} aria-hidden />Повторить
        </button>
      )}
    </div>
  );
}

const wordTranslations = ["туман", "сильнее", "кто-то", "снова", "прилагательные", "как-то", "стирать", "мир", "которыми", "вернуть", "волшебно", "слова", "быстрый", "тогда"];
const comicTranslations = ["собака", "разноцветный", "сумка", "спасён", "обычная магия", "серо", "улицы широкие", "что-то не так", "описываем"];

type MatchLine = { word: string; translation: string; x1: number; y1: number; x2: number; y2: number };

function WordMatch({ items, translations, label, onComplete }: { items: string[][]; translations: string[]; label: string; onComplete: (done: boolean) => void }) {
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
    onComplete(false);
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
        onClick={() => { setChecked(true); onComplete(items.every(([a, b]) => pairs[a] === b)); }}
        reset={() => {
          setPairs({});
          setLeft(null);
          setRight(null);
          setChecked(false);
          onComplete(false);
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

function SelectExercise({ onComplete }: { onComplete: (done: boolean) => void }) {
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
                aria-pressed={answers[index] === value}
                onClick={() => {
                  setAnswers((current) => ({ ...current, [index]: value }));
                  setChecked(false);
                  onComplete(false);
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
        onClick={() => { setChecked(true); onComplete(qs.every((q, index) => answers[index] === q[2])); }}
        reset={() => {
          setAnswers({});
          setChecked(false);
          onComplete(false);
        }}
      />
      {checked && <p className="feedback" role="status">Правильно: {qs.filter((q, index) => answers[index] === q[2]).length} из {qs.length}.</p>}
    </div>
  );
}

function FillExercise({ onComplete }: { onComplete: (done: boolean) => void }) {
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
        const isCorrect = normalizeAnswer(answers[index] || "") === q[2];
        return (
          <label className="fill" key={q[0]}>
            <span>{q[0]}</span>
            <input
              value={answers[index] || ""}
              onChange={(event) => {
                setAnswers((current) => ({ ...current, [index]: event.target.value }));
                setChecked(false);
                onComplete(false);
              }}
              aria-label={`${q[0]} пропуск`}
            />
            <span>{q[1]}</span>
            {checked && <b className={isCorrect ? "ok" : "no"}>{isCorrect ? "✓" : `→ ${q[2]}`}</b>}
          </label>
        );
      })}
      <CheckButton
        onClick={() => { setChecked(true); onComplete(qs.every((q, index) => normalizeAnswer(answers[index] || "") === q[2])); }}
        reset={() => {
          setAnswers({});
          setChecked(false);
          onComplete(false);
        }}
      />
      {checked && <p className="feedback" role="status">Правильно: {qs.filter((q, index) => normalizeAnswer(answers[index] || "") === q[2]).length} из {qs.length}.</p>}
    </div>
  );
}

function MiniTest({ onComplete }: { onComplete: (done: boolean) => void }) {
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
                aria-pressed={answers[index] === value}
                onClick={() => {
                  setAnswers((current) => ({ ...current, [index]: value }));
                  setDone(false);
                  onComplete(false);
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
        onClick={() => { setDone(true); onComplete(score === qs.length); }}
        reset={() => {
          setAnswers({});
          setDone(false);
          onComplete(false);
        }}
      />
      {done && (
        <div className="result">
          <span>{score}/{qs.length}</span>
          <p>
            {score === 4
              ? "Одлично! Мини-тест пройден."
              : score >= 3
                ? "Очень хорошо! Исправь один ответ."
                : "Вернись к комиксу и таблице — затем попробуй ещё раз."}
          </p>
        </div>
      )}
    </div>
  );
}

function Homework() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);
  const key = "ty-serb-lesson-11-homework-v1";
  const prompts = ["Полина је", "Коцкослав је", "Јасмина је", "Маша је", "Лука је", "Омск је", "Ја сам", "Ја сам", "Ја сам"];
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "{}");
      if (saved && typeof saved === "object" && !Array.isArray(saved)) {
        setAnswers(Object.fromEntries(Object.entries(saved).filter(([id, value]) => /^[0-8]$/.test(id) && typeof value === "string").map(([id, value]) => [id, (value as string).slice(0, 500)])));
      }
    } catch { /* Drafts are optional when browser storage is unavailable. */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) try { localStorage.setItem(key, JSON.stringify(answers)); } catch { /* Storage may be disabled. */ }
  }, [answers, ready]);
  return <div className="homework-writing">
    {prompts.map((prompt, index) => <div key={index}>
      {index === 6 && <h3>Бонус: три предложения о себе</h3>}
      <label htmlFor={`l11-homework-${index}`}>{index < 6 ? index + 1 : index - 5}. {prompt}…</label>
      <textarea id={`l11-homework-${index}`} rows={2} maxLength={500} lang="sr" value={answers[index] || ""}
        onChange={event => setAnswers(current => ({ ...current, [index]: event.target.value }))} />
    </div>)}
  </div>;
}

export function LearningApp({ id, title, description, active }: { id: string; title: string; description: string; active: boolean }) {
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
      {active && <iframe src={embedUrl} title={`${title} — LearningApps`} loading="lazy" allow="autoplay; fullscreen" allowFullScreen />}
    </article>
  );
}

export default function LessonEleven() {
  const lesson = useRef<HTMLDivElement>(null);
  const navigation = useRef<HTMLElement>(null);
  const shouldScroll = useRef(false);
  const [active, setActive] = useState<StepId>("intro");
  const [completed, setCompleted] = useState<StepId[]>([]);
  const [passed, setPassed] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = restoreProgress(JSON.parse(localStorage.getItem(progressKey) || "{}"));
      setActive(saved.active);
      setCompleted(saved.completed);
    } catch { /* Progress is optional when browser storage is unavailable. */ }
    const hash = location.hash.slice(1);
    if (isStep(hash)) { setActive(hash); shouldScroll.current = true; }
    const fromHistory = () => {
      const id = location.hash.slice(1);
      setActive(isStep(id) ? id : "intro");
      shouldScroll.current = true;
    };
    addEventListener("hashchange", fromHistory);
    addEventListener("popstate", fromHistory);
    setReady(true);
    return () => {
      removeEventListener("hashchange", fromHistory);
      removeEventListener("popstate", fromHistory);
    };
  }, []);

  useEffect(() => {
    if (ready) try { localStorage.setItem(progressKey, JSON.stringify({ active, completed })); } catch { /* Storage may be disabled. */ }
  }, [active, completed, ready]);

  useLayoutEffect(() => {
    const bar = navigation.current;
    if (!bar) return;
    const measure = () => lesson.current?.style.setProperty("--lesson-nav-height", `${bar.getBoundingClientRect().height}px`);
    const observer = new ResizeObserver(measure);
    observer.observe(bar);
    measure();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    lesson.current?.querySelectorAll("audio").forEach(audio => audio.pause());
    if (!ready || !shouldScroll.current) return;
    shouldScroll.current = false;
    lesson.current?.scrollIntoView({ block: "start", behavior: "instant" });
    lesson.current?.querySelector<HTMLElement>(`[data-lesson-step="${active}"] h2`)?.focus({ preventScroll: true });
  }, [active, ready]);

  const jump = (id: StepId) => {
    if (id === active) return;
    shouldScroll.current = true;
    history.pushState(null, "", `#${id}`);
    setActive(id);
  };
  const report = (exercise: string, done: boolean) => {
    setPassed(current => ({ ...current, [exercise]: done }));
    if (!done) setCompleted(current => invalidateExercise(current, exercise));
  };
  const index = steps.findIndex(([id]) => id === active);
  const progress = Math.round(completed.length / steps.length * 100);
  const finished = completed.length === steps.length;
  const ending = (id: StepId) => {
    const number = steps.findIndex(([key]) => key === id);
    const canComplete = canCompleteStep(id, completed, passed);
    const remaining = steps.filter(([key]) => key !== "apps" && !completed.includes(key));
    return <div className="step-ending">
      {id === "apps" && remaining.length > 0 && <div className="remaining-steps">
        <p>Ещё не завершены:</p>
        {remaining.map(([key, title]) => <button type="button" className="secondary" key={key} onClick={() => jump(key)}>{title}</button>)}
      </div>}
      <div className="step-actions">
        <button type="button" className="secondary" disabled={number === 0} onClick={() => jump(steps[number - 1][0])}>
          <ArrowLeft size={18} aria-hidden />Назад
        </button>
        <span>{completed.includes(id) ? <><CircleCheck size={18} aria-hidden />Шаг завершён</> : `Шаг ${number + 1} из ${steps.length}`}</span>
        <button type="button" className="primary" disabled={!canComplete || (id === "apps" && (remaining.length > 0 || finished))} onClick={() => {
          setCompleted(current => current.includes(id) ? current : [...current, id]);
          if (number < steps.length - 1) jump(steps[number + 1][0]);
        }}>
          {id === "apps" ? <><CircleCheck size={18} aria-hidden />{finished ? "Урок завершён" : "Завершить урок"}</> : <>Дальше<ArrowRight size={18} aria-hidden /></>}
        </button>
      </div>
      {!canComplete && <p className="step-hint" role="status">{id === "apps" ? "Тренировки ещё не отмечены как выполненные." : "Задания ещё не проверены или есть ошибки."}</p>}
      {id === "apps" && finished && <div className="completion" role="status"><CircleCheck size={28} aria-hidden /><h3>Браво! Лекция 11 завершена.</h3></div>}
    </div>;
  };

  return (
    <div className="lesson-experience" ref={lesson} aria-busy={!ready}>
      <nav className="lesson-navigation" aria-label="Разделы урока 11" ref={navigation}>
        <div className="lesson-navigation-inner">
          <div className="lesson-progress-meta">
            <b>TY SERB · ЛЕКЦИЯ 11</b>
            <span>{completed.length}/{steps.length} · {progress}%</span>
          </div>
          <div className="lesson-section-links">
            {steps.map(([id, label], number) => (
              <button type="button" key={id} onClick={() => jump(id)} title={label}
                aria-label={`Шаг ${number + 1}: ${label}${completed.includes(id) ? ", завершён" : ""}`}
                aria-current={active === id ? "step" : undefined} className={completed.includes(id) ? "done" : ""}>
                {String(number + 1).padStart(2, "0")}
              </button>
            ))}
          </div>
        </div>
        <div className="step-caption"><span>{steps[index][1]}</span><span>Шаг {index + 1} из {steps.length}</span></div>
        <div className="lesson-progress-track" role="progressbar" aria-label="Прогресс урока" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <div style={{ width: `${progress}%` }} />
        </div>
      </nav>

      <div className="page">
        <section id="intro" data-lesson-step="intro" hidden={active !== "intro"} className="intro-step">
        <div className="hero">
          <div>
            <p className="badge">ЛЕКЦИЯ 11 · A1+</p>
            <h2 tabIndex={-1}>
              Прилагательные.
              <br />
              <em>Пропавшие слова</em>
            </h2>
            <p className="lead">
              Научимся описывать людей, животных и места, согласовывая прилагательные в мужском, женском и среднем роде.
            </p>
          </div>
          <div className="hero-card" aria-label="Примеры вопросов к прилагательным">
            <span className="spark">✦</span>
            <p>Какав?</p>
            <p>Каква?</p>
            <p>Какво?</p>
            <b>леп · лепа · лепо</b>
          </div>
        </div>
        <Audio step="intro" />
        {ending("intro")}
        <Feedback step="intro" />
        </section>

        <Section id="words" active={active} ending={ending("words")} eyebrow="Словарь" title="Новые слова">
          <div className="vocab">
            {words.map(([sr, ru]) => (
              <div key={sr}>
                <strong>{sr}</strong>
                <span>{ru}</span>
              </div>
            ))}
          </div>
          <h3>Соедини слова с переводами</h3>
          <WordMatch items={words} translations={wordTranslations} label="Слова и переводы" onComplete={done => report("words", done)} />
        </Section>

        <Section id="comic" active={active} ending={ending("comic")} eyebrow="Читаем" title="Стрип: Ко је украо придеве?" tone="blue">
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
            <WordMatch items={comicWords} translations={comicTranslations} label="Слова из комикса и переводы" onComplete={done => report("comic-words", done)} />
          </div>
        </Section>

        <Section id="grammar" active={active} ending={ending("grammar")} eyebrow="Правило" title="Три рода прилагательных" tone="red">
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

        <Section id="practice" active={active} ending={ending("practice")} eyebrow="Практика" title="Закрепляем формы" tone="yellow">
          <h3>А. Повежи са јунаком</h3>
          <p className="intro">
            Вспомни героев: Коцкослав је <b>јак</b>, Јасмина је <b>лепа</b>, Лука је <b>брз</b>, Маша је <b>смешна</b>, а
            Омск је <b>чаробно место</b>.
          </p>
          <h3>Б. Изабери правилно</h3>
          <SelectExercise onComplete={done => report("forms", done)} />
          <h3>В. Допуни реченицу</h3>
          <FillExercise onComplete={done => report("sentences", done)} />
        </Section>

        <Section id="test" active={active} ending={ending("test")} eyebrow="Финал" title="Мини-тест">
          <MiniTest onComplete={done => report("test", done)} />
        </Section>

        <Section id="homework" active={active} ending={ending("homework")} eyebrow="Домашняя работа" title="Моји јунаци" tone="blue">
          <p className="intro">Напиши 6 реченица: Полина је… Коцкослав је… Јасмина је… Маша је… Лука је… Омск је…</p>
          <Homework />
          <div className="bonus">
            <b>Бонус</b>
            <p>
              Напиши 3 реченице о себи: <i>Ја сам паметна. Ја сам добра. Ја сам храбра.</i>
            </p>
          </div>
        </Section>

        <Section id="apps" active={active} ending={ending("apps")} eyebrow="LearningApps" title="Ещё две тренировки" tone="red">
          <p className="intro">
            Сначала потренируй прилагательные, потом проверь себя в игре.
          </p>
          <div className="learningapps-grid">
            <LearningApp active={active === "apps"} id="pe514bjca26" title="Pridevi" description="Потренируй формы прилагательных." />
            <LearningApp active={active === "apps"} id="ppi7p6qnj26" title="MILIONER 15" description="Проверь себя в игре «Миллионер»." />
          </div>
          <label className="apps-complete"><input type="checkbox" checked={passed.apps === true || completed.includes("apps")} onChange={event => report("apps", event.target.checked)} />Я выполнил обе тренировки</label>
        </Section>

        <div className="lesson-footer" hidden={active !== "apps"}>
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
