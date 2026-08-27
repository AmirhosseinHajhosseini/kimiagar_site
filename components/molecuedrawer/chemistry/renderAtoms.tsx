import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import type { Atom } from "../types";
import {
  getChargeDisplayText,
  getElectronPositions,
} from "./chargeAndElectronUtils";

type AtomPalette = {
  fill: string;
  text: string;
};

// پالت استاندارد CPK
const ELEMENT_PALETTES: Record<string, AtomPalette> = {
  H:  { fill: "#E2E8F0", text: "#0F172A" },
  C:  { fill: "#334155", text: "#FFFFFF" },
  N:  { fill: "#2563EB", text: "#FFFFFF" },
  O:  { fill: "#DC2626", text: "#FFFFFF" },
  F:  { fill: "#16A34A", text: "#FFFFFF" },
  Cl: { fill: "#059669", text: "#FFFFFF" },
  Br: { fill: "#92400E", text: "#FFFFFF" },
  I:  { fill: "#7C3AED", text: "#FFFFFF" },
  S:  { fill: "#EAB308", text: "#0F172A" },
  P:  { fill: "#EA580C", text: "#FFFFFF" },
  B:  { fill: "#D97706", text: "#FFFFFF" },
  Si: { fill: "#64748B", text: "#FFFFFF" },
  Na: { fill: "#7C3AED", text: "#FFFFFF" },
  K:  { fill: "#8B5CF6", text: "#FFFFFF" },
  Ca: { fill: "#22C55E", text: "#FFFFFF" },
  Mg: { fill: "#65A30D", text: "#FFFFFF" },
  Fe: { fill: "#B45309", text: "#FFFFFF" },
  Cu: { fill: "#C2410C", text: "#FFFFFF" },
  Zn: { fill: "#94A3B8", text: "#0F172A" },
};

const getAtomPalette = (element: string): AtomPalette =>
  ELEMENT_PALETTES[element] ?? { fill: "#64748B", text: "#FFFFFF" };

export interface RenderAtomsProps {
  atoms: Atom[];
  selectedAtomId: string | null;
  atomRadius: number;
  onAtomMouseDown: (event: ReactMouseEvent<SVGGElement>, atomId: string) => void;
}

export function renderAtoms({
  atoms,
  selectedAtomId,
  atomRadius,
  onAtomMouseDown,
}: RenderAtomsProps): ReactNode {
  return atoms.map((atom) => {
    const isSelected = selectedAtomId === atom.id;
    const { fill, text } = getAtomPalette(atom.element || "C");
    const chargeText = getChargeDisplayText(atom);
    // chemistry/renderAtoms.tsx
const shouldRenderLonePair =
  atom.showLonePairs &&
  atom.electronDisplay === "lone-pair";

const rawElectronPositions = shouldRenderLonePair
  ? getElectronPositions(atom.position, atomRadius)
  : [];


    // آفست بج بار الکتریکی متناسب با اندازه شعاع اتم
    const badgeOffset = atomRadius * 0.85;

    return (
      <g
        key={atom.id}
        data-atom-id={atom.id}
        transform={`translate(${atom.position.x}, ${atom.position.y})`}
        style={{ cursor: "pointer" }}
        onMouseDown={(event) => onAtomMouseDown(event, atom.id)}
      >
        {/* ۱. نشانگر انتخاب اتم */}
        {isSelected && (
          <circle
            r={atomRadius + 4}
            fill="none"
            stroke="var(--md-selection-color, #3b82f6)"
            strokeWidth={2}
            strokeDasharray="4 2"
            pointerEvents="none"
          />
        )}

        {/* ۲. هسته اصلی اتم */}
        <circle
          r={atomRadius}
          fill={fill}
          stroke={isSelected ? "var(--md-selection-color, #3b82f6)" : fill}
          strokeWidth={isSelected ? 2.5 : 1}
        />

        {/* ۳. نماد شیمیایی عنصر */}
        <text
          y={1}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={text}
          fontSize={atomRadius * 0.9}
          fontWeight={700}
          style={{ userSelect: "none" }}
          pointerEvents="none"
        >
          {atom.element || "C"}
        </text>

        {/* ۴. بج بار الکتریکی (Formal Charge) */}
        {chargeText && (
          <g
            transform={`translate(${badgeOffset}, ${-badgeOffset})`}
            pointerEvents="none"
          >
            <circle
              r={6.5}
              fill="#FFFFFF"
              stroke="#64748B"
              strokeWidth={1}
            />
            <text
              y={0.5}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#0F172A"
              fontSize={7.5}
              fontWeight={800}
            >
              {chargeText}
            </text>
          </g>
        )}

        {/* ۵. جفت‌الکترون‌های ناپیوندی و رادیکال‌ها */}
        {rawElectronPositions.map((pos, index) => {
          // در صورتی که تابع موقعیت مطلق فرستاده باشد، آن را به مختصات محلی تبدیل می‌کنیم
          const cx = Math.abs(pos.x - atom.position.x) < atomRadius * 3 ? pos.x - atom.position.x : pos.x;
          const cy = Math.abs(pos.y - atom.position.y) < atomRadius * 3 ? pos.y - atom.position.y : pos.y;

          return (
            <circle
              key={`el-${atom.id}-${index}`}
              cx={cx}
              cy={cy}
              r={2}
              fill="var(--md-text-primary, #0f172a)"
              pointerEvents="none"
            />
          );
        })}
      </g>
    );
  });
}
