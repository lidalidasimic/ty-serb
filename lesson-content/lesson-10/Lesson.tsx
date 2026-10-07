"use client";
import type { CSSProperties } from "react";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Play, Pause, Square, RotateCcw, Volume2, FileText, PartyPopper } from "lucide-react";
import { Feedback, Fireworks } from "../lesson-03/LessonTools";

const images = [
  {
    src: "https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:2000/https://cdn.gamma.app/isn4m4spq0jh937/2940934dcea8466daf64b8c22350de55/original/ChatGPT-Image-Apr-24-2026-01_59_38-PM.png",
    label: "Оригинална уводна илустрација",
    size: "1448 × 1086",
  },
];

const parts = [
  ["reci", "Речи"],
  ["gramatika", "Граматика"],
  ["original", "Вежба"],
  ["pridevi", "Придеви"],
  ["mnozina", "Множина"],
  ["vezbe", "Вежбамо"],
  ["domaci", "Домаћи"],
] as const;

const singular = [
  ["велики пас", "велика торба", "велико село"],
  ["мали пас", "мала књига", "мало дете"],
  ["добар дан", "добра улица", "добро време"],
  ["лош филм", "лоша идеја", "лоше место"],
  ["нов телефон", "нова јакна", "ново писмо"],
  ["стар ранац", "стара кућа", "старо село"],
  ["леп човек", "лепа девојка", "лепо место"],
  ["ружан пас", "ружна зграда", "ружно лице"],
  ["скуп ауто", "скупа торба", "скупо пиће"],
  ["јефтин ранац", "јефтина књига", "јефтино вино"],
  ["топао дан", "топла вода", "топло млеко"],
  ["хладан сок", "хладна кафа", "хладно јутро"],
];

const plural = [
  ["велики пси", "велике торбе", "велика села"],
  ["мали пси", "мале књиге", "мала деца"],
  ["добри дани", "добре улице", "добра места"],
  ["лоши филмови", "лоше идеје", "лоша места"],
  ["нови телефони", "нове јакне", "нова писма"],
  ["стари ранчеви", "старе куће", "стара села"],
  ["лепи људи", "лепе девојке", "лепа места"],
  ["ружни пси", "ружне зграде", "ружна лица"],
];

type Answer = string | string[];
type FillSentence = { parts: string[]; answers: Answer[]; distinct?: boolean };
type MatchPair = readonly [string, string];

function normalize(value: string) {
  return value.toLocaleLowerCase("sr").replace(/\s+/g, "").trim();
}

function answerList(answer: Answer) {
  return Array.isArray(answer) ? answer : [answer];
}

function answerLabel(answer: Answer) {
  return answerList(answer).join(" / ");
}

function isCorrect(value: string, answer: Answer) {
  return answerList(answer).some((candidate) => normalize(candidate) === normalize(value));
}

const LessonNavigation = createContext({ active: 0, completed: [] as number[], jump: (_index: number) => {}, complete: (_index: number) => {} });

function PartBar() {
  const { active, completed, jump } = useContext(LessonNavigation);
  return (
    <nav className="lesson-navigation" aria-label="Делови лекције">
      <div className="wrap">
        <div className="lesson-rail">{parts.map(([id, label], index) => (
          <button key={id} type="button" title={label} aria-label={`${index + 1}. ${label}`} aria-current={active === index ? "step" : undefined} className={`${active === index ? "active " : ""}${completed.includes(index) ? "done" : ""}`} onClick={() => jump(index)}>{completed.includes(index) ? <Check size={17} /> : index + 1}</button>
        ))}</div>
        <div className="rail-caption"><span>{active + 1} / 7 · {parts[active][1]}</span><span>Завршено: {completed.length} / 7</span></div>
        <progress aria-label="Напредак лекције" max={7} value={completed.length} />
      </div>
    </nav>
  );
}

