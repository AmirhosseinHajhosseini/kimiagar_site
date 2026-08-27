import type {
  Atom,
  ChargeKind,
  ElectronDisplay,
  Point,
} from "../types";

/**
 * تغییرات مربوط به بار الکتریکی اتم.
 * خروجی به صورت Partial<Atom> است تا مستقیماً
 * به onUpdateAtom(atomId, changes) ارسال شود.
 */
export function getChargeAtomPatch(
  chargeKind: ChargeKind | "remove" | undefined
): Partial<Atom> {
  switch (chargeKind) {
    case "formal-positive":
      return {
        formalCharge: 1,
        partialCharge: "none",
      };

    case "formal-negative":
      return {
        formalCharge: -1,
        partialCharge: "none",
      };

    case "formal-positive-double":
      return {
        formalCharge: 2,
        partialCharge: "none",
      };

    case "formal-negative-double":
      return {
        formalCharge: -2,
        partialCharge: "none",
      };

    case "partial-positive":
      return {
        formalCharge: 0,
        partialCharge: "partial-positive",
      };

    case "partial-negative":
      return {
        formalCharge: 0,
        partialCharge: "partial-negative",
      };

    case "remove":
    case undefined:
    default:
      return {
        formalCharge: 0,
        partialCharge: "none",
      };
  }
}

/**
 * تغییرات مربوط به جفت‌الکترون ناپیوندی یا تک‌الکترون.
 */
export function getElectronAtomPatch(
  electronDisplay: ElectronDisplay | undefined
): Partial<Atom> {
  switch (electronDisplay) {
    case "lone-pair":
      return {
        electronDisplay: "lone-pair",
        showLonePairs: true,
        radical: "none",
      };

    case "single-electron":
      return {
        electronDisplay: "single-electron",
        showLonePairs: false,
        radical: "single",
      };

    case "none":
    case undefined:
    default:
      return {
        electronDisplay: "none",
        showLonePairs: false,
        radical: "none",
      };
  }
}

/**
 * اعمال مستقیم بار به یک Atom کامل.
 * برای استفاده در reducer یا منطق state مفید است.
 */
export function applyChargeToAtom(
  atom: Atom,
  chargeKind: ChargeKind | "remove"
): Atom {
  return {
    ...atom,
    ...getChargeAtomPatch(chargeKind),
  };
}

/**
 * اعمال مستقیم وضعیت الکترونی به یک Atom کامل.
 */
export function applyElectronToAtom(
  atom: Atom,
  electronDisplay: ElectronDisplay
): Atom {
  return {
    ...atom,
    ...getElectronAtomPatch(electronDisplay),
  };
}

/**
 * تولید متن قابل نمایش برای بار اتم.
 *
 * نمونه‌ها:
 * +1  => +
 * -1  => −
 * +2  => 2+
 * -2  => 2−
 * بار جزئی مثبت => δ⁺
 * بار جزئی منفی => δ⁻
 */
export function getChargeDisplayText(
  atom: Atom
): string | null {
  if (atom.partialCharge === "partial-positive") {
    return "δ⁺";
  }

  if (atom.partialCharge === "partial-negative") {
    return "δ⁻";
  }

  if (
    typeof atom.formalCharge !== "number" ||
    atom.formalCharge === 0
  ) {
    return null;
  }

  switch (atom.formalCharge) {
    case 1:
      return "+";

    case -1:
      return "−";

    case 2:
      return "2+";

    case -2:
      return "2−";

    default:
      return atom.formalCharge > 0
        ? `+${atom.formalCharge}`
        : `${atom.formalCharge}`;
  }
}

/**
 * محاسبه موقعیت نشانگر بار در بالا-راست اتم.
 */
export function getChargePosition(
  atomPosition: Point,
  radius = 14
): Point {
  return {
    x: atomPosition.x + radius * 0.85,
    y: atomPosition.y - radius * 0.85,
  };
}

/**
 * محاسبه موقعیت دو نقطه برای نمایش یک جفت‌الکترون ناپیوندی.
 */
export function getElectronPositions(
  atomPosition: Point,
  radius = 14
): Point[] {
  return [
    {
      x: atomPosition.x - 3,
      y: atomPosition.y - radius - 3,
    },
    {
      x: atomPosition.x + 3,
      y: atomPosition.y - radius - 3,
    },
  ];
}
