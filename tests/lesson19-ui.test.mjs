import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
function lesson() {
  const activity = { querySelector: () => ({ focus() {} }) };
  const context = vm.createContext({
    document: { querySelector: () => activity, addEventListener() {}, body: { classList: { toggle() {} } } },
    window: { addEventListener() {} },
    localStorage: { getItem: () => null },
  });
  const source = readFileSync(new URL('lesson-content/lesson-19/lesson.js', root), 'utf8');
  vm.runInContext(source.replace(/render\(\);\s*$/, ''), context);
  vm.runInContext('renderActivity=()=>{};progress=()=>{};', context);
  return expression => vm.runInContext(expression, context);
}

test('lesson 19 has exactly four past and four future transformations', () => {
  const run = lesson();
  assert.equal(run('tasks.past.rows.length'), 4);
  assert.equal(run('tasks.future.rows.length'), 4);
});

test('vocabulary connects either endpoint first and replaces occupied pairs', () => {
  const run = lesson();
  run("selectWordEndpoint('word',0);selectWordEndpoint('translation',1)");
  assert.equal(run("record('words-0').value"), 'подарок');
  run("selectWordEndpoint('translation',1);selectWordEndpoint('word',1)");
  assert.equal(run("record('words-0').value"), '');
  assert.equal(run("record('words-1').value"), 'подарок');
  run("selectWordEndpoint('word',0);selectWordEndpoint('translation',0);checkTask('words')");
  assert.equal(run("record('words-0').status"), 'correct');
  assert.equal(run("record('words-2').status"), 'wrong');
  assert.equal(run("allCorrect('words')"), false);
});

test('revealed vocabulary answers do not complete the exercise', () => {
  const run = lesson();
  run("tasks.words.rows.forEach((_,i)=>{selectWordEndpoint('word',i);selectWordEndpoint('translation',i)});checkTask('words')");
  assert.equal(run("allCorrect('words')"), true);
  assert.match(run('wordConnectionsHTML()'), /10 из 10 верно/);
  run("checkTask('words',true)");
  assert.equal(run("allCorrect('words')"), false);
  assert.match(run('wordConnectionsHTML()'), /connection-solutions/);
});

test('lesson title precedes the embedded lesson and vocabulary has no dropdowns', () => {
  const run = lesson();
  const html = run('wordConnectionsHTML()');
  assert.equal((html.match(/data-word-side=/g) || []).length, 20);
  assert.equal(html.includes('<select'), false);
  assert.match(html, /connection-lines/);
  const component = readFileSync(new URL('components/LessonNineteenExperience.tsx', root), 'utf8');
  assert.ok(component.indexOf('Лекция 19. Мисија Ртањ 2') < component.indexOf('<iframe'));
});
