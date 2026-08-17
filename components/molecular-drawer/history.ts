import { HistoryState, Molecule } from './types';

export const INITIAL_MOLECULE: Molecule = {
  atoms: [],
  bonds: [],
  texts: [],
};

export const DEFAULT_HISTORY_LIMIT = 100;

/**
 * Deep clone سازگار با داده‌های فعلی Molecule.
 * ابتدا از structuredClone (در مرورگرهای مدرن) استفاده می‌کند
 * و در صورت نبود آن، از JSON clone کمک می‌گیرد.
 */
export function cloneMolecule(molecule: Molecule): Molecule {
  if (typeof structuredClone === 'function') {
    return structuredClone(molecule);
  }

  return JSON.parse(JSON.stringify(molecule)) as Molecule;
}

export function createEmptyMolecule(): Molecule {
  return cloneMolecule(INITIAL_MOLECULE);
}

export function createHistory(
  initialMolecule: Molecule = INITIAL_MOLECULE
): HistoryState {
  return {
    past: [],
    present: cloneMolecule(initialMolecule),
    future: [],
  };
}

/**
 * مقایسه‌ی محتوایی Molecule.
 * برای تشخیص اینکه drag یا edit واقعاً تغییری ایجاد کرده است استفاده می‌شود.
 */
export function moleculesAreEqual(a: Molecule, b: Molecule): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function limitPastStates(
  past: Molecule[],
  limit: number
): Molecule[] {
  if (limit <= 0) return [];
  if (past.length <= limit) return past;

  return past.slice(past.length - limit);
}

/**
 * ثبت یک تغییر نهایی در history.
 *
 * - present فعلی به past منتقل می‌شود.
 * - nextMolecule به present تبدیل می‌شود.
 * - future پاک می‌شود، چون پس از تغییر جدید redo دیگر معتبر نیست.
 */
export function pushState(
  history: HistoryState,
  nextMolecule: Molecule,
  limit = DEFAULT_HISTORY_LIMIT
): HistoryState {
  if (moleculesAreEqual(history.present, nextMolecule)) {
    return history;
  }

  const nextPast = limitPastStates(
    [...history.past, cloneMolecule(history.present)],
    limit
  );

  return {
    past: nextPast,
    present: cloneMolecule(nextMolecule),
    future: [],
  };
}

/**
 * فقط present را تغییر می‌دهد، بدون ثبت در history.
 *
 * کاربرد اصلی:
 * - preview هنگام کشیدن atom با ماوس
 * - تغییرات موقت پیش از mouseup
 *
 * هشدار:
 * این تابع را برای تغییرات نهایی مانند افزودن atom یا bond استفاده نکن؛
 * برای آن‌ها pushState مناسب است.
 */
export function replacePresent(
  history: HistoryState,
  nextMolecule: Molecule
): HistoryState {
  if (moleculesAreEqual(history.present, nextMolecule)) {
    return history;
  }

  return {
    ...history,
    present: cloneMolecule(nextMolecule),
  };
}

/**
 * ثبت نهایی یک preview.
 *
 * فرض کنید در شروع drag، snapshot گرفته‌اید؛
 * در حین drag از replacePresent استفاده کرده‌اید؛
 * و اکنون در mouseup می‌خواهید فقط یک Undo entry ثبت شود.
 */
export function commitPreview(
  history: HistoryState,
  beforePreview: Molecule,
  limit = DEFAULT_HISTORY_LIMIT
): HistoryState {
  if (moleculesAreEqual(beforePreview, history.present)) {
    return {
      ...history,
      present: cloneMolecule(beforePreview),
    };
  }

  const nextPast = limitPastStates(
    [...history.past, cloneMolecule(beforePreview)],
    limit
  );

  return {
    past: nextPast,
    present: cloneMolecule(history.present),
    future: [],
  };
}

export function canUndo(history: HistoryState): boolean {
  return history.past.length > 0;
}

export function canRedo(history: HistoryState): boolean {
  return history.future.length > 0;
}

export function undo(history: HistoryState): HistoryState {
  if (!canUndo(history)) {
    return history;
  }

  const previousMolecule = history.past[history.past.length - 1];

  return {
    past: history.past.slice(0, -1).map(cloneMolecule),
    present: cloneMolecule(previousMolecule),
    future: [cloneMolecule(history.present), ...history.future.map(cloneMolecule)],
  };
}

export function redo(history: HistoryState): HistoryState {
  if (!canRedo(history)) {
    return history;
  }

  const nextMolecule = history.future[0];

  return {
    past: [...history.past.map(cloneMolecule), cloneMolecule(history.present)],
    present: cloneMolecule(nextMolecule),
    future: history.future.slice(1).map(cloneMolecule),
  };
}

/**
 * پاک‌کردن ساختار با قابلیت Undo.
 */
export function clearCanvas(
  history: HistoryState,
  limit = DEFAULT_HISTORY_LIMIT
): HistoryState {
  return pushState(history, createEmptyMolecule(), limit);
}

/**
 * جایگزین‌کردن یک ساختار کامل (مثلاً هنگام Import JSON/Molfile).
 *
 * به طور پیش‌فرض import یک تغییر قابل Undo محسوب می‌شود.
 */
export function loadMolecule(
  history: HistoryState,
  molecule: Molecule,
  options: {
    addToHistory?: boolean;
    historyLimit?: number;
  } = {}
): HistoryState {
  const {
    addToHistory = true,
    historyLimit = DEFAULT_HISTORY_LIMIT,
  } = options;

  if (!addToHistory) {
    return createHistory(molecule);
  }

  return pushState(history, molecule, historyLimit);
}

/**
 * حذف کامل تمام مراحل Undo/Redo، اما نگه‌داشتن ساختار فعلی.
 * برای مثال پس از ذخیره‌ی پروژه یا شروع یک سند جدید مفید است.
 */
export function clearHistory(history: HistoryState): HistoryState {
  return {
    past: [],
    present: cloneMolecule(history.present),
    future: [],
  };
}

/**
 * شروع پروژه‌ی کاملاً جدید.
 */
export function resetHistory(
  molecule: Molecule = INITIAL_MOLECULE
): HistoryState {
  return createHistory(molecule);
}
