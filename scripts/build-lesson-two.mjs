import { build } from "esbuild";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

await build({
  absWorkingDir: root,
  entryPoints: ["./lesson-content/lesson-02/entry.tsx"],
  outfile: "lesson-content/lesson-02/lesson.js",
  bundle: true,
  minify: true,
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  target: ["es2020"],
});
