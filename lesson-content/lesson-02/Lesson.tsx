"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

const storageKey = "tyserb-lesson-02";
const sections = [
  ["intro", "Вступление"], ["reading", "Диалог"], ["vocabulary", "Профессии"],
  ["comic", "Комикс"], ["grammar", "Глагол biti"], ["comparison", "Ovo, to, ono"],
  ["practice", "Практика"], ["phrases", "Фразы для урока"],
  ["homework", "Домашнее задание"], ["recap", "Итоги"],
] as const;
const audioTracks = {
  intro: { number: "01", file: "lesson-02-01-intro.m4a", name: "Вступление к уроку" },
  reading: { number: "02", file: "lesson-02-02-passport.m4a", name: "На паспортном контроле" },
  professions: { number: "03", file: "lesson-02-03-professions.m4a", name: "Профессии" },
  comic: { number: "04", file: "lesson-02-04-comic.m4a", name: "Чтение комикса" },
  words: { number: "05", file: "lesson-02-05-new-words.m4a", name: "Незнакомые слова" },
  translation: { number: "06", file: "lesson-02-06-translation.m4a", name: "Перевод комикса" },
  whyBiti: { number: "07", file: "lesson-02-07-why-biti.m4a", name: "Зачем нужен глагол biti" },
  forms: { number: "08", file: "lesson-02-08-biti-forms.m4a", name: "Формы глагола biti" },
  demonstratives: { number: "09", file: "lesson-02-09-ovo-to-ono.m4a", name: "Ovo, to, ono" },
} as const;
const forms = [["Ја", "сам", "я есть"], ["Ти", "си", "ты есть"], ["Он / Она / Оно", "је", "он / она / оно есть"], ["Ми", "смо", "мы есть"], ["Ви", "сте", "вы есть"], ["Они / Оне / Она", "су", "они есть"]];
const profs = ["учитељ / учитељица", "васпитач / васпитачица", "певач / певачица", "конобар / конобарица", "кувар / куварица", "ученик / ученица", "службеник / службеница", "научник / научница", "комшија / комшиница", "колега / колегиница", "професор / професорка", "новинар / новинарка", "лекар / лекарка", "министар / министарка", "политичар / политичарка", "полицајац / полицајка", "менаџер / менаџерка", "инжењер / инжењерка", "фризер / фризерка", "пензионер / пензионерка", "програмер / програмерка", "фудбалер / фудбалерка", "апотекар / апотекарка", "ветеринар / ветеринарка", "сликар / сликарка", "уметник / уметница", "економиста / економисткиња", "студент / студенткиња"];
const qs = [["Ја ___ лекарка.", "сам"], ["Ти ___ учитељица.", "си"], ["Он ___ бизнисмен.", "је"], ["Она ___ програмерка.", "је"], ["Ми ___ менаџери.", "смо"], ["Ви ___ политичари.", "сте"], ["Они ___ зубари.", "су"], ["Оне ___ фризерке.", "су"], ["Џон ___ лекар.", "је"]];
const comicLines = [
  'Zdravo! Ja sam Ana. Ja sam, samo konj u velikom gradu. Ne znam šta je moja "prava" profesija.',
  "Da li sam ja konobarica?",
  "Da li ja želim da budem kuvarica?",
  "Možda treba da budem policajka, da se borim protiv kriminala!",
  "Frizerke su super! Imaju puno drugarica! Šta ako postanem frizerka?",
  "Ali ja baš volim da crtam, onda moram da budem slikarka!",
  "Ali ja sam mnogo pametna, to je to! Ja sam naučnica!",
];
const comicWords = [["Veliki grad", "большой город"], ["Samo", "всего лишь"], ["Konobarica", "официантка"], ["Kuvarica", "повар"], ["Želeti, želim", "хотеть"], ["Treba", "надо"], ["Baš", "очень"], ["Morati, moram", "должен / должна"], ["Pametna", "умная"]];
// Bounds include the artwork and every speech bubble, excluding empty side margins.
const comicBounds = [[437, 1483], [437, 1594], [271, 1480], [437, 1624], [437, 1641], [133, 1483], [437, 1746]];

