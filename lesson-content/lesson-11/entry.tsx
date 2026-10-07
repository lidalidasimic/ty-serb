import { createRoot } from "react-dom/client";
import LessonEleven from "./Lesson";

const script = document.currentScript as HTMLScriptElement | null;
const element = document.getElementById(script?.dataset.rootId || "root");
if (element) {
  const root = createRoot(element);
  root.render(<LessonEleven />);
  element.dispatchEvent(new CustomEvent("ty-serb-lesson-ready", { detail: () => root.unmount() }));
}
