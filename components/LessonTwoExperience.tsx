"use client";

import { useEffect, useRef, useState } from "react";

export default function LessonTwoExperience() {
  const ref = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const base = "/api/lesson-content/kak-predstavitsya";
    element.id = `lesson-two-${crypto.randomUUID()}`;
    let disposed = false;
    let unmount: (() => void) | undefined;
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = `${base}/embedded.css`;
    const script = document.createElement("script");
    script.src = `${base}/lesson.js`;
    script.dataset.rootId = element.id;
    const fail = () => { if (!disposed) { setError(true); setLoading(false); } };
    const ready = (event: Event) => {
      unmount = (event as CustomEvent<() => void>).detail;
      if (!disposed) setLoading(false);
    };
    element.addEventListener("ty-serb-lesson-ready", ready);
    stylesheet.onerror = fail;
    script.onerror = fail;
    stylesheet.onload = () => { if (!disposed) document.body.append(script); };
    const header = document.querySelector("body > header");
    const positionNavigation = () => element.style.setProperty("--lesson-top", `${header?.getBoundingClientRect().height ?? 0}px`);
    positionNavigation();
    const observer = new ResizeObserver(positionNavigation);
    if (header) observer.observe(header);
    document.head.append(stylesheet);
    return () => {
      disposed = true;
      observer.disconnect();
      element.removeEventListener("ty-serb-lesson-ready", ready);
      element.querySelectorAll("audio").forEach(audio => audio.pause());
      queueMicrotask(() => unmount?.());
      script.remove();
      stylesheet.remove();
    };
  }, []);

  return <section id="lesson-02-start" className="bg-white">
    {loading && <p className="px-6 py-8" role="status">Загружаю урок...</p>}
    {error && <p className="px-6 py-8" role="alert">Не удалось открыть урок. <a href="/lessons/kak-predstavitsya">Обновить страницу</a></p>}
    <div ref={ref} data-lesson-two aria-busy={loading} />
  </section>;
}
