export type BrushPoint = {
  x: number;
  y: number;
};

export type BrushPath = {
  id: string;
  points: BrushPoint[];
  color: string;
  strokeWidth: number;
  opacity: number;
};
export type BrushPreset =
  | "pencil"
  | "marker"
  | "highlighter"
  | "solid";


export const DEFAULT_BRUSH_COLOR = "#111827";
export const DEFAULT_BRUSH_STROKE_WIDTH = 3;
export const DEFAULT_BRUSH_OPACITY = 1;
