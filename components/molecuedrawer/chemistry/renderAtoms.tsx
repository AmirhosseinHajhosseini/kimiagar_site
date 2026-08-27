import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import type { Atom } from "../types";
import { getChargeDisplayText } from "./chargeAndElectronUtils";

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

    // ۱. تفکیک وضعیت‌های الکترونی
    const isLonePair =
      atom.showLonePairs === true && atom.electronDisplay === "lone-pair";

    const isSingleElectron =
      atom.electronDisplay === "single-electron" || atom.radical === "single";

    // ۲. فواصل محاسبه‌شده برای خارج بودن از هاله انتخاب
    const badgeOffset = atomRadius * 0.85;
    const lonePairY = -atomRadius - 14; // کاملاً بالاتر از خط‌چین هاله

    return (
      <g
        key={atom.id}
        data-atom-id={atom.id}
        transform={`translate(${atom.position.x}, ${atom.position.y})`}
        style={{ cursor: "pointer" }}
        onMouseDown={(event) => onAtomMouseDown(event, atom.id)}
      >
        {/* ۱. نشانگر انتخاب اتم (هاله خط‌چین) */}
        {isSelected && (
          <circle
            r={atomRadius + 5}
            fill="none"
            stroke="var(--md-selection-color, #EAB308)"
            strokeWidth={2}
            strokeDasharray="4 3"
            pointerEvents="none"
          />
        )}

        {/* ۲. هسته اصلی اتم */}
        <circle
          r={atomRadius}
          fill={fill}
          stroke={isSelected ? "var(--md-selection-color, #EAB308)" : fill}
          strokeWidth={isSelected ? 2 : 1}
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
              r={8.5}
              fill="#FFFFFF"
              stroke="#0F172A"
              strokeWidth={1.5}
            />
            <text
              y={0.5}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#DC2626"
              fontSize={10}
              fontWeight={900}
              style={{ userSelect: "none" }}
              pointerEvents="none"
            >
              {chargeText}
            </text>
          </g>
        )}

        {/* ۵. جفت‌الکترون ناپیوندی (دو نقطه قرمز بالاتر از هاله انتخاب) */}
        {isLonePair && (
          <g transform={`translate(0, ${lonePairY})`} pointerEvents="none">
            <circle cx={-4} cy={0} r={2.2} fill="#DC2626" />
            <circle cx={4} cy={0} r={2.2} fill="#DC2626" />
          </g>
        )}

        {/* ۶. تک‌الکترون / رادیکال (یک نقطه قرمز در بالا-راست بیرون از هاله) */}
        {isSingleElectron && (
          <circle
            cx={atomRadius + 8}
            cy={-(atomRadius + 8)}
            r={2.4}
            fill="#DC2626"
            pointerEvents="none"
          />
        )}
      </g>
    );
  });
}
