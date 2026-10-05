"use client";

import { useEffect, useState, type ReactNode } from "react";

const gamma = "https://gamma.app/docs/4--5fdhvt36nbimmwq";
const cdn = "https://cdn.gamma.app/isn4m4spq0jh937/";
const panels = [
  ["93a71afe6ba34887b64b1a208992ebee", "Суперполина и Коцкослав!", "Иду у авантуру!"],
  ["0c24d943007e4613bcdbd6b38fcc75e2", "И Чудни Хари!", ""],
  ["d2cfedb5c5c74ea7b5b7da9740783f7f", "Заједно са Хермионом, краљицом књига.", "заједно — вместе"],
  ["61d22cb571b2409b9c6271a40318c538", "Имају заједничког непријатеља — Злог Абракадабруса. Он је напао Омск.", ""],
  ["99b66cec25a5418fa4fde88b8d02ddb9", "И сад, наши хероји — Суперполина и њен коњ Коцкослав, Чудни Хари и Хермиона — морају да одбране Омск.", "сад — сейчас · морају — должны"],
  ["e41a539c1e05430f9b76932e0c83f277", "Нека битка за Омск почне!", "нека — пусть · почне — начнётся"],
];
const chapters = [["opening", "Молим или Молим?"], ["questions", "Питања"], ["molim", "Молим?"], ["practice", "Вежбање"], ["comic", "Битка за Омск"], ["learning", "LearningApps"], ["homework", "Домаћи"]];

