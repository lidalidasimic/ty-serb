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
    require: (name) => name in dependencies ? dependencies[name] : name === "@/components/LessonTenExperience" ? loadModule("components/LessonTenExperience.tsx").default : require(name),
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

test("lesson 10 assets use the platform access policy and private folder", async () => {
  const slug = "ucimo-srpski-10";
  const files = ["index.html", "styles.css", "embedded.css", "lesson.js"];
  for (const user of [null, { accessStatus: "pending" }, { accessStatus: "revoked" }, { accessStatus: "approved" }, { isAdmin: true }]) {
    const route = createRoute(user, false, slug);
    const authorized = access.canOpenLesson(user, lessons.getLessonBySlug(slug));
    for (const file of files) {
      const response = await route.get([file]);
      assert.equal(response.status, authorized ? 200 : user ? 403 : 401);
      assert.equal(response.headers.get("cache-control"), "private, no-store");
      if (authorized) {
        assert.match(route.calls.paths.at(-1), /lesson-content[/\\]lesson-10[/\\]/);
        assert.equal(response.headers.get("content-security-policy"), "frame-ancestors 'self'");
        assert.ok(readFileSync(new URL(`lesson-content/lesson-10/${file}`, root)).length);
      }
    }
    if (!authorized) assert.equal(route.calls.reads, 0);
  }
  const route = createRoute({ accessStatus: "approved" }, false, slug);
  for (const file of ["Lesson.tsx", "entry.tsx", "../lesson-11/index.html", "assets/lucide.min.js", "audio/missing.mp3"]) {
    assert.equal((await route.get(file.split("/"))).status, 404);
  }
  assert.equal(route.calls.reads, 0);
});

test("lesson 10 is embedded below existing materials after the access check", async () => {
  const slug = "ucimo-srpski-10";
  for (const user of [null, { accessStatus: "pending" }, { accessStatus: "approved" }, { isAdmin: true }]) {
    const page = loadModule("app/lessons/[slug]/page.tsx", {
      "next/link": ({ children, ...props }) => React.createElement("a", props, children),
      "next/navigation": { notFound: () => { throw new Error("Not found"); } },
      "@/data/lessons": lessons,
      "@/lib/access-control": access,
      "@/lib/supabase-server": { getCurrentUser: async () => user, logActivity: async () => {} },
      ...Object.fromEntries(["OneGamma", "Two", "Three", "Four", "Eleven", "Seventeen", "Eighteen", "Nineteen"].map(name => [`@/components/Lesson${name}Experience`, () => null])),
    });
    const html = renderToStaticMarkup(await page.default({ params: Promise.resolve({ slug }) }));
    const frame = html.indexOf("data-lesson-ten=");
    if (access.canOpenLesson(user, lessons.getLessonBySlug(slug))) {
      assert.ok(frame > html.indexOf("Telegram-пост"));
      assert.doesNotMatch(html, /<iframe/);
      assert.match(html, /href="\/lessons\/ucimo-srpski-9"/);
      assert.match(html, /href="\/lessons\/ucimo-srpski-11"/);
    } else {
      assert.equal(frame, -1);
      assert.match(html, /Доступ к материалам ожидает подтверждения/);
    }
  }
});

