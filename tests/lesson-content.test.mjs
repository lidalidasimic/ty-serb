import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const root = new URL("../", import.meta.url);

function loadModule(relativePath, dependencies = {}) {
  const filename = fileURLToPath(new URL(relativePath, root));
  const source = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(source, {
    exports: module.exports, module, process, Buffer, Uint8Array, URL,
    require: (name) => name in dependencies ? dependencies[name] : require(name),
  }, { filename });
  return module.exports;
}

const lessons = loadModule("data/lessons.ts");
const access = loadModule("lib/access-control.ts");
const content = Buffer.from("0123456789");

function createRoute(user, missing = false, slug = "misija-rtanj") {
  const calls = { reads: 0, paths: [] };
  const route = loadModule("app/api/lesson-content/[slug]/[...path]/route.ts", {
    "@/data/lessons": lessons,
    "@/lib/access-control": access,
    "@/lib/supabase-server": { getCurrentUser: async () => user },
    "node:fs/promises": {
      readFile: async (filename) => {
        calls.reads++;
        calls.paths.push(filename);
        if (missing) throw Object.assign(new Error("Missing"), { code: "ENOENT" });
        return content;
      },
    },
  });
  return { calls, get: (parts, range) => route.GET(
    new Request(`https://ty-serb.vercel.app/api/lesson-content/${slug}/index.html`, {
      headers: range ? { range } : {},
    }),
    { params: Promise.resolve({ slug, path: parts }) },
  ) };
}

test("lesson 18 uses the existing protected lesson policy", () => {
  const lesson = lessons.getLessonBySlug("misija-rtanj");
  assert.equal(lesson.number, 18);
  assert.equal(access.canOpenLesson(null, lesson), false);
  for (const accessStatus of ["pending", "rejected", "revoked"]) {
    assert.equal(access.canOpenLesson({ accessStatus }, lesson), false);
  }
  assert.equal(access.canOpenLesson({ accessStatus: "approved" }, lesson), true);
  assert.equal(access.canOpenLesson({ accessStatus: "revoked", isAdmin: true }, lesson), true);
  assert.equal(access.canOpenLesson(null, lessons.getLessonBySlug("azbuka-i-proiznoshenie")), true);
});

const lessonTwoFiles = [
  "index.html", "styles.css", "lesson.js",
  ...Array.from({ length: 7 }, (_, i) => `images/lesson-02-comic-0${i + 1}.jpg`),
  "images/lesson-02-professions-01.png", "images/lesson-02-professions-02.png",
  "images/lesson-02-demonstrative-ovo.png", "images/lesson-02-demonstrative-to.png",
  ...["01-intro", "02-passport", "03-professions", "04-comic", "05-new-words", "06-translation",
    "07-why-biti", "08-biti-forms", "09-ovo-to-ono"].map(name => `audio/lesson-02-${name}.m4a`),
];

test("all lesson 2 materials remain protected, including scripts and recordings", async () => {
  for (const user of [null, { accessStatus: "pending" }, { accessStatus: "rejected" }, { accessStatus: "revoked" }]) {
    const route = createRoute(user, false, "kak-predstavitsya");
    for (const file of lessonTwoFiles) {
      const response = await route.get(file.split("/"));
      assert.equal(response.status, user ? 403 : 401);
      assert.equal(response.headers.get("cache-control"), "private, no-store");
    }
    assert.equal(route.calls.reads, 0);
  }
});

test("approved students receive every supplied lesson 2 file from the private folder", async () => {
  const route = createRoute({ accessStatus: "approved" }, false, "kak-predstavitsya");
  for (const file of lessonTwoFiles) {
    assert.ok(readFileSync(new URL(`lesson-content/lesson-02/${file}`, root)).length > 0);
    const response = await route.get(file.split("/"));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.equal(response.headers.get("content-security-policy"), "frame-ancestors 'self'");
    assert.match(route.calls.paths.at(-1), /lesson-content[/\\]lesson-02[/\\]/);
    if (file.endsWith(".jpg")) assert.equal(response.headers.get("content-type"), "image/jpeg");
    if (file.endsWith(".m4a")) assert.equal(response.headers.get("content-type"), "audio/mp4");
  }
});

test("lesson 2 rejects source files, traversal and files belonging to other lessons", async () => {
  const route = createRoute({ accessStatus: "approved" }, false, "kak-predstavitsya");
  for (const file of ["Lesson.tsx", "entry.tsx", "../lesson-18/index.html", "images/../index.html",
    "images/lesson-02-comic-08.jpg", "audio/lesson-02-01-intro.mp3", "audio/section-01.m4a",
    "assets/lucide.min.js", "images/lesson-02-contact-sheet.jpg"]) {
    assert.equal((await route.get(file.split("/"))).status, 404);
  }
  assert.equal(route.calls.reads, 0);
  const otherLesson = createRoute({ accessStatus: "approved" }, false, "azbuka-i-proiznoshenie");
  assert.equal((await otherLesson.get(["index.html"])).status, 404);
  assert.equal(otherLesson.calls.reads, 0);
});

test("lesson 2 recordings support seeking and missing-file responses", async () => {
  const parts = ["audio", "lesson-02-02-passport.m4a"];
  const response = await createRoute({ accessStatus: "approved" }, false, "kak-predstavitsya").get(parts, "bytes=2-4");
  assert.equal(response.status, 206);
  assert.equal(response.headers.get("content-type"), "audio/mp4");
  assert.equal(response.headers.get("content-range"), "bytes 2-4/10");
  assert.equal(await response.text(), "234");
  assert.equal((await createRoute({ accessStatus: "approved" }, true, "kak-predstavitsya").get(parts)).status, 404);
});

