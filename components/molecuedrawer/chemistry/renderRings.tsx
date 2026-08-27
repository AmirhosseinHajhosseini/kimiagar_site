import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import type { Atom, Ring } from "../types";

export interface RenderRingsProps {
  rings: Ring[];
  atoms: Atom[];
  primarySelectedId: string | null;
  onRingClick: (
    event: ReactMouseEvent<SVGGElement>,
    ringId: string,
  ) => void;
}

export function renderRings({
  rings,
  atoms,
  primarySelectedId,
  onRingClick,
}: RenderRingsProps): ReactNode {
  const atomsById = new Map<string, Atom>(
    atoms.map((atom) => [atom.id, atom]),
  );

  return rings.map((ring) => {
    const points = ring.atomIds
      .map((atomId) => atomsById.get(atomId))
      .filter((atom): atom is Atom => atom !== undefined)
      .map((atom) => atom.position);

    // حلقه باید حداقل سه اتم معتبر داشته باشد.
    if (points.length < 3) {
      return null;
    }

    const isSelected = primarySelectedId === ring.id;

    const polygonPoints = points
      .map(({ x, y }) => `${x},${y}`)
      .join(" ");

    const ringStroke = isSelected
      ? "var(--md-selection-color)"
      : ring.style.strokeColor;

    return (
      <g
        key={ring.id}
        data-ring-id={ring.id}
        onClick={(event) => onRingClick(event, ring.id)}
        style={{ cursor: "pointer" }}
      >
        {/* مرز اصلی حلقه */}
        <polygon
          points={polygonPoints}
          fill="transparent"
          stroke={ringStroke}
          strokeWidth={ring.style.strokeWidth}
          strokeLinejoin="round"
          opacity={ring.style.opacity}
          pointerEvents="none"
        />

        {/* دایرهٔ داخلی برای حلقه‌های آروماتیک */}
        {ring.aromatic && (
          <circle
            cx={ring.center.x}
            cy={ring.center.y}
            r={ring.radius * 0.45}
            fill="none"
            stroke={ringStroke}
            strokeWidth={2}
            opacity={0.9}
            pointerEvents="none"
          />
        )}

        {/* محدودهٔ نامرئی بزرگ‌تر برای انتخاب آسان‌تر حلقه */}
        <polygon
          points={polygonPoints}
          fill="transparent"
          stroke="transparent"
          strokeWidth={20}
          pointerEvents="stroke"
        />
      </g>
    );
  });
}
