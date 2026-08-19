import type {
  ArrowHeadType,
  ArrowType,
  BondOrder,
  BondType,
  BrushPreset,
  ElementSymbol,
  InteractionMode,
  RingKind,
} from "./types";

export const MOLECULE_DRAWER_TITLE = "Molecuedrawer";

export const DEFAULT_CANVAS_SIZE = {
  width: 1600,
  height: 1000,
};

export const DEFAULT_GRID_SIZE = 24;

export const DEFAULT_ZOOM = 1;
export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 4;

export const DEFAULT_ATOM_COLOR = "#202124";
export const DEFAULT_BOND_COLOR_LIGHT = "#123B5D";
export const DEFAULT_BOND_COLOR_DARK = "#D4AF37";
export const DEFAULT_ARROW_COLOR_LIGHT = "#0E7490";
export const DEFAULT_ARROW_COLOR_DARK = "#D4AF37";
export const DEFAULT_CHARGE_COLOR = "#E53935";
export const DEFAULT_SELECTION_COLOR = "#D4AF37";

export const DEFAULT_FONT_FAMILY =
  "Times New Roman, Vazirmatn, serif";

export const ELEMENTS: readonly ElementSymbol[] = [
  "C",
  "H",
  "O",
  "N",
  "S",
  "P",
  "F",
  "Cl",
  "Br",
  "I",
  "B",
  "Si",
  "Na",
  "K",
  "Mg",
  "Ca",
  "Fe",
];

export const INTERACTION_MODES: readonly InteractionMode[] = [
  "select",
  "add-atom",
  "add-bond",
  "add-ring",
  "add-functional-group",
  "add-arrow",
  "add-text",
  "brush",
  "erase",
  "pan",
];

export const BOND_TYPES: readonly BondType[] = [
  "single",
  "double",
  "triple",
  "aromatic",
  "solid-wedge",
  "hashed-wedge",
  "wavy",
  "dashed",
  "bold",
  "curved",
];

export const BOND_ORDERS: readonly BondOrder[] = [1, 2, 3, 1.5];

export const RING_KINDS: readonly RingKind[] = [
  "cyclopropane",
  "cyclobutane",
  "cyclopentane",
  "cyclohexane",
  "cycloheptane",
  "cyclooctane",
  "benzene",
  "cyclopentadiene",
  "cyclohexadiene",
  "pyridine",
  "pyrrole",
  "furan",
  "thiophene",
  "imidazole",
  "oxazole",
  "thiazole",
  "pyrimidine",
  "naphthalene",
  "anthracene",
  "custom",
];

export const ARROW_TYPES: readonly ArrowType[] = [
  "electron-pair",
  "single-electron",
  "curved-reaction",
  "straight-reaction",
  "resonance",
  "equilibrium",
  "retrosynthesis",
  "dashed-reaction",
  "reversible-reaction",
  "bond-breaking",
  "bond-forming",
  "proton-transfer",
  "charge-transfer",
  "mechanistic-annotation",
];

export const ARROW_HEAD_TYPES: readonly ArrowHeadType[] = [
  "full",
  "fishhook",
  "half",
  "double",
  "none",
];

export const BRUSH_PRESETS: readonly BrushPreset[] = [
  "fine-pen",
  "standard-pen",
  "thick-marker",
  "mechanism-highlight",
  "eraser",
];

export const DEFAULT_ATOM_LABEL_SIZE = 20;
export const DEFAULT_ATOM_SPHERE_RADIUS = 14;
export const DEFAULT_STROKE_WIDTH = 2;
export const DEFAULT_ARROW_HEAD_SIZE = 10;

export const EMPTY_SELECTION = {
  selectedIds: [],
  primarySelectedId: null,
  isBoxSelecting: false,
  boxStart: null,
  boxEnd: null,
} as const;