function SectionNav({ index }: { index: number }) {
  const { jump, complete, completed } = useContext(LessonNavigation);
  const done = completed.includes(index);
  return (
    <>
    <nav className="sectionNav" aria-label="Навигација кроз лекцију">
      <button type="button" className="icon-button" title="Назад" aria-label="Назад" disabled={index === 0} onClick={() => jump(index - 1)}><ArrowLeft size={20} /></button>
      <button type="button" className={done ? "done" : ""} onClick={() => complete(index)} disabled={done}><Check size={18} />{done ? "Део је завршен" : index === 6 ? "Заврши лекцију" : "Заврши овај део"}</button>
      {index < 6 && <button type="button" className="icon-button" title="Заврши и даље" aria-label="Даље" onClick={() => { complete(index); jump(index + 1); }}><ArrowRight size={20} /></button>}
    </nav>
    <Feedback section={parts[index][0]} remote={false} lessonSlug="ucimo-srpski-10" sectionPrefix="l10" />
    </>
  );
}

function AudioPlayer({ label, text }: { label: string; text: string }) {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState("1");
  const [transcript, setTranscript] = useState(false);
  const [error, setError] = useState("");
  const { active } = useContext(LessonNavigation);
  useEffect(() => { setSpeaking(false); setPaused(false); }, [active]);
  const play = () => {
    if (!("speechSynthesis" in window)) { setError("Читање није доступно у овом прегледачу. Отвори текст испод."); return; }
    if (paused) { window.speechSynthesis.resume(); setPaused(false); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "sr-RS";
    utterance.rate = Number(rate);
    utterance.onend = () => { setSpeaking(false); setPaused(false); };
    utterance.onerror = () => { setSpeaking(false); setPaused(false); };
    setError("");
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };
  const stop = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  };
  return (
    <article className="audioPlayer">
      <h3><Volume2 size={19} />{label}</h3>
      <div className="audioControls">
        <button type="button" title={speaking && !paused ? "Пауза" : "Пусти"} aria-label={speaking && !paused ? "Пауза" : "Пусти"} onClick={() => { if (speaking && !paused) { window.speechSynthesis.pause(); setPaused(true); } else play(); }}>{speaking && !paused ? <Pause size={20} /> : <Play size={20} />}</button>
        <button type="button" title="Стоп" aria-label="Стоп" disabled={!speaking} onClick={stop}><Square size={18} /></button>
        <label>Брзина <select value={rate} onChange={(event) => { stop(); setRate(event.target.value); }}>{[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => <option key={speed} value={String(speed)}>{speed}×</option>)}</select></label>
      </div>
      <button type="button" className="transcript-toggle" aria-expanded={transcript} onClick={() => setTranscript(!transcript)}><FileText size={17} />Текст</button>
      {transcript && <p>{text}</p>}
      {error && <p role="status">{error}</p>}
    </article>
  );
}

function ChoiceExercise({
  title,
  prompt,
  choices,
  answer,
  why,
}: {
  title: string;
  prompt: string;
  choices: string[];
  answer: Answer;
  why: string;
}) {
  const [picked, setPicked] = useState("");
  const [checked, setChecked] = useState(false);
  const correct = isCorrect(picked, answer);
  return (
    <article className="exercise">
      <p className="eyebrow">{title}</p>
      <h3>{prompt}</h3>
      <div className="choices">
        {choices.map((choice) => (
          <button
            key={choice}
            className={`${picked === choice ? "selected " : ""}${checked && isCorrect(choice, answer) ? "rightChoice" : ""}`}
            onClick={() => {
              setPicked(choice);
              setChecked(false);
            }}
          >
            {choice}
          </button>
        ))}
      </div>
      <div className="actions">
        <button className="primary" onClick={() => setChecked(true)} disabled={!picked}><Check size={18} />Провери</button>
        <button title="Покушај поново" aria-label="Покушај поново" onClick={() => { setPicked(""); setChecked(false); }}><RotateCcw size={18} /></button>
      </div>
      {checked && (
        <div className={correct ? "feedback good" : "feedback bad"}>
          {correct ? "Тачно!" : "Није тачно."} <strong>Могући тачни одговори: {answerLabel(answer)}.</strong> {why}
        </div>
      )}
    </article>
  );
}

