"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Pause, Play, Volume2 } from "lucide-react";
import { cyrillicAlphabetImage, latinAlphabetImage } from "@/data/alphabet-images";

const KEY = "ty-serb:lesson-1-gamma:v1";
const sections = [
  "Сербский — это легко",
  "Вук Караджич",
  "Диалекты",
  "Два алфавита",
  "Приветствия",
  "Глагол BITI",
  "Рассказываю о себе",
  "Род существительных",
];

const letters = [
  ["Ј", "j", "јабука", "Й", "/audio/lesson-1/letters/j-jabuka.m4a"],
  ["Љ", "lj", "љубав", "ЛЬ", "/audio/lesson-1/letters/lj-ljubav.m4a"],
  ["Њ", "nj", "његов", "НЬ", "/audio/lesson-1/letters/nj-njegov.m4a"],
  ["Ћ", "ć", "ноћ", "мягкое ТЧ", "/audio/lesson-1/letters/c-noc.m4a"],
  ["Ђ", "đ", "Ђорђе", "мягкое ДЖ", "/audio/lesson-1/letters/dj-djordje.m4a"],
  ["Џ", "dž", "џем", "ДЖ", "/audio/lesson-1/letters/dz-dzem.m4a"],
];

const biti = [
  ["Ја", "САМ"], ["Ти", "СИ"], ["Он / Она / Оно", "ЈЕ"],
  ["Ми", "СМО"], ["Ви", "СТЕ"], ["Они / Оне / Она", "СУ"],
];

const people = [
  { name: "Лидија", text: "Ја сам Лидија. Имам двадесет и четири године. Студирам физику. Ја сам професорка српског језика и уметница. Ја сам из Београда, али живим у Русији.", audio: "/audio/lesson-1/10-lidija.m4a" },
  { name: "Ана", text: "Ја сам Ана. Имам двадесет година. Ја сам из Новог Сада. Студирам медицину и живим са сестром.", audio: "/audio/lesson-1/people/ana.m4a" },
  { name: "Марко", text: "Зовем се Марко. Имам двадесет осам година. Ја сам програмер. Радим од куће и живим у Београду.", audio: "/audio/lesson-1/people/marko.m4a" },
  { name: "Ирина", text: "Ја сам Ирина. Ја сам из Москве, али сада живим у Нишу. Учим српски и радим у кафићу.", audio: "/audio/lesson-1/people/irina.m4a" },
  { name: "Никола", text: "Зовем се Никола. Имам седамнаест година. Идем у школу. Волим математику, музику и спорт.", audio: "/audio/lesson-1/people/nikola.m4a" },
  { name: "Милица", text: "Ја сам Милица. Живим у Крагујевцу. Ја сам професорка. Радим у школи и волим свој посао.", audio: "/audio/lesson-1/people/milica.m4a" },
];

const media = {
  family: "https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:2000/https://cdn.gamma.app/cpl8q973cwg4z5j/de33d26bdd6e4e2ba4208ae569d9f0a7/original/blob.png",
  schoolDrawing: "https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:2000/https://cdn.gamma.app/cpl8q973cwg4z5j/dfcda8bdd6de47e6b14cc6d09ce0b872/original/blob.png",
  gymnasium: "https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:2000/https://cdn.gamma.app/cpl8q973cwg4z5j/d361e35835974b06b84ff5ed1d37ce67/original/blob.png",
  internet: "https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:2000/https://cdn.gamma.app/cpl8q973cwg4z5j/b7ccd8e5834a4bb8ad1d8ee9be08eaeb/original/blob.png",
  vuk: "https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:2000/https://cdn.gamma.app/cpl8q973cwg4z5j/a30a7c650b0943b9b080354f7596689a/original/blob.png",
  oldAlphabet: "https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:2000/https://cdn.gamma.app/cpl8q973cwg4z5j/9e27071e11c54a019c7671854e53c6da/original/blob.png",
  dialectMap: "https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:2000/https://cdn.gamma.app/cpl8q973cwg4z5j/4817125fac824dbda5e439ea6080ddc7/original/blob.png",
  cyrillic: cyrillicAlphabetImage,
  latin: latinAlphabetImage,
  comic: [
    "https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:2000/https://cdn.gamma.app/cpl8q973cwg4z5j/831866931ff04b729a674f6e555a1337/original/blob.png",
    "https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:2000/https://cdn.gamma.app/cpl8q973cwg4z5j/617423c4f3ae4d0f9ab93cf444cfc249/original/blob.png",
    "https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:2000/https://cdn.gamma.app/cpl8q973cwg4z5j/2fd8014b68ca4dd1b278b810b0d76db6/original/blob.png",
    "https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:2000/https://cdn.gamma.app/cpl8q973cwg4z5j/dd0a17cb95db4549b6de030b06d71be9/original/blob.png",
    "https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:2000/https://cdn.gamma.app/cpl8q973cwg4z5j/601184cd42be4ec89c20f1b2a7224442/original/blob.png",
    "https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:2000/https://cdn.gamma.app/cpl8q973cwg4z5j/101a9eb60a414f3197cc053c46a60696/original/blob.png",
    "https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:2000/https://cdn.gamma.app/cpl8q973cwg4z5j/a95b39778ac64ce9bfa5440ff2cc0ccf/original/blob.png",
  ],
};

