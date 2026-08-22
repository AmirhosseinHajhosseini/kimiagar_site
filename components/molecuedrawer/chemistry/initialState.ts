import {
  DEFAULT_ARROW_COLOR_LIGHT,
  DEFAULT_BOND_COLOR_LIGHT,
  DEFAULT_CANVAS_SIZE,
  DEFAULT_FONT_FAMILY,
  DEFAULT_GRID_SIZE,
  DEFAULT_STROKE_WIDTH,
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  EMPTY_SELECTION,
} from "../constants";

import type {
  MechanismDocument,
  StyleConfiguration,
} from "../types";

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

export const createId = (prefix: string): string => {
  const randomPart = Math.random()
    .toString(36)
    .slice(2, 10);

  return `${prefix}-${Date.now()}-${randomPart}`;
};

/* -------------------------------------------------------------------------- */
/*                              Default Styles                                */
/* -------------------------------------------------------------------------- */

export const createDefaultStyle = (
  overrides: Partial<StyleConfiguration> = {},
): StyleConfiguration => {
  return {
    color: DEFAULT_BOND_COLOR_LIGHT,
    fillColor: "transparent",
    strokeColor: DEFAULT_BOND_COLOR_LIGHT,
    strokeWidth: DEFAULT_STROKE_WIDTH,
    opacity: 1,
    fontSize: 20,
    fontFamily: DEFAULT_FONT_FAMILY,
    scale: 1,
    rotation: 0,
    dashPattern: [],
    lineCap: "round",
    lineJoin: "round",
    visible: true,
    ...overrides,
  };
};

export const createDefaultTextStyle = (
  overrides: Partial<StyleConfiguration> = {},
): StyleConfiguration => {
  return createDefaultStyle({
    color: "#111827",
    fillColor: "transparent",
    strokeColor: "transparent",
    strokeWidth: 0,
    fontSize: 20,
    fontFamily: DEFAULT_FONT_FAMILY,
    lineCap: "round",
    lineJoin: "round",
    ...overrides,
  });
};

export const createDefaultBrushStyle = (
  overrides: Partial<StyleConfiguration> = {},
): StyleConfiguration => {
  return createDefaultStyle({
    color: "#111827",
    fillColor: "none",
    strokeColor: "#111827",
    strokeWidth: 3,
    opacity: 1,
    lineCap: "round",
    lineJoin: "round",
    ...overrides,
  });
};

export const createDefaultAtomStyle = (
  overrides: Partial<StyleConfiguration> = {},
): StyleConfiguration => {
  return createDefaultStyle({
    color: "#111827",
    fillColor: "#ffffff",
    strokeColor: "#111827",
    strokeWidth: 1.5,
    fontSize: 20,
    ...overrides,
  });
};

export const getDefaultArrowStyle = (
  darkMode = false,
  overrides: Partial<StyleConfiguration> = {},
): StyleConfiguration => {
  const color = darkMode
    ? "#D4AF37"
    : DEFAULT_ARROW_COLOR_LIGHT;

  return createDefaultStyle({
    color,
    strokeColor: color,
    fillColor: color,
    strokeWidth: 2.5,
    lineCap: "round",
    lineJoin: "round",
    ...overrides,
  });
};

/* -------------------------------------------------------------------------- */
/*                           Initial Document                                 */
/* -------------------------------------------------------------------------- */

export const createInitialDocument = (): MechanismDocument => {
  const now = new Date().toISOString();

  return {
    id: createId("document"),
    title: "Molecule Drawer",

    objects: [],
    molecules: [],
    reactionSteps: [],

    selection: {
      selectedIds: [...EMPTY_SELECTION.selectedIds],
      primarySelectedId: EMPTY_SELECTION.primarySelectedId,
      isBoxSelecting: EMPTY_SELECTION.isBoxSelecting,
      boxStart: EMPTY_SELECTION.boxStart,
      boxEnd: EMPTY_SELECTION.boxEnd,
    },

    viewport: {
      offset: {
        x: DEFAULT_CANVAS_SIZE.width / 2,
        y: DEFAULT_CANVAS_SIZE.height / 2,
      },
      zoom: DEFAULT_ZOOM,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      showGrid: true,
      gridSize: DEFAULT_GRID_SIZE,
      snapToGrid: true,
      isPanning: false,
    },

    contextMenu: {
      isOpen: false,
      position: {
        x: 0,
        y: 0,
      },
      targetId: null,
      targetType: null,
    },

    tool: {
      mode: "select",
      selectedElement: "C",
      selectedBondType: "single",
      selectedBondOrder: 1,
      selectedRingKind: "benzene",
      selectedCharge: "remove",
      selectedElectronDisplay: "none",
      selectedArrowType: "electron-pair",
      selectedBrushPreset: "standard-pen",
    },

    theme: {
      mode: "light",
    },

    version: 1,
    updatedAt: now,
  };
};

export const INITIAL_DOCUMENT: MechanismDocument =
  createInitialDocument();

/* -------------------------------------------------------------------------- */
/*                              Text and Brush                                */
/* -------------------------------------------------------------------------- */

export const TEXT_COLORS = [
  "#DC2626", // قرمز
  "#111827", // مشکی
  "#2563EB", // آبی
  "#92400E", // قهوه‌ای
  "#EA580C", // نارنجی
] as const;

export const BRUSH_COLORS = TEXT_COLORS;

export const TEXT_SIZES = {
  small: 14,
  medium: 20,
  large: 28,
} as const;

export type TextSize = keyof typeof TEXT_SIZES;
