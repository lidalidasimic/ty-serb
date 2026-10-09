"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Feedback, Fireworks } from "./lesson-tools";

const steps = [
  { id: "intro", title: "Введение", check: false },
  { id: "opening", title: "Молим или Молим?", check: false },
  { id: "questions", title: "Питања", check: true },
  { id: "molim", title: "Молим?", check: true },
  { id: "practice", title: "Вежбање", check: true },
  { id: "comic", title: "Битка за Омск", check: false },
  { id: "learning", title: "LearningApps", check: false },
  { id: "homework", title: "Домаћи", check: true },
];
const classSteps = steps.filter(step => step.id !== "homework");
type Progress = { active: number; unlocked: number; completed: string[]; finished: boolean };
const initial: Progress = { active: 0, unlocked: 0, completed: [], finished: false };
const key = "ty-serb-04:steps-v1";
const Flow = createContext<{
  progress: Progress; ready: boolean; jump: (index: number) => void;
  complete: (id: string) => void;
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
        const hashIndex = steps.findIndex(step => step.id === location.hash.slice(1));
        const active = hashIndex >= 0 && hashIndex <= unlocked ? hashIndex : Number.isInteger(saved.active) ? Math.max(0, Math.min(unlocked, saved.active)) : 0;
        setProgress({ active, unlocked, completed, finished: saved.finished === true && classSteps.every(step => completed.includes(step.id)) });
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
  }, [celebrating, celebrationRound]);
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
  function complete(id: string) {
    const index = steps.findIndex(step => step.id === id);
    if (!ready || index !== progress.active || progress.completed.includes(id)) return;
    setProgress(previous => ({ ...previous,
      unlocked: Math.max(previous.unlocked, Math.min(index + 1, steps.length - 1)),
      completed: [...previous.completed, id] }));
  }
  function advance(id: string) {
    const index = steps.findIndex(step => step.id === id);
    if (!ready || index !== progress.active || !progress.completed.includes(id)) return;
    const last = index === steps.length - 1;
    const classFinished = id === "learning";
    setProgress(previous => ({ ...previous, active: last ? index : index + 1, finished: previous.finished || classFinished || last }));
    if (!last) { history.pushState(null, "", `#${steps[index + 1].id}`); scrollToStep(); }
    if (classFinished || last) { setCelebrationRound(previous => previous + 1); setCelebrating(true); }
  }
  return <Flow.Provider value={{ progress, ready, jump, complete, advance }}>
    <nav className="step-navigation" aria-label="Прогресс лекции">
      <div className="step-navigation-inner">
        <div className="step-caption"><b>ЛЕКЦИЯ 04</b><span>Шаг {progress.active + 1} из {steps.length} · {steps[progress.active].title}</span></div>
        <div className="step-rail">{steps.map((step, index) => <button key={step.id} type="button" disabled={!ready || index > progress.unlocked}
          title={`${index + 1}. ${step.title}${index > progress.unlocked ? " · ещё не открыт" : ""}`}
          aria-label={`${index + 1}. ${step.title}`} aria-current={index === progress.active ? "step" : undefined}
          className={progress.completed.includes(step.id) ? "step-done" : ""} onClick={() => jump(index)}>{String(index + 1).padStart(2, "0")}</button>)}</div>
        <progress max={classSteps.length} value={classSteps.filter(step => progress.completed.includes(step.id)).length} aria-label="Пройденные разделы" />
        <span className="step-count">Пройдено {classSteps.filter(step => progress.completed.includes(step.id)).length} из {classSteps.length} · домашнее задание отдельно</span>
      </div>
    </nav>
    {progress.finished && progress.active === steps.length - 1 && <div className="lesson-finish" ref={finish} role="status"><p className="eyebrow">ЛЕКЦИЯ ЗАВЕРШЕНА</p><h2>Браво! Четвёртый урок пройден.</h2>
      <p>Мост пройден. Ниже — короткая практика для закрепления.</p>
      <button type="button" onClick={() => { setCelebrationRound(previous => previous + 1); setCelebrating(true); }}>Ещё фейерверк</button>
      {celebrating && <Fireworks key={celebrationRound} />}
    </div>}
    {children}
  </Flow.Provider>;
}

export function StepSection({ id, children }: { id: string; children: ReactNode }) {
  const flow = useContext(Flow)!;
  const [checkVersion, setCheckVersion] = useState(0);
  const index = steps.findIndex(step => step.id === id);
  const step = steps[index];
  const completed = flow.progress.completed.includes(id);
  const canAdvance = flow.ready && completed;
  return <div className="step-panel" data-step={id} hidden={flow.progress.active !== index}>
    <CheckVersion.Provider value={checkVersion}>{children}</CheckVersion.Provider>
    <div className="step-ending">
      {step.check && <button className="primary section-check" type="button" disabled={!flow.ready} onClick={() => setCheckVersion(previous => previous + 1)}>Проверить упражнения</button>}
      <nav className="step-controls" aria-label={`Переходы: ${step.title}`}>
        <button type="button" disabled={!flow.ready || index === 0} onClick={() => flow.jump(index - 1)}>Назад</button>
        <button type="button" className="primary section-complete" disabled={!flow.ready || completed} onClick={() => flow.complete(id)}>{completed ? "Раздел завершён" : "Завершить раздел"}</button>
        <button type="button" disabled={!canAdvance} onClick={() => flow.advance(id)}>{index === steps.length - 1 ? "Готово" : "Далее"}</button>
      </nav>
      <Feedback section={id} />
    </div>
  </div>;
}