function Audio({ track }: { track: keyof typeof audioTracks }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [speed, setSpeed] = useState("1");
  const [error, setError] = useState(false);
  const { number, file, name } = audioTracks[track];
  const src = "/api/lesson-content/kak-predstavitsya/audio/" + file;
  return <div className="audio">
    <p className="audio-title"><span>{number}</span><b>{name}</b></p>
    <audio ref={ref} controls data-lesson-audio preload="none" aria-label={name}
      onPlay={() => {
        setError(false);
        document.querySelectorAll<HTMLAudioElement>("audio[data-lesson-audio]").forEach(other => {
          if (other !== ref.current) other.pause();
        });
      }} onError={() => setError(true)}>
      <source src={src} type="audio/mp4" />
      Ваш браузер не поддерживает аудио.
    </audio>
    <label className="audio-speed">Скорость
      <select aria-label={"Скорость: " + name} value={speed} onChange={event => {
        setSpeed(event.target.value);
        if (ref.current) ref.current.playbackRate = Number(event.target.value);
      }}><option value="0.75">0,75×</option><option value="1">1×</option><option value="1.25">1,25×</option><option value="1.5">1,5×</option></select>
    </label>
    {error && <p role="alert">Не удалось загрузить запись. <a href={src}>Открыть аудио</a></p>}
  </div>;
}

function LearningApp({ id, title, description }: { id: string; title: string; description: string }) {
  const url = "https://learningapps.org/watch?v=" + id;
  return <div className="learningapp">
    <div className="learningapp-head"><h3>{title}</h3><p>{description}</p></div>
    <div className="embed-wrap"><iframe loading="lazy" src={url} title={title + " — LearningApps"} allowFullScreen /></div>
    <a className="external-link" href={url} target="_blank" rel="noreferrer">Открыть упражнение отдельно ↗</a>
  </div>;
}

function Quiz() {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const [round, setRound] = useState(0);
  const options = useMemo(() => qs.map((_, i) => ["сам", "си", "је", "смо", "сте", "су"].sort((x, y) => ((i + 1) * 17 + x.charCodeAt(0) * 7 + round * 13) % 19 - ((i + 1) * 17 + y.charCodeAt(0) * 7 + round * 13) % 19)), [round]);
  const score = qs.filter((q, i) => answers[i] === q[1]).length;
  return <div className="quiz">
    <p><b>Изабери правилан облик глагола бити / јесам.</b></p>
    {qs.map((q, i) => <label key={q[0]}><span>{i + 1}. {q[0]}</span>
      <select aria-label={"Одговор " + (i + 1)} value={answers[i] || ""} onChange={event => {
        setChecked(false); setAnswers({ ...answers, [i]: event.target.value });
      }} className={checked ? (answers[i] === q[1] ? "ok" : "bad") : ""}>
        <option value="">Выбери</option>{options[i].map(x => <option key={x} value={x}>{x}</option>)}
      </select>{checked && answers[i] !== q[1] && <small>Тачно: {q[1]}</small>}
    </label>)}
    <div className="actions"><button onClick={() => setChecked(true)}>Проверить</button><button onClick={() => { setAnswers({}); setChecked(false); setRound(round + 1); }}>Повторить</button></div>
    {checked && <p role="status">Результат: <b>{score}/{qs.length}</b>{score === qs.length ? " · Браво!" : ""}</p>}
  </div>;
}

