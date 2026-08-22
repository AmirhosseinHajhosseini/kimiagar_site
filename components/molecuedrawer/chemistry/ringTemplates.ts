import type { RingKind } from "../types";

export interface RingTemplate {
  ringKind: RingKind;
  sides: number;
  aromatic: boolean;
  alternatingDoubleBonds: boolean;
}

/**
 * قالب‌های حلقه‌هایی که فعلاً قابلیت رسم مستقیم دارند.
 *
 * Partial استفاده شده است، چون همه RingKindهای تعریف‌شده
 * هنوز template رسم ندارند.
 */
export const RING_TEMPLATES: Partial<Record<RingKind, RingTemplate>> = {
  cyclopropane: {
    ringKind: "cyclopropane",
    sides: 3,
    aromatic: false,
    alternatingDoubleBonds: false,
  },

  cyclobutane: {
    ringKind: "cyclobutane",
    sides: 4,
    aromatic: false,
    alternatingDoubleBonds: false,
  },

  cyclopentane: {
    ringKind: "cyclopentane",
    sides: 5,
    aromatic: false,
    alternatingDoubleBonds: false,
  },

  cyclohexane: {
    ringKind: "cyclohexane",
    sides: 6,
    aromatic: false,
    alternatingDoubleBonds: false,
  },

  benzene: {
    ringKind: "benzene",
    sides: 6,
    aromatic: true,
    alternatingDoubleBonds: true,
  },
};
