"use client";

import {
  useCallback,
  useRef,
  useState,
} from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

import {
  getChargeAtomPatch,
  getElectronAtomPatch,
  getChargeDisplayText,
} from "./chemistry/chargeAndElectronUtils";

import type {
  Arrow,
  Atom,
  Bond,
  MechanismDocument,
  Point,
  Ring,
  TextObject,
} from "./types";

import { getElementData } from "./chemistry/atomData";
import {
  createDefaultStyle,
  createId,
} from "./chemistry/initialState";

import styles from "./MoleculeDrawer.module.css";

const SVG_WIDTH = 1200;
const SVG_HEIGHT = 800;
const ATOM_RADIUS = 18;

const MIN_ARROW_DRAG_DISTANCE = 15;
const ARROW_DRAG_THRESHOLD = 3;
const OBJECT_HIT_STROKE_WIDTH = 18;

type AtomPalette = {
  fill: string;
  text: string;
};

const ELEMENT_PALETTES: Record<string, AtomPalette> = {
  H: {
    fill: "#E2E8F0",
    text: "#1E293B",
  },
  C: {
    fill: "#334155",
    text: "#FFFFFF",
  },
  N: {
    fill: "#2563EB",
    text: "#FFFFFF",
  },
  O: {
    fill: "#DC2626",
    text: "#FFFFFF",
  },
  F: {
    fill: "#16A34A",
    text: "#FFFFFF",
  },
  Cl: {
    fill: "#059669",
    text: "#FFFFFF",
  },
  Br: {
    fill: "#92400E",
    text: "#FFFFFF",
  },
  I: {
    fill: "#7C3AED",
    text: "#FFFFFF",
  },
  S: {
    fill: "#EAB308",
    text: "#1F2937",
  },
  P: {
    fill: "#EA580C",
    text: "#FFFFFF",
  },
  B: {
    fill: "#D97706",
    text: "#FFFFFF",
  },
  Si: {
    fill: "#64748B",
    text: "#FFFFFF",
  },
  Na: {
    fill: "#7C3AED",
    text: "#FFFFFF",
  },
  K: {
    fill: "#8B5CF6",
    text: "#FFFFFF",
  },
  Ca: {
    fill: "#22C55E",
    text: "#FFFFFF",
  },
  Mg: {
    fill: "#65A30D",
    text: "#FFFFFF",
  },
  Fe: {
    fill: "#B45309",
    text: "#FFFFFF",
  },
  Cu: {
    fill: "#C2410C",
    text: "#FFFFFF",
  },
  Zn: {
    fill: "#94A3B8",
    text: "#1F2937",
  },
};

const getAtomPalette = (
  element: string,
  fallbackFill?: string,
  fallbackText?: string
): AtomPalette => {
  const rawElement = String(element ?? "").trim();

  const normalizedElement =
    rawElement.length > 0
      ? rawElement.charAt(0).toUpperCase() +
        rawElement.slice(1).toLowerCase()
      : "";

  const palette = ELEMENT_PALETTES[normalizedElement];

  if (palette) {
    return palette;
  }

  return {
    fill: fallbackFill?.trim() || "#64748B",
    text: fallbackText?.trim() || "#FFFFFF",
  };
};

type BondLine = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

type SimpleBondOrder = 1 | 2 | 3;

interface MoleculeCanvasProps {
  document: MechanismDocument;
  bondSelection: string[];
  activeOperator?: string | null;

  onAtomMouseDown: (
    event: ReactMouseEvent<SVGGElement>,
    atomId: string
  ) => void;

  onBondClick: (
    event: ReactMouseEvent<SVGGElement>,
    bondId: string
  ) => void;

  onRingClick: (
    event: ReactMouseEvent<SVGGElement>,
    ringId: string
  ) => void;

  onArrowClick?: (
    event: ReactMouseEvent<SVGGElement>,
    arrowId: string
  ) => void;

  onTextClick?: (
    event: ReactMouseEvent<SVGGElement>,
    textId: string
  ) => void;

  onCanvasClick: (
    event: ReactMouseEvent<SVGSVGElement>,
    point: Point
  ) => void;