test("lesson 2 appears below the existing material card only for authorized students", async () => {
  for (const user of [null, { id: "student", accessStatus: "approved" }]) {
    const page = loadModule("app/lessons/[slug]/page.tsx", {
      "next/link": ({ children, ...props }) => React.createElement("a", props, children),
      "next/navigation": { notFound: () => { throw new Error("Not found"); } },
      "@/data/lessons": lessons,
      "@/lib/access-control": access,
      "@/lib/supabase-server": { getCurrentUser: async () => user, logActivity: async () => {} },
      "@/components/LessonOneGammaExperience": () => null,
      "@/components/LessonTwoExperience": loadModule("components/LessonTwoExperience.tsx").default,
      "@/components/LessonSeventeenExperience": () => null,
      "@/components/LessonEighteenExperience": () => null,
    });
    const html = renderToStaticMarkup(await page.default({ params: Promise.resolve({ slug: "kak-predstavitsya" }) }));
    const frame = html.indexOf('src="/api/lesson-content/kak-predstavitsya/index.html"');
    if (user) {
      assert.ok(frame > html.indexOf("Открыть презентацию"));
      assert.ok(frame > html.indexOf("Telegram-пост"));
      assert.match(html, /href="\/api\/materials\/kak-predstavitsya\/telegram"/);
    } else {
      assert.equal(frame, -1);
      assert.match(html, /Доступ к материалам ожидает подтверждения/);
    }
  }
});

test("lesson 2 Telegram and presentation buttons retain protected redirects", async () => {
  for (const user of [null, { accessStatus: "pending" }, { accessStatus: "approved" }]) {
    const route = loadModule("app/api/materials/[slug]/[kind]/route.ts", {
      "@/data/lessons": lessons,
      "@/lib/access-control": access,
      "@/lib/supabase-server": { getCurrentUser: async () => user, logActivity: async () => {} },
    });
    for (const [kind, target] of [["telegram", "https://t.me/tyserb/38"], ["gamma", lessons.getLessonBySlug("kak-predstavitsya").gammaLink]]) {
      const response = await route.GET(new Request(`https://ty-serb.vercel.app/api/materials/kak-predstavitsya/${kind}`),
        { params: Promise.resolve({ slug: "kak-predstavitsya", kind }) });
      assert.equal(response.status, 307);
      assert.equal(response.headers.get("location"), user?.accessStatus === "approved" ? target : "https://ty-serb.vercel.app/access");
    }
  }
});

test("guests and unapproved users cannot read HTML, scripts, images or audio", async () => {
  for (const user of [null, { accessStatus: "pending" }, { accessStatus: "revoked" }]) {
    const route = createRoute(user);
    for (const parts of [["index.html"], ["styles.css"], ["lesson.js"], ["assets", "slide-2-1.png"], ["audio", "section-01.mp3"]]) {
      const response = await route.get(parts);
      assert.equal(response.status, user ? 403 : 401);
      assert.equal(response.headers.get("cache-control"), "private, no-store");
    }
    assert.equal(route.calls.reads, 0);
  }
});

test("approved students receive the lesson with private response headers", async () => {
  const route = createRoute({ accessStatus: "approved" });
  const response = await route.get(["index.html"]);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), content.toString());
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal(response.headers.get("content-security-policy"), "frame-ancestors 'self'");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
});

test("unlisted files and traversal attempts never reach the filesystem", async () => {
  const route = createRoute({ accessStatus: "approved" });
  for (const parts of [["..", "package.json"], ["assets", "..", "lesson.js"], [".openai", "hosting.json"], ["assets", "slide-99-1.png"]]) {
    assert.equal((await route.get(parts)).status, 404);
  }
  assert.equal(route.calls.reads, 0);
});

test("audio supports bounded, open and suffix byte ranges", async () => {
  const route = createRoute({ accessStatus: "approved" });
  for (const [range, body, header] of [["bytes=2-4", "234", "bytes 2-4/10"], ["bytes=7-", "789", "bytes 7-9/10"], ["bytes=-3", "789", "bytes 7-9/10"]]) {
    const response = await route.get(["audio", "section-01.mp3"], range);
    assert.equal(response.status, 206);
    assert.equal(await response.text(), body);
    assert.equal(response.headers.get("content-range"), header);
  }
  for (const range of ["bytes=100-", "bytes=4-2", "bytes=-0", "bytes=-", "bytes=0-1,4-5"]) {
    assert.equal((await route.get(["audio", "section-01.mp3"], range)).status, 416);
  }
});

test("recordings that have not been added return 404", async () => {
  const response = await createRoute({ accessStatus: "approved" }, true).get(["audio", "section-01.mp3"]);
  assert.equal(response.status, 404);
});

test("material routes reject unknown kinds and keep approved lesson links", async () => {
  let userReads = 0;
  const route = loadModule("app/api/materials/[slug]/[kind]/route.ts", {
    "@/data/lessons": lessons,
    "@/lib/access-control": access,
    "@/lib/supabase-server": {
      getCurrentUser: async () => { userReads++; return { accessStatus: "approved" }; },
      logActivity: async () => {},
    },
  });
  const request = new Request("https://ty-serb.vercel.app/api/materials/misija-rtanj/gamma");
  const invalid = await route.GET(request, { params: Promise.resolve({ slug: "misija-rtanj", kind: "unknown" }) });
  assert.equal(invalid.status, 404);
  assert.equal(userReads, 0);
  const valid = await route.GET(request, { params: Promise.resolve({ slug: "misija-rtanj", kind: "gamma" }) });
  assert.equal(valid.status, 307);
  assert.equal(valid.headers.get("location"), lessons.getLessonBySlug("misija-rtanj").gammaLink);
});
