"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Feedback, Fireworks } from "./lesson-tools";

const steps = [
  { id: "intro", title: "Введение", audio: true, task: false, check: false },
  { id: "opening", title: "Молим или Молим?", audio: true, task: false, check: false },
  { id: "questions", title: "Питања", audio: true, task: true, check: true },
  { id: "molim", title: "Молим?", audio: true, task: true, check: true },
  { id: "practice", title: "Вежбање", audio: true, task: true, check: true },
  { id: "comic", title: "Битка за Омск", audio: true, task: false, check: false },
  { id: "learning", title: "LearningApps", audio: true, task: true, check: false },
  { id: "homework", title: "Домаћи", audio: false, task: true, check: false },
];
type Assessment = { understood?: string; listened?: string; task?: string };
type Progress = { active: number; unlocked: number; completed: string[]; answers: Record<string, Assessment>; finished: boolean };
const initial: Progress = { active: 0, unlocked: 0, completed: [], answers: {}, finished: false };
const key = "ty-serb-04:steps-v1";
const Flow = createContext<{
  progress: Progress; ready: boolean; jump: (index: number) => void;
  assess: (id: string, field: keyof Assessment, value: string) => void;
  advance: (id: string) => void;
} | null>(null);
export const CheckVersion = createContext(0);

export function LessonFlow({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(initial);
  const [ready, setReady] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [celebrationRound, setCelebrationRound] = useState(0);
  const finish = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "null");
      if (saved && typeof saved === "object") {
        const unlocked = Number.isInteger(saved.unlocked) ? Math.max(0, Math.min(steps.length - 1, saved.unlocked)) : 0;
        const completed = Array.isArray(saved.completed) ? steps.map(step => step.id).filter(id => saved.completed.includes(id)) : [];
        const answers: Record<string, Assessment> = {};
        for (const { id } of steps) {
          answers[id] = {};
          for (const field of ["understood", "listened", "task"] as const) {
            if (["yes", "no"].includes(saved.answers?.[id]?.[field])) answers[id][field] = saved.answers[id][field];
          }
        }
        const hashIndex = steps.findIndex(step => step.id === location.hash.slice(1));
        const active = hashIndex >= 0 && hashIndex <= unlocked ? hashIndex : Number.isInteger(saved.active) ? Math.max(0, Math.min(unlocked, saved.active)) : 0;
        setProgress({ active, unlocked, completed, answers, finished: saved.finished === true && completed.length === steps.length });
      }
    } catch { /* Progress is optional when storage is unavailable. */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) try { localStorage.setItem(key, JSON.stringify(progress)); } catch { /* Optional persistence. */ }
  }, [progress, ready]);
  useEffect(() => {
    if (!ready) return;
    const fromHash = () => {
      const index = steps.findIndex(step => step.id === location.hash.slice(1));
      if (index >= 0 && index <= progress.unlocked) { setProgress(previous => ({ ...previous, active: index })); setCelebrating(false); }
    };
    addEventListener("hashchange", fromHash);
    addEventListener("popstate", fromHash);
    return () => { removeEventListener("hashchange", fromHash); removeEventListener("popstate", fromHash); };
  }, [progress.unlocked, ready]);
  useEffect(() => {
    document.querySelectorAll("audio").forEach(audio => audio.pause());
  }, [progress.active]);
  useEffect(() => {
    if (celebrating) finish.current?.scrollIntoView({ block: "center", behavior: "instant" });
  }, [celebrating]);
  useEffect(() => {
    if (!celebrating) return;
    const timeout = setTimeout(() => setCelebrating(false), 5200);
    return () => clearTimeout(timeout);
  }, [celebrating, celebrationRound]);
  function scrollToStep() {
    window.scrollTo({ top: 0, behavior: "instant" });
    try { window.frameElement?.scrollIntoView({ block: "start", behavior: "instant" }); } catch { /* Standalone views have no frame. */ }
  }
  function jump(index: number) {
    if (!ready || index < 0 || index > progress.unlocked || index >= steps.length) return;
    setProgress(previous => ({ ...previous, active: index }));
    setCelebrating(false);
    history.pushState(null, "", `#${steps[index].id}`);
    scrollToStep();
  }
  function assess(id: string, field: keyof Assessment, value: string) {
    setProgress(previous => ({ ...previous, finished: false, answers: { ...previous.answers, [id]: { ...previous.answers[id], [field]: value } } }));
    setCelebrating(false);
  }
  function advance(id: string) {
    const index = steps.findIndex(step => step.id === id);
    const answer = progress.answers[id];
    if (!ready || index !== progress.active || !answer?.understood || (steps[index].task && !answer.task)) return;
    const last = index === steps.length - 1;
    setProgress(previous => ({ ...previous, active: last ? index : index + 1,
      unlocked: Math.max(previous.unlocked, Math.min(index + 1, steps.length - 1)),
      completed: previous.completed.includes(id) ? previous.completed : [...previous.completed, id], finished: last }));
    if (last) { setCelebrationRound(previous => previous + 1); setCelebrating(true); }
    else { history.pushState(null, "", `#${steps[index + 1].id}`); scrollToStep(); }
  }
  const review = steps.filter(step => progress.answers[step.id]?.understood === "no" || (step.task && progress.answers[step.id]?.task === "no"));
  return <Flow.Provider value={{ progress, ready, jump, assess, advance }}>
    <nav className="step-navigation" aria-label="Прогресс лекции">
      <div className="step-navigation-inner">
        <div className="step-caption"><b>ЛЕКЦИЯ 04</b><span>Шаг {progress.active + 1} из {steps.length} · {steps[progress.active].title}</span></div>
        <div className="step-rail">{steps.map((step, index) => <button key={step.id} type="button" disabled={!ready || index > progress.unlocked}
          title={`${index + 1}. ${step.title}${index > progress.unlocked ? " · ещё не открыт" : ""}`}
          aria-label={`${index + 1}. ${step.title}`} aria-current={index === progress.active ? "step" : undefined}
          className={progress.completed.includes(step.id) ? "step-done" : ""} onClick={() => jump(index)}>{String(index + 1).padStart(2, "0")}</button>)}</div>
        <progress max={steps.length} value={progress.completed.length} aria-label="Пройденные разделы" />
        <span className="step-count">Пройдено {progress.completed.length} из {steps.length}</span>
      </div>
    </nav>
    {children}
    {progress.finished && <div className="lesson-finish" ref={finish} role="status"><p className="eyebrow">ЛЕКЦИЯ ЗАВЕРШЕНА</p><h2>Браво! Четвёртый шаг пройден.</h2>
      {review.length > 0 ? <><p>Можно вернуться к этим разделам:</p><div className="review-links">{review.map(step => <button key={step.id} onClick={() => jump(steps.indexOf(step))}>{step.title}</button>)}</div></> : <p>Мост пройден. Идемо даље!</p>}
      <button type="button" onClick={() => { setCelebrationRound(previous => previous + 1); setCelebrating(true); }}>Ещё фейерверк</button>
    </div>}
    {celebrating && <Fireworks key={celebrationRound} />}
  </Flow.Provider>;
}