  onCanvasMouseMove: (
    event: ReactMouseEvent<SVGSVGElement>,
    point: Point
  ) => void;

  onCanvasMouseUp: () => void;

  onUpdateAtom: (
    atomId: string,
    changes: Partial<Atom>
  ) => void;

  onAddArrow: (arrow: Arrow) => void;

  onAddTextObject: (
    textObject: TextObject
  ) => void;
}

const getSimpleBondOrder = (
  order: number
): SimpleBondOrder => {
  if (order === 2) return 2;
  if (order === 3) return 3;
  return 1;
};

const getBondLines = (
  start: Point,
  end: Point,
  order: SimpleBondOrder
): BondLine[] => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);

  if (length === 0) return [];

  const normalX = -dy / length;
  const normalY = dx / length;
  const offset = 5;

  const createLine = (
    distance: number
  ): BondLine => ({
    x1: start.x + normalX * distance,
    y1: start.y + normalY * distance,
    x2: end.x + normalX * distance,
    y2: end.y + normalY * distance,
  });

  if (order === 1) {
    return [createLine(0)];
  }

  if (order === 2) {
    return [
      createLine(-offset),
      createLine(offset),
    ];
  }

  return [
    createLine(0),
    createLine(-offset * 1.8),
    createLine(offset * 1.8),
  ];
};

const getWedgePoints = (
  start: Point,
  end: Point
): string | null => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);

  if (length === 0) return null;

  const normalX = -dy / length;
  const normalY = dx / length;
  const width = 14;

  return [
    `${start.x},${start.y}`,
    `${end.x + normalX * width},${
      end.y + normalY * width
    }`,
    `${end.x - normalX * width},${
      end.y - normalY * width
    }`,
  ].join(" ");
};

const getHashedWedgeLines = (
  start: Point,
  end: Point
): BondLine[] => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);

  if (length === 0) return [];

  const normalX = -dy / length;
  const normalY = dx / length;
  const count = Math.max(
    5,
    Math.floor(length / 10)
  );
  const maxWidth = 14;

  return Array.from(
    { length: count },
    (_, index): BondLine => {
      const progress = (index + 1) / count;

      const centerX =
        start.x + dx * progress;
      const centerY =
        start.y + dy * progress;

      const halfWidth =
        (maxWidth * progress) / 2;

      return {
        x1: centerX - normalX * halfWidth,
        y1: centerY - normalY * halfWidth,
        x2: centerX + normalX * halfWidth,
        y2: centerY + normalY * halfWidth,
      };
    }
  );
};

const getWavyPoints = (
  start: Point,
  end: Point
): string | null => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);

  if (length === 0) return null;

  const normalX = -dy / length;
  const normalY = dx / length;
  const amplitude = 5;
  const segments = Math.max(
    6,
    Math.floor(length / 12)
  );

  return Array.from(
    { length: segments + 1 },
    (_, index) => {
      const progress = index / segments;
      const direction =
        index % 2 === 0 ? 1 : -1;

      const x =
        start.x +
        dx * progress +
        normalX * amplitude * direction;

      const y =
        start.y +
        dy * progress +
        normalY * amplitude * direction;

      return `${x},${y}`;
    }
  ).join(" ");
};

const getArrowPath = (
  arrow: Arrow
): string => {
  const { start, end } = arrow;

  if (!arrow.curvature) {
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  }

  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;

  const dx = end.x - start.x;
  const dy = end.y - start.y;

  const controlX =
    midX - dy * arrow.curvature;
  const controlY =
    midY + dx * arrow.curvature;

  return [
    `M ${start.x} ${start.y}`,
    `Q ${controlX} ${controlY}`,
    `${end.x} ${end.y}`,
  ].join(" ");
};

