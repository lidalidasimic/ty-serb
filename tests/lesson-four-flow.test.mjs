import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import React from "react";
import ts from "typescript";

const require = createRequire(import.meta.url);
const directory = new URL("../lesson-content/lesson-04/", import.meta.url);

function load(name, react, globals = {}) {
  const source = ts.transpileModule(readFileSync(new URL(name, directory), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(source, {
    module, exports: module.exports,
    require: name => name === "react" ? react : name === "./lesson-tools" ? { Feedback() {}, Fireworks() {} } : require(name),
    ...globals,
  });
  return module.exports;
}

function descendants(element) {
  if (!React.isValidElement(element)) return [];
  return [element, ...React.Children.toArray(element.props.children).flatMap(descendants)];
}

function flowHarness(saved = null) {
  const values = [];
  const dependencies = [];
  const effects = [];
  let cursor = 0;
  let effectCursor = 0;
  let scrolls = 0;
  let persisted;
  const react = {
    ...React,
    useState(initial) {
      const index = cursor++;
      if (!(index in values)) values[index] = initial;
      return [values[index], value => { values[index] = typeof value === "function" ? value(values[index]) : value; }];
    },
    useRef: () => ({ current: { scrollIntoView() { scrolls++; } } }),
    useEffect(effect, deps) {
      const index = effectCursor++;
      if (!dependencies[index] || deps.some((value, i) => value !== dependencies[index][i])) effects.push(effect);
      dependencies[index] = deps;
    },
  };
  const { LessonFlow } = load("lesson-flow.tsx", react, {
    localStorage: { getItem: () => JSON.stringify(saved), setItem: (_, value) => { persisted = JSON.parse(value); } },
    location: { hash: "" }, history: { pushState() {} },
    window: { scrollTo() {}, frameElement: null }, document: { querySelectorAll: () => [] },
    addEventListener() {}, removeEventListener() {}, setTimeout() { return 1; }, clearTimeout() {},
  });
  function render() {
    cursor = 0; effectCursor = 0;
    const tree = LessonFlow({ children: null });
    effects.splice(0).forEach(effect => effect());
    return tree;
  }
  render();
  return { render, scrolls: () => scrolls, persisted: () => persisted };
}

test("one completion action unlocks each next section without navigating or radio choices", () => {
  const harness = flowHarness();
  const ids = ["intro", "opening", "questions", "molim", "practice", "comic", "learning", "homework"];
  let tree = harness.render();
  tree.props.value.jump(7);
  tree.props.value.advance("intro");
  tree = harness.render();
  assert.equal(tree.props.value.progress.active, 0);
  assert.equal(tree.props.value.progress.unlocked, 0);
  ids.forEach((id, index) => {
    tree.props.value.complete(id);
    tree = harness.render();
    assert.equal(tree.props.value.progress.active, index);
    assert.equal(tree.props.value.progress.unlocked, Math.min(7, index + 1));
    assert.equal(tree.props.value.progress.completed.length, index + 1);
    tree.props.value.complete(id);
    tree = harness.render();
    assert.equal(tree.props.value.progress.completed.length, index + 1);
    tree.props.value.advance(id);
    tree = harness.render();
    assert.equal(tree.props.value.progress.active, Math.min(7, index + 1));
    if (id === "learning") {
      assert.equal(tree.props.value.progress.finished, true, "class ends before homework");
      assert.equal(tree.props.value.progress.completed.includes("homework"), false);
      assert.ok(descendants(tree).find(element => element.props.className === "lesson-finish"));
    }
  });
  assert.equal(tree.props.value.progress.finished, true);
  const finish = descendants(tree).find(element => element.props.className === "lesson-finish");
  const fireworks = descendants(finish).find(element => typeof element.type === "function");
  assert.ok(fireworks, "fireworks belong to the completion panel, not the iframe viewport");
  const firstKey = fireworks.key;
  tree.props.value.advance("homework");
  tree = harness.render();
  const replay = descendants(tree).find(element => element.props.className === "lesson-finish");
  assert.notEqual(descendants(replay).find(element => typeof element.type === "function").key, firstKey);
  assert.ok(harness.scrolls() >= 2);
  assert.equal(harness.persisted().completed.length, 8);
});

test("old progress survives the removal of self-assessment fields", () => {
  const harness = flowHarness({ active: 3, unlocked: 4, completed: ["intro", "opening", "questions", "molim"], answers: { molim: { understood: "yes" } }, finished: false });
  const { progress } = harness.render().props.value;
  assert.equal(progress.active, 3);
  assert.equal(progress.completed.length, 4);
  assert.equal("answers" in progress, false);
});

for (const reduced of [false, true]) test(`fireworks draw within the panel in a tall iframe (reduced motion: ${reduced})`, () => {
  let effect;
  let scheduled;
  let disconnected = false;
  let strokes = 0;
  const points = [];
  const context = {
    setTransform() {}, clearRect() {}, beginPath() {},
    moveTo(x, y) { points.push([x, y]); }, lineTo(x, y) { points.push([x, y]); }, stroke() { strokes++; },
  };
  const canvas = { clientWidth: 390, clientHeight: 360, getContext: () => context };
  const { Fireworks } = load("lesson-tools.tsx", {
    ...React, useRef: () => ({ current: canvas }), useEffect: fn => { effect = fn; },
  }, {
    matchMedia: () => ({ matches: reduced }), devicePixelRatio: 3, innerWidth: 390, innerHeight: 12000,
    ResizeObserver: class { observe() {} disconnect() { disconnected = true; } },
    performance: { now: () => 100 }, requestAnimationFrame: fn => { scheduled = fn; return 1; }, cancelAnimationFrame() {},
  });
  Fireworks();
  const cleanup = effect();
  assert.equal(canvas.width, 780);
  assert.equal(canvas.height, 720);
  assert.ok(strokes >= 48, "celebration is drawn immediately, including reduced-motion mode");
  assert.ok(points.every(([x, y]) => x >= 0 && x <= 390 && y >= 0 && y <= 360));
  if (reduced) assert.equal(scheduled, undefined);
  else {
    assert.equal(typeof scheduled, "function");
    scheduled(450);
    assert.ok(strokes > 48);
  }
  cleanup();
  assert.equal(disconnected, true);
});
