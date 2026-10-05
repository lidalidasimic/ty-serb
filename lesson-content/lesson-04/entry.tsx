import { createRoot } from "react-dom/client";
import Lesson from "./Lesson";

const root = document.getElementById("root");
if (root) createRoot(root).render(<Lesson />);
