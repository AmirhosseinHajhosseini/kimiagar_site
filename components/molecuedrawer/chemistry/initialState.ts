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

export const createId = (prefix: string): string => {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now()}-${randomPart}`;
};

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

export const createInitialDocument = (): MechanismDocument => {
  const now = new Date().toISOString();

  return {
    id: createId("document"),
    title: "Molecuedrawer",
    objects: [],
    molecules: [],
    reactionSteps: [],
    selection: {
      ...EMPTY_SELECTION,
      selectedIds: [...EMPTY_SELECTION.selectedIds],
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

export const INITIAL_DOCUMENT = createInitialDocument();

export const getDefaultArrowStyle = (
  darkMode = false,
): StyleConfiguration => {
  const color = darkMode
    ? "#D4AF37"
    : DEFAULT_ARROW_COLOR_LIGHT;

  return createDefaultStyle({
    color,
    strokeColor: color,
    fillColor: color,
    strokeWidth: 2.5,
  });
};
