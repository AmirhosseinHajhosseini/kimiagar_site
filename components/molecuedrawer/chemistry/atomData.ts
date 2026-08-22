import type { ElementSymbol } from "../types";

export interface ElementData {
  symbol: ElementSymbol;
  name: string;
  persianName: string;
  atomicNumber: number;
  atomicMass: number;
  defaultColor: string;
  defaultTextColor: string;
  commonValences: readonly number[];
  electronegativity?: number;
  isMetal: boolean;
  isHalogen: boolean;
}

export const ELEMENT_DATA: Readonly<
  Record<ElementSymbol, ElementData>
> = {
  H: {
    symbol: "H",
    name: "Hydrogen",
    persianName: "هیدروژن",
    atomicNumber: 1,
    atomicMass: 1.008,
    defaultColor: "#F8FAFC",
    defaultTextColor: "#111827",
    commonValences: [1],
    electronegativity: 2.2,
    isMetal: false,
    isHalogen: false,
  },

  C: {
    symbol: "C",
    name: "Carbon",
    persianName: "کربن",
    atomicNumber: 6,
    atomicMass: 12.011,
    defaultColor: "#343A40",
    defaultTextColor: "#FFFFFF",
    commonValences: [4],
    electronegativity: 2.55,
    isMetal: false,
    isHalogen: false,
  },

  N: {
    symbol: "N",
    name: "Nitrogen",
    persianName: "نیتروژن",
    atomicNumber: 7,
    atomicMass: 14.007,
    defaultColor: "#2563EB",
    defaultTextColor: "#FFFFFF",
    commonValences: [3, 5],
    electronegativity: 3.04,
    isMetal: false,
    isHalogen: false,
  },

  O: {
    symbol: "O",
    name: "Oxygen",
    persianName: "اکسیژن",
    atomicNumber: 8,
    atomicMass: 15.999,
    defaultColor: "#DC2626",
    defaultTextColor: "#FFFFFF",
    commonValences: [2],
    electronegativity: 3.44,
    isMetal: false,
    isHalogen: false,
  },

  F: {
    symbol: "F",
    name: "Fluorine",
    persianName: "فلوئور",
    atomicNumber: 9,
    atomicMass: 18.998,
    defaultColor: "#22C55E",
    defaultTextColor: "#FFFFFF",
    commonValences: [1],
    electronegativity: 3.98,
    isMetal: false,
    isHalogen: true,
  },

  P: {
    symbol: "P",
    name: "Phosphorus",
    persianName: "فسفر",
    atomicNumber: 15,
    atomicMass: 30.974,
    defaultColor: "#F97316",
    defaultTextColor: "#FFFFFF",
    commonValences: [3, 5],
    electronegativity: 2.19,
    isMetal: false,
    isHalogen: false,
  },

  S: {
    symbol: "S",
    name: "Sulfur",
    persianName: "گوگرد",
    atomicNumber: 16,
    atomicMass: 32.06,
    defaultColor: "#EAB308",
    defaultTextColor: "#111827",
    commonValences: [2, 4, 6],
    electronegativity: 2.58,
    isMetal: false,
    isHalogen: false,
  },

  Cl: {
    symbol: "Cl",
    name: "Chlorine",
    persianName: "کلر",
    atomicNumber: 17,
    atomicMass: 35.45,
    defaultColor: "#16A34A",
    defaultTextColor: "#FFFFFF",
    commonValences: [1],
    electronegativity: 3.16,
    isMetal: false,
    isHalogen: true,
  },

  Br: {
    symbol: "Br",
    name: "Bromine",
    persianName: "برم",
    atomicNumber: 35,
    atomicMass: 79.904,
    defaultColor: "#B45309",
    defaultTextColor: "#FFFFFF",
    commonValences: [1],
    electronegativity: 2.96,
    isMetal: false,
    isHalogen: true,
  },

  I: {
    symbol: "I",
    name: "Iodine",
    persianName: "ید",
    atomicNumber: 53,
    atomicMass: 126.904,
    defaultColor: "#7C3AED",
    defaultTextColor: "#FFFFFF",
    commonValences: [1],
    electronegativity: 2.66,
    isMetal: false,
    isHalogen: true,
  },

  B: {
    symbol: "B",
    name: "Boron",
    persianName: "بور",
    atomicNumber: 5,
    atomicMass: 10.81,
    defaultColor: "#F59E0B",
    defaultTextColor: "#111827",
    commonValences: [3],
    electronegativity: 2.04,
    isMetal: false,
    isHalogen: false,
  },

  Si: {
    symbol: "Si",
    name: "Silicon",
    persianName: "سیلیسیم",
    atomicNumber: 14,
    atomicMass: 28.085,
    defaultColor: "#F59E0B",
    defaultTextColor: "#111827",
    commonValences: [4],
    electronegativity: 1.9,
    isMetal: false,
    isHalogen: false,
  },

  Na: {
    symbol: "Na",
    name: "Sodium",
    persianName: "سدیم",
    atomicNumber: 11,
    atomicMass: 22.99,
    defaultColor: "#64748B",
    defaultTextColor: "#FFFFFF",
    commonValences: [1],
    electronegativity: 0.93,
    isMetal: true,
    isHalogen: false,
  },

  K: {
    symbol: "K",
    name: "Potassium",
    persianName: "پتاسیم",
    atomicNumber: 19,
    atomicMass: 39.098,
    defaultColor: "#64748B",
    defaultTextColor: "#FFFFFF",
    commonValences: [1],
    electronegativity: 0.82,
    isMetal: true,
    isHalogen: false,
  },

  Mg: {
    symbol: "Mg",
    name: "Magnesium",
    persianName: "منیزیم",
    atomicNumber: 12,
    atomicMass: 24.305,
    defaultColor: "#64748B",
    defaultTextColor: "#FFFFFF",
    commonValences: [2],
    electronegativity: 1.31,
    isMetal: true,
    isHalogen: false,
  },

  Ca: {
    symbol: "Ca",
    name: "Calcium",
    persianName: "ک defaultColor",
    atomicNumber: 20,
    atomicMass: 40.078,
    defaultColor: "#64748B",
    defaultTextColor: "#FFFFFF",
    commonValences: [2],
    electronegativity: 1,
    isMetal: true,
    isHalogen: false,
  },

  Fe: {
    symbol: "Fe",
    name: "Iron",
    persianName: "آهن",
    atomicNumber: 26,
    atomicMass: 55.845,
    defaultColor: "#78716C",
    defaultTextColor: "#FFFFFF",
    commonValences: [2, 3],
    electronegativity: 1.83,
    isMetal: true,
    isHalogen: false,
  },
};

const FALLBACK_ELEMENT_DATA: Omit<
  ElementData,
  "symbol"
> = {
  name: "Unknown",
  persianName: "ناشناخته",
  atomicNumber: 0,
  atomicMass: 0,
  defaultColor: "#64748B",
  defaultTextColor: "#FFFFFF",
  commonValences: [],
  isMetal: false,
  isHalogen: false,
};

export const getElementData = (
  symbol: ElementSymbol,
): ElementData => {
  return (
    ELEMENT_DATA[symbol] ?? {
      symbol,
      ...FALLBACK_ELEMENT_DATA,
    }
  );
};