function TypeExercise() {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  const accepted = useMemo(() => ["овај", "ovaj"].includes(normalize(value)), [value]);
  return (
    <article className="exercise">
      <p className="eyebrow">УПИШИ • ЋИРИЛИЦА ИЛИ LATINICA</p>
      <h3>Ово је телефон. ___ телефон је нов.</h3>
      <input aria-label="Одговор" value={value} onChange={(e) => { setValue(e.target.value); setChecked(false); }} placeholder="Упиши одговор" />
      <div className="actions">
        <button className="primary" disabled={!value} onClick={() => setChecked(true)}><Check size={18} />Провери</button>
        <button title="Покушај поново" aria-label="Покушај поново" onClick={() => { setValue(""); setChecked(false); }}><RotateCcw size={18} /></button>
      </div>
      {checked && (
        <div className={accepted ? "feedback good" : "feedback bad"}>
          {accepted ? "Тачно!" : "Пази на мушки род."} <strong>Тачан одговор: овај / ovaj.</strong> „Телефон“ је мушког рода, а предмет је близу.
        </div>
      )}
    </article>
  );
}

function MatchingExercise({
  pairs,
  translations,
  hint,
}: {
  pairs: readonly MatchPair[];
  translations: string[];
  hint: string;
}) {
  const [active, setActive] = useState<{ side: "left" | "right"; value: string } | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [mistake, setMistake] = useState("");
  const rowHeight = 72;
  const canvasHeight = Math.max(pairs.length, translations.length) * rowHeight;
  const choose = (side: "left" | "right", value: string) => {
    if (!active || active.side === side) {
      setActive({ side, value });
      setMistake("");
      return;
    }
    const word = side === "left" ? value : active.value;
    const translation = side === "right" ? value : active.value;
    const correct = pairs.find(([candidate]) => candidate === word)?.[1] === translation;
    if (correct) {
      setMatched(current => current.includes(word) ? current : [...current, word]);
      setActive(null);
      setMistake("");
    } else {
      setMistake(`${side}:${value}`);
    }
  };
  const reset = () => { setActive(null); setMatched([]); setMistake(""); };
  return (
    <div className="matchingExercise">
      <p className="matchingHint">{hint}</p>
      <div className="matchingCanvas" style={{ "--rows": Math.max(pairs.length, translations.length) } as CSSProperties}>
        <svg className="matchingLines" viewBox={`0 0 100 ${canvasHeight}`} preserveAspectRatio="none" aria-hidden="true">
          {matched.map((word) => {
            const leftIndex = pairs.findIndex(([candidate]) => candidate === word);
            const translation = pairs[leftIndex]?.[1];
            const rightIndex = translations.indexOf(translation);
            if (leftIndex < 0 || rightIndex < 0) return null;
            return <line key={word} x1="38" x2="62" y1={(leftIndex + 0.5) * rowHeight} y2={(rightIndex + 0.5) * rowHeight} />;
          })}
        </svg>
        <div className="matchingColumns">
          <div>
            {pairs.map(([word]) => (
              <button key={word} aria-pressed={active?.side === "left" && active.value === word} className={`${active?.side === "left" && active.value === word ? "activeMatch " : ""}${mistake === `left:${word}` ? "wrongMatch " : ""}${matched.includes(word) ? "matched" : ""}`} disabled={matched.includes(word)} onClick={() => choose("left", word)}>{word}</button>
            ))}
          </div>
          <div>
            {translations.map((translation) => {
              const done = pairs.some(([word, ru]) => ru === translation && matched.includes(word));
              return <button key={translation} aria-pressed={active?.side === "right" && active.value === translation} className={`${active?.side === "right" && active.value === translation ? "activeMatch " : ""}${mistake === `right:${translation}` ? "wrongMatch " : ""}${done ? "matched" : ""}`} disabled={done} onClick={() => choose("right", translation)}>{translation}</button>;
            })}
          </div>
        </div>
      </div>
      <div className="matchingStatus" aria-live="polite">
        {matched.length === pairs.length ? "Супер! Све речи су повезане." : mistake ? "Пробај још једном, ово је други превод." : `Повезано: ${matched.length} од ${pairs.length}`}
      </div>
      <button className="resetMatch" title="Почни поново" aria-label="Почни поново" onClick={reset}><RotateCcw size={18} /></button>
    </div>
  );
}

