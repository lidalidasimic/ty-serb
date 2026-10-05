import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const { NextRequest } = require("next/server");
const { unstable_doesMiddlewareMatch } = require("next/experimental/testing/server");
const root = new URL("../", import.meta.url);
const env = {
  NODE_ENV: "production",
  NEXT_PUBLIC_SUPABASE_URL: "https://auth.example.test",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "test-service-key",
};

function loadModule(relativePath, dependencies = {}, globals = {}) {
  const filename = fileURLToPath(new URL(relativePath, root));
  const source = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(source, {
    exports: module.exports, module, process: { env }, atob, AbortSignal,
    require: (name) => name in dependencies ? dependencies[name] : require(name),
    ...globals,
  }, { filename });
  return module.exports;
}

const session = loadModule("lib/auth-session.ts");
const access = loadModule("lib/access-control.ts");
const { accessTokenCookie, refreshTokenCookie, rememberMeCookie } = session;
const profile = { id: "student-id", email: "student@example.test", access_status: "approved" };

function token(exp) {
  return `header.${Buffer.from(JSON.stringify({ exp })).toString("base64url")}.signature`;
}

const expiredToken = token(Math.floor(Date.now() / 1000) - 60);
const freshToken = token(Math.floor(Date.now() / 1000) + 3600);

function createMiddleware(cookies = {}, result = { access_token: freshToken, refresh_token: "rotated-refresh" }, status = 200) {
  const calls = [];
  const request = new NextRequest("https://ty-serb.vercel.app/lessons", {
    headers: { cookie: Object.entries(cookies).map(([name, value]) => `${name}=${value}`).join("; ") },
  });
  const { middleware, config } = loadModule("middleware.ts", { "@/lib/auth-session": session }, {
    fetch: async (url, options) => {
      calls.push({ url, options });
      return Response.json(result, { status });
    },
  });
  return { request, calls, config, run: () => middleware(request) };
}

test("expired remembered session refreshes both the page request and browser", async () => {
  const flow = createMiddleware({
    [accessTokenCookie]: expiredToken,
    [refreshTokenCookie]: "old-refresh",
    [rememberMeCookie]: "1",
  });
  const response = await flow.run();
  assert.equal(flow.calls.length, 1);
  assert.equal(flow.calls[0].url, "https://auth.example.test/auth/v1/token?grant_type=refresh_token");
  assert.equal(JSON.parse(flow.calls[0].options.body).refresh_token, "old-refresh");
  assert.equal(flow.request.cookies.get(accessTokenCookie).value, freshToken);
  assert.equal(flow.request.cookies.get(refreshTokenCookie).value, "rotated-refresh");
  assert.ok(response.headers.get("x-middleware-request-cookie").includes(freshToken));
  for (const name of [accessTokenCookie, refreshTokenCookie, rememberMeCookie]) {
    const cookie = response.cookies.get(name);
    assert.ok(cookie.maxAge > 60 * 60 * 24 * 30);
    assert.equal(cookie.httpOnly, true);
    assert.equal(cookie.secure, true);
    assert.equal(cookie.sameSite, "lax");
  }
  assert.equal(response.headers.get("cache-control"), "private, no-store");

  const calls = [];
  const readOnlyCookies = {
    get: name => flow.request.cookies.get(name),
    set: () => { throw new Error("Cannot write cookies while rendering"); },
  };
  const server = loadModule("lib/supabase-server.ts", {
    "@/lib/auth-session": session,
    "@/lib/access-control": access,
    "next/headers": { cookies: async () => readOnlyCookies },
  }, {
    fetch: async (url, options) => {
      calls.push(url);
      if (url.endsWith("/auth/v1/user")) {
        assert.equal(options.headers.Authorization, `Bearer ${freshToken}`);
        return Response.json({ id: profile.id, email: profile.email });
      }
      assert.ok(url.includes("/rest/v1/profiles?"));
      return Response.json([profile]);
    },
  });
  const user = await server.getCurrentUser();
  assert.equal(user.id, profile.id);
  assert.equal(user.accessStatus, "approved");
  assert.equal(calls.filter(url => url.includes("grant_type=refresh_token")).length, 0);
});

test("valid session does not rotate refresh tokens on every request", async () => {
  const flow = createMiddleware({ [accessTokenCookie]: freshToken, [refreshTokenCookie]: "old-refresh" });
  const response = await flow.run();
  assert.equal(flow.calls.length, 0);
  assert.equal(response.cookies.getAll().length, 0);
});

test("refresh cookie recovers a missing access token", async () => {
  const flow = createMiddleware({ [refreshTokenCookie]: "old-refresh", [rememberMeCookie]: "1" });
  const response = await flow.run();
  assert.equal(flow.calls.length, 1);
  assert.equal(response.cookies.get(accessTokenCookie).value, freshToken);
});

test("unchecked remember me stays a browser session after refresh", async () => {
  const flow = createMiddleware({ [accessTokenCookie]: expiredToken, [refreshTokenCookie]: "old-refresh" });
  const response = await flow.run();
  for (const name of [accessTokenCookie, refreshTokenCookie]) {
    assert.equal(response.cookies.get(name).maxAge, undefined);
    assert.equal(response.cookies.get(name).expires, undefined);
  }
  assert.equal(response.cookies.get(rememberMeCookie), undefined);
});

test("guests do not call the auth service", async () => {
  const flow = createMiddleware();
  await flow.run();
  assert.equal(flow.calls.length, 0);
});

test("temporary Auth failure preserves credentials for a later retry", async () => {
  const flow = createMiddleware({ [accessTokenCookie]: expiredToken, [refreshTokenCookie]: "old-refresh" }, {}, 503);
  const response = await flow.run();
  assert.equal(flow.request.cookies.get(refreshTokenCookie).value, "old-refresh");
  assert.equal(response.cookies.getAll().length, 0);
});

test("incomplete Auth responses never replace half of a session", async () => {
  const flow = createMiddleware({ [accessTokenCookie]: expiredToken, [refreshTokenCookie]: "old-refresh" }, { access_token: freshToken });
  const response = await flow.run();
  assert.equal(flow.request.cookies.get(accessTokenCookie).value, expiredToken);
  assert.equal(flow.request.cookies.get(refreshTokenCookie).value, "old-refresh");
  assert.equal(response.cookies.getAll().length, 0);
});

test("forged future expiry does not bypass server authentication", async () => {
  const server = loadModule("lib/supabase-server.ts", {
    "@/lib/auth-session": session,
    "@/lib/access-control": access,
    "next/headers": { cookies: async () => ({ get: () => ({ value: freshToken }) }) },
  }, { fetch: async () => Response.json({ error: "Invalid token" }, { status: 401 }) });
  assert.equal(await server.getCurrentUser(), null);
});

test("middleware covers protected lesson assets while skipping Next static assets", () => {
  const { config } = createMiddleware();
  for (const url of ["/lessons", "/api/lesson-content/lesson-2/lesson.js", "/api/lesson-content/lesson-2/audio.m4a"]) {
    assert.equal(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url }), true);
  }
  assert.equal(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: "/_next/static/chunk.js" }), false);
});
