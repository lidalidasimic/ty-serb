export const steps = [
  ["intro", "Вступление"],
  ["words", "Слова"],
  ["comic", "Комикс"],
  ["grammar", "Грамматика"],
  ["practice", "Практика"],
  ["test", "Мини-тест"],
  ["homework", "Домашнее задание"],
  ["apps", "LearningApps"],
] as const;

export type StepId = typeof steps[number][0];

export const requiredExercises: Record<StepId, string[]> = {
  intro: [], words: ["words"], comic: ["comic-words"], grammar: [],
  practice: ["forms", "sentences"], test: ["test"], homework: [], apps: ["apps"],
};

export const progressKey = "ty-serb-lesson-11-progress-v1";

export function isStep(value: unknown): value is StepId {
  return steps.some(([id]) => id === value);
}

export function restoreProgress(value: unknown): { active: StepId; completed: StepId[] } {
  const saved = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const completed = Array.isArray(saved.completed) ? [...new Set(saved.completed.filter(isStep))] : [];
  return { active: isStep(saved.active) ? saved.active : "intro", completed };
}

export function canCompleteStep(id: StepId, completed: StepId[], passed: Record<string, boolean>) {
  return completed.includes(id) || requiredExercises[id].every(key => passed[key] === true);
}

export function invalidateExercise(completed: StepId[], exercise: string) {
  const step = steps.find(([id]) => requiredExercises[id].includes(exercise))?.[0];
  return step ? completed.filter(id => id !== step && id !== "apps") : completed;
}

const latin = "a b v g d đ e ž z i j k l lj m n nj o p r s t ć u f h c č dž š".split(" ");
const cyrillic = "а б в г д ђ е ж з и ј к л љ м н њ о п р с т ћ у ф х ц ч џ ш".split(" ");

export function normalizeAnswer(value: string) {
  return value.toLowerCase().normalize("NFC")
    .replace(/dž|lj|nj|[a-zđžćčš]/g, letter => cyrillic[latin.indexOf(letter)] ?? letter)
    .replace(/[.,!?]/g, "").trim().replace(/\s+/g, " ");
}
