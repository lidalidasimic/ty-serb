"use client";

import { useMemo, useState } from "react";

const pairs = [
  ["veliki grad", "большой город"],
  ["samo", "всего лишь"],
  ["konobarica", "официантка"],
  ["kuvarica", "повариха"],
  ["želeti, želim", "хотеть"],
  ["treba", "надо"],
  ["baš", "очень"],
  ["morati, moram", "должен / должна"],
  ["pametna", "умная"],
];

const forms = ["сам", "си", "је", "смо", "сте", "су"];
const questions = [
  ["Ја ___ лекарка.", "сам"],
  ["Ти ___ учитељица.", "си"],
  ["Он ___ бизнисмен.", "је"],
  ["Ми ___ менаџери.", "смо"],
  ["Ви ___ из Београда?", "сте"],
  ["Оне ___ ученице.", "су"],
];

export default function LessonTwoPractice() {
  const [selectedWord, setSelectedWord] = useState<number | null>(null);
  const [solved, setSolved] = useState<number[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const translations = useMemo(
    () => pairs.map((pair, index) => ({ text: pair[1], index })).reverse(),
    [],
  );

  function chooseTranslation(index: number) {
    if (selectedWord === null) return;
    if (selectedWord === index) {
      setSolved((current) => current.includes(index) ? current : [...current, index]);
    }
    setSelectedWord(null);
  }

  return (
    <section className="bg-[#f8f1e7] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="border-2 border-ink bg-white p-5 shadow-comic sm:p-8">
          <p className="font-black uppercase tracking-[0.18em] text-serbian-blue">лексика</p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">Непознате речи</h2>
          <p className="mt-3 text-ink/70">Нажми сначала на слово по-сербски, затем на его перевод.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              {pairs.map(([word], index) => (
                <button key={word} type="button" disabled={solved.includes(index)} onClick={() => setSelectedWord(index)} className={`w-full border-2 p-3 text-left font-black transition ${solved.includes(index) ? "border-serbian-blue bg-serbian-blue text-white" : selectedWord === index ? "border-serbian-red bg-serbian-red text-white" : "border-ink bg-white hover:-translate-y-0.5"}`}>
                  {word}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {translations.map(({ text, index }) => (
                <button key={text} type="button" disabled={solved.includes(index)} onClick={() => chooseTranslation(index)} className={`w-full border-2 p-3 text-left font-bold transition ${solved.includes(index) ? "border-serbian-blue bg-serbian-blue text-white" : "border-ink bg-white hover:-translate-y-0.5"}`}>
                  {text}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-4 text-sm font-bold text-serbian-blue" aria-live="polite">{solved.length === pairs.length ? "Браво! Все слова соединены." : `Готово: ${solved.length}/${pairs.length}`}</p>
        </div>

        <div className="border-2 border-ink bg-white shadow-comic">
          <div className="border-b-2 border-ink p-5 sm:p-8"><p className="font-black uppercase tracking-[0.18em] text-serbian-blue">граматика</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Личные местоимения — <span className="text-serbian-red">nominativ</span></h2><p className="mt-3 text-lg font-bold text-serbian-blue">Кто? Что?</p></div>
          <div className="grid sm:grid-cols-2">
            <div className="border-b-2 border-ink p-5 sm:border-b-0 sm:border-r-2 sm:p-8"><p className="font-black uppercase tracking-[0.14em]">Singular / Jednina</p><div className="mt-6 space-y-5 text-4xl font-black"><div>ја<span className="ml-3 text-base font-normal text-ink/55">я</span></div><div>ти<span className="ml-3 text-base font-normal text-ink/55">ты</span></div><div className="leading-tight">он<br/>она<br/>оно</div></div><p className="mt-5 text-ink/55">он / она / оно</p></div>
            <div className="p-5 sm:p-8"><p className="font-black uppercase tracking-[0.14em] text-serbian-blue">Plural / Množina</p><div className="mt-6 space-y-5 text-4xl font-black text-serbian-blue"><div>ми<span className="ml-3 text-base font-normal text-ink/55">мы</span></div><div>ви / Ви<span className="ml-3 text-base font-normal text-serbian-red">Вы — вежливая форма</span></div><div className="leading-tight">они<br/>оне<br/>она</div></div><p className="mt-5 text-serbian-red">они — м. / ж. / ср. род</p></div>
          </div>
          <div className="border-t-2 border-ink p-5 sm:p-8"><p className="font-black uppercase tracking-[0.18em] text-serbian-blue">примеры</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="border-2 border-ink p-4 text-xl font-black"><span className="text-serbian-blue">Оне</span> <span className="text-serbian-red">су</span> ученице.<p className="mt-2 text-base font-normal text-ink/55">Они ученицы.</p></div><div className="border-2 border-ink p-4 text-xl font-black">Два места <span className="text-serbian-red">су</span> за <span className="text-serbian-blue">вас</span>.<p className="mt-2 text-base font-normal text-ink/55">Два места для вас.</p></div></div><p className="mt-5 text-sm"><span className="font-black text-serbian-red">■</span> форма глагола biti <span className="ml-5 font-black text-serbian-blue">■</span> местоимение</p></div>
        </div>

        <div className="border-2 border-ink bg-white p-5 shadow-comic sm:p-8">
          <p className="font-black uppercase tracking-[0.18em] text-serbian-red">вежба</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Выбери форму глагола biti</h2><p className="mt-3 text-ink/70">Нажми на подходящий вариант — ничего печатать не нужно.</p>
          <div className="mt-6 space-y-4">{questions.map(([question, correct], index) => <div key={question} className="border-2 border-ink p-4"><p className="font-black">{index + 1}. {question}</p><div className="mt-3 flex flex-wrap gap-2">{forms.map((form) => <button key={form} type="button" onClick={() => { setAnswers({ ...answers, [index]: form }); setChecked(false); }} className={`border-2 px-4 py-2 font-black ${answers[index] === form ? "border-serbian-red bg-serbian-red text-white" : "border-ink bg-white"}`}>{form}</button>)}</div>{checked && answers[index] !== correct ? <p className="mt-2 text-sm font-bold text-serbian-red">Правильно: {correct}</p> : null}</div>)}</div>
          <button type="button" onClick={() => setChecked(true)} className="mt-6 border-2 border-ink bg-serbian-blue px-5 py-3 font-black text-white shadow-[3px_3px_0_#202124]">Проверить</button>{checked ? <p className="mt-4 font-black">Результат: {questions.filter(([, correct], index) => answers[index] === correct).length}/{questions.length}</p> : null}
        </div>
      </div>
    </section>
  );
}