const schoolWords = [
  ["📓", "свеска", "тетрадь"], ["🪑", "столица", "стул"],
  ["📚", "књига", "книга"], ["💻", "рачунар", "компьютер"],
  ["✏️", "оловка", "карандаш"], ["📱", "телефон", "телефон"],
  ["🔑", "кључ", "ключ"], ["🎒", "торба", "сумка"],
];

const studentExamples = [
  "Ја сам Кирил. Ја сам из Санкт-Петербурга. Моја девојка се зове Снежана. Она је исто из Санкт-Петербурга. Ја имам тридесет пет година.",
  "Ја сам Александар. Ја сам из Ижевска. Моја сестра се зове Ана. Она је исто из Ижевска. Ја имам двадесет осам година. Живим на Вождовцу!",
  "Ja sam Vasja. Ja sam iz Sankt-Peterburga. Ja imam osamnaest godina. Moja sestra se zove Olesja. Ona živi u Baru u Crnoj Gori.",
  "Ja sam Olesja. Ja sam iz Crne Gore. Ja imam dvadeset dve godine. Moj muž se zove Nikita, on je programer.",
  "Ja sam Irina. Ja sam iz Tule! Ja imam dvadeset i pet godina. Ja sam zoolog! Moja sestra se zove Saša! Ona živi u Tuli. Ona ima šestnaest godina. Ona ide u školu!",
  "Ja sam Ana. Ja sam iz Rusije. Moja sestra se zove Saša. Ona živi u Crnoj Gori. Imam dvadeset šest godina, a moja sestra ima dvadeset i tri godine.",
];

function Narration({ src, label, transcript, bonus = false }: { src: string; label: string; transcript: string; bonus?: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [speed, setSpeed] = useState<1 | 1.5>(1);
  const [showTranscript, setShowTranscript] = useState(false);

  const toggleSpeed = () => {
    const nextSpeed = speed === 1 ? 1.5 : 1;
    setSpeed(nextSpeed);
    if (audioRef.current) audioRef.current.playbackRate = nextSpeed;
  };

  return <div className={`mt-5 rounded-xl border-2 border-ink p-4 shadow-[3px_3px_0_#202124] ${bonus ? "bg-yellow-50" : "bg-blue-50"}`}>
    <p className="mb-3 flex items-center gap-2 font-black"><Volume2 size={20} aria-hidden /> Послушай объяснение · {label}</p>
    <audio ref={audioRef} controls preload="none" className="w-full" aria-label={label}>
      <source src={src} type="audio/mp4" />
      Ваш браузер не поддерживает аудио.
    </audio>
    <div className="mt-3 flex flex-wrap gap-2">
      <button type="button" onClick={toggleSpeed} aria-label={`Скорость воспроизведения ${speed}x`} className="focus-ring min-h-11 rounded-full border-2 border-ink bg-white px-4 font-black">{speed}× / {speed === 1 ? "1,5×" : "1×"}</button>
      <button type="button" onClick={() => setShowTranscript(value => !value)} aria-expanded={showTranscript} className="focus-ring min-h-11 rounded-full border-2 border-ink bg-white px-4 font-black">{showTranscript ? "Скрыть текст" : "Показать текст"}</button>
    </div>
    {showTranscript ? <div className="mt-3 rounded-lg border-2 border-ink/20 bg-white p-4 whitespace-pre-line"><p className="text-sm font-black uppercase tracking-[.12em] text-ink/60">Текст аудио</p><p className="mt-2">{transcript}</p></div> : null}
  </div>;
}

function PronunciationButton({ word, isPlaying, onToggle }: { word: string; isPlaying: boolean; onToggle: () => void }) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <span className="flex min-h-12 min-w-12 items-center justify-center rounded-full border-2 border-ink bg-serbian-blue text-white" aria-hidden>
        <Volume2 />
      </span>
      <button
        type="button"
        onClick={onToggle}
        aria-label={`${isPlaying ? "Приостановить" : "Прослушать"} ${word}`}
        className="focus-ring flex min-h-12 items-center gap-2 rounded-full border-2 border-ink bg-white px-3 font-black"
      >
        {isPlaying ? <><Pause size={18} aria-hidden /> Pause</> : <><Play size={18} aria-hidden /> Play</>}
      </button>
    </div>
  );
}

function LearningExercise({ title, appId }: { title: string; appId: string }) {
  const url = `https://learningapps.org/watch?v=${appId}`;
  return (
    <div className="mt-6 overflow-hidden rounded-xl border-2 border-ink bg-white shadow-[3px_3px_0_#202124]">
      <div className="border-b-2 border-ink bg-serbian-blue p-4 text-white">
        <p className="text-xl font-black">{title}</p>
      </div>
      <iframe
        src={url}
        title={title}
        loading="lazy"
        allowFullScreen
        className="h-[620px] w-full bg-white sm:h-[700px]"
      />
      <div className="border-t-2 border-ink p-3 text-center">
        <a href={url} target="_blank" rel="noreferrer" className="focus-ring inline-flex min-h-11 items-center rounded-full border-2 border-ink bg-white px-4 font-black text-serbian-blue">
          Открыть упражнение отдельно ↗
        </a>
      </div>
    </div>
  );
}

