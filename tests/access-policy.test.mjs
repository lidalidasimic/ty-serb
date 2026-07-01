import test from "node:test";
import assert from "node:assert/strict";

function canOpenProtectedMaterials(user) {
  return Boolean(user?.isAdmin || user?.accessStatus === "approved");
}

function canOpenLesson(user, lesson) {
  return lesson.number === 1 || canOpenProtectedMaterials(user);
}

test("guest can open only the first demo lesson", () => {
  assert.equal(canOpenLesson(null, { number: 1 }), true);
  assert.equal(canOpenLesson(null, { number: 2 }), false);
});

test("pending user cannot open protected lessons", () => {
  assert.equal(canOpenLesson({ accessStatus: "pending" }, { number: 2 }), false);
});

test("approved user can open protected lessons", () => {
  assert.equal(canOpenLesson({ accessStatus: "approved" }, { number: 2 }), true);
});

test("revoked user loses protected access", () => {
  assert.equal(canOpenLesson({ accessStatus: "revoked" }, { number: 2 }), false);
});

test("admin can open protected lessons", () => {
  assert.equal(canOpenLesson({ accessStatus: "revoked", isAdmin: true }, { number: 2 }), true);
});
