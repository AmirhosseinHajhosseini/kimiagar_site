import type {
  Arrow,
  ArrowHeadType,
  ArrowType,
  Point,
  StyleConfiguration,
} from "../types";

const DEFAULT_ARROW_COLOR = "#2563eb";
const DEFAULT_ARROW_STROKE_WIDTH = 3;
const DEFAULT_ARROW_OPACITY = 1;
const DEFAULT_ARROW_Z_INDEX = 10;
const DEFAULT_CURVE_OFFSET = 50;
const DEFAULT_ARROW_HEAD_SIZE = 14;
const DEFAULT_ARROW_MINIMUM_LENGTH = 25;
const DEFAULT_ARROW_STYLE: StyleConfiguration = {
  color: DEFAULT_ARROW_COLOR,
  fillColor: "none",
  strokeColor: DEFAULT_ARROW_COLOR,
  strokeWidth: DEFAULT_ARROW_STROKE_WIDTH,
  opacity: DEFAULT_ARROW_OPACITY,
  fontSize: 16,
  fontFamily: "Arial, sans-serif",
  scale: 1,
  rotation: 0,
  dashPattern: [],
  lineCap: "round",
  lineJoin: "round",
  visible: true,
};


function createId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `arrow-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function distanceBetween(start: Point, end: Point): number {
  return Math.hypot(end.x - start.x, end.y - start.y);
}

function normalizeVector(x: number, y: number): Point {
  const length = Math.hypot(x, y);

  if (length === 0) {
    return { x: 1, y: 0 };
  }

  return {
    x: x / length,
    y: y / length,
  };
}

function getLastControlPoint(arrow: Arrow): Point | null {
  const controlPoints = arrow.controlPoints;

  if (!controlPoints || controlPoints.length === 0) {
    return null;
  }

  return controlPoints[controlPoints.length - 1] ?? null;
}

function getArrowHeadFromArrowType(
  arrowType: ArrowType,
): ArrowHeadType {
  switch (arrowType) {
    case "single-electron":
      return "fishhook";

    case "equilibrium":
    case "reversible-reaction":
      return "double";

    case "dashed-reaction":
      return "half";

    case "electron-pair":
    case "curved-reaction":
    case "bond-forming":
    case "bond-breaking":
    case "proton-transfer":
    case "charge-transfer":
    default:
      return "full";
  }
}

export interface CreateMechanisticArrowOptions {
  controlPoint?: Point;
  curveOffset?: number;
  curveDirection?: 1 | -1;
  arrowHead?: ArrowHeadType;
  arrowHeadSize?: number;
  label?: string;
  style?: Partial<StyleConfiguration>;
}

export function getDefaultArrowControlPoint(
  start: Point,
  end: Point,
  curveOffset = DEFAULT_CURVE_OFFSET,
  direction: 1 | -1 = 1,
): Point {
  const middlePoint: Point = {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2,
  };

  const directionVector: Point = {
    x: end.x - start.x,
    y: end.y - start.y,
  };

  const normal = normalizeVector(
    -directionVector.y,
    directionVector.x,
  );

  const adaptiveOffset = Math.min(
    Math.abs(curveOffset),
    Math.max(20, distanceBetween(start, end) * 0.45),
  );

  return {
    x: middlePoint.x + normal.x * adaptiveOffset * direction,
    y: middlePoint.y + normal.y * adaptiveOffset * direction,
  };
}

export function createMechanisticArrow(
  start: Point,
  end: Point,
  arrowType: ArrowType,
  options: CreateMechanisticArrowOptions = {},
): Arrow {
  const curveOffset =
    options.curveOffset ?? DEFAULT_CURVE_OFFSET;

  const curveDirection =
    options.curveDirection ?? 1;

  const controlPoint =
    options.controlPoint ??
    getDefaultArrowControlPoint(
      start,
      end,
      curveOffset,
      curveDirection,
    );

  return {
    id: createId(),
    type: "arrow",
    selected: false,
    locked: false,
    visible: true,
    zIndex: DEFAULT_ARROW_Z_INDEX,

    style: {
      ...DEFAULT_ARROW_STYLE,
      ...options.style,
    },

    arrowType,

    start: {
      x: start.x,
      y: start.y,
    },

    end: {
      x: end.x,
      y: end.y,
    },

        controlPoints: [
      {
        x: controlPoint.x,
        y: controlPoint.y,
      },
    ],


    curvature: curveOffset,

    arrowHead:
      options.arrowHead ??
      getArrowHeadFromArrowType(arrowType),

    arrowHeadSize:
      options.arrowHeadSize ??
      DEFAULT_ARROW_HEAD_SIZE,

    ...(options.label?.trim()
      ? {
          label: options.label.trim(),
        }
      : {}),

    backgroundContrast: false,
  };
}

export function getQuadraticBezierPoint(
  start: Point,
  control: Point,
  end: Point,
  t: number,
): Point {
  const safeT = Math.max(0, Math.min(1, t));
  const inverseT = 1 - safeT;

  return {
    x:
      inverseT * inverseT * start.x +
      2 * inverseT * safeT * control.x +
      safeT * safeT * end.x,

    y:
      inverseT * inverseT * start.y +
      2 * inverseT * safeT * control.y +
      safeT * safeT * end.y,
  };
}

export function getQuadraticBezierTangent(
  start: Point,
  control: Point,
  end: Point,
  t: number,
): Point {

  const safeT = Math.max(0, Math.min(1, t));

  const tangentX =
    2 *
    ((1 - safeT) * (control.x - start.x) +
      safeT * (end.x - control.x));

  const tangentY =
    2 *
    ((1 - safeT) * (control.y - start.y) +
      safeT * (end.y - control.y));

  return normalizeVector(tangentX, tangentY);
}

export function getArrowEndTangent(
  control: Point,
  end: Point,
): Point {
  return normalizeVector(
    end.x - control.x,
    end.y - control.y,
  );
}

export interface ArrowHeadGeometry {
  tip: Point;
  left: Point;
  right: Point;
}

export function getArrowHeadGeometry(
  arrow: Arrow,
): ArrowHeadGeometry {
  const controlPoint =
    getLastControlPoint(arrow) ?? arrow.start;

  const tangent = getArrowEndTangent(
    controlPoint,
    arrow.end,
  );

  const isFishhook =
    arrow.arrowHead === "fishhook";

  const headLength = isFishhook
    ? arrow.arrowHeadSize * 0.85
    : arrow.arrowHeadSize;

  const headWidth = isFishhook
    ? arrow.arrowHeadSize * 0.5
    : arrow.arrowHeadSize * 0.75;

  const base: Point = {
    x: arrow.end.x - tangent.x * headLength,
    y: arrow.end.y - tangent.y * headLength,
  };

  const perpendicular: Point = {
    x: -tangent.y,
    y: tangent.x,
  };

  return {
    tip: {
      x: arrow.end.x,
      y: arrow.end.y,
    },

    left: {
      x: base.x + perpendicular.x * headWidth,
      y: base.y + perpendicular.y * headWidth,
    },

    right: {
      x: base.x - perpendicular.x * headWidth,
      y: base.y - perpendicular.y * headWidth,
    },
  };
}

export function getArrowHeadPoints(
  geometry: ArrowHeadGeometry,
): string {
  return [
    `${geometry.tip.x},${geometry.tip.y}`,
    `${geometry.left.x},${geometry.left.y}`,
    `${geometry.right.x},${geometry.right.y}`,
  ].join(" ");
}

export function getMechanisticArrowPath(
  arrow: Arrow,
): string {
  const controlPoint = getLastControlPoint(arrow);

  if (!controlPoint) {
    return [
      `M ${arrow.start.x} ${arrow.start.y}`,
      `L ${arrow.end.x} ${arrow.end.y}`,
    ].join(" ");
  }

  return [
    `M ${arrow.start.x} ${arrow.start.y}`,
    `Q ${controlPoint.x} ${controlPoint.y}`,
    `${arrow.end.x} ${arrow.end.y}`,
  ].join(" ");
}


export function isValidMechanisticArrow(
  start: Point,
  end: Point,
  minimumLength = DEFAULT_ARROW_MINIMUM_LENGTH,
): boolean {
  if (
    !Number.isFinite(start.x) ||
    !Number.isFinite(start.y) ||
    !Number.isFinite(end.x) ||
    !Number.isFinite(end.y)
  ) {
    return false;
  }

  if (
    !Number.isFinite(minimumLength) ||
    minimumLength < 0
  ) {
    return false;
  }

  return distanceBetween(start, end) >= minimumLength;
}

export function getMechanisticArrowLength(
  arrow: Arrow,
): number {
  return distanceBetween(
    arrow.start,
    arrow.end,
  );
}

export function getMechanisticArrowMidpoint(
  arrow: Arrow,
): Point {
  const controlPoint = getLastControlPoint(arrow);

  if (!controlPoint) {
    return {
      x: (arrow.start.x + arrow.end.x) / 2,
      y: (arrow.start.y + arrow.end.y) / 2,
    };
  }

  return getQuadraticBezierPoint(
    arrow.start,
    controlPoint,
    arrow.end,
    0.5,
  );
}