export default function MoleculeCanvas({
  document,
  bondSelection,
  activeOperator,
  onAtomMouseDown,
  onBondClick,
  onRingClick,
  onArrowClick,
  onTextClick,
  onCanvasClick,
  onCanvasMouseMove,
  onCanvasMouseUp,
  onUpdateAtom,
  onAddArrow,
  onAddTextObject,
}: MoleculeCanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const isDraggingArrowRef = useRef(false);

  const [
    arrowDraftStart,
    setArrowDraftStart,
  ] = useState<Point | null>(null);

  const [
    arrowDraftCurrent,
    setArrowDraftCurrent,
  ] = useState<Point | null>(null);

  const getSVGCoordinates = useCallback(
    (
      event: ReactMouseEvent<SVGSVGElement>
    ): Point => {
      const svg = svgRef.current;

      if (!svg) {
        return {
          x: event.clientX,
          y: event.clientY,
        };
      }

      const matrix = svg.getScreenCTM();

      if (!matrix) {
        return {
          x: event.clientX,
          y: event.clientY,
        };
      }

      const point = new DOMPoint(
        event.clientX,
        event.clientY
      ).matrixTransform(matrix.inverse());

      let x = point.x;
      let y = point.y;

      if (document.viewport.snapToGrid) {
        const gridSize =
          document.viewport.gridSize || 20;

        x = Math.round(x / gridSize) * gridSize;
        y = Math.round(y / gridSize) * gridSize;
      }

      return { x, y };
    },
    [
      document.viewport.gridSize,
      document.viewport.snapToGrid,
    ]
  );

  const clearArrowDraft = () => {
    setArrowDraftStart(null);
    setArrowDraftCurrent(null);
    isDraggingArrowRef.current = false;
  };

  const handleAtomInteract = (
    atom: Atom,
    event: ReactMouseEvent<SVGGElement>
  ) => {
    event.stopPropagation();

    const mode = document.tool.mode;

    if (mode === "add-charge") {
      const patch = getChargeAtomPatch(document.tool.selectedCharge);
      onUpdateAtom(atom.id, patch);
      return;
    }

    if (mode === "add-electron") {
      const patch = getElectronAtomPatch(document.tool.selectedElectronDisplay);
      onUpdateAtom(atom.id, patch);
      return;
    }

    onAtomMouseDown(event, atom.id);
  };

  const handleMouseDown = (
    event: ReactMouseEvent<SVGSVGElement>
  ) => {
    if (document.tool.mode !== "add-arrow") {
      return;
    }

    const point = getSVGCoordinates(event);

    isDraggingArrowRef.current = false;

    setArrowDraftStart(point);
    setArrowDraftCurrent(point);
  };

  const handleMouseMove = (
    event: ReactMouseEvent<SVGSVGElement>
  ) => {
    const point = getSVGCoordinates(event);

    if (
      arrowDraftStart &&
      document.tool.mode === "add-arrow"
    ) {
      const distance = Math.hypot(
        point.x - arrowDraftStart.x,
        point.y - arrowDraftStart.y
      );

      if (distance > ARROW_DRAG_THRESHOLD) {
        isDraggingArrowRef.current = true;
      }

      setArrowDraftCurrent(point);
    }

    onCanvasMouseMove(event, point);
  };

  const handleMouseUp = () => {
    if (
      arrowDraftStart &&
      arrowDraftCurrent &&
      document.tool.mode === "add-arrow"
    ) {
      const distance = Math.hypot(
        arrowDraftCurrent.x - arrowDraftStart.x,
        arrowDraftCurrent.y - arrowDraftStart.y
      );

      if (distance >= MIN_ARROW_DRAG_DISTANCE) {
        const selectedArrowType =
          document.tool.selectedArrowType ||
          "straight-reaction";

        const isCurved =
          selectedArrowType.includes("curved");

        const newArrow: Arrow = {
          id: createId("arrow"),
          type: "arrow",
          arrowType: selectedArrowType,
          start: arrowDraftStart,
          end: arrowDraftCurrent,
          controlPoints: [],
          curvature: isCurved ? 0.35 : 0,
          arrowHead: "full",
          arrowHeadSize: 10,
          backgroundContrast: true,
          selected: true,
          locked: false,
          visible: true,
          zIndex: 2,
          style: createDefaultStyle({
            strokeColor:
              "var(--md-arrow-color, #10B981)",
            strokeWidth: 2.5,
            lineCap: "round",
            lineJoin: "round",
          }),
        };

        onAddArrow(newArrow);
      }

      clearArrowDraft();
    }

    onCanvasMouseUp();
  };

  const handleClick = (
    event: ReactMouseEvent<SVGSVGElement>
  ) => {
    if (isDraggingArrowRef.current) {
      isDraggingArrowRef.current = false;
      return;
    }

    const point = getSVGCoordinates(event);

    if (activeOperator) {
      let textSymbol = "+";

      if (activeOperator === "heat") {
        textSymbol = "Δ";
      } else if (activeOperator === "light") {
        textSymbol = "hν";
      } else if (activeOperator === "bracket") {
        textSymbol = "[ ]‡";
      } else if (
        activeOperator === "equilibrium-constant"
      ) {
        textSymbol = "K";
      }

      const textObject: TextObject = {
        id: createId("text"),
        type: "text",
        position: point,
        segments: [
          {
            id: createId("segment"),
            text: textSymbol,
            mode: "normal",
          },
        ],
        fontWeight: "bold",
        fontStyle: "normal",
        alignment: "middle",
        editable: true,
        rotation: 0,
        selected: true,
        locked: false,
        visible: true,
        zIndex: 3,
        style: createDefaultStyle({
          color:
            "var(--md-text-primary, #1F2937)",
          fontSize: 24,
        }),
      };

      onAddTextObject(textObject);
      return;
    }

    onCanvasClick(event, point);
  };

  const atoms = document.objects.filter(
    (object): object is Atom =>
      object.type === "atom"
  );

  const bonds = document.objects.filter(
    (object): object is Bond =>
      object.type === "bond"
  );

  const rings = document.objects.filter(
    (object): object is Ring =>
      object.type === "ring"
  );

  const arrows = document.objects.filter(
    (object): object is Arrow =>
      object.type === "arrow"
  );

  const texts = document.objects.filter(
    (object): object is TextObject =>
      object.type === "text"
  );

  const renderedBonds = bonds.map((bond) => {
    const atomA = atoms.find(
      (atom) => atom.id === bond.startAtomId
    );

    const atomB = atoms.find(
      (atom) => atom.id === bond.endAtomId
    );

    if (!atomA || !atomB) {
      return null;
    }

    const start = atomA.position;
    const end = atomB.position;

    const isSelected =
      document.selection.primarySelectedId === bond.id ||
      bondSelection.includes(bond.id);

    const strokeColor = isSelected
      ? "var(--md-arrow-selected-color)"
      : "var(--md-arrow-color)";

    const commonProps = {
      stroke: strokeColor,
      strokeWidth: bond.style.strokeWidth,
      strokeLinecap: bond.style.lineCap,
      strokeLinejoin: bond.style.lineJoin,
      opacity: bond.style.opacity,
    };

    const renderShape = () => {
      if (bond.bondType === "solid-wedge") {
        const points = getWedgePoints(
          start,
          end
        );

        return points ? (
          <polygon
            points={points}
            fill={strokeColor}
            opacity={bond.style.opacity}
          />
        ) : null;
      }

      if (bond.bondType === "hashed-wedge") {
        return (
          <>
            {getHashedWedgeLines(
              start,
              end
            ).map((line, index) => (
              <line
                key={`${bond.id}-hash-${index}`}
                {...line}
                {...commonProps}
                strokeWidth={2}
              />
            ))}
          </>
        );
      }

      if (bond.bondType === "dashed") {
        return (
          <line
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            {...commonProps}
            strokeDasharray="8 6"
          />
        );
      }

      if (bond.bondType === "wavy") {
        const points = getWavyPoints(
          start,
          end
        );

        return points ? (
          <polyline
            points={points}
            fill="none"
            {...commonProps}
          />
        ) : null;
      }

      return (
        <>
          {getBondLines(
            start,
            end,
            getSimpleBondOrder(bond.order)
          ).map((line, index) => (
            <line
              key={`${bond.id}-line-${index}`}
              {...line}
              {...commonProps}
            />
          ))}
        </>
      );
    };

    return (
      <g
        key={bond.id}
        className={`${styles.bond} ${
          isSelected ? styles.bondSelected : ""
        }`}
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.stopPropagation();
          onBondClick(event, bond.id);
        }}
        style={{ cursor: "pointer" }}
      >
        <line
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          stroke="transparent"
          strokeWidth={OBJECT_HIT_STROKE_WIDTH}
        />

        {renderShape()}
      </g>
    );
  });

  const renderedRings = rings.map((ring) => {
    const points = ring.atomIds
      .map(
        (atomId) =>
          atoms.find(
            (atom) => atom.id === atomId
          )?.position
      )
      .filter(
        (position): position is Point =>
          Boolean(position)
      );

    if (points.length < 3) {
      return null;
    }

    const polygonPoints = points
      .map(
        (point) => `${point.x},${point.y}`
      )
      .join(" ");

    const isSelected =
      document.selection.primarySelectedId === ring.id;

    const ringColor = isSelected
      ? "var(--md-selection-color)"
      : ring.style.strokeColor;

    return (
      <g
        key={ring.id}
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.stopPropagation();
          onRingClick(event, ring.id);
        }}
        style={{ cursor: "pointer" }}
      >
        <polygon
          points={polygonPoints}
          fill="transparent"
          stroke={ringColor}
          strokeWidth={ring.style.strokeWidth}
          opacity={ring.style.opacity}
        />

        {ring.aromatic && (
          <circle
            cx={ring.center.x}
            cy={ring.center.y}
            r={ring.radius * 0.45}
            fill="none"
            stroke={ringColor}
            strokeWidth={2}
            opacity={0.9}
            pointerEvents="none"
          />
        )}
      </g>
    );
  });

  const renderedAtoms = atoms.map((atom) => {
    const elementData = getElementData(atom.element);

    const atomPalette = getAtomPalette(
      atom.element,
      elementData.defaultColor,
      elementData.defaultTextColor
    );

    const isSelected =
      document.selection.primarySelectedId === atom.id;

    const isBondStart =
      bondSelection[0] === atom.id;

    const chargeSymbol = getChargeDisplayText(atom);

    return (
      <g
        key={atom.id}
        transform={`translate(${atom.position.x} ${atom.position.y})`}
        onMouseDown={(event) => {
          handleAtomInteract(atom, event);
        }}
        className={
          isBondStart
            ? styles.atomSelected
            : undefined
        }
        style={{ cursor: "pointer" }}
      >
        <circle
          r={ATOM_RADIUS + 8}
          fill="transparent"
          pointerEvents="all"
        />

        {isSelected && (
          <circle
            r={ATOM_RADIUS + 4}
            fill="none"
            stroke="var(--md-selection-color)"
            strokeWidth={3}
            opacity={0.9}
            pointerEvents="none"
          />
        )}

        <circle
          r={ATOM_RADIUS}
          fill={atomPalette.fill}
          stroke={atomPalette.fill}
          strokeWidth={2}
          pointerEvents="none"
        />

        <text
          x="0"
          y="7"
          textAnchor="middle"
          fill={atomPalette.text}
          fontSize={atom.labelSize}
          fontWeight="700"
          pointerEvents="none"
        >
          {atom.element}
        </text>

        {/* نشان بار اتم (متن سفید روی دایره قرمز) */}
        {chargeSymbol && (
          <g transform="translate(14, -12)">
            <circle
              r="8"
              fill="#B91C1C"
              pointerEvents="none"
            />

            <text
              x="0"
              y="3.5"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="10"
              fontWeight="bold"
              pointerEvents="none"
            >
              {chargeSymbol}
            </text>
          </g>
        )}

        {/* جفت‌الکترون ناپیوندی */}
        {(atom.electronDisplay === "lone-pair" ||
          atom.showLonePairs) && (
          <g
            transform="translate(0, -22)"
            pointerEvents="none"
          >
            <circle
              cx="-3"
              cy="0"
              r="2"
              fill="#2563EB"
            />

            <circle
              cx="3"
              cy="0"
              r="2"
              fill="#2563EB"
            />
          </g>
        )}

        {/* رادیکال / تک‌الکترون */}
        {(atom.electronDisplay === "single-electron" ||
          atom.radical === "single") && (
          <circle
            cx="0"
            cy="-22"
            r="2.5"
            fill="#DC2626"
            pointerEvents="none"
          />
        )}
      </g>
    );
  });

  const renderedArrows = arrows.map((arrow) => {
    const isSelected =
      document.selection.primarySelectedId === arrow.id;

    const color = isSelected
      ? "var(--md-selection-color)"
      : arrow.style.strokeColor;

    const pathData = getArrowPath(arrow);

    const isDashed =
      arrow.arrowType === "dashed-reaction";

    return (
      <g
        key={arrow.id}
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.stopPropagation();
          onArrowClick?.(event, arrow.id);
        }}
        style={{ cursor: "pointer" }}
      >
        <path
          d={pathData}
          fill="none"
          stroke="transparent"
          strokeWidth={OBJECT_HIT_STROKE_WIDTH}
          pointerEvents="stroke"
        />

        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth={arrow.style.strokeWidth}
          strokeLinecap={arrow.style.lineCap}
          strokeLinejoin={arrow.style.lineJoin}
          strokeDasharray={
            isDashed ? "8 6" : undefined
          }
          opacity={arrow.style.opacity}
          markerEnd={
            arrow.arrowHead === "none"
              ? undefined
              : isSelected
              ? "url(#arrowhead-selected)"
              : "url(#arrowhead)"
          }
          pointerEvents="none"
        />
      </g>
    );
  });

  const renderedTexts = texts.map((textObject) => {
    const isSelected =
      document.selection.primarySelectedId ===
      textObject.id;

    const textContent = textObject.segments
      .map((segment) => segment.text)
      .join("");

    return (
      <g
        key={textObject.id}
        transform={`
          translate(
            ${textObject.position.x}
            ${textObject.position.y}
          )
          rotate(${textObject.rotation})
        `}
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.stopPropagation();
          onTextClick?.(event, textObject.id);
        }}
        style={{ cursor: "pointer" }}
      >
        <text
          x="0"
          y="0"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={
            isSelected
              ? "var(--md-selection-color)"
              : textObject.style.color
          }
          fontSize={textObject.style.fontSize}
          fontWeight={textObject.fontWeight}
          fontStyle={textObject.fontStyle}
        >
          {textContent}
        </text>
      </g>
    );
  });

  const gridSize =
    document.viewport.gridSize || 20;

  return (
    <div className={styles.canvasPlaceholder}>
      <svg
        ref={svgRef}
        className={styles.moleculeCanvas}
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="بوم طراحی مولکول"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon
              points="0 0, 8 3, 0 6"
              fill="var(--md-arrow-color, #10B981)"
            />
          </marker>

          <marker
            id="arrowhead-selected"
            markerWidth="8"
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon
              points="0 0, 8 3, 0 6"
              fill="var(--md-selection-color, #2563EB)"
            />
          </marker>

          <pattern
            id="molecule-grid-small"
            width={gridSize}
            height={gridSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`
                M ${gridSize} 0
                L 0 0
                L 0 ${gridSize}
              `}
              fill="none"
              stroke="var(--md-grid-color)"
              strokeWidth="0.7"
            />
          </pattern>
        </defs>

        {document.viewport.showGrid && (
          <rect
            width={SVG_WIDTH}
            height={SVG_HEIGHT}
            fill="url(#molecule-grid-small)"
            pointerEvents="none"
          />
        )}

        {renderedBonds}
        {renderedRings}
        {renderedArrows}
        {renderedTexts}
        {renderedAtoms}

        {arrowDraftStart &&
          arrowDraftCurrent && (
            <line
              x1={arrowDraftStart.x}
              y1={arrowDraftStart.y}
              x2={arrowDraftCurrent.x}
              y2={arrowDraftCurrent.y}
              stroke="var(--md-arrow-color, #10B981)"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              strokeLinecap="round"
              markerEnd="url(#arrowhead)"
              pointerEvents="none"
            />
          )}
      </svg>

      {document.objects.length === 0 && (
        <div
          className={styles.canvasWelcome}
          style={{ pointerEvents: "none" }}
        >
          <div className={styles.canvasIcon}>
            ⌬
          </div>

          <h2>
            محیط طراحی هوشمند شیمیایی
          </h2>

          <p>
            عنصر، پیوند، فلش یا ابزار مورد نظر را
            از نوار کناری انتخاب کنید.
          </p>
        </div>
      )}
    </div>
  );
}
