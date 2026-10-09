"use client";

import { useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { CheckVersion, LessonFlow, StepSection } from "./lesson-flow";
import { Feedback } from "./lesson-tools";

const cdn = "https://cdn.gamma.app/isn4m4spq0jh937/";
const panels = [
  ["93a71afe6ba34887b64b1a208992ebee", "Суперполина и Коцкослав!", "Иду у авантуру!"],
  ["0c24d943007e4613bcdbd6b38fcc75e2", "И Чудни Хари!", ""],
  ["d2cfedb5c5c74ea7b5b7da9740783f7f", "Заједно са Хермионом, краљицом књига.", "заједно — вместе"],
  ["61d22cb571b2409b9c6271a40318c538", "Имају заједничког непријатеља — Злог Абракадабруса. Он је напао Омск.", ""],
  ["99b66cec25a5418fa4fde88b8d02ddb9", "И сад, наши хероји — Суперполина и њен коњ Коцкослав, Чудни Хари и Хермиона — морају да одбране Омск.", "сад — сейчас · морају — должны"],
  ["e41a539c1e05430f9b76932e0c83f277", "Нека битка за Омск почне!", "нека — пусть · почне — начнётся"],
];

const audioTracks: Record<string, string> = {
  intro: "intro", "molim-comic": "opening-reading", "opening-translation": "opening-translation",
  questions: "questions", molim: "molim", phrases: "phrases", omsk: "omsk-reading", "omsk-translation": "omsk-translation",
};
function Audio({ id, title }: { id: string; title: string }) {
  return <div className="audio-slot" data-audio-slot={id}><div><b>{title}</b><span>Аудио · Лидия</span></div><audio controls preload="none" src={`audio/${audioTracks[id]}.mp3`} aria-label={title} onPlay={event => {
    const current = event.currentTarget;
    document.querySelectorAll("audio").forEach(audio => { if (audio !== current) audio.pause(); });
  }} /></div>;
}
const phrases = [
  ["molim-te", "Молим те.", "Пожалуйста."], ["molim-vas", "Молим Вас.", "Прошу Вас."],
  ["izvini", "Извини.", "Извини."], ["izvinite", "Извините.", "Извините."],
  ["nista", "Ништа.", "Ничего страшного."], ["nema-problema", "Нема проблема.", "Без проблем."],
  ["hvala", "Хвала.", "Спасибо."], ["hvala-lepo", "Хвала лепо.", "Большое спасибо."],
  ["veliko-hvala", "Велико хвала.", "Огромное спасибо."], ["nema-na-cemu", "Нема на чему.", "Не за что."],
  ["i-drugi-put", "И други пут!", "Обращайтесь ещё!"],
];
function PhraseAudio() {
  const player = useRef<HTMLAudioElement>(null);
  const request = useRef(0);
  const [playing, setPlaying] = useState("");
  const [error, setError] = useState(false);
  async function listen(id: string) {
    const audio = player.current;
    if (!audio) return;
    const currentRequest = ++request.current;
    document.querySelectorAll("audio").forEach(other => other.pause());
    audio.src = `audio/phrase-${id}.mp3`;
    setPlaying(id); setError(false);
    try { await audio.play(); if (currentRequest === request.current) setPlaying(id); }
    catch { if (currentRequest === request.current) { setPlaying(""); setError(true); } }
  }
  return <div className="phrase-audio"><audio ref={player} preload="none" aria-hidden="true" onEnded={() => setPlaying("")} onPause={() => { if (player.current?.paused) setPlaying(""); }} />
    <div className="phrase-grid">{phrases.map(([id, phrase, translation]) => <div className="phrase-item" key={id}>
      <button type="button" aria-pressed={playing === id} title={`Прослушать: ${phrase}`} onClick={() => listen(id)}>{phrase}</button><span>{translation}</span>
    </div>)}</div>{error && <p role="alert" className="incorrect">Не удалось воспроизвести запись. Попробуйте ещё раз.</p>}
  </div>;
}
function useAnswers(id: string) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`ty-serb-04:${id}`) || "{}");
      if (saved && typeof saved === "object" && !Array.isArray(saved)) setValues(Object.fromEntries(Object.entries(saved).filter(([, value]) => typeof value === "string")) as Record<string, string>);
    } catch { /* Optional persistence. */ }
    setReady(true);
  }, [id]);
  useEffect(() => {
    if (ready) try { localStorage.setItem(`ty-serb-04:${id}`, JSON.stringify(values)); } catch { /* Optional persistence. */ }
  }, [id, ready, values]);
  function update(key: string, value: string) {
    setValues(previous => ({ ...previous, [key]: value }));
  }
  function reset() {
    setValues({});
    try { localStorage.removeItem(`ty-serb-04:${id}`); } catch { /* Optional persistence. */ }
  }
  return { values, update, reset, ready };
}
type Row = { text: string; answers: string[][]; example?: string; options: string[] | string[][] };
function Exercise({ id, title, intro, rows }: { id: string; title: string; intro?: ReactNode; rows: Row[] }) {
  const { values, update, reset, ready } = useAnswers(`tap-v2:${id}`);
  const savedQuestion = Number(values.question);
  const question = Number.isInteger(savedQuestion) ? Math.max(0, Math.min(rows.length - 1, savedQuestion)) : 0;
  const [blank, setBlank] = useState(0);
  const [checked, setChecked] = useState(false);
  const [shown, setShown] = useState(false);
  const checkVersion = useContext(CheckVersion);
  useEffect(() => { if (checkVersion > 0) setChecked(true); }, [checkVersion]);
  const statuses = rows.map((row, i) => row.answers.map((accepted, j) => {
    const value = values[`${i}-${j}`] || "";
    return !value.trim() ? "empty" : accepted.includes(value) ? "correct" : "incorrect";
  }));
  const row = rows[question];
  const activeBlank = Math.min(blank, row.answers.length - 1);
  const choices = Array.isArray(row.options[0]) ? (row.options as string[][])[activeBlank] : row.options as string[];
  const correct = statuses.filter(row => row.every(status => status === "correct")).length;
  const rowCorrect = statuses[question].every(status => status === "correct");
  function select(value: string) {
    update(`${question}-${activeBlank}`, value); setChecked(false);
    const next = row.answers.findIndex((_, index) => index !== activeBlank && !values[`${question}-${index}`]);
    if (next >= 0) setBlank(next);
  }
  function nextQuestion(index: number) {
    update("question", String(index)); setBlank(0); setChecked(false); setShown(false);
  }
  return <div className="exercise tap-exercise" id={id}><fieldset disabled={!ready}><h3>{title}</h3>{intro && <div className="exercise-intro">{intro}</div>}
    <div className="quiz-caption"><span>Вопрос {question + 1} из {rows.length}</span><span>{correct} / {rows.length}</span></div>
    <progress className="quiz-progress" max={rows.length} value={correct} aria-label={`${title}: правильные ответы`} />
    <div className="quiz-question"><div className="prompt">{row.text.split("___").map((part, j, parts) => <span key={j}>{part}{j < parts.length - 1 && <button type="button" className={`quiz-blank${j === activeBlank ? " active" : ""}`} onClick={() => setBlank(j)} aria-label={`Ответ ${j + 1}: ${values[`${question}-${j}`] || "не выбран"}`} aria-pressed={j === activeBlank}>{values[`${question}-${j}`] || "…"}</button>}</span>)}</div>
    <div className="answer-choices" role="group" aria-label={`${title}, вопрос ${question + 1}, ответ ${activeBlank + 1}`}>{choices.map(choice => <button type="button" key={choice} aria-pressed={values[`${question}-${activeBlank}`] === choice} onClick={() => select(choice)}>{choice}</button>)}</div>
    <div className="row-feedback" role="status">{checked ? rowCorrect ? <span className="correct">Тачно! {correct === rows.length ? "Все ответы верны." : ""}</span> : statuses[question].includes("empty") ? <span className="incorrect">Выбери ответ для каждого пропуска.</span> : <span className="incorrect">Покушај поново.</span> : null}</div>
    {shown && <p className="solution">Одговор: {row.example || row.answers.map(answers => answers[0]).join(" · ")}</p>}
    </div><div className="exercise-actions"><button type="button" className="primary" onClick={() => setChecked(true)}>Проверить</button>
      {question < rows.length - 1 && <button type="button" disabled={!checked || !rowCorrect} onClick={() => nextQuestion(question + 1)}>Следующее</button>}
      {question > 0 && <button type="button" onClick={() => nextQuestion(question - 1)}>Предыдущее</button>}
      <button type="button" onClick={() => setShown(!shown)} aria-expanded={shown}>{shown ? "Скрыть ответ" : "Подсказка"}</button>
      <button type="button" onClick={() => { reset(); setBlank(0); setChecked(false); setShown(false); }}>Заново</button>
    </div></fieldset></div>;
}
function Notebook({ id, label, rows = 4 }: { id: string; label: string; rows?: number }) {
  const { values, update, ready } = useAnswers(id);
  return <label className="notebook">{label}<textarea disabled={!ready} rows={rows} value={values.text || ""} onChange={e => update("text", e.target.value)} /></label>;
}
function Section({ id, number, eyebrow, title, children }: { id: string; number: string; eyebrow: string; title: string; children: ReactNode }) {
  return <StepSection id={id}><section id={id} className="lesson-section"><div className="section-heading"><span className="section-number">{number}</span><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div></div>{children}</section></StepSection>;
}
const shortForms = ["сам", "си", "је", "смо", "сте", "су"];
const negativeForms = ["нисам", "ниси", "није", "нисмо", "нисте", "нису"];
const questionStarts = ["Да ли сам", "Да ли си", "Да ли је", "Да ли смо", "Да ли сте", "Да ли су"];
const liStarts = ["Јесам ли", "Јеси ли", "Је ли", "Јесмо ли", "Јесте ли", "Јесу ли"];
const formRows: Row[] = [
  { text: "Ја сам из Русије. → ___ ти из Русије?", answers: [["Да ли си"]], options: questionStarts },
  { text: "Ти си добар ђак. → ___ ја добар ђак?", answers: [["Да ли сам"]], options: questionStarts },
  { text: "Она је лепа. → ___ она лепа?", answers: [["Да ли је"]], options: questionStarts },
  { text: "Ми смо пријатељи. → ___ ми пријатељи?", answers: [["Да ли смо"]], options: questionStarts },
  { text: "Они су уморни. → ___ они уморни?", answers: [["Да ли су"]], options: questionStarts },
];
const liRows: Row[] = [
  { text: "Ја сам из Србије. → ___ из Србије?", answers: [["Јеси ли"]], options: liStarts },
  { text: "Он је Немац. → ___ он Немац?", answers: [["Је ли"]], options: liStarts },
  { text: "Ми смо код куће. → ___ код куће?", answers: [["Јесмо ли"]], options: liStarts },
  { text: "Ви сте студенти. → ___ студенти?", answers: [["Јесте ли"]], options: liStarts },
  { text: "Они су гладни. → ___ гладни?", answers: [["Јесу ли"]], options: liStarts },
];
const answerChoices = ["Да, јесам.", "Не, нисам.", "Да, јесте.", "Не, није.", "Да, јесмо.", "Не, нисмо.", "Да, јесу.", "Не, нису."];
const yesNo = ["Јесте ли из Енглеске?", "Јеси ли Американац?", "Јесмо ли у Пекингу?", "Јесу ли они Кинези?", "Јесте ли лекар?"];
const homeworkQuestions = ["Да ли си из Америке?", "Да ли је Ана из Кине?", "Да ли је он из Енглеске?", "Да ли сте из Италије?", "Да ли су они из Пољске?"];
export default function Lesson() {
  return <LessonFlow><main>
    <StepSection id="intro"><section id="intro" className="hero"><p className="eyebrow">УРОК 4 · A1</p><h1>Мост.<em>Питања и глаголи!</em></h1><p className="hero-copy">Да ли си…? Јеси ли…? „Молим” у живом говору и велика битка за Омск.</p><Audio id="intro" title="Лидијин увод" /></section></StepSection>
    <Section id="opening" number="01" eyebrow="СТРИП" title="МОЛИМ или МОЛИМ?"><Audio id="molim-comic" title="МОЛИМ или МОЛИМ? · читање" /><figure className="opening-comic"><img src={`${cdn}e21c2589eaa04927a3ad367cc4697d0b/original/image.png`} alt="Оригинални стрип МОЛИМ или МОЛИМ?" width="1054" height="1492" /><figcaption>МОЛИМ или МОЛИМ?</figcaption></figure><Audio id="opening-translation" title="МОЛИМ или МОЛИМ? · перевод" /></Section>
    <Section id="questions" number="02" eyebrow="ГРАМАТИКА" title="Как построить вопрос"><p>В сербском языке вопрос можно построить двумя способами. Оба варианта правильные.</p><Audio id="questions" title="Как построить вопрос" /><figure className="original-diagram"><img src="./question-reference.png" alt="Оригинальная схема из Gamma: Да ли + краткая форма бити; полная форма бити + ли; формы и примеры ответов." width="903" height="1106" /><figcaption>Оригинална дијаграма · Gamma</figcaption></figure>
      <div className="grammar-pair"><div><h3>ДА ЛИ + краткая форма</h3><p>Да ли си студент?<br />Да ли је она лепа?<br />Да ли сте Срби?</p></div><div><h3>Полная форма + ЛИ</h3><p>Јеси ли студент?<br />Је ли она лепа?<br />Јесте ли Срби?</p></div></div><table className="forms"><caption>Глагол бити · полная и отрицательная форма</caption><tbody>{[["ја", "јесам", "нисам"], ["ти", "јеси", "ниси"], ["он / она / оно", "јесте", "није"], ["ми", "јесмо", "нисмо"], ["ви", "јесте", "нисте"], ["они / оне / она", "јесу", "нису"]].map(row => <tr key={row[0]}>{row.map((cell, i) => i === 0 ? <th scope="row" key={i}>{cell}</th> : <td key={i}>{cell}</td>)}</tr>)}</tbody></table><blockquote><b>Важно.</b> В русском часто достаточно интонации: «Ты студент?» В сербском используем «Да ли си студент?» или «Јеси ли студент?» В вопросе с «да ли» краткая форма бити стоит сразу после «да ли».</blockquote>
      <Exercise id="original-1" title="Вежба 1 · Вопрос с ‘Да ли’" intro={<><p>Ти си студент. → Да ли си ти студент?</p><p>В первых двух фразах обращаемся к собеседнику: ја → ти, ти → ја.</p></>} rows={formRows} />
      <Exercise id="original-2" title="Оригинална вежба 2 · Без ‘Да ли’" intro="Ја сам студент. → Јеси ли студент?" rows={liRows} />
      <Exercise id="original-3" title="Вежба 3 · Ответь" intro="Можно ответить «да» или «нет». Сохрани правильную форму бити." rows={[
        {text:"Да ли си ти студент? — ___",answers:[["Да, јесам.","Не, нисам."]],options:answerChoices},
        {text:"Јеси ли из Русије? — ___",answers:[["Да, јесам.","Не, нисам."]],options:answerChoices},
        {text:"Да ли је твој професор Србин? — ___",answers:[["Да, јесте.","Не, није."]],options:answerChoices},
        {text:"Јесте ли Ви уморни? — ___",answers:[["Да, јесам.","Не, нисам."]],options:answerChoices},
        {text:"Јесу ли твоји пријатељи Срби? — ___",answers:[["Да, јесу.","Не, нису."]],options:answerChoices},
      ]} />
    </Section>
    <Section id="molim" number="03" eyebrow="ЖИВИ ЈЕЗИК" title="МОЛИМ?"><p>«Молим» может значить: пожалуйста; прошу; что? / простите?; не за что; повторите, пожалуйста.</p><Audio id="molim" title="Молим · значења и изговор" /><div className="dialogue-scenes"><div><h3>Когда что-то просишь</h3><p>— Молим Вас, Вашу карту.<br />— Изволите.</p></div><div><h3>Когда не понял</h3><p>— Да ли је то твоја оловка?<br />— Молим?</p></div><div><h3>Когда говорят спасибо</h3><p>— Хвала!<br />— Молим.</p></div><div><h3>Когда извиняются</h3><p>— Извините!<br />— Ништа. Нема проблема.</p></div></div><div className="vocabulary"><h3>Полезные фразы</h3><PhraseAudio /><Audio id="phrases" title="Полезные фразы · все вместе" /></div>
      <Exercise id="molim-meaning" title="Что значит ‘молим’?" rows={[{text:"— Хвала! — Молим. → ___",options:["Пожалуйста / не за что","Простите? / Что?","Пожалуйста, Ваш билет"],answers:[["Пожалуйста / не за что"]]},{text:"— Да ли је то твоја оловка? — Молим? → ___",options:["Пожалуйста / не за что","Простите? / Что?","Пожалуйста, Ваш билет"],answers:[["Простите? / Что?"]]},{text:"— Молим Вас, Вашу карту. — Изволите. → ___",options:["Пожалуйста / не за что","Простите? / Что?","Пожалуйста, Ваш билет"],answers:[["Пожалуйста, Ваш билет"]]}]} />
      <Exercise id="molim-fill" title="Вставь фразу" rows={[{text:"— ___ — Молим.",options:["Молим.","Молим?","Изволите.","Хвала.","Нема проблема."],answers:[["Хвала."]]},{text:"— Да ли је то твоја књига? — ___",options:["Молим.","Молим?","Изволите.","Хвала.","Нема проблема."],answers:[["Молим?"]]},{text:"— Молим Вас, Ваш пасош. — ___",options:["Молим.","Молим?","Изволите.","Хвала.","Нема проблема."],answers:[["Изволите."]]},{text:"— Извините! — ___",options:["Молим.","Молим?","Изволите.","Хвала.","Нема проблема."],answers:[["Нема проблема."]]}]} />
      <details className="bonus-dialogue"><summary>Бонус · свой диалог</summary><p>Необязательное задание: составь короткий диалог с «Молим?» и отправь Лидии.</p><div className="role-dialogue"><p>— Да ли си ти студент?</p><p>— Молим?</p><p>— Јеси ли ти студент?</p><p>— Да, јесам.</p></div><Feedback section="molim" title="Ваш диалог" placeholder="Ваш короткий диалог" /></details>
    </Section>
    <Section id="practice" number="04" eyebrow="ВЕЖБАЊЕ" title="Продолжим практику"><p>Посмотрим, что вы помните из прошлого урока и как хорошо знаете глагол бити.</p>
      <Exercise id="practice-1" title="Упражнение 1 · Вставьте бити" rows={[{text:"Да ли ___ ти програмер?",answers:[["си"]]},{text:"Да ли ___ ви из Пољске?",answers:[["сте"]]},{text:"Да ли ___ ми у Паризу?",answers:[["смо"]]},{text:"Да ли ___ они Бугари?",answers:[["су"]]},{text:"Да ли ___ Марија Шпањолка?",answers:[["је"]]}].map(row => ({...row,options:shortForms}))} />
      <Exercise id="practice-2" title="Упражнение 2 · По смыслу" rows={[
        {text:"Да ли ___ Ви из Београда? — Не, ја ___ из Београда, али ја ___ Србин.",answers:[["сте"],["нисам"],["сам"]],options:[shortForms,negativeForms,shortForms]},
        {text:"Да ли ___ ти Срђан? — Да, ја ___ Срђан.",answers:[["си"],["сам"]],options:shortForms},
        {text:"Да ли си Американац? — Не, ја ___ Американац.",answers:[["нисам"]],options:negativeForms},
        {text:"Да ли ___ ти Дарја? — Да, ја ___ Дарја.",answers:[["си"],["сам"]],options:shortForms},
        {text:"Не, ја ___ Францускиња, ја ___ Рускиња.",answers:[["нисам"],["сам"]],options:[negativeForms,shortForms]},
      ]} />
      <Exercise id="practice-3" title="Упражнение 3 · Собери похожие вопросы" rows={[
        {text:"___ у Београду?",answers:[["Јесам ли"]],options:["Јесам ли","Јесу ли","Је ли"]},
        {text:"___ ти Рускиња?",answers:[["Да ли си"]],options:questionStarts},
        {text:"___ Марко из Италије?",answers:[["Је ли"]],options:liStarts},
        {text:"___ ми Срби?",answers:[["Да ли смо"]],options:questionStarts},
        {text:"___ ви професори?",answers:[["Јесте ли"]],options:liStarts},
      ]} />
      <Exercise id="practice-4" title="Упражнение 4 · Да и нет" rows={yesNo.map((text,i) => ({text:`${text} Да: ___ Не: ___`,options:answerChoices,answers:[[["Да, јесам.","Да, јесмо."],["Да, јесам."],["Да, јесмо."],["Да, јесу."],["Да, јесам."]][i],[["Не, нисам.","Не, нисмо."],["Не, нисам."],["Не, нисмо."],["Не, нису."],["Не, нисам."]][i]]}))} />
    </Section>
    <Section id="comic" number="05" eyebrow="АВАНТУРА" title="Битка за Омск!"><p>Суперполина и Коцкослав иду у авантуру! Са Чудним Харијем и Хермионом, краљицом књига, морају да одбране Омск од Злог Абракадабруса. Нека битка почне!</p><Audio id="omsk" title="Битка за Омск · читање" /><div className="comic-panels">{panels.map(([image,title,translation],i) => <figure key={image}><img src={`${cdn}${image}/original/blob.png`} alt={title} width="1024" height="1024" loading="lazy" /><figcaption><span className="panel-index">{String(i+1).padStart(2,"0")}</span><p>{title}</p>{translation && <small>{translation}</small>}</figcaption></figure>)}</div><Audio id="omsk-translation" title="Битка за Омск · перевод" /></Section>
    <Section id="learning" number="06" eyebrow="LEARNINGAPPS" title="Још мало вежбања!"><div className="learning-embed"><iframe src="https://learningapps.org/watch?v=pyj65zkf326&amp;disableanalytics=1" title="LearningApps · Битка за Омск" loading="lazy" allow="fullscreen" allowFullScreen /></div><a className="external-link" href="https://learningapps.org/watch?v=pyj65zkf326" target="_blank" rel="noreferrer">Открыть упражнение отдельно</a></Section>
    <Section id="homework" number="07" eyebrow="САМОСТАЛНО" title="Домаћи задатак!">
      <p>Короткая практика · около 5 минут.</p>
      <Exercise id="homework-5" title="Упражнение 5 · Собери диалог" intro="В вопросе с ли нужна полная форма бити." rows={[
        {text:"— Добар дан! ___ ли у Београду? — Да, јесам.",answers:[["Јесте"]],options:["Јесте","Сте","Јесу"]},
        {text:"— ___ ви Шпанац?",answers:[["Да ли сте","Јесте ли"]],options:["Да ли сте","Да ли си","Да ли су","Јесте ли"]},
        {text:"— Не, ___ Шпанац. А да ли сте Ви Шпанац?",answers:[["нисам"]],options:negativeForms},
        {text:"— Да, ја ___ Шпанац.",answers:[["сам"]],options:shortForms},
        {text:"— ___ ли и они Шпанци? — Не, нису. — Добро. Ми смо сви Срби!",answers:[["Јесу"]],options:["Јесу","Јесмо","Јесте"]},
      ]} />
      <Exercise id="homework-6" title="Упражнение 6 · Профессии" intro="Ответь отрицательно." rows={[
        {text:"Ти си грађевинар? — Не, ја ___ грађевинар.",answers:[["нисам"]],options:negativeForms},
        {text:"Он је правник? — Не, он ___ правник.",answers:[["није"]],options:negativeForms},
        {text:"Ви сте професори? — Не, ми ___ професори.",answers:[["нисмо"]],options:negativeForms},
        {text:"Они су лекари? — Не, они ___ лекари.",answers:[["нису"]],options:negativeForms},
        {text:"Ти си запослен? — Не, ја ___ запослен. Ја идем у школу!",answers:[["нисам"]],options:negativeForms},
      ]} />
      <Exercise id="homework-7" title="Упражнение 7 · Национальности" rows={[
        {text:"Ви сте из Француске? — Не, ја ___ из Француске, ја ___ Француз.",answers:[["нисам"],["нисам"]],options:negativeForms},
        {text:"Ви сте из Енглеске? — Не, ја ___ из Енглеске, ја ___ Енглез.",answers:[["нисам"],["нисам"]],options:negativeForms},
        {text:"Он је Немац? — Не, он ___ Немац.",answers:[["није"]],options:negativeForms},
        {text:"Ми смо Пољаци? — Не, ми ___ Пољаци.",answers:[["нисмо"]],options:negativeForms},
        {text:"Они су Италијани? — Не, они ___ Италијани.",answers:[["нису"]],options:negativeForms},
      ]} />
      <Exercise id="homework-8" title="Упражнение 8 · Да и нет" rows={homeworkQuestions.map((text,i) => ({text:`${text} Да: ___ Не: ___`,options:answerChoices,answers:[[["Да, јесам."],["Да, јесте."],["Да, јесте."],["Да, јесам.","Да, јесмо."],["Да, јесу."]][i],[["Не, нисам."],["Не, није."],["Не, није."],["Не, нисам.","Не, нисмо."],["Не, нису."]][i]]}))} />
      <Exercise id="homework-9" title="Упражнение 9 · Вопрос с ли" rows={[
        {text:"Да ли си из Америке? → ___ из Америке?",answers:[["Јеси ли"]],options:liStarts},
        {text:"Да ли је Ана из Кине? → ___ Ана из Кине?",answers:[["Је ли"]],options:liStarts},
        {text:"Да ли је он из Енглеске? → ___ он из Енглеске?",answers:[["Је ли"]],options:liStarts},
        {text:"Да ли сте из Италије? → ___ из Италије?",answers:[["Јесте ли"]],options:liStarts},
        {text:"Да ли су они из Пољске? → ___ они из Пољске?",answers:[["Јесу ли"]],options:liStarts},
      ]} />
      <div className="homework-exercise"><h3>Упражнение 10 · Мой опросник</h3><p>Составьте опросник из 5–7 пунктов на сербском языке для прибывающих в страну. Обязательно включите перечисленные ниже вопросы. Затем заполните эту анкету.</p><h4>Как вас зовут?</h4><ol><li>Откуда вы? Одакле сте?</li><li>Кто вы по национальности?</li><li>Кто вы по профессии?</li><li>Како се зовеш? или Како се зовете?</li><li>Чиме се бавиш? Да ли имаш посао?</li><li>Зашто долазите? Туризам, посета пријатељу.</li><li>Да ли сте дошли да живите или да радите? Или туристички?</li><li>Која је ваша националност?</li></ol><Notebook id="homework-10" label="Мой опросник:" rows={10} /></div>
    </Section></main></LessonFlow>;
}