test("embedded lesson 10 keeps seven parts and the first-lesson reference", () => {
  const Lesson = loadModule("lesson-content/lesson-10/Lesson.tsx", { "../lesson-03/LessonTools": loadModule("lesson-content/lesson-03/LessonTools.tsx") }).default;
  const html = renderToStaticMarkup(React.createElement(Lesson));
  const sections = ["top", "reci", "gramatika", "original", "pridevi", "mnozina", "vezbe", "domaci"];
  let previous = -1;
  for (const id of sections) {
    const offset = html.indexOf(`id="${id}"`);
    assert.ok(offset > previous);
    previous = offset;
  }
  assert.match(html, /href="\/lessons\/azbuka-i-proiznoshenie" target="_top"/);
  assert.doesNotMatch(html, /chatgpt\.site|class="topbar"/);
  assert.match(html, /Моје ствари и једна мала сцена/);
  assert.equal((html.match(/aria-label="[1-7]\. /g) || []).length, 7);
  assert.equal((html.match(/hidden=""/g) || []).length, 6);
  const homework = html.slice(html.indexOf('id="domaci"'));
  assert.doesNotMatch(homework, /aria-label="Даље"/);
  assert.match(homework, /Моја фото-прича/);
  assert.equal((html.match(/data-lesson-feedback="l10-/g) || []).length, 7);
  for (const rate of [0.5, 0.75, 1, 1.25, 1.5, 2]) assert.equal((html.match(new RegExp(`<option value="${rate}"(?: selected="")?>`, "g")) || []).length, 5);
  assert.match(html, /<option value="1" selected="">1×<\/option>/);
  assert.doesNotMatch(html, /<option value="0\.[79]"/);
  assert.match(html, /class="section red"/);
  assert.match(html, /class="section dark"/);
});

test("lesson 10 feedback accepts all seven sections and preserves validation", async () => {
  const user = { id: "student", accessStatus: "approved" };
  for (const section of ["reci", "gramatika", "original", "pridevi", "mnozina", "vezbe", "domaci"]) {
    const route = createFeedbackRoute(false, user);
    const response = await route.submit({ lessonSlug: "ucimo-srpski-10", section: `l10-${section}`, message: "Ошибка в упражнении" }, "https://ty-serb.vercel.app");
    assert.equal(response.status, 200);
    assert.equal(route.submissions[0].section, `l10-${section}`);
    assert.equal(route.submissions[0].lessonSlug, "ucimo-srpski-10");
    assert.equal(route.submissions[0].kind, "feedback");
    assert.equal((await route.submit({ lessonSlug: "ucimo-srpski-10", section: `l10-${section}`, message: "Ещё вопрос" }, "https://ty-serb.vercel.app")).status, 429);
  }
  const invalid = createFeedbackRoute(false, user);
  for (const extra of [{ section: "l10-unknown" }, { section: "l3-intro" }, { message: " " }, { kind: "introduction" }]) {
    assert.equal((await invalid.submit({ lessonSlug: "ucimo-srpski-10", section: "l10-reci", message: "Вопрос", ...extra }, "https://ty-serb.vercel.app")).status, 400);
  }
  assert.equal(invalid.submissions.length, 0);
  const failed = createFeedbackRoute(true, user);
  const response = await failed.submit({ lessonSlug: "ucimo-srpski-10", section: "l10-reci", message: "Вопрос" }, "https://ty-serb.vercel.app");
  assert.equal(response.status, 500);
  assert.doesNotMatch(await response.text(), /"ok":true|private database failure/);
  for (const blockedUser of [null, { accessStatus: "pending" }, { accessStatus: "revoked" }]) {
    const route = createFeedbackRoute(false, blockedUser);
    assert.equal((await route.submit({ lessonSlug: "ucimo-srpski-10", section: "l10-reci", message: "Вопрос" }, "https://ty-serb.vercel.app")).status, blockedUser ? 403 : 401);
    assert.equal(route.submissions.length, 0);
  }
});

test("lesson 10 bug reports reach the teacher moderation panel", async () => {
  const route = createFeedbackRoute(false, { id: "student", accessStatus: "approved" });
  await route.submit({ lessonSlug: "ucimo-srpski-10", section: "l10-original", message: "Ошибка в упражнении" }, "https://ty-serb.vercel.app");
  const entry = route.submissions[0];
  const { default: AdminPage } = loadModule("app/admin/page.tsx", {
    "@/app/admin/actions": { moderateFeedbackAction() {}, updateAccessStatusAction() {} },
    "@/lib/supabase-server": {
      requireAdmin: async () => {}, listProfiles: async () => [],
      listRecentActivity: async () => [{ id: "feedback-10", user_id: entry.userId, lesson_slug: entry.lessonSlug, created_at: "2026-10-08T10:00:00Z", action_type: `lesson_feedback_pending:${JSON.stringify(entry)}` }],
    },
  });
  const html = renderToStaticMarkup(await AdminPage({}));
  assert.match(html, /l10-original/);
  assert.match(html, /Ошибка в упражнении/);
  assert.match(html, /ожидает проверки/);
});

test("lesson 10 styles stay inside the course experience", async () => {
  const { default: postcss } = await import("postcss");
  const stylesheet = postcss.parse(readFileSync(new URL("lesson-content/lesson-10/embedded.css", root), "utf8"));
  stylesheet.walkRules(rule => assert.ok(rule.selectors.every(selector => selector.startsWith("[data-lesson-ten]"))));
});

const lessonThreeSlug = "rod-muzhskoy-zhenskiy-sredniy";
const lessonFourSlug = "prilagatelnye";
const lessonFourFiles = ["index.html", "styles.css", "lesson.js", "question-reference.png"];

test("lesson 4 protects every file before reading it", async () => {
  for (const user of [null, ...["pending", "rejected", "revoked"].map(accessStatus => ({ accessStatus }))]) {
    const route = createRoute(user, false, lessonFourSlug);
    for (const file of lessonFourFiles) {
      const response = await route.get([file]);
      assert.equal(response.status, user ? 403 : 401);
      assert.equal(response.headers.get("cache-control"), "private, no-store");
    }
    assert.equal(route.calls.reads, 0);
  }
});

const lessonElevenSlug = "ucimo-srpski-11";
const lessonElevenFiles = ["index.html", "styles.css", "embedded.css", "lesson.js", "comic.png"];
const lessonElevenAudio = Array.from({ length: 8 }, (_, i) => `audio/section-0${i + 1}.m4a`);
const elevenWorkflow = loadModule("lesson-content/lesson-11/workflow.ts");
function loadLessonEleven() {
  return loadModule("lesson-content/lesson-11/Lesson.tsx", {
    "./workflow": elevenWorkflow,
    "./LessonTools": loadModule("lesson-content/lesson-11/LessonTools.tsx", { "./workflow": elevenWorkflow }),
  });
}

test("lesson 19 opens as the course experience only after the access check", async () => {
  const slug = "polinin-rodjendan";
  for (const user of [null, { accessStatus: "pending" }, { accessStatus: "approved" }, { isAdmin: true }]) {
    const page = loadModule("app/lessons/[slug]/page.tsx", {
      "next/link": ({ children, ...props }) => React.createElement("a", props, children),
      "next/navigation": { notFound: () => { throw new Error("Not found"); } },
      "@/data/lessons": lessons,
      "@/lib/access-control": access,
      "@/lib/supabase-server": { getCurrentUser: async () => user, logActivity: async () => {} },
      ...Object.fromEntries(["OneGamma", "Two", "Three", "Four", "Eleven", "Seventeen", "Eighteen"].map(name => [`@/components/Lesson${name}Experience`, () => null])),
      "@/components/LessonNineteenExperience": loadModule("components/LessonNineteenExperience.tsx").default,
    });
    const html = renderToStaticMarkup(await page.default({ params: Promise.resolve({ slug }) }));
    const authorized = access.canOpenLesson(user, lessons.getLessonBySlug(slug));
    assert.equal(html.includes(`src="/api/lesson-content/${slug}/index.html"`), authorized);
    assert.equal(html.includes("Открыть презентацию"), false);
    if (!authorized) assert.match(html, /Доступ к материалам ожидает подтверждения/);
  }
});

test("lesson 19 protects content and all twelve original comic frames", async () => {
  const slug = "polinin-rodjendan";
  const files = ["index.html", "styles.css", "lesson.js", "assets/lucide.min.js",
    ...Array.from({ length: 12 }, (_, i) => `assets/comic-${String(i + 1).padStart(2, "0")}.png`)];
  for (const user of [null, { accessStatus: "pending" }, { accessStatus: "approved" }, { isAdmin: true }]) {
    const route = createRoute(user, false, slug);
    for (const file of files) {
      const response = await route.get(file.split("/"));
      assert.equal(response.status, access.canOpenLesson(user, lessons.getLessonBySlug(slug)) ? 200 : user ? 403 : 401);
      assert.equal(response.headers.get("cache-control"), "private, no-store");
      assert.ok(readFileSync(new URL(`lesson-content/lesson-19/${file}`, root)).length);
    }
    if (!access.canOpenLesson(user, lessons.getLessonBySlug(slug))) assert.equal(route.calls.reads, 0);
  }
  const approved = createRoute({ accessStatus: "approved" }, false, slug);
  for (const file of ["../lesson-18/index.html", "assets/comic-13.png", "Lesson.tsx", "assets/../lesson.js"]) {
    assert.equal((await approved.get(file.split("/"))).status, 404);
  }
  assert.equal(approved.calls.reads, 0);
});

test("all lesson 11 assets require approved access before any filesystem read", async () => {
  for (const user of [null, ...["pending", "rejected", "revoked"].map(accessStatus => ({ accessStatus }))]) {
    const route = createRoute(user, false, lessonElevenSlug);
    for (const file of lessonElevenFiles) {
      const response = await route.get([file]);
      assert.equal(response.status, user ? 403 : 401);
      assert.equal(response.headers.get("cache-control"), "private, no-store");
    }
    assert.equal(route.calls.reads, 0);
  }
});

test("approved students and admins receive only known lesson 4 assets", async () => {
  for (const user of [{ accessStatus: "approved" }, { isAdmin: true, accessStatus: "revoked" }]) {
    const route = createRoute(user, false, lessonFourSlug);
    for (const file of lessonFourFiles) {
      assert.ok(readFileSync(new URL(`lesson-content/lesson-04/${file}`, root)).length);
      const response = await route.get([file]);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("cache-control"), "private, no-store");
      assert.equal(response.headers.get("content-security-policy"), "frame-ancestors 'self'");
      assert.match(route.calls.paths.at(-1), /lesson-content[/\\]lesson-04[/\\]/);
      if (file.endsWith(".png")) assert.equal(response.headers.get("content-type"), "image/png");
    }
    const reads = route.calls.reads;
    for (const file of ["Lesson.tsx", "entry.tsx", "../lesson-03/index.html", "audio/section-01.mp3", "assets/lucide.min.js"]) {
      assert.equal((await route.get(file.split("/"))).status, 404);
    }
    assert.equal(route.calls.reads, reads);
  }
});

test("lesson 4 is embedded below its course title only for authorized users", async () => {
  for (const user of [null, { accessStatus: "pending" }, { accessStatus: "approved" }, { isAdmin: true }]) {
    const page = loadModule("app/lessons/[slug]/page.tsx", {
      "next/link": ({ children, ...props }) => React.createElement("a", props, children),
      "next/navigation": { notFound: () => { throw new Error("Not found"); } },
      "@/data/lessons": lessons,
      "@/lib/access-control": access,
      "@/lib/supabase-server": { getCurrentUser: async () => user, logActivity: async () => {} },
      "@/components/LessonOneGammaExperience": () => null,
      "@/components/LessonTwoExperience": () => null,
      "@/components/LessonThreeExperience": () => null,
      "@/components/LessonFourExperience": loadModule("components/LessonFourExperience.tsx").default,
      "@/components/LessonElevenExperience": () => null,
      "@/components/LessonSeventeenExperience": () => null,
      "@/components/LessonEighteenExperience": () => null,
      "@/components/LessonNineteenExperience": () => null,
    });
    const html = renderToStaticMarkup(await page.default({ params: Promise.resolve({ slug: lessonFourSlug }) }));
    const frame = html.indexOf(`src="/api/lesson-content/${lessonFourSlug}/index.html"`);
    if (access.canOpenLesson(user, lessons.getLessonBySlug(lessonFourSlug))) {
      assert.ok(frame > html.indexOf("Telegram-пост"));
      assert.match(html, /Вопросы, глагол бити/);
      assert.doesNotMatch(html, /Описание людей и предметов|example\.com/);
    } else {
      assert.equal(frame, -1);
    }
  }
});

test("approved students receive lesson 11 assets only from its private folder", async () => {
  const route = createRoute({ accessStatus: "approved" }, false, lessonElevenSlug);
  for (const file of lessonElevenFiles) {
    assert.ok(readFileSync(new URL(`lesson-content/lesson-11/${file}`, root)).length);
    const response = await route.get([file]);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.equal(response.headers.get("content-security-policy"), "frame-ancestors 'self'");
    assert.match(route.calls.paths.at(-1), /lesson-content[/\\]lesson-11[/\\]/);
  }
  for (const file of ["Lesson.tsx", "entry.tsx", "../lesson-03/index.html", "audio/00-intro.m4a", "missing.png"]) {
    assert.equal((await route.get(file.split("/"))).status, 404);
  }
  assert.equal(route.calls.reads, lessonElevenFiles.length);
  assert.equal((await createRoute({ accessStatus: "approved" }, true, lessonElevenSlug).get(["index.html"])).status, 404);
});

test("lesson 11 keeps the shared lesson header above its directly mounted content", async () => {
  for (const user of [null, { id: "student", accessStatus: "pending" }, { id: "student", accessStatus: "approved" }, { id: "admin", isAdmin: true }]) {
    const page = loadModule("app/lessons/[slug]/page.tsx", {
      "next/link": ({ children, ...props }) => React.createElement("a", props, children),
      "next/navigation": { notFound: () => { throw new Error("Not found"); } },
      "@/data/lessons": lessons,
      "@/lib/access-control": access,
      "@/lib/supabase-server": { getCurrentUser: async () => user, logActivity: async () => {} },
      "@/components/LessonOneGammaExperience": () => null,
      "@/components/LessonTwoExperience": () => null,
      "@/components/LessonThreeExperience": () => null,
      "@/components/LessonFourExperience": () => null,
      "@/components/LessonElevenExperience": loadModule("components/LessonElevenExperience.tsx").default,
      "@/components/LessonSeventeenExperience": () => null,
      "@/components/LessonEighteenExperience": () => null,
      "@/components/LessonNineteenExperience": () => null,
    });
    const html = renderToStaticMarkup(await page.default({ params: Promise.resolve({ slug: lessonElevenSlug }) }));
    const lessonContent = html.indexOf("data-lesson-eleven=");
    if (access.canOpenLesson(user, lessons.getLessonBySlug(lessonElevenSlug))) {
      assert.ok(lessonContent > html.indexOf("Telegram-пост"));
      assert.doesNotMatch(html, /<iframe/);
      assert.match(html, /<h1[^>]*>Лекция 11\. Прилагательные\.<\/h1>/);
      assert.match(html, /Урок 11 · A1\+/);
      assert.match(html, /Читаем комикс о пропавших словах/);
      assert.match(html, /href="\/lessons"[^>]*>[\s\S]*?Все уроки/);
      assert.match(html, /href="\/lessons\/ucimo-srpski-10"[\s\S]*?Предыдущая лекция/);
      assert.match(html, /href="\/lessons\/ucimo-srpski-12"[\s\S]*?Следующая лекция/);
      assert.match(html, /href="\/api\/materials\/ucimo-srpski-11\/gamma"[\s\S]*?Открыть презентацию/);
      assert.match(html, /href="\/api\/materials\/ucimo-srpski-11\/telegram"[\s\S]*?Telegram-пост/);
      assert.match(html, /aria-disabled="true"[\s\S]*?PDF worksheet скоро/);
    } else {
      assert.equal(lessonContent, -1);
      assert.match(html, /Доступ к материалам ожидает подтверждения/);
      assert.doesNotMatch(html, /Открыть презентацию|Telegram-пост/);
    }
  }
});

test("lesson 4 retains original media, complete homework and eight empty audio players", () => {
  const tools = loadModule("lesson-content/lesson-04/lesson-tools.tsx");
  const flow = loadModule("lesson-content/lesson-04/lesson-flow.tsx", { "./lesson-tools": tools });
  const Lesson = loadModule("lesson-content/lesson-04/Lesson.tsx", { "./lesson-flow": flow }).default;
  const html = renderToStaticMarkup(React.createElement(Lesson));
  const sections = ["opening", "questions", "molim", "practice", "comic", "learning", "homework"];
  let previous = -1;
  for (const id of sections) {
    const offset = html.indexOf(`id="${id}"`);
    assert.ok(offset > previous);
    previous = offset;
  }
  assert.equal((html.match(/<audio\b/g) || []).length, 8);
  assert.doesNotMatch(html.match(/<audio\b[^>]*>/g).join(""), /src=/);
  assert.doesNotMatch(html.slice(html.indexOf('id="homework"')), /<audio\b/);
  assert.match(html, /src="\.\/question-reference\.png"/);
  assert.match(html, /e21c2589eaa04927a3ad367cc4697d0b\/original\/image\.png/);
  assert.equal((html.match(/\/original\/blob\.png/g) || []).length, 6);
  assert.match(html, /learningapps\.org\/display\?v=pyj65zkf326/);
  for (let number = 5; number <= 10; number++) assert.match(html, new RegExp(`Упражнение ${number}`));
  assert.match(html, /Мой опросник:/);
  assert.equal((html.match(/data-step=/g) || []).length, 8);
  assert.equal((html.match(/class="step-panel"[^>]*hidden/g) || []).length, 7);
  assert.equal((html.match(/class="feedback-form"/g) || []).length, 8);
  assert.match(html, /Пройденные разделы/);
  assert.match(html, /Проверить упражнения/);
  assert.doesNotMatch(html, /gamma\.app\/(?:embed|docs)/);
  assert.doesNotMatch(html, /site-header|ty-serb-lesson-four.*chatgpt\.site/);
});

test("lesson 11 loads the two requested LearningApps only in their final step", () => {
  const module = loadLessonEleven();
  const html = renderToStaticMarkup(React.createElement(module.default));
  assert.doesNotMatch(html, /<iframe /);
  for (const id of ["pe514bjca26", "ppi7p6qnj26"]) {
    const link = html.indexOf(`href="https://learningapps.org/watch?id=${id}"`);
    assert.ok(link > html.indexOf('id="homework"'));
    const props = { id, title: id, description: "", active: true };
    const frame = renderToStaticMarkup(React.createElement(module.LearningApp, props));
    assert.match(frame, new RegExp(`src="https://learningapps.org/watch\\?v=${id}"`));
    assert.doesNotMatch(renderToStaticMarkup(React.createElement(module.LearningApp, { ...props, active: false })), /<iframe/);
  }
  assert.doesNotMatch(html, /pyj65zkf326|pezs2mbpa26/);
  assert.match(html, /src="\/api\/lesson-content\/ucimo-srpski-11\/comic\.png"/);
  assert.doesNotMatch(html, /<main|<header|<footer|<h1/);
  assert.match(html, /href="\/lessons\/ucimo-srpski-10"/);
  assert.match(html, /href="\/lessons\/ucimo-srpski-12"/);
  assert.match(html, /href="\/api\/materials\/ucimo-srpski-11\/gamma"/);
  assert.match(html, /href="\/api\/materials\/ucimo-srpski-11\/telegram"/);
});

test("lesson 11 starts with one visible step, eight audio slots and feedback forms", () => {
  const html = renderToStaticMarkup(React.createElement(loadLessonEleven().default));
  const sections = html.match(/<section\b[^>]*data-lesson-step[^>]*>/g) || [];
  assert.equal(sections.length, 8);
  assert.equal(sections.filter(section => !/\bhidden=/.test(section)).length, 1);
  assert.match(sections.find(section => !/\bhidden=/.test(section)), /id="intro"/);
  assert.equal((html.match(/data-lesson-audio=/g) || []).length, 8);
  assert.equal((html.match(/<audio\b/g) || []).length, 8);
  assert.doesNotMatch(html.match(/<audio\b[^>]*>/g).join(""), /src=/);
  assert.equal((html.match(/Запись ещё не загружена\./g) || []).length, 8);
  assert.equal((html.match(/data-lesson-feedback=/g) || []).length, 8);
  for (const [id] of elevenWorkflow.steps) {
    assert.match(html, new RegExp(`data-lesson-feedback="l11-${id}"`));
    assert.match(html, new RegExp(`for="l11-${id}-message"`));
  }
  assert.match(html, /aria-label="Прогресс урока"[^>]*aria-valuenow="0"/);
  assert.equal((html.match(/id="l11-homework-[0-8]"/g) || []).length, 9);
  assert.match(html, /Назад/);
  assert.match(html, /Дальше/);
  assert.match(html, /Завершить урок/);
});

test("lesson 11 progress is validated and cannot finish unchecked exercises", () => {
  const plain = value => JSON.parse(JSON.stringify(value));
  assert.deepEqual(plain(elevenWorkflow.restoreProgress(null)), { active: "intro", completed: [] });
  assert.deepEqual(plain(elevenWorkflow.restoreProgress({ active: "missing", completed: ["intro", "missing", "intro", 2, "comic"] })), { active: "intro", completed: ["intro", "comic"] });
  assert.deepEqual(plain(elevenWorkflow.restoreProgress({ active: "test", completed: "all" })), { active: "test", completed: [] });
  assert.equal(elevenWorkflow.canCompleteStep("intro", [], {}), true);
  assert.equal(elevenWorkflow.canCompleteStep("words", [], {}), false);
  assert.equal(elevenWorkflow.canCompleteStep("words", [], { words: true }), true);
  assert.equal(elevenWorkflow.canCompleteStep("practice", [], { forms: true }), false);
  assert.equal(elevenWorkflow.canCompleteStep("practice", [], { forms: true, sentences: true }), true);
  assert.equal(elevenWorkflow.canCompleteStep("apps", [], {}), false);
  assert.deepEqual(plain(elevenWorkflow.invalidateExercise(["intro", "words", "practice", "apps"], "forms")), ["intro", "words"]);
  assert.deepEqual(plain(elevenWorkflow.invalidateExercise(["intro", "comic", "apps"], "comic-words")), ["intro"]);
  for (const [latin, cyrillic] of [["jak", "јак"], ["LEPA!", "лепа"], ["smešna", "смешна"], ["  чаробно. ", "чаробно"]]) {
    assert.equal(elevenWorkflow.normalizeAnswer(latin), cyrillic);
  }
});

test("lesson 11 future recordings remain private and support audio seeking", async () => {
  for (const user of [null, { accessStatus: "pending" }, { accessStatus: "revoked" }]) {
    const route = createRoute(user, false, lessonElevenSlug);
    for (const file of lessonElevenAudio) assert.equal((await route.get(file.split("/"))).status, user ? 403 : 401);
    assert.equal(route.calls.reads, 0);
  }
  const route = createRoute({ accessStatus: "approved" }, false, lessonElevenSlug);
  for (const file of lessonElevenAudio) {
    const response = await route.get(file.split("/"), "bytes=2-5");
    assert.equal(response.status, 206);
    assert.equal(response.headers.get("content-type"), "audio/mp4");
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.equal(await response.text(), "2345");
  }
  for (const file of ["audio/section-00.m4a", "audio/section-09.m4a", "audio/other.m4a", "audio/section-01.exe", "audio/../section-01.m4a"]) {
    assert.equal((await route.get(file.split("/"))).status, 404);
  }
  assert.equal((await createRoute({ accessStatus: "approved" }, true, lessonElevenSlug).get(["audio", "section-01.m4a"])).status, 404);
});

test("lesson 11 styles stay inside the protected course experience", async () => {
  const { default: postcss } = await import("postcss");
  const stylesheet = postcss.parse(readFileSync(new URL("lesson-content/lesson-11/embedded.css", root), "utf8"));
  stylesheet.walkRules(rule => assert.ok(rule.selectors.every(selector => selector.startsWith("[data-lesson-eleven]"))));
});
const lessonThreeFiles = [
  "index.html", "styles.css", "lesson.js", "comic.png",
  ...["00-intro", "01-comic", "02-comic-translation", "03-countries-instruction",
    "04-more-countries", "05-usage", "06-nationalities-instruction", "07-plural-intro",
    "08-taxi-dialogue", "09-taxi-translation", "10-plural-explanation", "11-masculine",
    "12-feminine", "13-neuter", "14-plural-practice", "15-possessive-singular",
    "16-possessive-plural"].map(id => `audio/${id}.m4a`),
];

test("all lesson 3 files require approved access before any filesystem read", async () => {
  for (const user of [null, ...["pending", "rejected", "revoked"].map(accessStatus => ({ accessStatus }))]) {
    const route = createRoute(user, false, lessonThreeSlug);
    for (const file of lessonThreeFiles) {
      const response = await route.get(file.split("/"));
      assert.equal(response.status, user ? 403 : 401);
      assert.equal(response.headers.get("cache-control"), "private, no-store");
    }
    assert.equal(route.calls.reads, 0);
  }
});

test("approved students receive every lesson 3 asset from its private folder", async () => {
  const route = createRoute({ accessStatus: "approved" }, false, lessonThreeSlug);
  for (const file of lessonThreeFiles) {
    assert.ok(readFileSync(new URL(`lesson-content/lesson-03/${file}`, root)).length);
    const response = await route.get(file.split("/"));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.equal(response.headers.get("content-security-policy"), "frame-ancestors 'self'");
    assert.match(route.calls.paths.at(-1), /lesson-content[/\\]lesson-03[/\\]/);
    if (file.endsWith(".m4a")) assert.equal(response.headers.get("content-type"), "audio/mp4");
    if (file.endsWith(".png")) assert.equal(response.headers.get("content-type"), "image/png");
  }
});

test("lesson 3 rejects source, manifests, unknown files and traversal", async () => {
  const route = createRoute({ accessStatus: "approved" }, false, lessonThreeSlug);
  for (const file of ["Lesson.tsx", "transcripts.ts", "audio/manifest.json", "entry.tsx",
    "../lesson-02/index.html", "audio/../index.html", "audio/00-intro.mp3",
    "audio/section-01.mp3", "audio/missing.m4a", "images/lesson-02-comic-01.jpg"]) {
    assert.equal((await route.get(file.split("/"))).status, 404);
  }
  assert.equal(route.calls.reads, 0);
});

test("lesson 3 audio supports seeking, invalid ranges and missing files", async () => {
  const route = createRoute({ accessStatus: "approved" }, false, lessonThreeSlug);
  const parts = ["audio", "11-masculine.m4a"];
  const response = await route.get(parts, "bytes=2-4");
  assert.equal(response.status, 206);
  assert.equal(await response.text(), "234");
  assert.equal(response.headers.get("content-range"), "bytes 2-4/10");
  assert.equal((await route.get(parts, "bytes=100-")).status, 416);
  assert.equal((await createRoute({ accessStatus: "approved" }, true, lessonThreeSlug).get(parts)).status, 404);
});

test("lesson 3 appears below existing materials only for approved students", async () => {
  for (const user of [null, { id: "student", accessStatus: "pending" }, { id: "student", accessStatus: "approved" }]) {
    const page = loadModule("app/lessons/[slug]/page.tsx", {
      "next/link": ({ children, ...props }) => React.createElement("a", props, children),
      "next/navigation": { notFound: () => { throw new Error("Not found"); } },
      "@/data/lessons": lessons,
      "@/lib/access-control": access,
      "@/lib/supabase-server": { getCurrentUser: async () => user, logActivity: async () => {} },
      "@/components/LessonOneGammaExperience": () => null,
      "@/components/LessonTwoExperience": () => null,
      "@/components/LessonThreeExperience": loadModule("components/LessonThreeExperience.tsx").default,
      "@/components/LessonFourExperience": () => null,
      "@/components/LessonElevenExperience": () => null,
      "@/components/LessonSeventeenExperience": () => null,
      "@/components/LessonEighteenExperience": () => null,
      "@/components/LessonNineteenExperience": () => null,
    });
    const html = renderToStaticMarkup(await page.default({ params: Promise.resolve({ slug: lessonThreeSlug }) }));
    const frame = html.indexOf(`src="/api/lesson-content/${lessonThreeSlug}/index.html"`);
    if (user?.accessStatus === "approved") {
      assert.ok(frame > html.indexOf("Открыть презентацию"));
      assert.ok(frame > html.indexOf("Telegram-пост"));
    } else {
      assert.equal(frame, -1);
      assert.match(html, /Доступ к материалам ожидает подтверждения/);
    }
  }
});

function createFeedbackRoute(fail = false, user = null) {
  const submissions = [];
  const route = loadModule("app/api/lesson-feedback/route.ts", {
    "@/data/lessons": lessons,
    "@/lib/access-control": access,
    "@/lib/supabase-server": {
      getCurrentUser: async () => user,
      listApprovedLessonFeedback: async () => [],
      saveLessonFeedback: async (entry) => { if (fail) throw new Error("private database failure"); submissions.push(entry); },
    },
  });
  const submit = (body, origin = "https://ty-serb-lesson-three.lixi141210.chatgpt.site") => route.POST(new Request("https://ty-serb.vercel.app/api/lesson-feedback", {
    method: "POST", headers: { "Content-Type": "application/json", origin }, body: JSON.stringify(body),
  }));
  return { route, submissions, submit };
}

test("lesson 11 feedback accepts every step only for approved students or admins", async () => {
  for (const user of [null, { accessStatus: "pending" }, { accessStatus: "revoked" }]) {
    const route = createFeedbackRoute(false, user);
    const response = await route.submit({ lessonSlug: lessonElevenSlug, section: "l11-intro", message: "Вопрос" }, "https://ty-serb.vercel.app");
    assert.equal(response.status, user ? 403 : 401);
    assert.equal(route.submissions.length, 0);
  }
  for (const user of [{ id: "student", accessStatus: "approved" }, { id: "teacher", isAdmin: true }]) {
    for (const [id] of elevenWorkflow.steps) {
      const route = createFeedbackRoute(false, user);
      const response = await route.submit({ lessonSlug: lessonElevenSlug, section: `l11-${id}`, name: " Лида ", message: " Вопрос " }, "https://ty-serb.vercel.app");
      assert.equal(response.status, 200);
      assert.equal((await response.json()).ok, true);
      assert.equal(route.submissions[0].userId, user.id);
      assert.equal(route.submissions[0].section, `l11-${id}`);
      assert.equal(route.submissions[0].lessonSlug, lessonElevenSlug);
      assert.equal(route.submissions[0].message, "Вопрос");
      assert.equal((await route.submit({ lessonSlug: lessonElevenSlug, section: `l11-${id}`, message: "Ещё вопрос" }, "https://ty-serb.vercel.app")).status, 429);
    }
  }
});

test("lesson 11 feedback rejects invalid sections and reports storage failures", async () => {
  const user = { id: "student", accessStatus: "approved" };
  const invalid = createFeedbackRoute(false, user);
  for (const extra of [{ section: "l11-missing" }, { section: "l3-comic" }, { message: " " }, { kind: "introduction" }]) {
    assert.equal((await invalid.submit({ lessonSlug: lessonElevenSlug, section: "l11-intro", message: "Вопрос", ...extra }, "https://ty-serb.vercel.app")).status, 400);
  }
  assert.equal((await invalid.submit({ lessonSlug: lessonElevenSlug, section: "l11-intro", message: "Вопрос" }, "https://unrelated.example")).status, 403);
  assert.equal(invalid.submissions.length, 0);
  const failed = await createFeedbackRoute(true, user).submit({ lessonSlug: lessonElevenSlug, section: "l11-intro", message: "Вопрос" }, "https://ty-serb.vercel.app");
  assert.equal(failed.status, 500);
  assert.doesNotMatch(await failed.text(), /private database failure|"ok":true/);
});

test("lesson 11 feedback reaches the existing teacher moderation panel", async () => {
  const route = createFeedbackRoute(false, { id: "student", accessStatus: "approved" });
  await route.submit({ lessonSlug: lessonElevenSlug, section: "l11-grammar", message: "Вопрос о прилагательных" }, "https://ty-serb.vercel.app");
  const entry = route.submissions[0];
  const { default: AdminPage } = loadModule("app/admin/page.tsx", {
    "@/app/admin/actions": { moderateFeedbackAction() {}, updateAccessStatusAction() {} },
    "@/lib/supabase-server": {
      requireAdmin: async () => {}, listProfiles: async () => [],
      listRecentActivity: async () => [{ id: "feedback-11", user_id: entry.userId, lesson_slug: entry.lessonSlug, created_at: "2026-10-08T10:00:00Z", action_type: `lesson_feedback_pending:${JSON.stringify(entry)}` }],
    },
  });
  const html = renderToStaticMarkup(await AdminPage({}));
  assert.match(html, /l11-grammar/);
  assert.match(html, /Вопрос о прилагательных/);
  assert.match(html, /ожидает проверки/);
});

test("lesson 4 feedback uses the existing teacher channel and exact Site origin", async () => {
  const origin = "https://ty-serb-lesson-four.lixi141210.chatgpt.site";
  for (const section of ["intro", "opening", "questions", "molim", "practice", "comic", "learning", "homework"]) {
    const route = createFeedbackRoute();
    const result = await route.submit({ lessonSlug: lessonFourSlug, section: `l4-${section}`, message: "Вопрос по разделу" }, origin);
    assert.equal(result.status, 200);
    assert.equal(result.headers.get("access-control-allow-origin"), origin);
    assert.equal(route.submissions[0].section, `l4-${section}`);
    assert.equal(route.submissions[0].lessonSlug, lessonFourSlug);
  }
  const route = createFeedbackRoute();
  const preflight = await route.route.OPTIONS(new Request("https://ty-serb.vercel.app/api/lesson-feedback", { method: "OPTIONS", headers: { origin } }));
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("access-control-allow-origin"), origin);
  assert.equal(preflight.headers.get("access-control-allow-credentials"), null);
  assert.equal((await route.submit({ lessonSlug: lessonFourSlug, section: "l4-unknown", message: "Вопрос" }, origin)).status, 400);
  assert.equal((await route.submit({ lessonSlug: lessonFourSlug, section: "l4-intro", message: "Вопрос", kind: "introduction" }, origin)).status, 400);
  assert.equal((await route.submit({ lessonSlug: lessonFourSlug, section: "l4-intro", message: "Вопрос" }, "https://unrelated.example")).status, 403);
  const failure = await createFeedbackRoute(true).submit({ lessonSlug: lessonFourSlug, section: "l4-intro", message: "Вопрос" }, origin);
  assert.equal(failure.status, 500);
});

test("lesson 19 sends each section to the existing teacher feedback channel", async () => {
  const slug = "polinin-rodjendan";
  for (const section of ["comic", "heroes", "words", "grammar", "timeline", "transform", "negative", "questions", "reading", "gifts", "quiz", "homework"]) {
    const route = createFeedbackRoute();
    const response = await route.submit({ lessonSlug: slug, section: `l19-${section}`, name: "Лида", message: "Вопрос" }, "https://ty-serb.vercel.app");
    assert.equal(response.status, 200);
    assert.equal(route.submissions[0].lessonSlug, slug);
    assert.equal(route.submissions[0].section, `l19-${section}`);
  }
  const invalid = createFeedbackRoute();
  for (const extra of [{ section: "l19-unknown" }, { section: "l3-comic" }, { kind: "introduction" }]) {
    assert.equal((await invalid.submit({ lessonSlug: slug, section: "l19-comic", message: "Вопрос", ...extra }, "https://ty-serb.vercel.app")).status, 400);
  }
  assert.equal(invalid.submissions.length, 0);
});

test("lesson 3 feedback accepts only its known sections and preserves lesson 1 submissions", async () => {
  for (const section of ["intro", "comic", "countries", "taxi", "plural", "words", "possessives", "practice", "recap", "homework"]) {
    const route = createFeedbackRoute();
    const response = await route.submit({ lessonSlug: lessonThreeSlug, section: `l3-${section}`, name: "Лида", message: "Мой вопрос" });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("access-control-allow-origin"), "https://ty-serb-lesson-three.lixi141210.chatgpt.site");
    assert.equal(route.submissions[0].lessonSlug, lessonThreeSlug);
    assert.equal(route.submissions[0].section, `l3-${section}`);
    assert.equal(route.submissions[0].kind, "feedback");
    assert.equal((await route.submit({ lessonSlug: lessonThreeSlug, section: `l3-${section}`, message: "Ещё вопрос" })).status, 429);
  }
  const first = createFeedbackRoute();
  assert.equal((await first.submit({ lessonSlug: "azbuka-i-proiznoshenie", section: "introductions", message: "Ja se zovem…", kind: "introduction" }, "https://ty-serb.vercel.app")).status, 200);
  assert.equal(first.submissions[0].kind, "introduction");
  const invalid = createFeedbackRoute();
  for (const extra of [{ section: "l3-unknown" }, { message: " " }, { kind: "introduction" }, { lessonSlug: "unknown" }]) {
    assert.equal((await invalid.submit({ lessonSlug: lessonThreeSlug, section: "l3-intro", message: "Вопрос", ...extra })).status, 400);
  }
  assert.equal(invalid.submissions.length, 0);
});

test("lesson 2 feedback accepts every known section from the course and its Site", async () => {
  for (const origin of ["https://ty-serb.vercel.app", "https://ty-serb-lesson-two.lixi141210.chatgpt.site"]) {
    for (const section of ["intro", "reading", "vocabulary", "comic", "grammar", "comparison", "practice", "phrases", "homework", "recap"]) {
      const route = createFeedbackRoute();
      const response = await route.submit({ lessonSlug: "kak-predstavitsya", section: `l2-${section}`, name: " Лида ", message: " Мой вопрос " }, origin);
      assert.equal(response.status, 200);
      assert.equal((await response.json()).ok, true);
      assert.equal(route.submissions[0].lessonSlug, "kak-predstavitsya");
      assert.equal(route.submissions[0].section, `l2-${section}`);
      assert.equal(route.submissions[0].name, "Лида");
      assert.equal(route.submissions[0].message, "Мой вопрос");
      assert.equal(route.submissions[0].kind, "feedback");
      assert.equal(response.headers.get("access-control-allow-origin"), origin.includes("chatgpt.site") ? origin : null);
      assert.equal((await route.submit({ lessonSlug: "kak-predstavitsya", section: `l2-${section}`, message: "Ещё вопрос" }, origin)).status, 429);
    }
  }
});

test("lesson 2 rejects unknown sections, empty comments and introduction messages", async () => {
  const route = createFeedbackRoute();
  for (const extra of [{ section: "l2-unknown" }, { section: "l3-intro" }, { section: "1" }, { message: " " }, { kind: "introduction" }]) {
    assert.equal((await route.submit({ lessonSlug: "kak-predstavitsya", section: "l2-intro", message: "Вопрос", ...extra }, "https://ty-serb.vercel.app")).status, 400);
  }
  assert.equal(route.submissions.length, 0);
});

test("lesson 2 feedback preflight permits only its exact Site origin and storage failures are reported", async () => {
  const route = createFeedbackRoute(true);
  const origin = "https://ty-serb-lesson-two.lixi141210.chatgpt.site";
  const preflight = await route.route.OPTIONS(new Request("https://ty-serb.vercel.app/api/lesson-feedback", { method: "OPTIONS", headers: { origin } }));
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("access-control-allow-origin"), origin);
  assert.equal(preflight.headers.get("access-control-allow-credentials"), null);
  const untrustedOrigin = "https://ty-serb-lesson-two.lixi141210.chatgpt.site.unrelated.example";
  assert.equal((await route.route.OPTIONS(new Request("https://ty-serb.vercel.app/api/lesson-feedback", { method: "OPTIONS", headers: { origin: untrustedOrigin } }))).status, 403);
  assert.equal((await route.submit({ lessonSlug: "kak-predstavitsya", section: "l2-intro", message: "Вопрос" }, untrustedOrigin)).status, 403);
  const failed = await route.submit({ lessonSlug: "kak-predstavitsya", section: "l2-intro", message: "Вопрос" }, origin);
  assert.equal(failed.status, 500);
  assert.doesNotMatch(await failed.text(), /private database failure|"ok":true/);
});

test("lesson 2 feedback reaches the existing teacher moderation panel", async () => {
  const route = createFeedbackRoute();
  await route.submit({ lessonSlug: "kak-predstavitsya", section: "l2-grammar", name: "Лида", message: "Вопрос о глаголе biti" }, "https://ty-serb.vercel.app");
  const entry = route.submissions[0];
  const { default: AdminPage } = loadModule("app/admin/page.tsx", {
    "@/app/admin/actions": { moderateFeedbackAction() {}, updateAccessStatusAction() {} },
    "@/lib/supabase-server": {
      requireAdmin: async () => {}, listProfiles: async () => [],
      listRecentActivity: async () => [{ id: "feedback-2", user_id: null, lesson_slug: entry.lessonSlug, created_at: "2026-10-06T10:00:00Z", action_type: `lesson_feedback_pending:${JSON.stringify(entry)}` }],
    },
  });
  const html = renderToStaticMarkup(await AdminPage({}));
  assert.match(html, /Обратная связь по урокам/);
  assert.match(html, /l2-grammar/);
  assert.match(html, /Вопрос о глаголе biti/);
  assert.match(html, /ожидает проверки/);
});

test("feedback preflight is limited to the lesson Site and failures do not claim delivery", async () => {
  const route = createFeedbackRoute(true);
  const response = await route.route.OPTIONS(new Request("https://ty-serb.vercel.app/api/lesson-feedback", {
    method: "OPTIONS", headers: { origin: "https://ty-serb-lesson-three.lixi141210.chatgpt.site" },
  }));
  assert.equal(response.status, 204);
  assert.equal(response.headers.get("access-control-allow-methods"), "POST, OPTIONS");
  assert.equal(response.headers.get("access-control-allow-credentials"), null);
  assert.equal((await route.route.OPTIONS(new Request("https://ty-serb.vercel.app/api/lesson-feedback", { method: "OPTIONS", headers: { origin: "https://unrelated.example" } }))).status, 403);
  assert.equal((await route.submit({ lessonSlug: lessonThreeSlug, section: "l3-intro", message: "Вопрос" }, "https://unrelated.example")).status, 403);
  const failed = await route.submit({ lessonSlug: lessonThreeSlug, section: "l3-intro", message: "Вопрос" });
  assert.equal(failed.status, 500);
  assert.doesNotMatch(await failed.text(), /private database failure/);
});

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
  "index.html", "styles.css", "embedded.css", "lesson.js",
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
      "@/components/LessonThreeExperience": loadModule("components/LessonThreeExperience.tsx").default,
      "@/components/LessonFourExperience": () => null,
      "@/components/LessonElevenExperience": () => null,
      "@/components/LessonSeventeenExperience": () => null,
      "@/components/LessonEighteenExperience": () => null,
      "@/components/LessonNineteenExperience": () => null,
    });
    const html = renderToStaticMarkup(await page.default({ params: Promise.resolve({ slug: "kak-predstavitsya" }) }));
    const lessonContent = html.indexOf("data-lesson-two=");
    if (user) {
      assert.ok(lessonContent > html.indexOf("Открыть презентацию"));
      assert.ok(lessonContent > html.indexOf("Telegram-пост"));
      assert.doesNotMatch(html, /<iframe/);
      assert.match(html, /href="\/api\/materials\/kak-predstavitsya\/telegram"/);
    } else {
      assert.equal(lessonContent, -1);
      assert.match(html, /Доступ к материалам ожидает подтверждения/);
    }
  }
});

