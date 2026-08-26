export type FunctionalGroupId =
  | "oh"
  | "nh2"
  | "cooh"
  | "cho"
  | "co"
  | "no2"
  | "so3h"
  | "cn";

export type FunctionalElement =
  | "B"
  | "C"
  | "N"
  | "O"
  | "F"
  | "P"
  | "S"
  | "Cl"
  | "Br"
  | "I"
  | "H";

export type FunctionalBondOrder = 1 | 2 | 3;

export interface FunctionalPoint {
  x: number;
  y: number;
}

export interface FunctionalAtomTemplate {
  key: string;
  element: FunctionalElement;
  offset: FunctionalPoint;
  /**
   * اگر true باشد، این اتم به اتم موجود در محل کلیک متصل می‌شود.
   */
  attachment?: boolean;
}

export interface FunctionalBondTemplate {
  from: string;
  to: string;
  order: FunctionalBondOrder;
}

export interface FunctionalGroupDefinition {
  id: FunctionalGroupId;
  label: string;
  formula: string;
  atoms: readonly FunctionalAtomTemplate[];
  bonds: readonly FunctionalBondTemplate[];
}

const atom = (
  key: string,
  element: FunctionalElement,
  x: number,
  y: number,
  attachment = false,
): FunctionalAtomTemplate => ({
  key,
  element,
  offset: { x, y },
  attachment,
});

const bond = (
  from: string,
  to: string,
  order: FunctionalBondOrder,
): FunctionalBondTemplate => ({
  from,
  to,
  order,
});

/**
 * مختصات به‌صورت نسبی نسبت به نقطه کلیک تعریف شده‌اند.
 *
 * اتم attachment اتمی است که باید به اتم موجود یا محل انتخاب‌شده متصل شود.
 */
