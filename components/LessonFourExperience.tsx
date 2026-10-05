"use client";

import { useEffect, useRef, useState } from "react";

export default function LessonFourExperience() {
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(900);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const body = frame.current?.contentDocument?.body;
    if (!loaded || !body) return;
    const resize = () => setHeight(Math.max(620, Math.ceil(body.getBoundingClientRect().height)));
    const observer = new ResizeObserver(resize);
    observer.observe(body);
    resize();
    return () => observer.disconnect();
  }, [loaded]);

  return (
    <section id="lesson-04-start" className="bg-white">
      <iframe
        ref={frame}
        src="/api/lesson-content/prilagatelnye/index.html"
        title="Лекция 4. Мост. Питања и глаголи!"
        className="block w-full border-0"
        style={{ height }}
        onLoad={() => setLoaded(true)}
      />
    </section>
  );
}
