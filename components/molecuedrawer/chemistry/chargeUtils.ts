import type {
  Atom,
  ChargeKind,
  ElectronDisplay,
  RadicalType,
} from "../types";

export function applyChargeToAtom(
  atom: Atom,
  chargeKind: ChargeKind,
  customCharge?: number,
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

export function applyElectronToAtom(
  atom: Atom,
  electronType: ElectronDisplay | RadicalType | "remove",
): Atom {
  if (electronType === "remove" || electronType === "none") {
    return {
      ...atom,
      electronDisplay: "none",
      radical: "none",
      showLonePairs: false,
    };
  }

  if (electronType === "lone-pair") {
    return {
      ...atom,
      electronDisplay: "lone-pair",
      showLonePairs: true,
      radical: "none",
    };
  }

  if (electronType === "single-electron" || electronType === "single") {
    return {
      ...atom,
      electronDisplay: "single-electron",
      showLonePairs: false,
      radical: "single",
    };
  }

  if (electronType === "double") {
    return {
      ...atom,
      electronDisplay: "none",
      showLonePairs: false,
      radical: "double",
    };
  }

  return atom;
}