function FillTask({ title, sentences, choices }: { title: string; sentences: FillSentence[]; choices: string[] }) {
  const answers = sentences.flatMap((sentence) => sentence.answers);
  const [values, setValues] = useState<string[]>(Array(answers.length).fill(""));
  const [active, setActive] = useState(0);
  const [checked, setChecked] = useState(false);
  const select = (choice: string) => {
    const next = [...values];
    next[active] = choice;
    setValues(next);
    setChecked(false);
    const empty = next.findIndex((value, index) => !value && index > active);
    if (empty >= 0) setActive(empty);
  };
  let offset = 0;
  const valid = sentences.flatMap((sentence) => {
    const start = offset;
    offset += sentence.answers.length;
    const distinct = !sentence.distinct || new Set(values.slice(start, offset).map(normalize)).size === sentence.answers.length;
    return sentence.answers.map((answer, index) => distinct && isCorrect(values[start + index], answer));
  });
  offset = 0;
  const correct = valid.filter(Boolean).length;
  return (
    <div className="fillTask">
      <h3>{title}</h3>
      <div className="fillSentences">
        {sentences.map((sentence, sentenceIndex) => {
          const start = offset;
          offset += sentence.answers.length;
          return (
            <p key={sentenceIndex}>
              {sentence.parts.map((part, partIndex) => (
                <span key={partIndex}>
                  {part}
                  {partIndex < sentence.answers.length && (
                    <button aria-label={`Празно место ${start + partIndex + 1}`} className={`${active === start + partIndex ? "activeBlank " : ""}${checked ? (valid[start + partIndex] ? "rightBlank" : "wrongBlank") : ""}`} onClick={() => setActive(start + partIndex)}>
                      {values[start + partIndex] || "___"}
                    </button>
                  )}
                </span>
              ))}
            </p>
          );
        })}
      </div>
      <div className="wordBank">
        {choices.map((choice) => {
          const shouldGlow = checked && isCorrect(choice, answers[active]);
          return <button key={choice} className={shouldGlow ? "bankRight" : ""} onClick={() => select(choice)}>{choice}</button>;
        })}
      </div>
      <div className="actions">
        <button className="primary" disabled={values.some((value) => !value)} onClick={() => setChecked(true)}><Check size={18} />Провери</button>
        <button title="Покушај поново" aria-label="Покушај поново" onClick={() => { setValues(Array(answers.length).fill("")); setActive(0); setChecked(false); }}><RotateCcw size={18} /></button>
      </div>
      {checked && (
        <div className={correct === answers.length ? "feedback good" : "feedback bad"}>
          {correct === answers.length ? "Све је тачно!" : `Тачно: ${correct} од ${answers.length}. Црвена поља покушај поново.`}
          <div className="answerKey">Решења: {answers.map(answerLabel).join(" · ")}</div>
        </div>
      )}
    </div>
  );
}

