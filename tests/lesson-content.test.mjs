import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const root = new URL("../", import.meta.url);

function loadModule(relativePath, dependencies = {}) {
  const filename = fileURLToPath(new URL(relativePath, root));
  const source = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(source, {
    exports: module.exports, module, process, Buffer, Uint8Array,
    require: (name) => name in dependencies ? dependencies[name] : require(name),
  }, { filename });
  return module.exports;
}

const lessons = loadModule("data/lessons.ts");
const access = loadModule("lib/access-control.ts");
const content = Buffer.from("0123456789");

function createRoute(user, missing = false) {
  const calls = { reads: 0 };
  const route = loadModule("app/api/lesson-content/[slug]/[...path]/route.ts", {
    "@/data/lessons": lessons,
    "@/lib/access-control": access,
    "@/lib/supabase-server": { getCurrentUser: async () => user },
    "node:fs/promises": {
      readFile: async () => {
        calls.reads++;
        if (missing) throw Object.assign(new Error("Missing"), { code: "ENOENT" });
        return content;
      },
    },
  });
  return { calls, get: (parts, range) => route.GET(
    new Request("https://ty-serb.vercel.app/api/lesson-content/misija-rtanj/index.html", {
      headers: range ? { range } : {},
    }),
    { params: Promise.resolve({ slug: "misija-rtanj", path: parts }) },
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
