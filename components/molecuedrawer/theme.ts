import {
  DEFAULT_ARROW_COLOR_DARK,
  DEFAULT_ARROW_COLOR_LIGHT,
  DEFAULT_BOND_COLOR_DARK,
  DEFAULT_BOND_COLOR_LIGHT,
  DEFAULT_CHARGE_COLOR,
  DEFAULT_SELECTION_COLOR,
} from "./constants";

export interface MoleculeDrawerTheme {
  mode: "light" | "dark";
  canvas: {
    background: string;
    grid: string;
    gridStrong: string;
  };
  surface: {
    background: string;
    elevated: string;
    border: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    title: string;
  };
  chemistry: {
    bondColor: string;
    arrowColor: string;
    chargeColor: string;
    selectionColor: string;
    selectionGlow: string;
    atomOutline: string;
  };
  controls: {
    hover: string;
    active: string;
    focus: string;
    danger: string;
  };
}

export const LIGHT_THEME: MoleculeDrawerTheme = {
  mode: "light",
  canvas: {
    background: "#F8FAFC",
    grid: "#E2E8F0",
    gridStrong: "#CBD5E1",
  },
  surface: {
    background: "#FFFFFF",
    elevated: "#F1F5F9",
    border: "#CBD5E1",
  },
  text: {
    primary: "#172033",
    secondary: "#334155",
    muted: "#64748B",
    title: "#DB2777",
  },
  chemistry: {
    bondColor: DEFAULT_BOND_COLOR_LIGHT,
    arrowColor: DEFAULT_ARROW_COLOR_LIGHT,
    chargeColor: DEFAULT_CHARGE_COLOR,
    selectionColor: DEFAULT_SELECTION_COLOR,
    selectionGlow: "rgba(212, 175, 55, 0.42)",
    atomOutline: "#0F172A",
  },
  controls: {
    hover: "#E0F2FE",
    active: "#BAE6FD",
    focus: "#0284C7",
    danger: "#DC2626",
  },
};

export const DARK_THEME: MoleculeDrawerTheme = {
  mode: "dark",
  canvas: {
    background: "#0B1120",
    grid: "#1E293B",
    gridStrong: "#334155",
  },
  surface: {
    background: "#111827",
    elevated: "#1F2937",
    border: "#475569",
  },
  text: {
    primary: "#F8FAFC",
    secondary: "#E2E8F0",
    muted: "#CBD5E1",
    title: "#F472B6",
  },
  chemistry: {
    bondColor: DEFAULT_BOND_COLOR_DARK,
    arrowColor: DEFAULT_ARROW_COLOR_DARK,
    chargeColor: DEFAULT_CHARGE_COLOR,
    selectionColor: DEFAULT_SELECTION_COLOR,
    selectionGlow: "rgba(212, 175, 55, 0.68)",
    atomOutline: "#FEF3C7",
  },
  controls: {
    hover: "#334155",
    active: "#475569",
    focus: "#FBBF24",
    danger: "#F87171",
  },
};

export const getTheme = (
  mode: "light" | "dark",
): MoleculeDrawerTheme => {
  return mode === "dark" ? DARK_THEME : LIGHT_THEME;
};