function Block({ number, title, children, active }: { number: number; title: string; children: React.ReactNode; active: boolean }) {
  if (!active) return null;
  return <section id={`gamma-step-${number}`} className="scroll-mt-24 border-t-2 border-ink py-10">
    <p className="font-black uppercase tracking-[.14em] text-serbian-red">{number + 1}. {title}</p>
    {children}
  </section>;
}

export default function LessonOneGammaExperience() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [cognateAnswers, setCognateAnswers] = useState<Record<string, string>>({});
  const [letterAnswers, setLetterAnswers] = useState<Record<string, string>>({});
  const [bitiAnswers, setBitiAnswers] = useState<Record<string, string>>({});
  const [schoolAnswers, setSchoolAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [done, setDone] = useState(false);
  const inlineAudioRef = useRef<HTMLAudioElement | null>(null);
  const [activeClip, setActiveClip] = useState<string | null>(null);
  const [clipPlaying, setClipPlaying] = useState(false);

  useEffect(() => {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || "{}");
      setCompleted(value.completed || []);
      setDone(Boolean(value.done));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify({ completed, done }));
  }, [completed, done]);

  useEffect(() => {
    if (currentStep === 0) return;
    requestAnimationFrame(() => document.getElementById(`gamma-step-${currentStep}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, [currentStep]);

  useEffect(() => () => inlineAudioRef.current?.pause(), []);

  const toggleClip = (src: string) => {
    const current = inlineAudioRef.current;
    if (activeClip === src && current) {
      if (current.paused) void current.play();
      else current.pause();
      return;
    }

    current?.pause();
    const audio = new Audio(src);
    inlineAudioRef.current = audio;
    setActiveClip(src);
    audio.onplay = () => setClipPlaying(true);
    audio.onpause = () => setClipPlaying(false);
    audio.onended = () => setClipPlaying(false);
    void audio.play();
  };

  const scrollWithinProfile = (id: string) => {
    inlineAudioRef.current?.pause();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const results = [
    ["škola", "gimnazija", "internet"].every(word => cognateAnswers[word] === "похоже на русское"),
    [["Й","Ј"],["ЛЬ","Љ"],["НЬ","Њ"],["ДЖ","Џ"]].every(([sound, answer]) => letterAnswers[sound] === answer),
    true,
    true,
    true,
    [["Ја","САМ"],["Ти","СИ"],["Она","ЈЕ"],["Ми","СМО"]].every(([pronoun, answer]) => bitiAnswers[pronoun] === answer),
    schoolWords.every(([, word]) => schoolAnswers[word] === word),
    true,
  ];

  const finish = (index: number) => {
    setChecked(old => ({ ...old, [index]: true }));
    setCompleted(old => results[index] && !old.includes(index) ? [...old, index] : old.filter(item => item !== index));
  };

  const Card = ({ children }: { children: React.ReactNode }) => <div className="rounded-xl border-2 border-ink bg-white p-5 shadow-[3px_3px_0_#202124]">{children}</div>;
  const Next = ({ index }: { index: number }) => <div className="mt-7"><div className={`grid gap-3 ${index > 0 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}><button onClick={() => finish(index)} className="focus-ring min-h-12 rounded-xl border-2 border-ink bg-serbian-red px-5 py-3 font-black text-white shadow-[3px_3px_0_#202124]">Проверить</button>{index > 0 ? <button onClick={() => setCurrentStep(index - 1)} className="focus-ring min-h-12 rounded-xl border-2 border-ink bg-white px-5 py-3 font-black shadow-[3px_3px_0_#202124]">← Вернуться</button> : null}<button onClick={() => setCurrentStep(index + 1)} className="focus-ring min-h-12 rounded-xl border-2 border-ink bg-serbian-blue px-5 py-3 font-black text-white shadow-[3px_3px_0_#202124]">Дальше →</button></div>{checked[index] && <p role="status" aria-live="polite" className={`mt-3 rounded-xl border-2 border-ink p-3 text-center font-black ${results[index] ? "bg-mint/50" : "bg-red-100 text-red-900"}`}>{results[index] ? "Всё правильно ✓ Раздел пройден." : "Есть ошибка. Красным отмечено, что нужно исправить — затем проверь ещё раз."}</p>}</div>;
  const SchoolNext = () => <div className="mt-7"><div className="grid gap-3 sm:grid-cols-2"><button onClick={() => finish(6)} className="focus-ring min-h-12 rounded-xl border-2 border-ink bg-serbian-red px-5 py-3 font-black text-white shadow-[3px_3px_0_#202124]">Проверить</button><button onClick={() => scrollWithinProfile("profile-comic")} className="focus-ring min-h-12 rounded-xl border-2 border-ink bg-serbian-blue px-5 py-3 font-black text-white shadow-[3px_3px_0_#202124]">Дальше: комикс →</button></div>{checked[6] && <p role="status" aria-live="polite" className={`mt-3 rounded-xl border-2 border-ink p-3 text-center font-black ${results[6] ? "bg-mint/50" : "bg-red-100 text-red-900"}`}>{results[6] ? "Всё правильно ✓ Раздел пройден." : "Есть ошибка. Исправь ответы и проверь ещё раз."}</p>}</div>;

  const answerClass = (selected: boolean, correct: boolean, section: number) => selected
    ? checked[section] ? (correct ? "border-green-700 bg-green-200 text-green-950" : "border-red-700 bg-red-100 text-red-900") : "bg-blue-50"
    : "bg-white";

  return <div className="bg-[#fffdf8] px-4 py-8 sm:px-6">
    <div className="mx-auto max-w-[640px] text-[17px] leading-7 text-ink">
      <div className="sticky top-0 z-20 -mx-4 border-b-2 border-ink bg-[#fffdf8]/95 px-4 py-3 backdrop-blur">
        <div className="flex justify-between gap-3 text-sm font-black"><span>Урок 1 · по структуре лекции</span><span>{completed.length}/8</span></div>
        <div className="mt-2 grid grid-cols-8 gap-1">{sections.map((name, i) => <div key={name} title={name} className={`h-2 rounded-full border border-ink ${completed.includes(i) ? "bg-serbian-red" : "bg-white"}`} />)}</div>
      </div>

      <header className="py-10">
        <p className="font-black uppercase tracking-[.15em] text-serbian-red">Учимо српски са Лидијом Симић!</p>
        <h1 className="mt-3 text-4xl font-black leading-tight">Srpski nije strašan, srpski je lak!</h1>
        <p className="mt-4 text-xl">Сербский — это не страшно, это легко. Начнём с того, что уже понятно без перевода.</p>
        <Narration src="/audio/lesson-1/02-introduction.m4a" label="Вступление к уроку" transcript="Добро пожаловать на первый урок. Сербский — это не страшно, сербский — это легко. Начнём с того, что уже можно понять без перевода." />
      </header>

      <Block number={0} title="Сербский — это легко" active={currentStep === 0}>
        <h2 className="mt-2 text-3xl font-black">Посмотри, как похоже</h2>
        <img src={media.family} alt="Мама и папа — mama i tata" className="mt-5 aspect-[16/9] w-full rounded-xl border-2 border-ink object-cover" />
        <Card><p className="text-3xl font-black">mama i tata</p><p>мама и папа</p></Card>
        <p className="mt-5">Многие семейные слова — когнаты: они похожи по звучанию и значению в славянских языках.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">{[["mama","мама"],["tata","папа"],["brat","брат"],["sestra","сестра"],["baka","бабушка"],["deda","дедушка"]].map(([sr,ru]) => <Card key={sr}><p><strong>{sr}</strong><br />{ru}</p></Card>)}</div>
        <h3 className="mt-8 text-xl font-black">Быстрая проверка</h3>
        {[
          ["škola","школа",media.schoolDrawing],
          ["gimnazija","гимназия",media.gymnasium],
          ["internet","интернет",media.internet],
        ].map(([word,ru,src]) => <div key={word} className="mt-4 overflow-hidden rounded-xl border-2 border-ink bg-white shadow-[3px_3px_0_#202124]"><img src={src} alt={`${word} — ${ru}`} className="aspect-[16/8] w-full object-cover" /><div className="p-4"><p className="text-2xl font-black">{word}</p><p>{ru}</p><div className="mt-3 grid grid-cols-2 gap-2">{["похоже на русское","совсем незнакомо"].map(answer => <button key={answer} onClick={() => { setCognateAnswers({...cognateAnswers,[word]:answer}); setChecked(old => ({...old, 0:false})); }} className={`min-h-12 rounded-xl border-2 border-ink px-3 ${answerClass(cognateAnswers[word]===answer, answer==="похоже на русское", 0)}`}>{answer}</button>)}</div>{checked[0] && cognateAnswers[word] && <p className={`mt-3 rounded-lg p-3 text-sm ${cognateAnswers[word] === "похоже на русское" ? "bg-mint/30" : "bg-red-50"}`}><strong>{cognateAnswers[word] === "похоже на русское" ? "Верно:" : "Подсказка:"}</strong> {word} и «{ru}» — родственные слова: форма и значение легко узнаются.</p>}</div></div>)}
        <p className="mt-6 rounded-xl bg-mint/30 p-4 font-black">Srpski je prijateljski jezik 😉</p><Next index={0} />
      </Block>

      <Block number={1} title="Вук Караджич и фонетический принцип" active={currentStep === 1}>
        <h2 className="mt-2 text-3xl font-black">Пиши као што говориш</h2>
        <Narration src="/audio/lesson-1/03-bonus-history.m4a" label="Бонус: история сербского языка и как он сформировался" transcript="Дополнительная история о развитии сербского языка, его связи с другими славянскими языками и о том, как сформировалась современная литературная норма." bonus />
        <Narration src="/audio/lesson-1/04-vuk-karadzic.m4a" label="Вук Караджич и фонетический принцип" transcript="Вук Стефановић Караџић не создал сербский язык: сербы уже говорили на нём. Он реформировал литературный язык и письмо, приблизив их к живой народной речи. Главный принцип: ‘Пиши као што говориш, читај као што је написано’ — пиши, как говоришь, и читай, как написано." />
        <div className="mt-5 grid gap-4 sm:grid-cols-[180px_1fr] sm:items-center"><img src={media.vuk} alt="Портрет Вука Стефановича Караджича" className="w-full rounded-xl border-2 border-ink" /><div><p className="text-xl font-black">Пиши као што говориш, читај као што је написано!</p><p className="mt-2">Вук Стефановић Караџић не «создал сербский язык»: сербы уже говорили на нём. Он реформировал литературный язык и письмо, приблизив их к живой народной речи.</p></div></div>
        <div className="mt-5 rounded-xl border-2 border-ink bg-mint/25 p-5"><p className="font-black">Что именно изменилось?</p><ol className="mt-2 list-decimal space-y-2 pl-6"><li>За основу литературного языка взята живая народная речь.</li><li>Убраны лишние старые буквы, которые не соответствовали отдельным звукам.</li><li>Добавлены или закреплены буквы для сербских звуков: Ј, Љ, Њ, Ћ, Ђ, Џ.</li><li>Получился принцип «один звук — одна буква».</li></ol></div>
        <img src={media.oldAlphabet} alt="Буквы старой кириллицы до реформы Вука Караджича" className="mt-5 w-full rounded-xl border-2 border-ink bg-white object-contain" />
        <div className="mt-6 space-y-3">{letters.map(([cy,lat,example,sound,audioSrc]) => <Card key={cy}><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-2xl font-black">{cy} / {lat}</p><p>{example} · слышим {sound}</p></div><PronunciationButton word={example} isPlaying={activeClip === audioSrc && clipPlaying} onToggle={() => toggleClip(audioSrc)} /></div></Card>)}</div>
        <h3 className="mt-8 text-xl font-black">Соедини звук и букву</h3>
        {[["Й","Ј"],["ЛЬ","Љ"],["НЬ","Њ"],["ДЖ","Џ"]].map(([sound,correct]) => <div key={sound} className="mt-4"><p className="font-black">Слышим {sound}</p><div className="mt-2 flex gap-2">{["Ј","Љ","Њ","Џ"].map(option => <button key={option} onClick={() => { setLetterAnswers({...letterAnswers,[sound]:option}); setChecked(old => ({...old, 1:false})); }} className={`min-h-12 flex-1 rounded-xl border-2 border-ink font-black ${answerClass(letterAnswers[sound]===option, option===correct, 1)}`}>{option}</button>)}</div>{checked[1] && letterAnswers[sound] && <p className={`mt-2 rounded-lg p-3 text-sm ${letterAnswers[sound] === correct ? "bg-mint/30" : "bg-red-50"}`}>Звук {sound} записывается буквой <strong>{correct}</strong>.</p>}</div>)}
        <Next index={1} />
      </Block>

      <Block number={2} title="Диалекты сербского языка" active={currentStep === 2}>
        <h2 className="mt-2 text-3xl font-black">млеко, млијеко или млико?</h2>
        <Narration src="/audio/lesson-1/05-dialects.m4a" label="Диалекты сербского языка" transcript="Млеко, млијеко и млико — это разные рефлексы древнего звука ѣ, ять. В живой речи он произносился по-разному. В Сербии чаще используется екавица: млеко, дете, лепо. Јекавица распространена в Черногории, Боснии и части региона: млијеко, дијете. Икавица встречается в отдельных региональных говорах: млико." />
        <p className="mt-4">Это разные рефлексы древнего ѣ (ять). В живой речи он произносился по-разному, поэтому письмо стало следовать произношению.</p>
        <img src={media.dialectMap} alt="Карта сербских штокавских диалектов в Сербии, Боснии и Герцеговине, Черногории и Хорватии" className="mt-5 w-full rounded-xl border-2 border-ink" />
        <div className="mt-5 space-y-3"><Card><strong>Екавица</strong><p>млеко, дете · преобладает в Сербии</p></Card><Card><strong>Јекавица</strong><p>млијеко, дијете · Черногория, Босния и часть региона</p></Card><Card><strong>Икавица</strong><p>млико · отдельные региональные говоры</p></Card></div>
        <p className="mt-5 rounded-xl border-2 border-ink bg-white p-4"><strong>Разговорное «бре»</strong> добавляет эмоцию: удивление, нетерпение, радость или раздражение. <em>Како си, бре?</em></p>
        <p className="mt-4 rounded-xl bg-blue-50 p-4"><strong>Главное:</strong> для начала выбираем екавицу: <em>млеко, дете, лепо</em>. Другие формы не являются ошибкой — они подсказывают регион говорящего.</p>
        <Next index={2} />
      </Block>

      <Block number={3} title="Ћирилица vs. латиница" active={currentStep === 3}>
        <h2 className="mt-2 text-3xl font-black">Один язык — два письма</h2>
        <p className="mt-4">Сербский использует кириллицу (азбука) и латиницу (абецеда). Умение узнавать обе системы понадобится с первого дня.</p>
        <Narration src="/audio/lesson-1/06-azbuka-abeceda.m4a" label="Азбука и абецеда" transcript="Сербский язык использует два равноправных письма: кириллицу — ћирилицу или азбуку — и латиницу, которую называют abeceda. Нужно постепенно научиться узнавать обе системы." />
        <div className="mt-5 space-y-6"><figure><img src={media.cyrillic} alt="Полная иллюстрированная сербская кириллица — азбука" className="w-full rounded-xl border-2 border-ink bg-white" /><figcaption className="mt-2 text-center font-black">Ћирилица · азбука</figcaption></figure><figure><img src={media.latin} alt="Полная иллюстрированная сербская латиница — абецеда" className="w-full rounded-xl border-2 border-ink bg-white" /><figcaption className="mt-2 text-center font-black">Latinica · abeceda</figcaption></figure></div>
        <Narration src="/audio/lesson-1/07-vazno.m4a" label="Важно" transcript="Пишем как говорим, читаем как написано. Ударение не падает на последний слог. Не бойся вариантов произношения: диалекты — часть живого языка." />
        <div className="mt-6 rounded-xl border-2 border-ink bg-mint/25 p-5"><p className="font-black">Важные правила из лекции</p><ul className="mt-2 list-disc pl-6"><li>Пишем как говорим, читаем как написано.</li><li>Ударение не падает на последний слог.</li><li>Не бойся вариантов произношения: диалекты — часть живого языка.</li></ul></div>
        <Next index={3} />
      </Block>

      <Block number={4} title="Поздрави и представљање" active={currentStep === 4}>
        <h2 className="mt-2 text-3xl font-black">Встреча, знакомство и прощание</h2>
        <Narration src="/audio/lesson-1/08-greetings.m4a" label="Приветствия и знакомство" transcript={'Сусрет: Добар дан! Добро јутро! Добро вече! Здраво! Ћао!\n\nПредстављање: Ја се зовем… Зовем се… Ја сам… Драго ми је!\n\nРастанак: Довиђења. Пријатно! Видимо се! Ћао!'} />
        {[["Сусрет","Добар дан! Добро јутро! Добро вече! Здраво! Ћао!"],["Представљање","Ја се зовем… Зовем се… Ја сам… Драго ми је!"],["Растанак","Довиђења. Пријатно! Видимо се! Ћао!"]].map(([title,text]) => <div className="mt-4" key={title}><Card><p className="text-xl font-black">{title}</p><p>{text}</p></Card></div>)}
        <Card><p className="font-black">Пример дијалога</p><p className="mt-2">— Како се зовеш?<br />— Ја се зовем Света. А ти?<br />— Зовем се Сева. Драго ми је!</p></Card>
        <p className="mt-4 rounded-xl bg-blue-50 p-4"><strong>Как строится знакомство:</strong> приветствие → имя → вопрос <em>А ти?</em> → фраза <em>Драго ми је</em>. «Здраво» нейтрально, «ћао» более неформально.</p>
        <Next index={4} />
      </Block>

      <Block number={5} title="Глагол BITI / JESAM" active={currentStep === 5}>
        <h2 className="mt-2 text-3xl font-black">Я есть, ты есть…</h2>
        <Narration src="/audio/lesson-1/09-biti.m4a" label="Глагол BITI / JESAM" transcript={'Ја сам. Ти си. Он, она или оно је. Ми смо. Ви сте. Они, оне или она су.\n\nВ настоящем времени сербский не опускает глагол-связку: Ја сам студент. Она је професорка.'} />
        <div className="mt-5 grid grid-cols-2 gap-3">{biti.map(([pronoun,form]) => <Card key={pronoun}><p>{pronoun}</p><p className="text-2xl font-black">{form}</p></Card>)}</div>
        <h3 className="mt-8 text-xl font-black">Выбери форму</h3>
        {[["Ја","САМ"],["Ти","СИ"],["Она","ЈЕ"],["Ми","СМО"]].map(([pronoun,correct]) => <div className="mt-4" key={pronoun}><p className="font-black">{pronoun} ___</p><div className="mt-2 grid grid-cols-3 gap-2">{["САМ","СИ","ЈЕ","СМО","СТЕ","СУ"].map(form => <button key={form} onClick={() => { setBitiAnswers({...bitiAnswers,[pronoun]:form}); setChecked(old => ({...old, 5:false})); }} className={`min-h-12 rounded-xl border-2 border-ink font-black ${answerClass(bitiAnswers[pronoun]===form, form===correct, 5)}`}>{form}</button>)}</div>{checked[5] && bitiAnswers[pronoun] && <p className={`mt-2 rounded-lg p-3 text-sm ${bitiAnswers[pronoun] === correct ? "bg-mint/30" : "bg-red-50"}`}><strong>{pronoun} {correct}</strong>. Форма <em>biti</em> меняется вместе с лицом: её нужно согласовать с местоимением.</p>}</div>)}
        <p className="mt-5 rounded-xl bg-blue-50 p-4"><strong>Важно:</strong> в настоящем времени сербский не опускает связку: <em>Ја сам студент</em>, <em>Она је професорка</em>. По-русски мы говорим «Я студент», но по-сербски форма <em>сам/је</em> обязательна.</p>
        <Next index={5} />
      </Block>

      <Block number={6} title="Рассказываю о себе" active={currentStep === 6}>
        <h2 className="mt-2 text-3xl font-black">От имени к профессии</h2>
        <p className="mt-3">Прочитай все шесть текстов. Заметь повторяющиеся конструкции: имя, возраст, город, учёба или работа.</p>
        <div className="mt-5 space-y-4">{people.map((person, index) => <Card key={person.name}><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><p className="text-xl font-black">{index + 1}. {person.name}</p><p className="mt-2">{person.text}</p></div><PronunciationButton word={`текст о ${person.name}`} isPlaying={activeClip === person.audio && clipPlaying} onToggle={() => toggleClip(person.audio)} /></div></Card>)}</div>
        <div className="mt-5 rounded-xl border-2 border-ink bg-blue-50 p-5"><p className="font-black">Как читать эти тексты</p><p className="mt-2"><em>Ја сам / Зовем се</em> — имя; <em>Имам … година</em> — возраст; <em>Ја сам из… / Живим у…</em> — происхождение и место жительства; <em>Студирам / Радим / Идем у школу</em> — занятие.</p></div>
        <h3 className="mt-7 text-xl font-black">Скажи о себе вслух</h3><p>Ja sam ____. Ja sam iz ____. Imam ____ godina. Ja sam ____.</p>
        <p className="mt-3 text-sm text-ink/65">Микрофон не нужен: произнеси четыре фразы, затем повтори без шаблона.</p>
        <button onClick={() => scrollWithinProfile("profile-school")} className="focus-ring mt-8 min-h-12 w-full rounded-xl border-2 border-ink bg-serbian-blue px-5 py-3 font-black text-white shadow-[3px_3px_0_#202124]">Дальше: школьная лексика →</button>

        <h2 id="profile-school" className="mt-10 scroll-mt-24 text-3xl font-black">Школьная лексика</h2>
        <p className="mt-3">Рассмотри иллюстрации и прочитай все слова вслух.</p>
        <Narration src="/audio/lesson-1/11-school-vocabulary.m4a" label="Школьная лексика" transcript="Школьная лексика: свеска — тетрадь, столица — стул, књига — книга, рачунар — компьютер, оловка — карандаш, телефон — телефон, кључ — ключ, торба — сумка." />
        <img
          src="/images/skolnaya-leksika.png"
          alt="Школьная лексика на сербском языке: 16 иллюстрированных карточек"
          className="mt-4 w-full rounded-xl border-2 border-ink bg-white"
        />

        <h3 className="mt-8 text-2xl font-black">Соедини картинку и слово</h3>
        <p className="mt-2">Для каждого предмета выбери сербское слово.</p>
        <div className="mt-5 space-y-5">{schoolWords.map(([emoji,word,ru], wordIndex) => { const options = wordIndex < 4 ? schoolWords.slice(0,4) : schoolWords.slice(4); return <div key={word} className="rounded-xl border-2 border-ink bg-white p-4"><p className="text-center"><span className="text-5xl" role="img" aria-label={ru}>{emoji}</span><br /><strong>{ru}</strong></p><div className="mt-3 grid grid-cols-2 gap-2">{options.map(([,option])=><button key={option} onClick={()=>{ setSchoolAnswers({...schoolAnswers,[word]:option}); setChecked(old => ({...old, 6:false})); }} className={`min-h-12 rounded-xl border-2 border-ink px-2 ${answerClass(schoolAnswers[word]===option, option===word, 6)}`}>{option}</button>)}</div>{checked[6] && schoolAnswers[word] && <p className={`mt-3 rounded-lg p-3 text-sm ${schoolAnswers[word] === word ? "bg-mint/30" : "bg-red-50"}`}>{schoolAnswers[word] === word ? "Верно" : "Правильный ответ"}: <strong>{word}</strong> — {ru}.</p>}</div>; })}</div>
        <SchoolNext />

        <h2 id="profile-comic" className="mt-10 scroll-mt-24 text-3xl font-black">Полина и Хари Потер у школи</h2>
        <p className="mt-3">Прочитай комикс по порядку. В нём повторяются слова <strong>школа, књига, торба, предмет</strong> и фразы знакомства.</p>
        <Narration src="/audio/lesson-1/12-comic.m4a" label="Комикс: Полина и Хари Потер у школи" transcript={'Полина: „Ја сам Полина и ја сам у школи! Али где је моја књига?“\nХари: „Здраво! Ја се зовем Хари! А ти?“\nПолина: „Здраво, Хари. Ја сам Полина. Не могу да нађем своју књигу…“\nХари: „Абракадабра!“\nХари: „Мислим да то није твоја књига… Извини.“\nПолина: „Ево је моја књига! Хвала ти, Хари!“\nХари: „Нема на чему! Који је твој омиљени предмет?“\nПолина: „Мој омиљени предмет је математика, а твој?“\nХари: „Магија!“'} />
        <div className="mt-5 space-y-4">{media.comic.map((src,i)=><figure key={src}><img src={src} alt={["Полина в школе не может найти книгу","Полина знакомится с Хари","Хари колдует и из сумки появляется лягушка","Хари ошибся: книга падает ему на голову","Полина получает свою книгу и благодарит Хари","Полина и Хари говорят о любимых школьных предметах","Хари отвечает: магия"][i]} className="w-full rounded-xl border-2 border-ink bg-white" /><figcaption className="mt-2 text-sm text-ink/65">Кадр {i+1} из 7</figcaption></figure>)}</div>
        <div className="mt-5 rounded-xl border-2 border-ink bg-white p-5"><p className="font-black">Текст комикса</p><p className="mt-2">Полина: „Ја сам Полина и ја сам у школи! Али где је моја књига?“<br />Полина: „Здраво, Хари. Ја сам Полина. Не могу да нађем своју књигу…“<br />Хари: „Здраво! Ја се зовем Хари! А ти?“<br />Хари: „Абракадабра!“<br />Хари: „Мислим да то није твоја књига… Извини.“<br />Полина: „Ево је моја књига! Хвала ти, Хари!“<br />Полина: „Мој омиљени предмет је математика, а твој?“<br />Хари: „Нема на чему! Који је твој омиљени предмет? Магија!“</p></div>
        <Next index={6} />
      </Block>

      <Block number={7} title="Род именица у једнини" active={currentStep === 7}>
        <h2 className="mt-2 text-3xl font-black">Род существительных</h2>
        <Narration src="/audio/lesson-1/13-gender.m4a" label="Род существительных" transcript="В сербском языке существительные имеют мужской, женский или средний род. Мужской род обычно заканчивается на согласную, но встречаются слова на -о и -а. Женский род обычно заканчивается на -а, однако некоторые слова заканчиваются на согласную или -о. Средний род чаще всего имеет окончания -о и -е." />
        <img src="/images/rod-imenica.png" alt="Инфографика: мужской, женский и средний род существительных в единственном числе" className="mt-6 w-full rounded-xl border-2 border-ink bg-white" />
        <LearningExercise title="Упражнение: род существительных" appId="pam6kysj526" />
        <Next index={7} />
      </Block>

      {currentStep === 8 ? <section id="gamma-step-8" className="scroll-mt-24 border-t-2 border-ink py-10">
        <p className="font-black uppercase tracking-[.14em] text-serbian-red">Домашний задание</p>
        <h2 className="mt-2 text-3xl font-black">Закрепи урок</h2>
        <Card><ol className="list-decimal space-y-3 pl-6"><li><strong>Новые слова:</strong> выпиши слова, которые хочешь использовать.</li><li><strong>Напиши короткий текст о себе:</strong> имя, город, возраст, профессия или учёба, один близкий человек.</li><li><strong>Прочитай текст вслух</strong> сначала с подсказкой, затем без неё.</li></ol></Card>
        <div className="mt-7">
          <h3 className="text-2xl font-black">Примеры текстов других учеников</h3>
          <p className="mt-2">Можно писать кириллицей или латиницей. Используй примеры как опору, но расскажи именно о себе.</p>
          <div className="mt-4 space-y-4">{studentExamples.map((example, index) => <Card key={example}><p className="mb-2 font-black text-serbian-blue">Пример {index + 1}</p><p>{example}</p></Card>)}</div>
        </div>
        <LearningExercise title="Повторение: новые слова урока" appId="po4gcggtv26" />
        <button onClick={() => setCurrentStep(7)} className="focus-ring mt-7 min-h-12 w-full rounded-xl border-2 border-ink bg-white px-5 py-3 font-black shadow-[3px_3px_0_#202124]">← Вернуться к предыдущему разделу</button>
        <button onClick={() => setDone(true)} className="focus-ring mt-7 min-h-12 w-full rounded-xl border-2 border-ink bg-serbian-red px-5 py-3 font-black text-white shadow-[3px_3px_0_#202124]">Завершить урок</button>
        {done && <div className="mt-5 rounded-xl border-2 border-ink bg-mint/40 p-6 text-center"><Check className="mx-auto" size={40} /><h3 className="mt-2 text-3xl font-black">Први час је готов!</h3><p>Структура лекции пройдена полностью. Сачувај текст о себи — он понадобится дальше.</p></div>}
      </section> : null}
    </div>
  </div>;
}
