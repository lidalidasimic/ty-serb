import { build } from "esbuild";
import { fileURLToPath } from "node:url";

await build({
  absWorkingDir: fileURLToPath(new URL("../", import.meta.url)),
  entryPoints: ["./lesson-content/lesson-11/entry.tsx"],
  outfile: "lesson-content/lesson-11/lesson.js",
  bundle: true,
  minify: true,
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  target: ["es2020"],
});
