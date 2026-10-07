"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Send } from "lucide-react";

export function Feedback({ section, remote, lessonSlug = "rod-muzhskoy-zhenskiy-sredniy", sectionPrefix = "l3" }: { section: string; remote: boolean; lessonSlug?: string; sectionPrefix?: string }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (message.trim().length < 2 || status === "sending") return;
    setStatus("sending");
    try {
      const response = await fetch(`${remote ? "https://ty-serb.vercel.app" : ""}/api/lesson-feedback`, {
        method: "POST", credentials: remote ? "omit" : "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonSlug, section: `${sectionPrefix}-${section}`, name: name.trim(), message: message.trim() }),
      });
      const result = await response.json().catch(() => ({ error: "Не получилось отправить. Попробуй ещё раз." }));
      if (!response.ok || result?.ok !== true) throw new Error(result?.error || "Не получилось отправить. Попробуй ещё раз.");
      setMessage("");
      setStatus("sent");
    } catch (reason) {
      setError(reason instanceof Error && reason.message !== "Failed to fetch" ? reason.message : "Не получилось отправить. Попробуй ещё раз.");
      setStatus("error");
    }
  }
  return <form className="feedback-form" data-lesson-feedback={`${sectionPrefix}-${section}`} onSubmit={submit} aria-label={`Обратная связь: ${section}`}>
    <h3>Обратная связь</h3>
    <label>Имя <span className="optional">(необязательно)</span><input maxLength={80} autoComplete="given-name" value={name} onChange={e => setName(e.target.value)} /></label>
    <label>Комментарий<textarea required minLength={2} maxLength={1500} rows={3} placeholder="Твой вопрос, впечатления или пожелания" value={message} onChange={e => { setMessage(e.target.value); setStatus("idle"); }} /></label>
    <button disabled={message.trim().length < 2 || status === "sending"}><Send size={18} aria-hidden />{status === "sending" ? "Отправляем…" : "Отправить"}</button>
    {status === "sent" && <p className="correct" role="status">Спасибо! Сообщение отправлено Лидии.</p>}
    {status === "error" && <p className="incorrect" role="alert">{error}</p>}
  </form>;
}

export function Fireworks() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = ref.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    let frame = 0;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = innerWidth * ratio; canvas.height = innerHeight * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();
    addEventListener("resize", resize);
    type Spark = { x: number; y: number; vx: number; vy: number; life: number; color: string };
    const sparks: Spark[] = [];
    const colors = ["#167446", "#279c59", "#58c781", "#a4e9bc"];
    let bursts = 0;
    let previous = 0;
    const start = performance.now();
    function draw(now: number) {
      const elapsed = now - start;
      const step = Math.min((now - (previous || now)) / 16.67, 2);
      previous = now;
      if (bursts < 7 && elapsed >= bursts * 350) {
        const x = innerWidth * (0.15 + ((bursts * 37) % 70) / 100);
        const y = innerHeight * (0.2 + (bursts % 3) * 0.13);
        for (let i = 0; i < 48; i++) {
          const angle = i * Math.PI * 2 / 48;
          const speed = 2.5 + Math.random() * 3.5;
          sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, color: colors[i % colors.length] });
        }
        bursts++;
      }
      context!.clearRect(0, 0, innerWidth, innerHeight);
      for (let i = sparks.length - 1; i >= 0; i--) {
        const spark = sparks[i];
        spark.x += spark.vx * step; spark.y += spark.vy * step;
        spark.vy += 0.035 * step; spark.life -= 0.01 * step;
        if (spark.life <= 0) { sparks.splice(i, 1); continue; }
        context!.globalAlpha = spark.life;
        context!.strokeStyle = spark.color;
        context!.lineWidth = 3;
        context!.beginPath(); context!.moveTo(spark.x, spark.y);
        context!.lineTo(spark.x - spark.vx * 2, spark.y - spark.vy * 2); context!.stroke();
      }
      if (elapsed < 5000) frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="fireworks" aria-hidden="true" />;
}
