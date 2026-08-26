import type { ArrowType, ArrowHeadType } from "../types";

export type ArrowPathStyle =
  | "straight"
  | "curved"
  | "resonance"
  | "equilibrium"
  | "reversible"
  | "retrosynthesis"
  | "dashed"
  | "annotation";

export type ArrowPreset = {
  id: ArrowType;
  label: string;
  symbol: string;
  head: ArrowHeadType;
  pathStyle: ArrowPathStyle;
  strokeDasharray?: string;
  doubleLine?: boolean;
  showLabel?: boolean;
  labelText?: string;
};

export const ARROW_PRESETS: ReadonlyArray<ArrowPreset> = [
  {
    id: "straight-reaction",
    label: "فلش مستقیم واکنش",
    symbol: "→",
    head: "full",
    pathStyle: "straight",
  },
  {
    id: "curved-reaction",
    label: "فلش خمیده مکانیسمی",
    symbol: "↷",
    head: "full",
    pathStyle: "curved",
  },
  {
    id: "electron-pair",
    label: "فلش جفت‌الکترونی",
    symbol: "↷",
    head: "full",
    pathStyle: "curved",
  },
  {
    id: "single-electron",
    label: "فلش تک‌الکترونی",
    symbol: "↝",
    head: "fishhook",
    pathStyle: "curved",
  },
  {
    id: "resonance",
    label: "فلش رزونانسی",
    symbol: "↔",
    head: "double",
    pathStyle: "resonance",
    doubleLine: true,
  },
  {
    id: "equilibrium",
    label: "فلش تعادلی",
    symbol: "⇌",
    head: "double",
    pathStyle: "equilibrium",
    doubleLine: true,
  },
  {
    id: "reversible-reaction",
    label: "فلش برگشت‌پذیر",
    symbol: "⇄",
    head: "double",
    pathStyle: "reversible",
    doubleLine: true,
  },
  {
    id: "retrosynthesis",
    label: "فلش رتروسنتزی",
    symbol: "⇒",
    head: "full",
    pathStyle: "retrosynthesis",
    doubleLine: true,
  },
  {
    id: "dashed-reaction",
    label: "فلش خط‌چین واکنش",
    symbol: "⇢",
    head: "full",
    pathStyle: "dashed",
    strokeDasharray: "8 6",
  },
  {
    id: "bond-breaking",
    label: "فلش شکستن پیوند",
    symbol: "↷",
    head: "full",
    pathStyle: "curved",
  },
  {
    id: "bond-forming",
    label: "فلش تشکیل پیوند",
    symbol: "↷",
    head: "full",
    pathStyle: "curved",
  },
  {
    id: "proton-transfer",
    label: "فلش انتقال پروتون",
    symbol: "H⁺→",
    head: "full",
    pathStyle: "curved",
    showLabel: true,
    labelText: "H⁺",
  },
  {
    id: "charge-transfer",
    label: "فلش انتقال بار",
    symbol: "⊕→",
    head: "full",
    pathStyle: "curved",
    showLabel: true,
    labelText: "±",
  },
  {
    id: "mechanistic-annotation",
    label: "فلش توضیح مکانیسم",
    symbol: "⤷",
    head: "none",
    pathStyle: "annotation",
    strokeDasharray: "5 5",
    showLabel: true,
    labelText: "مکانیسم",
  },
];

export const ARROW_PRESET_MAP: Readonly<
  Record<ArrowType, ArrowPreset>
> = Object.fromEntries(
  ARROW_PRESETS.map((preset) => [preset.id, preset]),
) as Record<ArrowType, ArrowPreset>;

export function getArrowPreset(arrowType: ArrowType): ArrowPreset {
  const preset = ARROW_PRESET_MAP[arrowType];

  if (!preset) {
    return ARROW_PRESET_MAP["straight-reaction"];
  }

  return preset;
}

export function getArrowHeadForType(
  arrowType: ArrowType,
): ArrowHeadType {
  return getArrowPreset(arrowType).head;
}