export default function Lesson() {
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLElement>(null);
  const scrollRequested = useRef(false);
  const [done, setDone] = useState(false);
  const [checks, setChecks] = useState<boolean[]>([]);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === "done") setDone(true);
      else if (saved) {
        const data = JSON.parse(saved);
        setDone(Boolean(data.done));
        setChecks(Array.isArray(data.checks) ? data.checks : []);
      }
    } catch { /* Browser storage is optional. */ }
  }, []);
  useEffect(() => {
    const update = () => {
      const index = sections.findIndex(([id]) => "#" + id === location.hash);
      scrollRequested.current = index >= 0;
      setActive(index < 0 ? 0 : index);
      rootRef.current?.querySelectorAll("audio").forEach(audio => audio.pause());
    };
    addEventListener("hashchange", update);
    addEventListener("popstate", update);
    update();
    return () => { removeEventListener("hashchange", update); removeEventListener("popstate", update); };
  }, []);
  useLayoutEffect(() => {
    if (!scrollRequested.current) return;
    rootRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
    scrollRequested.current = false;
  }, [active]);
  const openSection = (index: number) => {
    if (index < 0 || index >= sections.length) return;
    rootRef.current?.querySelectorAll("audio").forEach(audio => audio.pause());
    scrollRequested.current = true;
    setActive(index);
    if (location.hash !== "#" + sections[index][0]) history.pushState(null, "", "#" + sections[index][0]);
    if (index === active) rootRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
  };
  const persist = (nextDone: boolean, nextChecks: boolean[]) => {
    try { localStorage.setItem(storageKey, JSON.stringify({ done: nextDone, checks: nextChecks })); } catch { /* Browser storage is optional. */ }
  };
  return <main ref={rootRef} className="lesson-two-content">
    <div className="progress" aria-hidden="true"><i style={{ width: (active + 1) / sections.length * 100 + "%" }} /></div>
    <div className="wrap">
      <nav className="lesson-navigation" aria-label="Разделы урока">
        <div className="brandbar"><a href="#intro" onClick={event => { event.preventDefault(); openSection(0); }}>TY SERB</a><b>Урок 2</b><span>{active + 1}/{sections.length}</span></div>
        <div className="lesson-rail">{sections.map(([id, name], i) => <a key={id} href={"#" + id} title={(i + 1) + ". " + name} aria-label={"Раздел " + (i + 1) + ": " + name} aria-current={active === i ? "location" : undefined} onClick={event => { if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return; event.preventDefault(); openSection(i); }} className={active === i ? "active" : i < active ? "visited" : ""}>{String(i + 1).padStart(2, "0")}</a>)}</div>
        <p className="rail-caption">{sections[active][1]}</p>
      </nav>
      <header id="intro" data-lesson-section hidden={active !== 0}>
        <div className="eyebrow">Учимо српски са Лидијом Симић! · A1</div>
        <h1>Професије.<br /><em>Глагол biti.</em></h1>
        <p className="lead">Говоримо ко смо и чиме се бавимо. Учимо облике <b>сам, си, је, смо, сте, су</b>.</p>
        <Audio track="intro" />
      </header>

      <section id="reading" data-lesson-section hidden={active !== 1}>
        <div className="no">01 · УВОДНО ЧИТАЊЕ</div><h2>На пасошкој контроли</h2>
        <Audio track="reading" />
        <div className="cols"><article><h3>Пасошка контрола</h3><p>— Добро јутро!<br />— Добро јутро! Ваш пасош, молим.<br />— Изволите.<br />— Ви сте господин Бонд?<br />— Да, ја сам Стив Бонд.<br />— Ви сте туриста?<br />— Не, ја сам бизнисмен.<br />— Ваша адреса у Београду?<br />— Хотел „Метропол“.<br />— Изволите пасош.<br />— Хвала.</p></article><article><h3>Сусрет <small>· встреча</small></h3><p>— Извините, да ли сте ви господин Бонд?<br />— Да, ја сам Стив Бонд.<br />— Ја сам Љиљана Јовановић.<br />— Драго ми је.<br />— Ви сте Енглез?<br />— Да, ја сам Енглез.<br />— Добро говорите српски!<br />— Хвала.</p></article></div>
      </section>
      <section id="vocabulary" data-lesson-section hidden={active !== 2}>
        <div className="no">02 · НОВИ ВОКАБУЛАР</div><h2>Данас учимо о професијама!</h2>
        <p className="lead">Danas učimo o profesijama! Обрати пажњу како се граде називи у женском роду.</p>
        <Audio track="professions" />
        <ol className="profs">{profs.map(x => <li key={x}>{x}</li>)}</ol>
        <div className="images"><img loading="lazy" src="/api/lesson-content/kak-predstavitsya/images/lesson-02-professions-01.png" alt="Професије, први део" /><img loading="lazy" src="/api/lesson-content/kak-predstavitsya/images/lesson-02-professions-02.png" alt="Професије, други део" /></div>
        <aside><b>Погодите шта значе речи:</b><p>таксиста, адвокат, дипломата, пилот, пекар, судија, контролор, директор, фотограф, возач, чувар, рачуновођа, музичар, астронаут, инфлуенсер?</p></aside>
        <LearningApp id="pczrn0skn26" title="Професије" description="Повежи назив професије са руским преводом." />
      </section>
      <section id="comic" data-lesson-section hidden={active !== 3}>
        <div className="no">03 · СТРИП</div><h2>Ana, konj u velikom gradu!</h2>
        <Audio track="comic" />
        <div className="comic">{comicLines.map((line, i) => <figure key={line}>
          <a href={"/api/lesson-content/kak-predstavitsya/images/lesson-02-comic-0" + (i + 1) + ".jpg"} target="_blank" rel="noreferrer" aria-label={"Открыть кадр " + (i + 1) + " в полном размере"} style={{ aspectRatio: (comicBounds[i][1] - comicBounds[i][0]) + " / 1080" }}>
            <img loading="lazy" width="1920" height="1080" style={{ width: (1920 / (comicBounds[i][1] - comicBounds[i][0]) * 100) + "%", marginLeft: (-comicBounds[i][0] / (comicBounds[i][1] - comicBounds[i][0]) * 100) + "%" }} src={"/api/lesson-content/kak-predstavitsya/images/lesson-02-comic-0" + (i + 1) + ".jpg"} alt={line} />
          </a><figcaption><span>Кадр {i + 1} / 7</span><p lang="sr-Latn">{line}</p></figcaption>
        </figure>)}</div>
        <h3 className="sub">Nepoznate reči · Незнакомые слова</h3><Audio track="words" />
        <dl className="word-list">{comicWords.map(([word, translation]) => <div key={word}><dt lang="sr-Latn">{word}</dt><dd>{translation}</dd></div>)}</dl>
        <h3 className="sub">Prevod · Перевод</h3><Audio track="translation" />
      </section>
      <section id="grammar" data-lesson-section hidden={active !== 4}>
        <div className="no">04 · ГРАМАТИКА</div><h2>Глагол JESAM (biti)</h2>
        <Audio track="whyBiti" />
        <p className="lead">У српском језику глагол <b>БИТИ</b> („быть”) је обавезан! Без њега нема ни садашњег ни прошлог времена. Ово је једна од кључних разлика између српског и руског.</p>
        <div className="cards"><article><b>Повезује са именицом</b><p>Ја сам студент. <small>— Я студент.</small></p></article><article><b>Повезује са придевом</b><p>Она је лепа. <small>— Она красивая.</small></p></article><article><b>Повезује са местом</b><p>Ми смо код куће. <small>— Мы дома.</small></p></article><article><b>Повезује са стањем</b><p>Ја сам гладна. <small>— Я голодна.</small></p></article><article><b>Изражава радњу (прошло време)</b><p>Радила сам цео дан!<br />Јуче сте били у позоришту.</p></article></div>
        <aside className="blue"><b>Интересный факт: в русском глагол БИТИ тоже был!</b><p>„Я есмь путь, истина и жизнь“ — знакомо? Формы: <b>есмь, еси, есть, есмы, есте, суть.</b></p></aside>
        <h3 className="sub">Облици у садашњем времену</h3><Audio track="forms" />
        <div className="forms">{forms.map(x => <div key={x[0]}><span>{x[0]}</span><b>{x[1]}</b><small>{x[2]}</small></div>)}</div>
        <p className="remember">Ја сам Лидија. Он је Марко. Ми смо из Србије. Ви сте из Русије.</p>
      </section>
      <section id="comparison" data-lesson-section hidden={active !== 5}>
        <div className="no">05 · ПОРЕЂЕЊЕ</div><h2>Упоредимо српски и руски</h2>
        <div className="compare"><article><h3>Руски</h3><p>Я студент<br />Она дома<br />Мы умнейшие</p></article><article><h3>Српски</h3><p>Ја <mark>САМ</mark> студент<br />Она <mark>ЈЕ</mark> код куће<br />Ми <mark>СМО</mark> најпаметнији</p></article></div>
        <h3 className="sub">BITI + показне заменице</h3><Audio track="demonstratives" />
        <div className="formula"><b>Показна заменица + БИТИ + именица</b><p>Ово <mark>ЈЕ</mark> кућа. <small>— This is a house.</small><br />То <mark>ЈЕ</mark> мој брат. <small>— That is my brother.</small><br />Оно <mark>СУ</mark> деца. <small>— Those are children.</small></p></div>
        <div className="images"><img loading="lazy" src="/api/lesson-content/kak-predstavitsya/images/lesson-02-demonstrative-ovo.png" alt="ОВО, ТО, ОНО: близко, дальше, далеко" /><img loading="lazy" src="/api/lesson-content/kak-predstavitsya/images/lesson-02-demonstrative-to.png" alt="ОВО: мой простор, ТО: наш простор, ОНО: далеко" /></div>
      </section>
      <section id="practice" data-lesson-section hidden={active !== 6}>
        <div className="no">06 · ВЕЖБА</div><h2>Провери глагол biti</h2><Quiz />
        <LearningApp id="pdmogn67t26" title="Глагол TO BE на српском" description="Употреби глагол бити у правилном облику." />
      </section>
      <section id="phrases" data-lesson-section hidden={active !== 7}>
        <div className="no">07 · БИЋЕ ТИ КОРИСНО</div><h2>Фразе за час</h2>
        <div className="phrases"><article><h3>Извините…</h3><p>Извините, шта значи ова реч? <small>— слово</small><br />Шта ово значи? <small>— что это значит?</small><br />Како се пише…? Како се чита…?</p></article><article><h3>Објашњења</h3><p>Је л’ можете да поновите? <small>— повторить</small><br />Молим Вас, поновите, нисам разумео/разумела.<br />Не разумем…</p></article><article><h3>Како да кажем</h3><p>Нисам сигуран/сигурна. <small>— Я не уверен/а.</small><br />Професоре/Професорка…<br />Могу ли да Вас нешто питам?</p></article><article><h3>Је л’ говорите српски?</h3><p>Да, (по)мало. / Говорим (по)мало. / Причам (по)мало.<br />Разумем помало. / Знам нешто.</p></article></div>
      </section>
      <section id="homework" data-lesson-section hidden={active !== 8}>
        <div className="no">08 · ДОМАЋИ ЗАДАТАК</div><h2>Вежбе за код куће</h2>
        <LearningApp id="pvoby9i1k26" title="1. Нове речи" description="Понови и утврди нови вокабулар из лекције." />
        <LearningApp id="p6pbz143t26" title="2. Упиши глагол бити" description="Упиши ЈЕСАМ / БИТИ у правилном облику." />
        <article className="paper"><h3>Упражнение 1</h3><p>— Добар дан!<br />— ____________ Како се зовеш?<br />— Ја сам Милица. А ти?<br />— Ја сам Маја. Ја сам из Ниша. Одакле си ти?<br />— Ја сам из Суботице.<br />— Драго ми је.<br />— ______________________________.</p><h3>Упражнение 2</h3><p>Вставьте глагол бити: Ја ___ лекарка. Ти ___ учитељица. Он ___ бизнисмен. Она ___ програмерка. Ми ___ менаџери. Ви ___ политичари. Они ___ зубари. Оне ___ фризерке. Драган ___ ветеринар, Јелена ___ новинар. Џон ___ лекар.</p><h3>Упражнение 3</h3><p><b>а)</b> Ви ___ програмер? — Не, ја ___ менаџер. Програмер ___ у следећем кабинету. Ја ___ Мила, ваш нови правник. Драго ми ___. Ја ___ Стефан.<br /><br /><b>б)</b> Ја ___ ваша нова учитељица Ана. Ја ___ Милан. Ја ___ Љубица. Драго ми ___. Ви ___ из Београда? Да, ми ___ из Београда. Наши родитељи ___ из Русије, они ___ из Москве.</p></article>
      </section>
      <section id="recap" data-lesson-section hidden={active !== 9}>
        <div className="no">09 · ЗАВРШЕТАК</div><h2>Шта сада умем?</h2>
        <div className="checklist">{["Кажем своју професију.", "Препознајем мушки и женски род професија.", "Знам: сам, си, је, смо, сте, су.", "Питам: Је л’ говорите српски?", "Користим фразе за час."].map((x, i) => <label key={x}><input type="checkbox" checked={Boolean(checks[i])} onChange={event => {
          const next = [...checks]; next[i] = event.target.checked; setChecks(next); persist(done, next);
        }} />{x}</label>)}</div>
        <button className="finish" onClick={() => { setDone(true); persist(true, checks); }}>{done ? "Лекција је завршена ✓" : "Завершить урок"}</button>
      </section>
      <nav className="section-controls" aria-label="Переход между разделами"><button disabled={active === 0} onClick={() => openSection(active - 1)}>Назад</button><span>{active + 1} / {sections.length}</span><button disabled={active === sections.length - 1} onClick={() => openSection(active + 1)}>Далее</button></nav>
      <footer><b>TY SERB</b><span>Лекција 02 · Лидија Симић</span></footer>
    </div>
  </main>;
}
