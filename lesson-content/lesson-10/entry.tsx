import { createRoot } from "react-dom/client";
import Lesson10 from "./Lesson";

const script = document.currentScript as HTMLScriptElement | null;
const element = document.getElementById(script?.dataset.rootId || "root");
if (element) {
  const root = createRoot(element);
  root.render(<Lesson10 />);
  element.dispatchEvent(new CustomEvent("ty-serb-lesson-ready", { detail: () => root.unmount() }));
}
