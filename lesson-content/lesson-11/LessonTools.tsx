import { useRef, useState, type FormEvent } from "react";
import { Send, Volume2 } from "lucide-react";
import { steps, type StepId } from "./workflow";

export function Audio({ step, src }: { step: StepId; src?: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [speed, setSpeed] = useState("1");
  const [error, setError] = useState(false);
  const title = steps.find(([id]) => id === step)![1];
  return <div className="lesson-audio" data-lesson-audio={step}>
    <h3><Volume2 size={20} aria-hidden />Аудио: {title}</h3>
    <audio ref={ref} controls preload="none" src={src} aria-label={`Аудио: ${title}`}
      onError={() => { if (src) setError(true); }}
      onPlay={() => {
        setError(false);
        document.querySelectorAll("audio").forEach(other => { if (other !== ref.current) other.pause(); });
      }} />
    <label className="audio-speed">Скорость
      <select disabled={!src} value={speed} aria-label={`Скорость аудио: ${title}`} onChange={event => {
        setSpeed(event.target.value);
        if (ref.current) ref.current.playbackRate = Number(event.target.value);
      }}>
        <option value="0.75">0,75×</option><option value="1">1×</option>
        <option value="1.25">1,25×</option><option value="1.5">1,5×</option>
      </select>
    </label>
    {!src && <p className="audio-pending">Запись ещё не загружена.</p>}
    {error && <p role="alert">Не удалось загрузить аудио. <a href={src}>Открыть запись</a></p>}
  </div>;
}

export function Feedback({ step }: { step: StepId }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const id = `l11-${step}`;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending" || message.trim().length < 2) return;
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/lesson-feedback", {
        method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonSlug: "ucimo-srpski-11", section: id, name: name.trim(), message: message.trim() }),
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error(result.error || "Не получилось отправить сообщение. Попробуй ещё раз.");
      setMessage("");
      setStatus("sent");
    } catch (reason) {
      setError(reason instanceof Error && reason.message !== "Failed to fetch" ? reason.message : "Не получилось отправить сообщение. Проверь соединение и попробуй ещё раз.");
      setStatus("error");
    }
  }
  return <form className="feedback-form" data-lesson-feedback={id} aria-labelledby={`${id}-feedback-title`} onSubmit={submit}>
    <h3 id={`${id}-feedback-title`}>Обратная связь</h3>
    <label htmlFor={`${id}-name`}>Имя (необязательно)</label>
    <input id={`${id}-name`} autoComplete="given-name" maxLength={80} value={name} disabled={status === "sending"} onChange={event => setName(event.target.value)} />
    <label htmlFor={`${id}-message`}>Комментарий</label>
    <textarea id={`${id}-message`} required minLength={2} maxLength={1500} rows={3} value={message} disabled={status === "sending"}
      placeholder="Твой вопрос, впечатления или пожелания" onChange={event => { setMessage(event.target.value); setStatus("idle"); }} />
    <button type="submit" className="secondary" disabled={status === "sending" || message.trim().length < 2}>
      <Send size={18} aria-hidden />{status === "sending" ? "Отправляем…" : "Отправить"}
    </button>
    {status === "sent" && <p className="feedback-success" role="status">Спасибо! Сообщение отправлено Лидии.</p>}
    {status === "error" && <p className="feedback-error" role="alert">{error}</p>}
  </form>;
}
