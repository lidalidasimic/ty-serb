import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { readFile, writeFile } from "node:fs/promises";
import postcss from "postcss";

const styles = postcss.parse(await readFile(new URL("../lesson-content/lesson-11/styles.css", import.meta.url), "utf8"));
styles.walkRules(rule => {
  rule.selectors = rule.selectors.map(selector => [":root", "html", "body"].includes(selector)
    ? "[data-lesson-eleven]" : `[data-lesson-eleven] ${selector}`);
});
await writeFile(new URL("../lesson-content/lesson-11/embedded.css", import.meta.url), styles.toString());

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