function Choice({ id, field, title, yes, no }: { id: string; field: keyof Assessment; title: string; yes: string; no: string }) {
  const flow = useContext(Flow)!;
  return <fieldset className="self-check"><legend>{title}</legend>{[["yes", yes], ["no", no]].map(([value, label]) => <label key={value}>
    <input type="radio" name={`${id}-${field}`} value={value} checked={flow.progress.answers[id]?.[field] === value} disabled={!flow.ready} onChange={() => flow.assess(id, field, value)} />{label}
  </label>)}</fieldset>;
}

export function StepSection({ id, children }: { id: string; children: ReactNode }) {
  const flow = useContext(Flow)!;
  const [checkVersion, setCheckVersion] = useState(0);
  const index = steps.findIndex(step => step.id === id);
  const step = steps[index];
  const answer = flow.progress.answers[id];
  const canAdvance = Boolean(flow.ready && answer?.understood && (!step.task || answer.task));
  return <div className="step-panel" data-step={id} hidden={flow.progress.active !== index}>
    <CheckVersion.Provider value={checkVersion}>{children}</CheckVersion.Provider>
    <div className="step-ending">
      {step.check && <button className="primary section-check" type="button" disabled={!flow.ready} onClick={() => setCheckVersion(previous => previous + 1)}>Проверить упражнения</button>}
      <div className="self-checks">
        <Choice id={id} field="understood" title="Материал" yes="Понял" no="Не понял" />
        {step.task && <Choice id={id} field="task" title="Задания" yes="Сделал" no="Пока не сделал" />}
        {step.audio && <Choice id={id} field="listened" title="Аудио" yes="Прослушал" no="Пока не прослушал" />}
      </div>
      <nav className="step-controls" aria-label={`Переходы: ${step.title}`}>
        <button type="button" disabled={!flow.ready || index === 0} onClick={() => flow.jump(index - 1)}>Назад</button>
        <span>{index + 1} / {steps.length}</span>
        <button type="button" className="primary" disabled={!canAdvance} onClick={() => flow.advance(id)}>{index === steps.length - 1 ? "Завершить лекцию" : "Далее"}</button>
      </nav>
      {!canAdvance && <p className="assessment-hint">Отметь, понятен ли материал{step.task ? " и сделаны ли задания" : ""}.</p>}
      <Feedback section={id} />
    </div>
  </div>;
}