export default function Lesson10() {
  const [active, setActive] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [restored, setRestored] = useState(false);
  const [homework, setHomework] = useState("");
  const [celebration, setCelebration] = useState(0);
  const completedRef = useRef<number[]>([]);
  const content = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("ty-serb-lesson-10-v2") || "{}");
      if (Number.isInteger(saved.active) && saved.active >= 0 && saved.active < 7) setActive(saved.active);
      if (Array.isArray(saved.completed)) {
        completedRef.current = [...new Set<number>(saved.completed.filter((value: unknown) => Number.isInteger(value) && Number(value) >= 0 && Number(value) < 7))];
        setCompleted(completedRef.current);
      }
      if (typeof saved.homework === "string") setHomework(saved.homework);
    } catch { /* Storage is optional. */ }
    setRestored(true);
    return () => { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); };
  }, []);
  useEffect(() => {
    if (!restored) return;
    try { localStorage.setItem("ty-serb-lesson-10-v2", JSON.stringify({ active, completed, homework })); } catch { /* Storage is optional. */ }
  }, [active, completed, homework, restored]);
  const jump = (index: number) => {
    if (index < 0 || index >= 7) return;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setActive(index);
    requestAnimationFrame(() => content.current?.scrollIntoView({ block: "start", behavior: "auto" }));
  };
  const complete = (index: number) => {
    if (completedRef.current.includes(index)) return;
    const next = [...completedRef.current, index];
    completedRef.current = next;
    setCompleted(next);
    if (next.length === 7) {
      setCelebration(current => current + 1);
      jump(6);
    }
  };
  return (
    <LessonNavigation.Provider value={{ active, completed, jump, complete }}><div className="lesson-ten">
      {celebration > 0 && <Fireworks key={celebration} />}
      <PartBar />
      <div className="wrap lessonContent" ref={content}>
      <div hidden={active !== 0}>
      <section className="hero" id="top">
        <div className="heroCopy">
          <p className="kicker">A1+ · ЛЕКЦИЈА 10</p>
          <h1>Показне<br /><em>заменице</em></h1>
          <p className="lead">Ово, то или оно? Научи да покажеш шта је близу, шта је тамо, и како се придев слаже са именицом.</p>
          <div className="referenceStrip">
            <a href="/lessons/azbuka-i-proiznoshenie" target="_top">Референца: прва лекција</a>
          </div>
        </div>
        <AudioPlayer label="Слушај увод" text="Добродошли на десету лекцију. Данас учимо показне заменице: овај, тај, онај, и придеве уз именице." />
      </section>
      <div className="comicSection">
        <figure><img src={images[0].src} alt="Илустрација из оригиналне Лекције 10" /><figcaption>Оригинални визуал · Gamma</figcaption></figure>
      </div>
      <section className="section vocabulary" id="reci">
        <div className="sectionHead"><span>01</span><div><p className="eyebrow">НЕПОЗНАТЕ РЕЧИ ИЗ СТРИПА</p><h2>Повежи реч и превод</h2></div></div>
        <MatchingExercise hint="Српски — русский" pairs={[["пртљаг", "багаж"], ["изненадити", "удивить"], ["јакна", "куртка"]]} translations={["куртка", "багаж", "удивить"]} />
        <SectionNav index={0} />
      </section>
      </div>
      <section className="section" id="gramatika" hidden={active !== 1}>
        <div className="sectionHead"><span>02</span><div><p className="eyebrow">ГРАМАТИКА</p><h2>Три удаљености</h2></div></div>
        <p className="intro">Показне заменице указују на удаљеност предмета од нас. Запамти три нивоа: <b>близу</b> (ово), <b>средње</b> (то) и <b>далеко</b> (оно).</p>
        <AudioPlayer label="Слушај облике" text="Овај, ова, ово. Тај, та, то. Онај, она, оно. У множини: ови, ове, ова; ти, те, та; они, оне, она." />
        <div className="distanceGrid"><article className="near"><b>БЛИЗУ</b><strong>ОВО</strong><p>овај · ова · ово</p></article><article className="mid"><b>СРЕДЊЕ</b><strong>ТО</strong><p>тај · та · то</p></article><article className="far"><b>ДАЛЕКО</b><strong>ОНО</strong><p>онај · она · оно</p></article></div>
        <div className="note">Множина: <b>ови / ове / ова</b> (близу) · <b>ти / те / та</b> (средње) · <b>они / оне / она</b> (далеко)</div>
        <SectionNav index={1} />
      </section>
      <section className="section red" id="original" hidden={active !== 2}>
        <div className="sectionHead"><span>03</span><div><p className="eyebrow">ОРИГИНАЛНА ВЕЖБА</p><h2>Допуни одговарајућим обликом</h2></div></div>
        <p>У првом задатку удаљеност није увек наведена: могући су различити облици истог рода. У питању „која књига?“ покажи две различите књиге. У другом задатку први предмет је поред говорника, а други код саговорника или даље: та / она, тај / онај, те / оне.</p>
        <div className="interactiveSourceTasks">
          <FillTask title="Задатак 1 — Попуни празна места" choices={["овај", "тај", "онај", "ова", "та", "она"]} sentences={[{ parts: ["Ово је телефон. ", " телефон је нов."], answers: ["овај"] }, { parts: ["Ово није мој ранац. ", " ранац је његов."], answers: [["овај", "тај", "онај"]] }, { parts: ["Да ли је то твоја књига? — Која књига, ", " или ", "?"], answers: [["ова", "та", "она"], ["ова", "та", "она"]], distinct: true }, { parts: ["Ово није добра улица. ", " улица је моја!"], answers: [["ова", "та", "она"]] }]} />
          <FillTask title="Задатак 2 — Изабери правилан облик" choices={["та", "она", "тај", "онај", "те", "оне"]} sentences={[{ parts: ["Ова торба је моја, а ", " торба није моја."], answers: [["та", "она"]] }, { parts: ["Овај пас је мали, а ", " пас је велики."], answers: [["тај", "онај"]] }, { parts: ["Ова књига је добра, а ", " књига није занимљива."], answers: [["та", "она"]] }, { parts: ["Ово је мој телефон, а ", " је твој."], answers: [["тај", "онај"]] }, { parts: ["Ове улице су лепе, а ", " улице нису лепе."], answers: [["те", "оне"]] }, { parts: ["Ове наочаре су моје, а ", " нису моје."], answers: [["те", "оне"]] }]} />
        </div>
        <SectionNav index={2} />
      </section>
      <section className="section" id="pridevi" hidden={active !== 3}>
        <div className="sectionHead"><span>04</span><div><p className="eyebrow">ПРИДЕВИ</p><h2>Шта када су ствари различите?</h2></div></div>
        <blockquote>Полина каже: „Ова велика торба је моја, а та мала торба није моја.“ <b>Придеви се слажу са именицом у роду.</b></blockquote>
        <AudioPlayer label="Слушај пример" text="Ова велика торба је моја, а та мала торба није моја. Овај нови телефон је мој, а онај стари телефон није мој." />
        <div className="tableWrap"><table><thead><tr><th>Какав? (м.р.)</th><th>Каква? (ж.р.)</th><th>Какво? (ср.р.)</th></tr></thead><tbody>{singular.map((row, index) => <tr key={index}>{row.map((item) => <td key={item}>{item}</td>)}</tr>)}</tbody></table></div>
        <div className="belowTableMatch"><h3>Повежи још четири речи</h3><MatchingExercise hint="Српски — русский" pairs={[["ружан", "некрасивый"], ["скуп", "дорогой"], ["јефтин", "дешёвый"], ["лош", "плохой"]]} translations={["дорогой", "плохой", "дешёвый", "некрасивый"]} /></div>
        <SectionNav index={3} />
      </section>
      <section className="section dark" id="mnozina" hidden={active !== 4}>
        <div className="sectionHead"><span>05</span><div><p className="eyebrow">МНОЖИНА</p><h2>Они, оне, она</h2></div></div>
        <p className="intro">У множини придеви имају само три облика: <b>какви?</b> (м.р.), <b>какве?</b> (ж.р.) и <b>каква?</b> (ср.р.).</p>
        <AudioPlayer label="Слушај множину" text="Ови нови телефони су моји. Те велике торбе су твоје. Она мала села су лепа. Ове лепе књиге су наше." />
        <div className="tableWrap"><table><thead><tr><th>Какви? (м.р.)</th><th>Какве? (ж.р.)</th><th>Каква? (ср.р.)</th></tr></thead><tbody>{plural.map((row, index) => <tr key={index}>{row.map((item) => <td key={item}>{item}</td>)}</tr>)}</tbody></table></div>
        <div className="note">Запамти: у множини средњи род има наставак <b>-а</b>: велика села, мала деца, добра места.</div>
        <SectionNav index={4} />
      </section>
      <section className="section" id="vezbe" hidden={active !== 5}>
        <div className="sectionHead"><span>06</span><div><p className="eyebrow">ИНТЕРАКТИВНЕ ВЕЖБЕ</p><h2>Вежбамо заједно</h2></div></div>
        <div className="exerciseGrid">
          <ChoiceExercise title="ИЗАБЕРИ ОБЛИК" prompt="Ова велика торба је моја, а ___ мала торба није моја." choices={["ова", "та", "она"]} answer={["та", "она"]} why="„Торба“ је женског рода. Ако је друга торба средње удаљена, кажемо та; ако је далеко, кажемо она." />
          <ChoiceExercise title="ПРОВЕРИ РОД" prompt="Овај мали пас је мој, а ___ велики пас није мој." choices={["тај", "онај", "то"]} answer={["тај", "онај"]} why="„Пас“ је мушког рода. Тај и онај су могући, зависно од удаљености." />
          <TypeExercise />
        </div>
        <div className="allOriginalTasks">
          <h3>Завршне вежбе са више тачних варијанти</h3>
          <p>Један предмет је овде, а други код саговорника или даље. Изабери облик према роду и удаљености.</p>
          <div className="interactiveSourceTasks">
            <FillTask title="Вежба 1 — Допуни" choices={["та", "она", "тај", "онај"]} sentences={[{ parts: ["Ова велика торба је моја, а ", " мала торба није моја."], answers: [["та", "она"]] }, { parts: ["Овај мали пас је мој, а ", " велики пас није мој."], answers: [["тај", "онај"]] }, { parts: ["Ова добра књига је моја, а ", " лоша књига није моја."], answers: [["та", "она"]] }, { parts: ["Овај стари телефон није мој, а ", " нови телефон је мој."], answers: [["тај", "онај"]] }, { parts: ["Да ли је ", " велика кућа твоја или ова мала кућа?"], answers: [["та", "она"]] }, { parts: ["Ова лепа улица је моја, а ", " ружна улица није моја."], answers: [["та", "она"]] }]} />
            <FillTask title="Вежба 2 — Изабери правилан облик" choices={["ова", "та", "она", "овај", "тај", "онај"]} sentences={[{ parts: ["Ова велика торба је моја, ", " мала је твоја."], answers: [["та", "она"]] }, { parts: ["Овај добар филм је занимљив, ", " лош филм није."], answers: [["тај", "онај"]] }, { parts: ["Овај нови ранац је леп, ", " стари није."], answers: [["тај", "онај"]] }, { parts: ["Ова лепа књига је моја, ", " ружна није моја."], answers: [["та", "она"]] }]} />
          </div>
        </div>
        <div className="learningMini"><h3>Мали квиз</h3><p>Када завршиш вежбе, отвори квиз „Милионер 13“ и провери колико брзо препознајеш облике.</p><a className="fallback" href="https://learningapps.org/watch?v=p75doeouj26" target="_blank" rel="noreferrer">Отвори квиз</a></div>
        <SectionNav index={5} />
      </section>
      <section className="section" id="domaci" hidden={active !== 6}>
        <div className="sectionHead"><span>07</span><div><p className="eyebrow">ДОМАЋИ ЗАДАТАК</p><h2>Моје ствари и једна мала сцена</h2></div></div>
        <p className="intro">Направи мини-фото причу од <b>5 реченица</b>: три реченице о својим стварима и две реченице о стварима које нису твоје.</p>
        <AudioPlayer label="Слушај модел за домаћи" text="Ово је мој телефон. Овај нови телефон је мој. Та стара књига није моја. Она велика торба је Полинина. Ове лепе улице су у мом граду." />
        <div className="homeCards">{[["1", "Моје ствари", "Сликај или нацртај телефон, књигу и торбу. Напиши: овај нови телефон, ова стара књига, ова велика торба."], ["2", "Није моје", "Додај два предмета из собе или са улице. Напиши коме припадају: тај ранац је његов, она торба је њена."], ["3", "Мали изазов", "Убаци једну множину: ове лепе улице, ти стари телефони, она мала села."]].map((item) => <article key={item[0]}><i>{item[0]}</i><h3>{item[1]}</h3><p>{item[2]}</p></article>)}</div>
        <div className="note">Обавезно користи најмање: <b>овај / ова / ово</b>, један облик <b>тај / та / то</b> или <b>онај / она / оно</b>, и три придева: нов, стар, леп, ружан, скуп или јефтин.</div>
        <p><b>Бонус: детектив.</b> Замени фотографије са другом особом. Погоди чије су ствари: „Да ли је тај скупи ранац твој?“ Затим сними своју причу као гласовну поруку.</p>
        <label className="writing">Моја фото-прича<textarea rows={6} value={homework} onChange={(event) => setHomework(event.target.value)} /></label>
        <SectionNav index={6} />
        {completed.includes(6) && completed.length < 7 && <div className="remaining"><h3>Још мало до краја</h3>{parts.map(([id,label],index) => !completed.includes(index) && <button key={id} onClick={() => jump(index)}>{index + 1}. {label}</button>)}</div>}
        {completed.length === 7 && <div className="completion" role="status"><Check size={24} /><h3>Лекција је завршена!</h3><p>Сачувај фото-причу и пошаљи је наставници са гласовном поруком.</p><div className="completion-actions"><button onClick={() => jump(0)}><RotateCcw size={18} />Понови лекцију</button><button onClick={() => setCelebration(current => current + 1)}><PartyPopper size={18} />Фејерверк</button></div></div>}
      </section>
      <footer><b>ТЫ — СЕРБ / TY SERB</b><span>Лекција 10 · седам делова</span><a href="/lessons/azbuka-i-proiznoshenie">Прва лекција</a></footer>
      </div>
    </div></LessonNavigation.Provider>
  );
}
