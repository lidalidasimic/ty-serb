import { useMemo, useState, type ReactNode } from "react";

const comic = "./comic.png";

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
  ["06", "LearningApps", "#apps"],
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

function WordMatch() {
  const shuffled = useMemo(
    () => [
      "туман",
      "сильнее",
      "кто-то",
      "снова",
      "прилагательные",
      "как-то",
      "стирать",
      "мир",
      "которыми",
      "вернуть",
      "волшебно",
      "слова",
      "быстрый",
      "тогда",
    ],
    [],
  );
  const [left, setLeft] = useState<string | null>(null);
  const [pairs, setPairs] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const used = new Set(Object.values(pairs));

  return (
    <div className="exercise">
      <p className="instruction">Нажми слово слева, затем его перевод справа.</p>
      <div className="match-grid">
        <div>
          {words.map(([sr]) => (
            <button
              type="button"
              key={sr}
              onClick={() => setLeft(sr)}
              className={`match ${left === sr ? "selected" : ""} ${
                checked ? (pairs[sr] === words.find((item) => item[0] === sr)?.[1] ? "correct" : "wrong") : ""
              }`}
            >
              {sr}
              {pairs[sr] && <small>{pairs[sr]}</small>}
            </button>
          ))}
        </div>
        <div>
          {shuffled.map((ru) => (
            <button
              type="button"
              key={ru}
              disabled={used.has(ru)}
              onClick={() => {
                if (left) {
                  setPairs((current) => ({ ...current, [left]: ru }));
                  setLeft(null);
                  setChecked(false);
                }
              }}
              className="match translation"
            >
              {ru}
            </button>
          ))}
        </div>
      </div>
      <CheckButton
        onClick={() => setChecked(true)}
        reset={() => {
          setPairs({});
          setLeft(null);
          setChecked(false);
        }}
      />
      {checked && <p className="feedback">Правильно: {words.filter(([a, b]) => pairs[a] === b).length} из {words.length}.</p>}
    </div>
  );
}

function ComicWordMatch() {
  const shuffled = useMemo(
    () => [
      "собака",
      "разноцветный",
      "сумка",
      "спасён",
      "обычная магия",
      "серо",
      "улицы широкие",
      "что-то не так",
      "описываем",
    ],
    [],
  );
  const [left, setLeft] = useState<string | null>(null);
  const [pairs, setPairs] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const used = new Set(Object.values(pairs));

  return (
    <div className="exercise">
      <p className="instruction">Соедини сербские выражения с русским переводом.</p>
      <div className="match-grid">
        <div>
          {comicWords.map(([sr]) => (
            <button
              type="button"
              key={sr}
              onClick={() => setLeft(sr)}
              className={`match ${left === sr ? "selected" : ""} ${
                checked ? (pairs[sr] === comicWords.find((item) => item[0] === sr)?.[1] ? "correct" : "wrong") : ""
              }`}
            >
              {sr}
              {pairs[sr] && <small>{pairs[sr]}</small>}
            </button>
          ))}
        </div>
        <div>
          {shuffled.map((ru) => (
            <button
              type="button"
              key={ru}
              disabled={used.has(ru)}
              onClick={() => {
                if (left) {
                  setPairs((current) => ({ ...current, [left]: ru }));
                  setLeft(null);
                  setChecked(false);
                }
              }}
              className="match translation"
            >
              {ru}
            </button>
          ))}
        </div>
      </div>
      <CheckButton
        onClick={() => setChecked(true)}
        reset={() => {
          setPairs({});
          setLeft(null);
          setChecked(false);
        }}
      />
      {checked && (
        <p className="feedback">
          Правильно: {comicWords.filter(([a, b]) => pairs[a] === b).length} из {comicWords.length}.
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
  return (
    <main>
      <div className="platform-progress" aria-hidden>
        <i />
      </div>
      <header className="site-header">
        <a className="brand" href="/lessons" target="_top">
          <span>TY</span> SERB
        </a>
        <nav aria-label="Разделы урока">
          <a href="#words">Слова</a>
          <a href="#grammar">Грамматика</a>
          <a href="#apps">Apps</a>
        </nav>
        <a className="platform-link" href="/lessons" target="_top">
          Все уроки
        </a>
      </header>

      <div id="top" className="page">
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
              <a className="secondary start" href="/lessons" target="_top">
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
          <WordMatch />
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
            <ComicWordMatch />
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
      </div>

      <footer>
        <b>TY SERB</b>
        <span>ЛЕКЦИЯ 11 · Лидија Симић</span>
        <a href="/lessons" target="_top">
          Все уроки
        </a>
      </footer>
    </main>
  );
}
