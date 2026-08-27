import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import type { Atom, Bond } from "../types";
import {
  getBondLines,
  getHashedWedgeLines,
  getSimpleBondOrder,
  getWavyPoints,
  getWedgePoints,
} from "./shapeUtils";

export interface RenderBondsProps {
  bonds: Bond[];
  atoms: Atom[];
  primarySelectedId: string | null;
  bondSelection: string[];
  styles: Record<string, string>;
  onBondClick: (
    event: ReactMouseEvent<SVGGElement>,
    bondId: string,
  ) => void;
}

export function renderBonds({
  bonds,
  atoms,
  primarySelectedId,
  bondSelection,
  styles,
  onBondClick,
}: RenderBondsProps): ReactNode {
  const atomsById = new Map(atoms.map((atom) => [atom.id, atom]));

  return bonds.map((bond) => {
    const atomA = atomsById.get(bond.startAtomId);
    const atomB = atomsById.get(bond.endAtomId);

    // پیوندهایی که به اتم حذف‌شده اشاره می‌کنند، رندر نمی‌شوند.
    if (!atomA || !atomB) {
      return null;
    }

    const start = atomA.position;
    const end = atomB.position;

    const isSelected =
      primarySelectedId === bond.id || bondSelection.includes(bond.id);

    const strokeColor = isSelected
      ? "var(--md-selection-color, #3b82f6)"
      : bond.style.strokeColor;

    const commonLineProps = {
      stroke: strokeColor,
      strokeWidth: bond.style.strokeWidth,
      strokeLinecap: bond.style.lineCap,
      strokeLinejoin: bond.style.lineJoin,
      opacity: bond.style.opacity,
      pointerEvents: "none" as const,
    };

    const renderBondShape = (): ReactNode => {
      switch (bond.bondType) {
        case "solid-wedge": {
          const points = getWedgePoints(start, end);

          if (!points) {
            return null;
          }

          return (
            <polygon
              points={points}
              fill={strokeColor}
              opacity={bond.style.opacity}
              pointerEvents="none"
            />
          );
        }

        case "hashed-wedge": {
          const lines = getHashedWedgeLines(start, end);

          return (
            <>
              {lines.map((line, index) => (
                <line
                  key={`${bond.id}-hash-${index}`}
                  {...line}
                  {...commonLineProps}
                  // ضخامت مناسب برای خطوط wedge خط‌چین
                  strokeWidth={Math.max(1.5, bond.style.strokeWidth * 0.85)}
                />
              ))}
            </>
          );
        }

        case "dashed":
          return (
            <line
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              {...commonLineProps}
              strokeDasharray="8 6"
            />
          );

        case "wavy": {
          const points = getWavyPoints(start, end);

          if (!points) {
            return null;
          }

          return (
            <polyline
              points={points}
              fill="none"
              {...commonLineProps}
            />
          );
        }

        default: {
          const lines = getBondLines(
            start,
            end,
            getSimpleBondOrder(bond.order),
          );

          return (
            <>
              {lines.map((line, index) => (
                <line
                  key={`${bond.id}-line-${index}`}
                  {...line}
                  {...commonLineProps}
                />
              ))}
            </>
          );
        }
      }
    };

    const className = [
      styles.bond ?? "",
      isSelected ? styles.bondSelected ?? "" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <g
        key={bond.id}
        className={className}
        data-bond-id={bond.id}
        onClick={(event) => onBondClick(event, bond.id)}
        style={{ cursor: "pointer" }}
      >
        {/* Hit-area نامرئی برای انتخاب آسان پیوند */}
        <line
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          stroke="transparent"
          strokeWidth={18}
          pointerEvents="stroke"
        />

        {/* شکل قابل‌مشاهدهٔ پیوند */}
        {renderBondShape()}
      </g>
    );
  });
}
