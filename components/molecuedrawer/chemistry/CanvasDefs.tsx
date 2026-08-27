// components/molecuedrawer/chemistry/CanvasDefs.tsx
import type { ReactNode } from "react";

export function CanvasDefs(): ReactNode {
  return (
    <defs>
      <pattern
        id="md-small-grid"
        width="20"
        height="20"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M 20 0 L 0 0 0 20"
          fill="none"
          stroke="var(--md-grid-color)"
          strokeWidth="0.7"
        />
      </pattern>

      <pattern
        id="md-large-grid"
        width="100"
        height="100"
        patternUnits="userSpaceOnUse"
      >
        <rect
          width="100"
          height="100"
          fill="url(#md-small-grid)"
        />
        <path
          d="M 100 0 L 0 0 0 100"
          fill="none"
          stroke="var(--md-grid-strong-color)"
          strokeWidth="1"
        />
      </pattern>

      <marker
        id="md-preview-arrowhead"
        markerWidth="10"
        markerHeight="10"
        refX="8"
        refY="5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path
          d="M 0 0 L 10 5 L 0 10 Z"
          fill="var(--md-arrow-color)"
        />
      </marker>
    </defs>
  );
}