test("lesson 2 styles cannot change the surrounding course page", async () => {
  const { default: postcss } = await import("postcss");
  const stylesheet = postcss.parse(readFileSync(new URL("lesson-content/lesson-02/embedded.css", root), "utf8"));
  stylesheet.walkRules(rule => assert.ok(rule.selectors.every(selector => selector.startsWith("[data-lesson-two]"))));
});

test("lesson 2 initially exposes one section and keeps all media protected", () => {
  const Lesson = loadModule("lesson-content/lesson-02/Lesson.tsx").default;
  const html = renderToStaticMarkup(React.createElement(Lesson));
  const sections = html.match(/<(?:header|section)\b[^>]*data-lesson-section[^>]*>/g);
  assert.equal(sections.length, 9);
  assert.equal(sections.filter(section => !/\bhidden=/.test(section)).length, 1);
  assert.match(sections.find(section => !/\bhidden=/.test(section)), /id="intro"/);
  assert.equal((html.match(/data-lesson-audio=/g) || []).length, 9);
  assert.equal((html.match(/\.m4a\?v=balanced-stereo/g) || []).length, 9);
  assert.equal((html.match(/data-lesson-feedback=/g) || []).length, 9);
  assert.doesNotMatch(html, /id="recap"|href="#recap"|Раздел 10:|Шта сада умем/);
  assert.match(html, /Раздел 9: Домашнее задание/);
  for (const section of html.match(/<(header|section)\b[^>]*data-lesson-section[^>]*>[\s\S]*?<\/\1>/g) || []) {
    const id = section.match(/\bid="([^"]+)"/)[1];
    assert.match(section, new RegExp(`data-lesson-feedback="l2-${id}"`));
    assert.match(section, new RegExp(`for="l2-${id}-message"`));
    assert.match(section, /<textarea[^>]*required=""[^>]*minlength="2"[^>]*maxlength="1500"/i);
  }
  assert.doesNotMatch(html, /lesson-02-professions-0[12]\.png/);
  assert.equal((html.match(/<img\b/g) || []).length, 9);
  assert.match(html, /Nepoznate reči/);
  assert.match(html, /Переход между разделами/);
  assert.doesNotMatch(html, /(?:src|href)="\/lesson-02\//);
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
