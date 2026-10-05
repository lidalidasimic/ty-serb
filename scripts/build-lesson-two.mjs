import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { readFile, writeFile } from "node:fs/promises";
import postcss from "postcss";

const root = fileURLToPath(new URL("../", import.meta.url));

// Keep the protected lesson's styles local when it is mounted in the course page.
const styles = postcss.parse(await readFile(new URL("../lesson-content/lesson-02/styles.css", import.meta.url), "utf8"));
styles.walkRules(rule => {
  rule.selectors = rule.selectors.map(selector => [":root", "html", "body"].includes(selector)
    ? "[data-lesson-two]" : `[data-lesson-two] ${selector}`);
});
await writeFile(new URL("../lesson-content/lesson-02/embedded.css", import.meta.url), styles.toString());

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
