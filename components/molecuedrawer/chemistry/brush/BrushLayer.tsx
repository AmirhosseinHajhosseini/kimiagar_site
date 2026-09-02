import React, { useId, useMemo, memo, useCallback } from 'react';

// ==========================================
// 1. Types & Interfaces
// ==========================================

export interface BrushPoint {
  x: number;
  y: number;
  pressure?: number;
}

export interface BrushPathItem {
  id: string;
  points: BrushPoint[];
  color?: string;
  strokeWidth?: number;
  opacity?: number;
  mode?: 'pen' | 'highlighter' | 'dashed';
}

export interface BrushLayerProps {
  paths: BrushPathItem[];
  activePath: BrushPathItem | null;
  eraserMode?: boolean;
  onDeletePath?: (id: string) => void;
  onStrokeClick?: (id: string) => void;
}

// ==========================================
// 2. Fast Freehand SVG Path Generator (مثل مداد Paint)
// ==========================================

export const pointsToSvgPath = (points: BrushPoint[]): string => {
  if (!points || points.length === 0) return '';
  
  if (points.length === 1) {
    // نقطه تکی (Dot)
    return `M ${points[0].x} ${points[0].y} L ${points[0].x + 0.1} ${points[0].y + 0.1}`;
  }

  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  // رسم نرم با منحنی‌های درجه دو پیوسته بدون حذف نقاط
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    d += ` Q ${p1.x} ${p1.y}, ${midX} ${midY}`;
  }
  
  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
};

// ==========================================
// 3. Memoized Stroke Sub-component
// ==========================================

interface BrushStrokeItemProps {
  stroke: BrushPathItem;
  eraserMode?: boolean;
  onClick?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const BrushStrokeItem = memo(function BrushStrokeItem({
  stroke,
  eraserMode,
  onClick,
  onDelete,
}: BrushStrokeItemProps) {
  const pathData = useMemo(() => pointsToSvgPath(stroke.points), [stroke.points]);

  const handlePointerEnter = useCallback(
    (e: React.PointerEvent) => {
      if (eraserMode && (e.buttons === 1 || (e.pressure && e.pressure > 0))) {
        onDelete?.(stroke.id);
      }
    },
    [eraserMode, onDelete, stroke.id]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (eraserMode) {
        e.stopPropagation();
        onDelete?.(stroke.id);
      } else if (onClick) {
        e.stopPropagation();
        onClick(stroke.id);
      }
    },
    [eraserMode, onDelete, onClick, stroke.id]
  );

  const strokeWidth = stroke.strokeWidth || 2.5;
  const strokeColor = stroke.color || '#1e293b';
  const isHighlighter = stroke.mode === 'highlighter';

  return (
    <g
      className="brush-stroke-group"
      style={{ mixBlendMode: isHighlighter ? 'multiply' : 'normal' }}
    >
      {/* محدوده کلیک / پاک‌کن */}
      <path
        d={pathData}
        fill="none"
        stroke="transparent"
        strokeWidth={Math.max(strokeWidth, 14)}
        strokeLinecap="round"
        strokeLinejoin="round"
        cursor={eraserMode ? 'crosshair' : 'default'}
        onPointerEnter={handlePointerEnter}
        onPointerDown={handlePointerDown}
      />

      {/* خط اصلی مداد */}
      <path
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeOpacity={isHighlighter ? 0.4 : (stroke.opacity ?? 1)}
        strokeDasharray={
          stroke.mode === 'dashed'
            ? `${strokeWidth * 2}, ${strokeWidth * 2}`
            : undefined
        }
        strokeLinecap="round"
        strokeLinejoin="round"
        pointerEvents="none"
      />
    </g>
  );
});

// ==========================================
// 4. Main BrushLayer Component
// ==========================================

export const BrushLayer: React.FC<BrushLayerProps> = ({
  paths,
  activePath,
  eraserMode = false,
  onDeletePath,
  onStrokeClick,
}) => {
  const layerId = useId();

  const activePathData = useMemo(() => {
    if (!activePath?.points?.length) return '';
    return pointsToSvgPath(activePath.points);
  }, [activePath?.points]);

  return (
    <g id={`brush-layer-${layerId}`} className="brush-layer" style={{ pointerEvents: 'auto' }}>
      {/* خطوط کشیده شده قبلی */}
      <g className="brush-saved-strokes">
        {paths?.map((stroke) => (
          <BrushStrokeItem
            key={stroke.id}
            stroke={stroke}
            eraserMode={eraserMode}
            onClick={onStrokeClick}
            onDelete={onDeletePath}
          />
        ))}
      </g>

      {/* خط در حال کشیده شدن زنده */}
      {activePath && activePathData && (
        <g
          className="brush-active-stroke"
          style={{
            mixBlendMode: activePath.mode === 'highlighter' ? 'multiply' : 'normal',
            pointerEvents: 'none',
          }}
        >
          <path
            d={activePathData}
            fill="none"
            stroke={activePath.color || '#1e293b'}
            strokeWidth={activePath.strokeWidth || 2.5}
            strokeOpacity={activePath.mode === 'highlighter' ? 0.4 : (activePath.opacity ?? 1)}
            strokeDasharray={
              activePath.mode === 'dashed'
                ? `${(activePath.strokeWidth || 2.5) * 2}, ${(activePath.strokeWidth || 2.5) * 2}`
                : undefined
            }
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}
    </g>
  );
};

export default BrushLayer;
