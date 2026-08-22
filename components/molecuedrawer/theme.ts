import {
  DEFAULT_ARROW_COLOR_DARK,
  DEFAULT_ARROW_COLOR_LIGHT,
  DEFAULT_BOND_COLOR_DARK,
  DEFAULT_BOND_COLOR_LIGHT,
  DEFAULT_CHARGE_COLOR,
  DEFAULT_SELECTION_COLOR,
} from "./constants";

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

export type ThemeMode = "light" | "dark";

export interface MoleculeDrawerTheme {
  readonly mode: ThemeMode;

  readonly canvas: {
    readonly background: string;
    readonly grid: string;
    readonly gridStrong: string;
  };

  readonly surface: {
    readonly background: string;
    readonly elevated: string;
    readonly border: string;
  };

  readonly text: {
    readonly primary: string;
    readonly secondary: string;
    readonly muted: string;
    readonly title: string;
  };

  readonly chemistry: {
    readonly bondColor: string;
    readonly arrowColor: string;
    readonly chargeColor: string;
    readonly selectionColor: string;
    readonly selectionGlow: string;
    readonly atomOutline: string;
  };

  readonly controls: {
    readonly hover: string;
    readonly active: string;
    readonly focus: string;
    readonly danger: string;
  };
}

/* -------------------------------------------------------------------------- */
/*                                Light Theme                                 */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                                 Dark Theme                                 */
/* -------------------------------------------------------------------------- */

export const DARK_THEME: MoleculeDrawerTheme = {
  mode: "dark",

  canvas: {
    background: "#0B1120",
    grid: "#1E293B",
    gridStrong: "#334155",
  },

  surface: {
    background: "#0F172A",
    border: "#475569",
    elevated: "#1F2937",
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


/* -------------------------------------------------------------------------- */
/*                                  Selector                                  */
/* -------------------------------------------------------------------------- */

export const getTheme = (
  mode: ThemeMode,
): MoleculeDrawerTheme => {
  return mode === "dark"
    ? DARK_THEME
    : LIGHT_THEME;
};
