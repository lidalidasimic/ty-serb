"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";

export function Feedback({ section, title = "Обратная связь", placeholder = "Твой вопрос, впечатления или пожелания" }: { section: string; title?: string; placeholder?: string }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (message.trim().length < 2 || status === "sending") return;
    setStatus("sending");
    try {
      const response = await fetch("https://ty-serb.vercel.app/api/lesson-feedback", {
        method: "POST", credentials: "omit",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonSlug: "prilagatelnye", section: `l4-${section}`, name: name.trim(), message: message.trim() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Не получилось отправить. Попробуй ещё раз.");
      setMessage("");
      setStatus("sent");
    } catch (reason) {
      setError(reason instanceof Error && reason.message !== "Failed to fetch" ? reason.message : "Не получилось отправить. Попробуй ещё раз.");
      setStatus("error");
    }
  }
  return <form className="feedback-form" onSubmit={submit} aria-label={`Обратная связь: ${section}`}>
    <h3>{title}</h3>
    <label>Имя <span className="optional">(необязательно)</span><input maxLength={80} autoComplete="given-name" value={name} onChange={e => setName(e.target.value)} /></label>
    <label>Комментарий<textarea required minLength={2} maxLength={1500} rows={3} placeholder={placeholder} value={message} onChange={e => { setMessage(e.target.value); setStatus("idle"); }} /></label>
    <button disabled={message.trim().length < 2 || status === "sending"}>{status === "sending" ? "Отправляем…" : "Отправить"}</button>
    {status === "sent" && <p className="correct" role="status">Спасибо! Сообщение отправлено Лидии.</p>}
    {status === "error" && <p className="incorrect" role="alert">{error}</p>}
  </form>;
}

export function Fireworks() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let width = 0;
    let height = 0;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    const resize = () => {
      // Size to the visible celebration panel, not a tall course iframe's viewport.
      width = canvas.clientWidth; height = canvas.clientHeight;
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      if (reducedMotion) drawStill();
    };
    type Spark = { x: number; y: number; vx: number; vy: number; life: number; color: string };
    const sparks: Spark[] = [];
    const colors = ["#c63440", "#134676", "#d5a51c", "#279c59"];
    function drawStill() {
      context!.clearRect(0, 0, width, height);
      for (let burst = 0; burst < 5; burst++) {
        const x = width * (0.12 + burst * 0.19);
        const y = height * (burst % 2 ? 0.72 : 0.18);
        for (let i = 0; i < 20; i++) {
          const angle = i * Math.PI * 2 / 20;
          context!.strokeStyle = colors[i % colors.length];
          context!.lineWidth = 3;
          context!.beginPath();
          context!.moveTo(x + Math.cos(angle) * 20, y + Math.sin(angle) * 20);
          context!.lineTo(x + Math.cos(angle) * 40, y + Math.sin(angle) * 40);
          context!.stroke();
        }
      }
    }
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    let bursts = 0;
    let previous = 0;
    const start = performance.now();
    function draw(now: number) {
      const elapsed = now - start;
      const step = Math.min((now - (previous || now)) / 16.67, 2);
      previous = now;
      if (bursts < 7 && elapsed >= bursts * 350) {
        const x = width * (0.15 + ((bursts * 37) % 70) / 100);
        const y = height * (0.2 + (bursts % 3) * 0.24);
        for (let i = 0; i < 48; i++) {
          const angle = i * Math.PI * 2 / 48;
          const speed = 2.5 + Math.random() * 3.5;
          sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, color: colors[i % colors.length] });
        }
        bursts++;
      }
      context!.clearRect(0, 0, width, height);
      for (let i = sparks.length - 1; i >= 0; i--) {
        const spark = sparks[i];
        spark.x += spark.vx * step; spark.y += spark.vy * step;
        spark.vy += 0.035 * step; spark.life -= 0.01 * step;
        if (spark.life <= 0) { sparks.splice(i, 1); continue; }
        context!.globalAlpha = spark.life;
        context!.strokeStyle = spark.color;
        context!.lineWidth = 4;
        context!.beginPath(); context!.moveTo(spark.x, spark.y);
        context!.lineTo(spark.x - spark.vx * 2, spark.y - spark.vy * 2); context!.stroke();
      }
      if (elapsed < 5000) frame = requestAnimationFrame(draw);
    }
    if (!reducedMotion) draw(start);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, []);
  return <canvas ref={ref} className="fireworks" aria-hidden="true" />;
}
