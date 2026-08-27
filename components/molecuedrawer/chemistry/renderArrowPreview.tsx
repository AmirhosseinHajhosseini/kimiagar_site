// components/molecuedrawer/chemistry/renderArrowPreview.tsx
import type { ReactNode } from "react";
import type { ArrowHeadType } from "../types";

export interface ArrowPreviewData {
  path: string;
  headPoints: string;
  arrowHead: ArrowHeadType;
  pathStyle: string;
}

export interface RenderArrowPreviewProps {
  preview: ArrowPreviewData | null;
  className?: string;
}

export function renderArrowPreview({
  preview,
  className,
}: RenderArrowPreviewProps): ReactNode {
  if (!preview) return null;

  return (
    <g className={className} pointerEvents="none">
      <path
        d={preview.path}
        fill="none"
        stroke="var(--md-arrow-color)"
        strokeWidth={2}
        strokeDasharray="6 5"
        strokeLinecap="round"
        markerEnd="url(#md-preview-arrowhead)"
        opacity={0.8}
      />

      {preview.pathStyle !== "curved" &&
        preview.arrowHead !== "none" && (
          <polygon
            points={preview.headPoints}
            fill="var(--md-arrow-color)"
            opacity={0.8}
          />
        )}
    </g>
  );
}
