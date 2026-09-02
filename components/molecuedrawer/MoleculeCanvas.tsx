"use client";

import {
  useCallback,
  useRef,
  useState,
} from "react";
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";

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

import {
  TEXT_COLORS,
  TEXT_SIZES,
  type TextToolSettingsValue,
} from "./chemistry/text-tool/types";

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
  H: { fill: "#E2E8F0", text: "#1E293B" },
  C: { fill: "#334155", text: "#FFFFFF" },
  N: { fill: "#2563EB", text: "#FFFFFF" },
  O: { fill: "#DC2626", text: "#FFFFFF" },
  F: { fill: "#16A34A", text: "#FFFFFF" },
  Cl: { fill: "#059669", text: "#FFFFFF" },
  Br: { fill: "#92400E", text: "#FFFFFF" },
  I: { fill: "#7C3AED", text: "#FFFFFF" },
  S: { fill: "#EAB308", text: "#1F2937" },
  P: { fill: "#EA580C", text: "#FFFFFF" },
  B: { fill: "#D97706", text: "#FFFFFF" },
  Si: { fill: "#64748B", text: "#FFFFFF" },
  Na: { fill: "#7C3AED", text: "#FFFFFF" },
  K: { fill: "#8B5CF6", text: "#FFFFFF" },
  Ca: { fill: "#22C55E", text: "#FFFFFF" },
  Mg: { fill: "#65A30D", text: "#FFFFFF" },
  Fe: { fill: "#B45309", text: "#FFFFFF" },
  Cu: { fill: "#C2410C", text: "#FFFFFF" },
  Zn: { fill: "#94A3B8", text: "#1F2937" },
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
  textToolSettings: TextToolSettingsValue;
  onAtomMouseDown: (
    event: ReactPointerEvent<SVGGElement>,
    atomId: string
  ) => void;
  onSelectObjects?: (selectedIds: string[]) => void;
  onBondClick: (
    event: ReactPointerEvent<SVGGElement>,
    bondId: string
  ) => void;
  onRingClick: (
    event: ReactPointerEvent<SVGGElement>,
    ringId: string
  ) => void;
  onArrowClick?: (
    event: ReactPointerEvent<SVGGElement>,
    arrowId: string
  ) => void;
  onTextClick?: (
    event: ReactPointerEvent<SVGGElement>,
    textId: string
  ) => void;
  onCanvasClick: (
    event: ReactMouseEvent<SVGSVGElement>,
    point: Point
  ) => void;
  onCanvasMouseMove?: (
    event: ReactPointerEvent<SVGSVGElement>,
    point: Point
  ) => void;
  onCanvasMouseUp?: () => void;
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
  textToolSettings,
  onAtomMouseDown,
  onSelectObjects,
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

  const [arrowDraftStart, setArrowDraftStart] =
    useState<Point | null>(null);
  const [arrowDraftCurrent, setArrowDraftCurrent] =
    useState<Point | null>(null);

  const [selectionBoxStart, setSelectionBoxStart] =
    useState<Point | null>(null);
  const [selectionBoxCurrent, setSelectionBoxCurrent] =
    useState<Point | null>(null);

  const clearArrowDraft = () => {
    setArrowDraftStart(null);
    setArrowDraftCurrent(null);
    isDraggingArrowRef.current = false;
  };

  const getSVGCoordinates = useCallback(
    (
      event: ReactPointerEvent<SVGSVGElement> | ReactMouseEvent<SVGSVGElement>
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
        const gridSize = document.viewport.gridSize || 20;
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

  const handlePointerDown = (
  event: ReactPointerEvent<SVGSVGElement>
) => {
  // فقط زمانی که واقعاً نیاز به درگ باکس سلکت یا فلش داریم کپچر کنیم:
  if (document.tool.mode === "add-arrow" || document.tool.mode === "select") {
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  const point = getSVGCoordinates(event);

  if (document.tool.mode === "add-arrow") {
    isDraggingArrowRef.current = false;
    setArrowDraftStart(point);
    setArrowDraftCurrent(point);
    return;
  }

  if (document.tool.mode === "select") {
    setSelectionBoxStart(point);
    setSelectionBoxCurrent(point);
    return;
  }

  onCanvasClick(event, point);
};


  const handlePointerMove = (
    event: ReactPointerEvent<SVGSVGElement>
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

    if (
      selectionBoxStart &&
      document.tool.mode === "select"
    ) {
      setSelectionBoxCurrent(point);
    }

    onCanvasMouseMove?.(event, point);
  };

  const handlePointerUp = (
    event: ReactPointerEvent<SVGSVGElement>
  ) => {
    const target = event.currentTarget;

    if (target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }

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

    if (
      selectionBoxStart &&
      selectionBoxCurrent &&
      document.tool.mode === "select"
    ) {
      const minX = Math.min(
        selectionBoxStart.x,
        selectionBoxCurrent.x
      );
      const maxX = Math.max(
        selectionBoxStart.x,
        selectionBoxCurrent.x
      );
      const minY = Math.min(
        selectionBoxStart.y,
        selectionBoxCurrent.y
      );
      const maxY = Math.max(
        selectionBoxStart.y,
        selectionBoxCurrent.y
      );

      if (maxX - minX > 5 || maxY - minY > 5) {
        const selectedAtomIds = document.objects
          .filter(
            (object): object is Atom =>
              object.type === "atom"
          )
          .filter(
            (atom) =>
              atom.position.x >= minX &&
              atom.position.x <= maxX &&
              atom.position.y >= minY &&
              atom.position.y <= maxY
          )
          .map((atom) => atom.id);

        if (selectedAtomIds.length > 0) {
          onSelectObjects?.(selectedAtomIds);
        }
      }

      setSelectionBoxStart(null);
      setSelectionBoxCurrent(null);
    }

    onCanvasMouseUp?.();
  };
const handleClick = (
  event: ReactMouseEvent<SVGSVGElement>
) => {
  if (isDraggingArrowRef.current) {
    isDraggingArrowRef.current = false;
    return;
  }

  // اگر ابزار عملگر (مانند دلتا، مثبت، ...) فعال است، درج متن انجام شود:
  if (activeOperator) {
    const point = getSVGCoordinates(event);
    let textSymbol = "+";

    if (activeOperator === "heat") textSymbol = "Δ";
    else if (activeOperator === "light") textSymbol = "hν";
    else if (activeOperator === "bracket") textSymbol = "[ ]‡";
    else if (activeOperator === "equilibrium-constant") textSymbol = "K";

    const textObject: TextObject = {
      id: createId("text"),
      type: "text",
      position: point,
      segments: [{ id: createId("segment"), text: textSymbol, mode: "normal" }],
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
        color: TEXT_COLORS[textToolSettings.color] || "#1F2937",
        fontSize: TEXT_SIZES[textToolSettings.size] || 24,
      }),
    };

    onAddTextObject(textObject);

      return;
    }

  };

  const atoms = document.objects.filter(
    (object): object is Atom => object.type === "atom"
  );

  const bonds = document.objects.filter(
    (object): object is Bond => object.type === "bond"
  );

  const rings = document.objects.filter(
    (object): object is Ring => object.type === "ring"
  );

  const arrows = document.objects.filter(
    (object): object is Arrow => object.type === "arrow"
  );

  const texts = document.objects.filter(
    (object): object is TextObject => object.type === "text"
  );

  const renderedBonds = bonds.map((bond) => {
    const atomA = atoms.find(
      (atom) => atom.id === bond.startAtomId
    );
    const atomB = atoms.find(
      (atom) => atom.id === bond.endAtomId
    );

    if (!atomA || !atomB) return null;

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
        const points = getWedgePoints(start, end);
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
            {getHashedWedgeLines(start, end).map(
              (line, index) => (
                <line
                  key={`${bond.id}-hash-${index}`}
                  {...line}
                  {...commonProps}
                  strokeWidth={2}
                />
              )
            )}
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
        const points = getWavyPoints(start, end);
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
        onPointerDown={(event) => {
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
          atoms.find((atom) => atom.id === atomId)
            ?.position
      )
      .filter((position): position is Point => Boolean(position));

    if (points.length < 3) return null;

    const polygonPoints = points
      .map((point) => `${point.x},${point.y}`)
      .join(" ");

    const isSelected =
      document.selection.primarySelectedId === ring.id;

    const ringColor = isSelected
      ? "var(--md-selection-color)"
      : ring.style.strokeColor;

    return (
      <g
        key={ring.id}
        onPointerDown={(event) => {
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

    // اتم مبدأ پیوند
    const isBondStart = bondSelection.includes(atom.id);

    const chargeSymbol = getChargeDisplayText(atom);

    return (
      <g
        key={atom.id}
        transform={`translate(${atom.position.x} ${atom.position.y})`}
        onPointerDown={(event) => {
          event.stopPropagation();
          onAtomMouseDown(event, atom.id);
        }}
        style={{ cursor: "crosshair" }}
      >
        {/* هاله راهنما برای اتم مبدا پیوند */}
        {isBondStart && (
          <circle
            r={ATOM_RADIUS + 7}
            fill="none"
            stroke="#10B981"
            strokeWidth={3}
            strokeDasharray="3 3"
            pointerEvents="none"
          />
        )}

        {/* هاله انتخاب معمولی */}
        {isSelected && !isBondStart && (
          <circle
            r={ATOM_RADIUS + 4}
            fill="none"
            stroke="var(--md-selection-color, #2563EB)"
            strokeWidth={3}
            opacity={0.9}
            pointerEvents="none"
          />
        )}

        <circle
          r={ATOM_RADIUS}
          fill={atomPalette.fill}
          stroke={isBondStart ? "#10B981" : atomPalette.fill}
          strokeWidth={2}
          pointerEvents="all"
        />

        <text
          x="0"
          y="7"
          textAnchor="middle"
          fill={atomPalette.text}
          fontSize={atom.labelSize || 16}
          fontWeight="700"
          pointerEvents="none"
        >
          {atom.element}
        </text>

        {chargeSymbol && (
          <g transform="translate(14, -12)" pointerEvents="none">
            <circle r="8" fill="#B91C1C" />
            <text
              x="0"
              y="3.5"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="10"
              fontWeight="bold"
            >
              {chargeSymbol}
            </text>
          </g>
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
     onPointerDown={(event) => {
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
          strokeDasharray={isDashed ? "8 6" : undefined}
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
       onPointerDown={(event) => {
  event.stopPropagation();
  onTextClick?.(event, textObject.id);
}}
        style={{ cursor: "pointer" }}
      >
        {isSelected && (
          <rect
            x={-15}
            y={-(textObject.style.fontSize ?? 20) / 2 - 4}
            width={30 + textContent.length * 10}
            height={(textObject.style.fontSize ?? 20) + 8}
            fill="none"
            stroke="var(--md-selection-color, #2563EB)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            rx="4"
            pointerEvents="none"
          />
        )}
        <text
          x="0"
          y="0"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={textObject.style.color || "var(--md-text-primary, #1F2937)"}
          fontSize={textObject.style.fontSize}
          fontWeight={textObject.fontWeight}
          fontStyle={textObject.fontStyle}
        >
          {textContent}
        </text>
      </g>
    );
  });

  const gridSize = document.viewport.gridSize || 20;

  return (
    <div className={styles.canvasPlaceholder}>
      <svg
        ref={svgRef}
        className={styles.moleculeCanvas}
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="بوم طراحی مولکول"
        style={{
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
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

        {selectionBoxStart && selectionBoxCurrent && (
          <rect
            x={Math.min(
              selectionBoxStart.x,
              selectionBoxCurrent.x
            )}
            y={Math.min(
              selectionBoxStart.y,
              selectionBoxCurrent.y
            )}
            width={Math.abs(
              selectionBoxCurrent.x -
                selectionBoxStart.x
            )}
            height={Math.abs(
              selectionBoxCurrent.y -
                selectionBoxStart.y
            )}
            fill="rgba(37, 99, 235, 0.12)"
            stroke="#2563EB"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            pointerEvents="none"
          />
        )}

        {arrowDraftStart && arrowDraftCurrent && (
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
          <div className={styles.canvasIcon}>⌬</div>
          <h2>محیط طراحی هوشمند شیمیایی</h2>
          <p>
            عنصر، پیوند، فلش یا ابزار مورد نظر را
            از نوار کناری انتخاب کنید.
          </p>
        </div>
      )}
    </div>
  );
}
