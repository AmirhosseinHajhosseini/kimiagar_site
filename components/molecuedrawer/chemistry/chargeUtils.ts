import type {
  Atom,
  ChargeKind,
  ElectronDisplay,
  RadicalType,
} from "../types";

/**
 * اعمال یا تغییر بار الکتریکی (Formal Charge یا Partial Charge) روی اتم
 */
export function applyChargeToAtom(
  atom: Atom,
  chargeKind: ChargeKind,
  customCharge?: number
): Atom {
  let formal = atom.formalCharge ?? 0;
  let partial = atom.partialCharge ?? "none";

  switch (chargeKind) {
    case "formal-positive":
      formal = (formal + 1) as Atom["formalCharge"];
      break;

    case "formal-negative":
      formal = (formal - 1) as Atom["formalCharge"];
      break;

    case "formal-positive-double":
      formal = (formal + 2) as Atom["formalCharge"];
      break;

    case "formal-negative-double":
      formal = (formal - 2) as Atom["formalCharge"];
      break;

    case "partial-positive":
      partial = "partial-positive";
      break;

    case "partial-negative":
      partial = "partial-negative";
      break;

    case "remove":
      formal = 0;
      partial = "none";
      break;

    default:
      if (customCharge !== undefined) {
        formal = customCharge as Atom["formalCharge"];
      }
      break;
  }

  return {
    ...atom,
    formalCharge: formal,
    partialCharge: partial,
  };
}

/**
 * اعمال تنظیمات مربوط به جفت‌الکترون ناپیوندی یا تک‌الکترون رادیکالی روی اتم
 */
export function applyElectronToAtom(
  atom: Atom,
  electronType: ElectronDisplay | RadicalType | "remove"
): Atom {
  const updated = { ...atom };

  if (electronType === "remove") {
    updated.electronDisplay = "none";
    updated.radical = "none";
    return updated;
  }

  if (electronType === "lone-pair" || electronType === "single-electron") {
    updated.electronDisplay = electronType;
    return updated;
  }

  if (electronType === "single" || electronType === "double") {
    updated.radical = electronType;
    return updated;
  }

  if (electronType === "none") {
    updated.electronDisplay = "none";
    updated.radical = "none";
    return updated;
  }

  return updated;
}