export const FUNCTIONAL_GROUPS = {
  oh: {
    id: "oh",
    label: "هیدروکسیل",
    formula: "OH",
    atoms: [
      atom("attachment", "C", 0, 0, true),
      atom("oxygen", "O", 42, 0),
      atom("hydrogen", "H", 72, 0),
    ],
    bonds: [
      bond("attachment", "oxygen", 1),
      bond("oxygen", "hydrogen", 1),
    ],
  },

  nh2: {
    id: "nh2",
    label: "آمینو",
    formula: "NH₂",
    atoms: [
      atom("attachment", "C", 0, 0, true),
      atom("nitrogen", "N", 42, 0),
      atom("hydrogen-1", "H", 72, -16),
      atom("hydrogen-2", "H", 72, 16),
    ],
    bonds: [
      bond("attachment", "nitrogen", 1),
      bond("nitrogen", "hydrogen-1", 1),
      bond("nitrogen", "hydrogen-2", 1),
    ],
  },

  cooh: {
    id: "cooh",
    label: "کربوکسیل",
    formula: "COOH",
    atoms: [
      atom("attachment", "C", 0, 0, true),
      atom("carbonyl-carbon", "C", 42, 0),
      atom("carbonyl-oxygen", "O", 42, -34),
      atom("hydroxyl-oxygen", "O", 82, 0),
      atom("hydroxyl-hydrogen", "H", 112, 0),
    ],
    bonds: [
      bond("attachment", "carbonyl-carbon", 1),
      bond("carbonyl-carbon", "carbonyl-oxygen", 2),
      bond("carbonyl-carbon", "hydroxyl-oxygen", 1),
      bond("hydroxyl-oxygen", "hydroxyl-hydrogen", 1),
    ],
  },

  cho: {
    id: "cho",
    label: "آلدهید",
    formula: "CHO",
    atoms: [
      atom("attachment", "C", 0, 0, true),
      atom("carbonyl-carbon", "C", 42, 0),
      atom("oxygen", "O", 42, -34),
      atom("hydrogen", "H", 76, 0),
    ],
    bonds: [
      bond("attachment", "carbonyl-carbon", 1),
      bond("carbonyl-carbon", "oxygen", 2),
      bond("carbonyl-carbon", "hydrogen", 1),
    ],
  },

  co: {
    id: "co",
    label: "کربونیل",
    formula: "C=O",
    atoms: [
      atom("attachment", "C", 0, 0, true),
      atom("carbonyl-carbon", "C", 42, 0),
      atom("oxygen", "O", 42, -34),
    ],
    bonds: [
      bond("attachment", "carbonyl-carbon", 1),
      bond("carbonyl-carbon", "oxygen", 2),
    ],
  },

  no2: {
    id: "no2",
    label: "نیترو",
    formula: "NO₂",
    atoms: [
      atom("attachment", "C", 0, 0, true),
      atom("nitrogen", "N", 42, 0),
      atom("oxygen-1", "O", 76, -24),
      atom("oxygen-2", "O", 76, 24),
    ],
    bonds: [
      bond("attachment", "nitrogen", 1),
      bond("nitrogen", "oxygen-1", 2),
      bond("nitrogen", "oxygen-2", 1),
    ],
  },

  so3h: {
    id: "so3h",
    label: "سولفونیک اسید",
    formula: "SO₃H",
    atoms: [
      atom("attachment", "C", 0, 0, true),
      atom("sulfur", "S", 44, 0),
      atom("oxygen-1", "O", 78, -32),
      atom("oxygen-2", "O", 78, 32),
      atom("hydroxyl-oxygen", "O", 78, 0),
      atom("hydrogen", "H", 110, 0),
    ],
    bonds: [
      bond("attachment", "sulfur", 1),
      bond("sulfur", "oxygen-1", 2),
      bond("sulfur", "oxygen-2", 2),
      bond("sulfur", "hydroxyl-oxygen", 1),
      bond("hydroxyl-oxygen", "hydrogen", 1),
    ],
  },

  cn: {
    id: "cn",
    label: "سیانو",
    formula: "C≡N",
    atoms: [
      atom("attachment", "C", 0, 0, true),
      atom("cyano-carbon", "C", 42, 0),
      atom("nitrogen", "N", 78, 0),
    ],
    bonds: [
      bond("attachment", "cyano-carbon", 1),
      bond("cyano-carbon", "nitrogen", 3),
    ],
  },
} as const satisfies Record<FunctionalGroupId, FunctionalGroupDefinition>;

export const getFunctionalGroup = (
  id: string | undefined,
): FunctionalGroupDefinition | undefined => {
  if (!id) return undefined;
  return FUNCTIONAL_GROUPS[id as FunctionalGroupId];
};

export const isFunctionalGroupId = (
  value: string,
): value is FunctionalGroupId => value in FUNCTIONAL_GROUPS;

export const getFunctionalGroupIds = (): FunctionalGroupId[] =>
  Object.keys(FUNCTIONAL_GROUPS) as FunctionalGroupId[];

export interface InstantiatedFunctionalAtom {
  key: string;
  element: FunctionalElement;
  position: FunctionalPoint;
  attachment: boolean;
}

export interface InstantiatedFunctionalBond {
  fromKey: string;
  toKey: string;
  order: FunctionalBondOrder;
}

/**
 * گروه عاملی را در یک نقطه مشخص قرار می‌دهد.
 */
export const instantiateFunctionalGroup = (
  group: FunctionalGroupDefinition,
  position: FunctionalPoint,
): {
  atoms: InstantiatedFunctionalAtom[];
  bonds: InstantiatedFunctionalBond[];
} => {
  const atoms = group.atoms.map((template) => ({
    key: template.key,
    element: template.element,
    position: {
      x: position.x + template.offset.x,
      y: position.y + template.offset.y,
    },
    attachment: template.attachment === true,
  }));

  const bonds = group.bonds.map((template) => ({
    fromKey: template.from,
    toKey: template.to,
    order: template.order,
  }));

  return { atoms, bonds };
};