function Audio({ id, title }: { id: string; title: string }) {
  return <div className="audio-slot" data-audio-slot={id}><div><b>{title}</b><span>Аудио · ускоро</span></div><audio controls preload="none" aria-label={title} /></div>;
}
function useAnswers(id: string) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`ty-serb-04:${id}`) || "{}");
      if (saved && typeof saved === "object" && !Array.isArray(saved)) setValues(saved);
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
const letters: Record<string, string> = { а:"a",б:"b",в:"v",г:"g",д:"d",ђ:"đ",е:"e",ж:"ž",з:"z",и:"i",ј:"j",к:"k",л:"l",љ:"lj",м:"m",н:"n",њ:"nj",о:"o",п:"p",р:"r",с:"s",т:"t",ћ:"ć",у:"u",ф:"f",х:"h",ц:"c",ч:"č",џ:"dž",ш:"š" };
function normalize(value: string) {
  return [...value.toLowerCase().trim()].map(char => letters[char] || char).join("").replace(/[.,!?;:—–]/g, "").replace(/\s+/g, " ");
}
type Row = { text: string; answers?: string[][]; example?: string; options?: string[] };
function Exercise({ id, title, intro, rows, free = false }: { id: string; title: string; intro?: ReactNode; rows: Row[]; free?: boolean }) {
  const { values, update, reset, ready } = useAnswers(id);
  const [checked, setChecked] = useState(false);
  const [shown, setShown] = useState(false);
  const [done, setDone] = useState(false);
  const statuses = rows.map((row, i) => (row.answers || []).map((accepted, j) => {
    const value = values[`${i}-${j}`] || "";
    return !value.trim() ? "empty" : accepted.some(answer => row.options ? answer === value : normalize(answer) === normalize(value)) ? "correct" : "incorrect";
  }));
  const total = statuses.flat().length;
  const correct = statuses.flat().filter(value => value === "correct").length;
  return <div className="exercise" id={id}><fieldset disabled={!ready}><h3>{title}</h3>{intro && <div className="exercise-intro">{intro}</div>}<ol className="exercise-rows">{rows.map((row, i) => <li key={i}>
    <div className="prompt">{row.text.split("___").map((part, j, parts) => <span key={j}>{part}{j < parts.length - 1 && <label className={`answer ${row.options ? "choice-answer" : (row.answers?.[j]?.[0]?.length || 100) < 8 ? "word-answer" : (row.answers?.[j]?.[0]?.length || 100) < 25 ? "short-answer" : ""}`}><span className="sr-only">{title}, {i + 1}, одговор {j + 1}</span>{row.options ? <select value={values[`${i}-${j}`] || ""} onChange={e => { update(`${i}-${j}`, e.target.value); setChecked(false); }}><option value="">…</option>{row.options.map(option => <option key={option}>{option}</option>)}</select> : <input autoComplete="off" value={values[`${i}-${j}`] || ""} onChange={e => { update(`${i}-${j}`, e.target.value); setChecked(false); }} aria-invalid={checked && statuses[i][j] === "incorrect"} />}</label>}</span>)}</div>
    {checked && row.answers && <div className="row-feedback" aria-live="polite">{statuses[i].every(status => status === "correct") ? <span className="correct">Тачно!</span> : statuses[i].includes("empty") ? <span className="incorrect">Попуни сва поља.</span> : <span className="incorrect">Покушај поново.</span>}</div>}
    {shown && <p className="solution">{free ? "Пример: " : "Одговор: "}{row.example || row.answers?.map(answers => answers[0]).join(" · ")}</p>}
  </li>)}</ol><div className="exercise-actions">{!free && <button className="primary" onClick={() => setChecked(true)}>Провери</button>}<button onClick={() => setShown(!shown)} aria-expanded={shown}>{shown ? "Сакриј" : free ? "Показать примеры" : "Покажи одговоре"}</button><button onClick={() => { reset(); setChecked(false); setShown(false); setDone(false); }}>Поново</button>{free && <label className="done-toggle"><input type="checkbox" checked={done} onChange={e => setDone(e.target.checked)} />Готово</label>}<span role="status">{checked && `${correct} / ${total}`}</span></div></fieldset></div>;
}
function Notebook({ id, label, rows = 4 }: { id: string; label: string; rows?: number }) {
  const { values, update, ready } = useAnswers(id);
  return <label className="notebook">{label}<textarea disabled={!ready} rows={rows} value={values.text || ""} onChange={e => update("text", e.target.value)} /></label>;
}
function Section({ id, number, eyebrow, title, children }: { id: string; number: string; eyebrow: string; title: string; children: ReactNode }) {
  return <section id={id} className="lesson-section"><div className="section-heading"><span className="section-number">{number}</span><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div></div>{children}</section>;
}
const formRows = [
  { text: "Ја сам из Русије. → ___", answers: [["Да ли си ти из Русије?", "Да ли сам ја из Русије?", "Да ли сам из Русије?", "Да ли си из Русије?"]] },
  { text: "Ти си добар ђак. → ___", answers: [["Да ли сам ја добар ђак?", "Да ли си ти добар ђак?", "Да ли си добар ђак?", "Да ли сам добар ђак?"]] },
  { text: "Она је лепа. → ___", answers: [["Да ли је лепа?", "Да ли је она лепа?"]] },
  { text: "Ми смо пријатељи. → ___", answers: [["Да ли смо ми пријатељи?", "Да ли смо пријатељи?"]] },
  { text: "Ви сте професори. → ___", answers: [["Да ли сте ви професори?", "Да ли сте професори?"]] },
  { text: "Они су уморни. → ___", answers: [["Да ли су они уморни?", "Да ли су уморни?"]] },
];
const liRows = [
  { text: "Ја сам из Србије. → ___", answers: [["Јеси ли из Србије?", "Јеси ли ти из Србије?", "Јесам ли из Србије?", "Јесам ли ја из Србије?"]] },
  { text: "Он је Немац. → ___", answers: [["Је ли он Немац?", "Је ли Немац?", "Јесте ли он Немац?"]] },
  { text: "Ми смо код куће. → ___", answers: [["Јесмо ли ми код куће?", "Јесмо ли код куће?"]] },
  { text: "Ви сте студенти. → ___", answers: [["Јесте ли ви студенти?", "Јесте ли студенти?"]] },
  { text: "Они су гладни. → ___", answers: [["Јесу ли они гладни?", "Јесу ли гладни?"]] },
];
const yesNo = ["Јесте ли из Енглеске?", "Јеси ли Американац?", "Јесмо ли у Пекингу?", "Јесу ли они Кинези?", "Јесте ли лекар?", "Јесмо ли у Москви?"];
const homeworkQuestions = ["Да ли си из Америке?", "Да ли је Ана из Кине?", "Да ли је он из Енглеске?", "Да ли сте из Италије?", "Да ли су они из Пољске?"];
export default function Lesson() {
  const [finished, setFinished] = useState(false);
  useEffect(() => { try { setFinished(localStorage.getItem("ty-serb-04:finished") === "true"); } catch { /* Optional persistence. */ } }, []);
  return <>
    <main><section id="top" className="hero"><p className="eyebrow">УРОК 4 · A1</p><h1>Мост.<em>Питања и глаголи!</em></h1><p className="hero-copy">Да ли си…? Јеси ли…? „Молим” у живом говору и велика битка за Омск.</p><Audio id="intro" title="Лидијин увод" /><details className="presentation"><summary>Оригинальная презентация · Лекција 4</summary><iframe src="https://gamma.app/embed/5fdhvt36nbimmwq" title="Оригинальная четвёртая лекция в Gamma" loading="lazy" allowFullScreen /><a href={gamma} target="_blank" rel="noreferrer">Открыть в Gamma ↗</a></details></section>
    <nav className="lesson-nav" aria-label="Делови лекције">{chapters.map(([id, title], i) => <a href={`#${id}`} key={id}><span>{String(i + 1).padStart(2, "0")}</span>{title}</a>)}</nav>
    <Section id="opening" number="01" eyebrow="СТРИП" title="МОЛИМ или МОЛИМ?"><Audio id="molim-comic" title="МОЛИМ или МОЛИМ? · читање" /><figure className="opening-comic"><img src={`${cdn}e21c2589eaa04927a3ad367cc4697d0b/original/image.png`} alt="Оригинални стрип МОЛИМ или МОЛИМ?" width="1054" height="1492" /><figcaption>МОЛИМ или МОЛИМ?</figcaption></figure></Section>
    <Section id="questions" number="02" eyebrow="ГРАМАТИКА" title="Как построить вопрос"><p>В сербском языке вопрос можно построить двумя способами. Оба варианта правильные.</p><Audio id="questions" title="Как построить вопрос" /><figure className="original-diagram"><img src="./question-reference.png" alt="Оригинальная схема из Gamma: Да ли + краткая форма бити; полная форма бити + ли; формы и примеры ответов." width="903" height="1106" /><figcaption>Оригинална дијаграма · Gamma</figcaption></figure>
      <div className="grammar-pair"><div><h3>ДА ЛИ + краткая форма</h3><p>Да ли си студент?<br />Да ли је она лепа?<br />Да ли сте Срби?</p></div><div><h3>Полная форма + ЛИ</h3><p>Јеси ли студент?<br />Је ли она лепа?<br />Јесте ли Срби?</p></div></div><table className="forms"><caption>Глагол бити · полная и отрицательная форма</caption><tbody>{[["ја", "јесам", "нисам"], ["ти", "јеси", "ниси"], ["он / она / оно", "јесте", "није"], ["ми", "јесмо", "нисмо"], ["ви", "јесте", "нисте"], ["они / оне / она", "јесу", "нису"]].map(row => <tr key={row[0]}>{row.map((cell, i) => i === 0 ? <th scope="row" key={i}>{cell}</th> : <td key={i}>{cell}</td>)}</tr>)}</tbody></table><blockquote><b>Важно.</b> В русском часто достаточно интонации: «Ты студент?» В сербском используем «Да ли си студент?» или «Јеси ли студент?» В вопросе с «да ли» краткая форма бити стоит сразу после «да ли».</blockquote>
      <Exercise id="original-1" title="Оригинална вежба 1 · Сделай вопрос с ‘Да ли’" intro={<><p>Образец: Ти си студент. → Да ли си ти студент?</p><p>Ја сам из Русије. → Да ли си ти из Русије?<br />Ти си добар ђак. → Да ли сам ја добар ђак?<br />Она је лепа. → Да ли је лепа?</p></>} rows={formRows} />
      <Exercise id="original-2" title="Оригинална вежба 2 · Без ‘Да ли’" intro="Ја сам студент. → Јеси ли студент?" rows={liRows} />
      <Exercise id="original-3" title="Оригинална вежба 3 · Ответь" intro="Да ли си ти студент? — Не, нисам. Ја сам ђак!" free rows={[{text:"Да ли си ти студент? — ___",example:"Не, нисам. Ја сам ђак!"},{text:"Јеси ли из Русије? — ___",example:"Да, јесам. / Не, нисам."},{text:"Да ли је твој професор Србин? — ___",example:"Да, јесте. / Не, није."},{text:"Јесте ли Ви уморни? — ___",example:"Да, јесам. / Не, нисам."},{text:"Јесу ли твоји пријатељи Срби? — ___",example:"Да, јесу. / Не, нису."}]} />
    </Section>
    <Section id="molim" number="03" eyebrow="ЖИВИ ЈЕЗИК" title="МОЛИМ?"><p>«Молим» может значить: пожалуйста; прошу; что? / простите?; не за что; повторите, пожалуйста.</p><Audio id="molim" title="Молим · значења и изговор" /><div className="dialogue-scenes"><div><h3>Когда что-то просишь</h3><p>— Молим Вас, Вашу карту.<br />— Изволите.</p></div><div><h3>Когда не понял</h3><p>— Да ли је то твоја оловка?<br />— Молим?</p></div><div><h3>Когда говорят спасибо</h3><p>— Хвала!<br />— Молим.</p></div><div><h3>Когда извиняются</h3><p>— Извините!<br />— Ништа. Нема проблема.</p></div></div><div className="vocabulary"><h3>Полезные фразы</h3><p>Молим те. — Пожалуйста. · Молим Вас. — Прошу Вас.<br />Извини. · Извините. · Ништа. · Нема проблема.<br />Хвала. · Хвала лепо. · Велико хвала.<br />Нема на чему. · И други пут!</p></div>
      <Exercise id="molim-meaning" title="Что значит ‘молим’?" rows={[{text:"— Хвала! — Молим. → ___",options:["Пожалуйста / не за что","Простите? / Что?","Пожалуйста, Ваш билет"],answers:[["Пожалуйста / не за что"]]},{text:"— Да ли је то твоја оловка? — Молим? → ___",options:["Пожалуйста / не за что","Простите? / Что?","Пожалуйста, Ваш билет"],answers:[["Простите? / Что?"]]},{text:"— Молим Вас, Вашу карту. — Изволите. → ___",options:["Пожалуйста / не за что","Простите? / Что?","Пожалуйста, Ваш билет"],answers:[["Пожалуйста, Ваш билет"]]}]} />
      <Exercise id="molim-fill" title="Вставь фразу" intro="Молим. · Молим? · Изволите. · Хвала. · Нема проблема." rows={[{text:"— ___! — Молим.",options:["Молим.","Молим?","Изволите.","Хвала.","Нема проблема."],answers:[["Хвала."]]},{text:"— Да ли је то твоја књига? — ___?",options:["Молим.","Молим?","Изволите.","Хвала.","Нема проблема."],answers:[["Молим?"]]},{text:"— Молим Вас, Ваш пасош. — ___.",options:["Молим.","Молим?","Изволите.","Хвала.","Нема проблема."],answers:[["Изволите."]]},{text:"— Извините! — ___.",options:["Молим.","Молим?","Изволите.","Хвала.","Нема проблема."],answers:[["Нема проблема."]]}]} />
      <div className="exercise"><h3>Разыграйте диалог</h3><Audio id="dialogue" title="Мини-дијалог" /><div className="role-dialogue"><p><b>А</b> Да ли си ти студент?</p><p><b>Б</b> Молим?</p><p><b>А</b> Јеси ли ти студент?</p><p><b>Б</b> Да, јесам.</p></div><Notebook id="your-dialogue" label="Ваш диалог" /></div>
    </Section>
    <Section id="practice" number="04" eyebrow="ВЕЖБАЊЕ" title="Да ли је све у реду?"><Audio id="practice" title="Да ли је све у реду? · вежбање" /><blockquote>Павла су испитивали на пасошкој контроли. „Врло сам интересантан пасошкој контроли. Ја нисам позната личност. Чудно је. Да ли је све у реду? Да ли сам им сумњив?”</blockquote>
      <Exercise id="practice-1" title="Упражнение 1 · Вставьте бити" rows={[{text:"Да ли ___ ти програмер?",answers:[["си"]]},{text:"Да ли ___ ви из Пољске?",answers:[["сте"]]},{text:"Да ли ___ ми у Паризу?",answers:[["смо"]]},{text:"Да ли ___ они Бугари?",answers:[["су"]]},{text:"Да ли ___ Марија Шпањолка?",answers:[["је"]]}]} />
      <Exercise id="practice-2" title="Упражнение 2 · По смыслу" intro="сам / си / је / смо / сте / су · нисам / ниси / није / нисмо / нисте / нису" rows={[{text:"Да ли ___ Ви из Београда? — Не, ја ___ из Београда, али ја ___ Србин.",answers:[["сте"],["нисам"],["сам"]]},{text:"Да ли ___ ти Срђан? — Да, ја ___ Срђан. Да ли ___ Американац? — Не, ја ___ Американац.",answers:[["си"],["сам"],["си"],["нисам"]]},{text:"Да ли ___ ти Дарја? — Да, ја ___ Дарја. Не, ја ___ Францускиња, ја ___ Рускиња.",answers:[["си"],["сам"],["нисам"],["сам"]]}]} />
      <Exercise id="practice-3" title="Упражнение 3 · Напиши слична питања" free rows={["Јесам ли у Риму?","Да ли си ти Францускиња?","Је ли Марко из Србије?","Да ли смо ми Пољаци?","Јесте ли ви програмери?","Јесу ли они чистачи?"].map((text,i) => ({text:`${text} → ___`,example:["Јесам ли у Београду?","Да ли си ти Рускиња?","Је ли Марко из Италије?","Да ли смо ми Срби?","Јесте ли ви професори?","Јесу ли они лекари?"][i]}))} />
      <Exercise id="practice-4" title="Упражнение 4 · Одговори потврдно и одрично" rows={yesNo.map((text,i) => ({text:`${text} Да: ___ Не: ___`,answers:[[["Да, јесам.","Да, јесмо."],["Да, јесам."],["Да, јесмо."],["Да, јесу."],["Да, јесам."],["Да, јесмо."]][i],[["Не, нисам.","Не, нисмо."],["Не, нисам."],["Не, нисмо."],["Не, нису."],["Не, нисам."],["Не, нисмо."]][i]]}))} />
    </Section>
    <Section id="comic" number="05" eyebrow="АВАНТУРА" title="Битка за Омск!"><p>Суперполина и Коцкослав иду у авантуру! Са Чудним Харијем и Хермионом, краљицом књига, морају да одбране Омск од Злог Абракадабруса. Нека битка почне!</p><Audio id="omsk" title="Битка за Омск · читање" /><div className="comic-panels">{panels.map(([image,title,translation],i) => <figure key={image}><img src={`${cdn}${image}/original/blob.png`} alt={title} width="1024" height="1024" loading="lazy" /><figcaption><span className="panel-index">{String(i+1).padStart(2,"0")}</span><p>{title}</p>{translation && <small>{translation}</small>}</figcaption></figure>)}</div></Section>
    <Section id="learning" number="06" eyebrow="LEARNINGAPPS" title="Још мало вежбања!"><Audio id="learningapps" title="Лидијин увод у вежбу" /><div className="learning-embed"><iframe src="https://learningapps.org/display?v=pyj65zkf326" title="LearningApps · Битка за Омск" loading="lazy" allowFullScreen /></div><a className="external-link" href="https://learningapps.org/watch?id=pyj65zkf326" target="_blank" rel="noreferrer">Открыть упражнение ↗</a></Section>
    <Section id="homework" number="07" eyebrow="САМОСТАЛНО" title="Домаћи задатак!">
      <div className="homework-exercise"><h3>Упражнение 5</h3><p>Заполните пропуски. Обратите внимание: вопросы с частицей <b>ли</b> предполагают использование полной формы глагола бити.</p><p>— Добар дан! ______ ли у Београду? — Да, јесам. ____________ ви Шпанац?</p><p>— Не, ______ Шпанац. А да ли сте Ви Шпанац?</p><p>— Да, ја ______ Шпанац. — ______ ли и они Шпанци? — Не, нису. — Добро. Ми смо сви Срби!</p><Notebook id="homework-5" label="Ваши ответы" rows={3} /></div>
      <div className="homework-exercise"><h3>Упражнение 6 · Профессии</h3><p>Вставьте глагол бити в отрицательной форме, дополните диалог тремя вопросами и ответами по образцу. Вспомните профессии.</p><p>— Здраво! — Здраво!</p><p>— Шта си по занимању? Ти си грађевинар? — Не, ја ______ грађевинар. — Ти си правник? — Не, ја ______ правник.</p><Notebook id="homework-6" label="Пропуски и три вопроса с ответами" rows={6} /><p>— Па шта си ти? — Ја нисам запослен («я не работаю», буквально «я не трудоустроен»). Ја идем у школу!</p></div>
      <div className="homework-exercise"><h3>Упражнение 7 · Национальности</h3><p>Вставьте глагол бити в отрицательной форме, дополните диалог тремя вопросами и ответами по образцу. Вспомните национальности.</p><p>— Добар дан! — Добар дан! — Одакле сте Ви? Ви сте из Француске?</p><p>— Не, ја ______ из Француске, ја ______ Француз.</p><p>— Ви сте из Енглеске? — Не, ја ______ из Енглеске, ја ______ Енглез.</p><Notebook id="homework-7" label="Пропуски и три вопроса с ответами" rows={6} /><p>— Онда, одакле сте ви? — Ја сам Србин, ја сам из Србије.</p></div>
      <div className="homework-exercise"><h3>Упражнение 8</h3><p>Ответьте на вопросы сначала утвердительно, потом отрицательно.</p>{homeworkQuestions.map((question,i) => <Notebook key={question} id={`homework-8-${i}`} label={`${i+1}. ${question}`} rows={2} />)}</div>
      <div className="homework-exercise"><h3>Упражнение 9</h3><p>Вопросы из предыдущего упражнения замените на вопросы с частицей <b>ли</b>, используя полные формы глагола бити.</p><Notebook id="homework-9" label="Пять вопросов с ‘ли’" rows={5} /></div>
      <div className="homework-exercise"><h3>Упражнение 10 · Мой опросник</h3><p>Составьте опросник из 5–7 пунктов на сербском языке для прибывающих в страну. Обязательно включите перечисленные ниже вопросы. Затем заполните эту анкету.</p><h4>Как вас зовут?</h4><ol><li>Откуда вы? Одакле сте?</li><li>Кто вы по национальности?</li><li>Кто вы по профессии?</li><li>Како се зовеш? или Како се зовете?</li><li>Чиме се бавиш? Да ли имаш посао?</li><li>Зашто долазите? Туризам, посета пријатељу.</li><li>Да ли сте дошли да живите или да радите? Или туристички?</li><li>Која је ваша националност?</li></ol><Notebook id="homework-10" label="Мой опросник:" rows={10} /></div>
      <button className="finish primary" onClick={() => { const next = !finished; setFinished(next); try { localStorage.setItem("ty-serb-04:finished", String(next)); } catch { /* Optional persistence. */ } }} aria-pressed={finished}>{finished ? "✓ Лекција је завршена" : "Заврши лекцију"}</button>
    </Section></main></>;
}
