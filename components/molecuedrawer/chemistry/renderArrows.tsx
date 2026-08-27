import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import type { Arrow, ArrowHeadType } from "../types";
import type { Point } from "./shapeUtils";
import { getArrowPreset } from "./arrowPresets";
import {
  getArrowHeadGeometry,
  getArrowHeadPoints,
  getMechanisticArrowPath,
} from "./mechanisticArrow";

export interface RenderArrowsProps {
  arrows: Arrow[];
  primarySelectedId: string | null;
  onArrowMouseDown: (
    event: ReactMouseEvent<SVGGElement>,
    arrowId: string,
  ) => void;
}

export function renderArrows({
  arrows,
  primarySelectedId,
  onArrowMouseDown,
}: RenderArrowsProps): ReactNode {
  return arrows.map((arrow) => {
    const isSelected = primarySelectedId === arrow.id;
    const preset = getArrowPreset(arrow.arrowType);

    const strokeColor = isSelected
      ? "var(--md-arrow-selected-color)"
      : "var(--md-arrow-color)";

    const strokeWidth = arrow.style.strokeWidth;
    const arrowHead = arrow.arrowHead ?? preset.head;

    const start = arrow.start;
    const end = arrow.end;

    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const length = Math.hypot(deltaX, deltaY);

    const unitX = length > 0 ? deltaX / length : 1;
    const unitY = length > 0 ? deltaY / length : 0;

    const normalX = -unitY;
    const normalY = unitX;

    const makePoint = (x: number, y: number, offset = 0): Point => ({
      x: x + normalX * offset,
      y: y + normalY * offset,
    });

    const getHeadGeometryForLine = (from: Point, to: Point) => {
      const headLength = Math.max(10, strokeWidth * 4);
      const headWidth = Math.max(7, strokeWidth * 2.6);

      const lineDx = to.x - from.x;
      const lineDy = to.y - from.y;
      const lineLength = Math.hypot(lineDx, lineDy) || 1;

      const lineUnitX = lineDx / lineLength;
      const lineUnitY = lineDy / lineLength;

      const lineNormalX = -lineUnitY;
      const lineNormalY = lineUnitX;

      const baseX = to.x - lineUnitX * headLength;
      const baseY = to.y - lineUnitY * headLength;

      return {
        tip: to,
        left: {
          x: baseX + lineNormalX * headWidth,
          y: baseY + lineNormalY * headWidth,
        },
        right: {
          x: baseX - lineNormalX * headWidth,
          y: baseY - lineNormalY * headWidth,
        },
      };
    };

    const renderArrowHead = (
      from: Point,
      to: Point,
      headType: ArrowHeadType,
      key: string,
    ): ReactNode => {
      if (headType === "none") {
        return null;
      }

      const geometry = getHeadGeometryForLine(from, to);
      const isOpenHead = headType === "fishhook" || headType === "half";

      const points = [
        `${geometry.left.x},${geometry.left.y}`,
        `${geometry.tip.x},${geometry.tip.y}`,
        `${geometry.right.x},${geometry.right.y}`,
      ].join(" ");

      if (isOpenHead) {
        return (
          <polyline
            key={key}
            points={points}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            pointerEvents="none"
          />
        );
      }

      return (
        <polygon
          key={key}
          points={points}
          fill={strokeColor}
          stroke={strokeColor}
          strokeWidth={1}
          strokeLinejoin="round"
          pointerEvents="none"
        />
      );
    };

    const renderLine = (
      from: Point,
      to: Point,
      key: string,
      dasharray?: string,
    ) => (
      <path
        key={key}
        d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap={arrow.style.lineCap}
        strokeLinejoin={arrow.style.lineJoin}
        strokeDasharray={dasharray}
        opacity={arrow.style.opacity}
        pointerEvents="none"
      />
    );

    const renderHitArea = (path: string) => (
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={24}
        pointerEvents="stroke"
      />
    );

    const renderSingleStraightArrow = (dasharray?: string) => {
      const path = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;

      return (
        <>
          {renderHitArea(path)}
          {renderLine(start, end, "line", dasharray)}
          {renderArrowHead(start, end, arrowHead, "head")}
        </>
      );
    };

    const renderCurvedArrow = () => {
      const path = getMechanisticArrowPath(arrow);
      const geometry = getArrowHeadGeometry(arrow);
      const isOpenHead = arrowHead === "fishhook" || arrowHead === "half";
      const headPoints = getArrowHeadPoints(geometry);

      return (
        <>
          {renderHitArea(path)}

          <path
            d={path}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap={arrow.style.lineCap}
            strokeLinejoin={arrow.style.lineJoin}
            strokeDasharray={
              preset.strokeDasharray ?? arrow.style.dashPattern?.join(" ")
            }
            opacity={arrow.style.opacity}
            pointerEvents="none"
          />

          {arrowHead === "none" ? null : isOpenHead ? (
            <polyline
              points={[
                `${geometry.left.x},${geometry.left.y}`,
                `${geometry.tip.x},${geometry.tip.y}`,
                `${geometry.right.x},${geometry.right.y}`,
              ].join(" ")}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap={arrow.style.lineCap}
              strokeLinejoin={arrow.style.lineJoin}
              pointerEvents="none"
            />
          ) : (
            <polygon
              points={headPoints}
              fill={strokeColor}
              stroke={strokeColor}
              strokeWidth={1}
              strokeLinejoin="round"
              pointerEvents="none"
            />
          )}
        </>
      );
    };

    const renderResonanceArrow = () => {
      const offset = 7;

      const topStart = makePoint(start.x, start.y, -offset);
      const topEnd = makePoint(end.x, end.y, -offset);

      const bottomStart = makePoint(start.x, start.y, offset);
      const bottomEnd = makePoint(end.x, end.y, offset);

      const hitPath = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;

      return (
        <>
          {renderHitArea(hitPath)}

          {renderLine(topStart, topEnd, "resonance-top")}
          {renderArrowHead(
            topStart,
            topEnd,
            "full",
            "resonance-top-head",
          )}

          {renderLine(bottomEnd, bottomStart, "resonance-bottom")}
          {renderArrowHead(
            bottomEnd,
            bottomStart,
            "full",
            "resonance-bottom-head",
          )}
        </>
      );
    };

    const renderEquilibriumArrow = () => {
      const offset = 7;
      const shortening = Math.min(18, length * 0.2);

      const topStart = makePoint(start.x, start.y, -offset);
      const topEnd = makePoint(
        end.x - unitX * shortening,
        end.y - unitY * shortening,
        -offset,
      );

      const bottomStart = makePoint(
        start.x + unitX * shortening,
        start.y + unitY * shortening,
        offset,
      );
      const bottomEnd = makePoint(end.x, end.y, offset);

      const hitPath = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;

      return (
        <>
          {renderHitArea(hitPath)}

          {renderLine(topStart, topEnd, "equilibrium-top")}
          {renderArrowHead(
            topStart,
            topEnd,
            "full",
            "equilibrium-top-head",
          )}

          {renderLine(bottomEnd, bottomStart, "equilibrium-bottom")}
          {renderArrowHead(
            bottomEnd,
            bottomStart,
            "full",
            "equilibrium-bottom-head",
          )}
        </>
      );
    };

    const renderReversibleArrow = () => {
      const offset = 7;

      const topStart = makePoint(start.x, start.y, -offset);
      const topEnd = makePoint(end.x, end.y, -offset);

      const bottomStart = makePoint(start.x, start.y, offset);
      const bottomEnd = makePoint(end.x, end.y, offset);

      const hitPath = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;

      return (
        <>
          {renderHitArea(hitPath)}

          {renderLine(topStart, topEnd, "reversible-top")}
          {renderArrowHead(
            topStart,
            topEnd,
            "full",
            "reversible-top-head",
          )}

          {renderLine(bottomEnd, bottomStart, "reversible-bottom")}
          {renderArrowHead(
            bottomEnd,
            bottomStart,
            "full",
            "reversible-bottom-head",
          )}
        </>
      );
    };

    const renderRetrosynthesisArrow = () => {
      const offset = 3.5;

      const upperStart = makePoint(start.x, start.y, -offset);
      const upperEnd = makePoint(end.x, end.y, -offset);

      const lowerStart = makePoint(start.x, start.y, offset);
      const lowerEnd = makePoint(end.x, end.y, offset);

      const hitPath = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;

      return (
        <>
          {renderHitArea(hitPath)}

          {renderLine(upperStart, upperEnd, "retro-upper", "7 4")}
          {renderLine(lowerStart, lowerEnd, "retro-lower", "7 4")}
          {renderArrowHead(upperStart, upperEnd, "full", "retro-head")}
        </>
      );
    };

    const renderAnnotationArrow = () => {
      const path = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;

      return (
        <>
          {renderHitArea(path)}

          <path
            d={path}
            fill="none"
            stroke={strokeColor}
            strokeWidth={Math.max(1, strokeWidth * 0.75)}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={preset.strokeDasharray ?? "5 5"}
            opacity={arrow.style.opacity}
            pointerEvents="none"
          />

          {renderArrowHead(start, end, "half", "annotation-head")}
        </>
      );
    };

    let arrowContent: ReactNode;

    switch (preset.pathStyle) {
      case "straight":
        arrowContent = renderSingleStraightArrow();
        break;

      case "dashed":
        arrowContent = renderSingleStraightArrow(
          preset.strokeDasharray ?? "8 6",
        );
        break;

      case "curved":
        arrowContent = renderCurvedArrow();
        break;

      case "resonance":
        arrowContent = renderResonanceArrow();
        break;

      case "equilibrium":
        arrowContent = renderEquilibriumArrow();
        break;

      case "reversible":
        arrowContent = renderReversibleArrow();
        break;

      case "retrosynthesis":
        arrowContent = renderRetrosynthesisArrow();
        break;

      case "annotation":
        arrowContent = renderAnnotationArrow();
        break;

      default:
        arrowContent = renderSingleStraightArrow();
    }

    const presetLabel = preset.showLabel
      ? preset.id === "proton-transfer"
        ? "H⁺"
        : preset.id === "charge-transfer"
          ? "±"
          : preset.id === "mechanistic-annotation"
            ? "مکانیسم"
            : undefined
      : undefined;

    const displayedLabel = arrow.label || presetLabel;

    return (
      <g
        key={arrow.id}
        data-arrow-id={arrow.id}
        onMouseDown={(event) => onArrowMouseDown(event, arrow.id)}
        style={{ cursor: "pointer" }}
      >
        {arrowContent}

        {displayedLabel && (
          <text
            x={(start.x + end.x) / 2}
            y={(start.y + end.y) / 2 - 14}
            textAnchor="middle"
            fill={strokeColor}
            fontSize={arrow.style.fontSize}
            fontFamily={arrow.style.fontFamily}
            fontWeight={700}
            pointerEvents="none"
          >
            {displayedLabel}
          </text>
        )}
      </g>
    );
  });
}
