"use client";

import { useState, useRef, useCallback } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
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
import { createDefaultStyle, createId } from "./chemistry/initialState";
import styles from "./MoleculeDrawer.module.css";

const SVG_WIDTH = 1200;
const SVG_HEIGHT = 800;
const ATOM_RADIUS = 18;

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
  onAddTextObject: (textObject: TextObject) => void;
}

const getSimpleBondOrder = (order: number): SimpleBondOrder => {
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
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length === 0) return [];

  const normalX = -dy / length;
  const normalY = dx / length;
  const offset = 5;

  const createLine = (distance: number): BondLine => ({
    x1: start.x + normalX * distance,
    y1: start.y + normalY * distance,
    x2: end.x + normalX * distance,
    y2: end.y + normalY * distance,
  });

  if (order === 1) {
    return [createLine(0)];
  }

  if (order === 2) {
    return [createLine(-offset), createLine(offset)];
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
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length === 0) return null;

  const normalX = -dy / length;
  const normalY = dx / length;
  const width = 14;

  return [
    `${start.x},${start.y}`,
    `${end.x + normalX * width},${end.y + normalY * width}`,
    `${end.x - normalX * width},${end.y - normalY * width}`,
  ].join(" ");
};

const getHashedWedgeLines = (
  start: Point,
  end: Point
): BondLine[] => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);


  if (length === 0) return [];

  const normalX = -dy / length;
  const normalY = dx / length;
  const count = Math.max(5, Math.floor(length / 10));
  const maxWidth = 14;

  return Array.from({ length: count }, (_, index) => {
    const progress = (index + 1) / count;
    const centerX = start.x + dx * progress;
    const centerY = start.y + dy * progress;
    const halfWidth = (maxWidth * progress) / 2;

    return {
      x1: centerX - normalX * halfWidth,
      y1: centerY - normalY * halfWidth,
      x2: centerX + normalX * halfWidth,
      y2: centerY + normalY * halfWidth,
    };
  });
};

const getWavyPoints = (
  start: Point,
  end: Point
): string | null => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length === 0) return null;

  const normalX = -dy / length;
  const normalY = dx / length;
  const amplitude = 5;
  const segments = Math.max(6, Math.floor(length / 12));

  return Array.from({ length: segments + 1 }, (_, index) => {
    const progress = index / segments;
    const direction = index % 2 === 0 ? 1 : -1;

    const x =
      start.x +
      dx * progress +
      normalX * amplitude * direction;

    const y =
      start.y +
      dy * progress +
      normalY * amplitude * direction;

    return `${x},${y}`;
  }).join(" ");
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

  const [arrowDraftStart, setArrowDraftStart] =
    useState<Point | null>(null);

  const [arrowDraftCurrent, setArrowDraftCurrent] =
    useState<Point | null>(null);

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

      const screenMatrix = svg.getScreenCTM();

      if (!screenMatrix) {
        return {
          x: event.clientX,
          y: event.clientY,
        };
      }

      const svgPoint = new DOMPoint(
        event.clientX,
        event.clientY
      ).matrixTransform(screenMatrix.inverse());

      let x = svgPoint.x;
      let y = svgPoint.y;

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

  const handleAtomInteract = (
    atom: Atom,
    event: ReactMouseEvent<SVGGElement>
  ) => {
    const mode = document.tool.mode;

    if (mode === "add-charge") {
      event.stopPropagation();

      const charge = document.tool.selectedCharge;

      if (!charge || charge === "remove") {
        onUpdateAtom(atom.id, {
          formalCharge: 0,
          partialCharge: "none",
        });
      } else if (charge === "formal-positive") {
        onUpdateAtom(atom.id, {
          formalCharge: 1,
          partialCharge: "none",
        });
      } else if (charge === "formal-negative") {
        onUpdateAtom(atom.id, {
          formalCharge: -1,
          partialCharge: "none",
        });
      } else if (charge === "formal-positive-double") {
        onUpdateAtom(atom.id, {
          formalCharge: 2,
          partialCharge: "none",
        });
      } else if (charge === "formal-negative-double") {
        onUpdateAtom(atom.id, {
          formalCharge: -2,
          partialCharge: "none",
        });
      } else if (charge === "partial-positive") {
        onUpdateAtom(atom.id, {
          formalCharge: 0,
          partialCharge: "partial-positive",
        });
      } else if (charge === "partial-negative") {
        onUpdateAtom(atom.id, {
          formalCharge: 0,
          partialCharge: "partial-negative",
        });
      }

      return;
    }

    if (mode === "add-electron") {
      event.stopPropagation();

      const electron =
        document.tool.selectedElectronDisplay;

      if (electron === "single-electron") {
        onUpdateAtom(atom.id, {
          electronDisplay: "single-electron",
          radical: "single",
        });
      } else if (electron === "lone-pair") {
        onUpdateAtom(atom.id, {
          electronDisplay: "lone-pair",
          radical: "none",
          showLonePairs: true,
        });
      } else {
        onUpdateAtom(atom.id, {
          electronDisplay: "none",
          radical: "none",
          showLonePairs: false,
        });
      }

      return;
    }

    onAtomMouseDown(event, atom.id);
  };

  const handleMouseDown = (
    event: ReactMouseEvent<SVGSVGElement>
  ) => {
    if (document.tool.mode !== "add-arrow") return;

    const coordinates = getSVGCoordinates(event);

    setArrowDraftStart(coordinates);
    setArrowDraftCurrent(coordinates);
  };

  const handleMouseMove = (
    event: ReactMouseEvent<SVGSVGElement>
  ) => {
    const coordinates = getSVGCoordinates(event);

    if (
      arrowDraftStart &&
      document.tool.mode === "add-arrow"
    ) {
      setArrowDraftCurrent(coordinates);
    }

    onCanvasMouseMove(event, coordinates);
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

      if (distance > 15) {
        const selectedArrowType =
          document.tool.selectedArrowType ||
          "straight-reaction";

        const newArrow: Arrow = {
          id: createId("arrow"),
          type: "arrow",
          arrowType: selectedArrowType,
          start: arrowDraftStart,
          end: arrowDraftCurrent,
          controlPoints: [],
          curvature: selectedArrowType.includes("curved")
            ? 0.35
            : 0,
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

      setArrowDraftStart(null);
      setArrowDraftCurrent(null);
    }

    onCanvasMouseUp();
  };

  const handleClick = (
    event: ReactMouseEvent<SVGSVGElement>
  ) => {
    const coordinates = getSVGCoordinates(event);

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
        position: coordinates,
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
          color: "var(--md-text-primary, #1F2937)",
          fontSize: 24,
        }),
      };

      onAddTextObject(textObject);
      return;
    }

    onCanvasClick(event, coordinates);
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
      ? "var(--md-selection-color)"
      : bond.style.strokeColor;

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
                  key={index}
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
              key={index}
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
        onClick={(event) => onBondClick(event, bond.id)}
        style={{ cursor: "pointer" }}
      >
        <line
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          stroke="transparent"
          strokeWidth={18}
        />

        {renderShape()}
      </g>
    );
  });

  const renderedRings = rings.map((ring) => {
    const points = ring.atomIds
      .map(
        (atomId) =>
          atoms.find((atom) => atom.id === atomId)?.position
      )
      .filter((position): position is Point =>
        Boolean(position)
      );

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
        onClick={(event) => onRingClick(event, ring.id)}
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
    const isSelected =
      document.selection.primarySelectedId === atom.id;
    const isBondStart = bondSelection[0] === atom.id;

    let chargeSymbol = "";

    if (atom.formalCharge === 1) {
      chargeSymbol = "+";
    } else if (atom.formalCharge === -1) {
      chargeSymbol = "−";
    } else if (atom.formalCharge === 2) {
      chargeSymbol = "2+";
    } else if (atom.formalCharge === -2) {
      chargeSymbol = "2−";
    } else if (
      atom.partialCharge === "partial-positive"
    ) {
      chargeSymbol = "δ+";
    } else if (
      atom.partialCharge === "partial-negative"
    ) {
      chargeSymbol = "δ−";
    }

    return (
      <g
        key={atom.id}
        transform={`translate(${atom.position.x} ${atom.position.y})`}
        onMouseDown={(event) =>
          handleAtomInteract(atom, event)
        }
        className={
          isBondStart ? styles.atomSelected : undefined
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
          fill={elementData.defaultColor}
          stroke={elementData.defaultColor}
          strokeWidth={2}
        />

        <text
          x="0"
          y="7"
          textAnchor="middle"
          fill={elementData.defaultTextColor}
          fontSize={atom.labelSize}
          fontWeight="700"
          pointerEvents="none"
        >
          {atom.element}
        </text>

        {chargeSymbol && (
          <g transform="translate(14, -12)">
            <circle r="8" fill="#B91C1C" />

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

        {(atom.electronDisplay === "lone-pair" ||
          atom.showLonePairs) && (
          <g transform="translate(0, -22)">
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

        {atom.electronDisplay === "single-electron" ||
        atom.radical === "single" ? (
          <circle
            cx="0"
            cy="-22"
            r="2.5"
            fill="#DC2626"
          />
        ) : null}
      </g>
    );
  });

  const renderedArrows = arrows.map((arrow) => {
    const isSelected =
      document.selection.primarySelectedId === arrow.id;

    const color = isSelected
      ? "var(--md-selection-color)"
      : arrow.style.strokeColor;

    const isCurved = arrow.curvature !== 0;

    let pathData = `M ${arrow.start.x} ${arrow.start.y} L ${arrow.end.x} ${arrow.end.y}`;

    if (isCurved) {
      const midX = (arrow.start.x + arrow.end.x) / 2;
      const midY = (arrow.start.y + arrow.end.y) / 2;
      const dx = arrow.end.x - arrow.start.x;
      const dy = arrow.end.y - arrow.start.y;
      const controlX = midX - dy * arrow.curvature;
      const controlY = midY + dx * arrow.curvature;

      pathData = `M ${arrow.start.x} ${arrow.start.y} Q ${controlX} ${controlY} ${arrow.end.x} ${arrow.end.y}`;
    }

    return (
      <g
        key={arrow.id}
        onClick={(event) =>
          onArrowClick?.(event, arrow.id)
        }
        style={{ cursor: "pointer" }}
      >
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth={arrow.style.strokeWidth}
          strokeLinecap={arrow.style.lineCap}
          strokeLinejoin={arrow.style.lineJoin}
          opacity={arrow.style.opacity}
          markerEnd={
            arrow.arrowHead === "none"
              ? undefined
              : "url(#arrowhead)"
          }
        />
      </g>
    );
  });

  const renderedTexts = texts.map((textObject) => {
    const isSelected =
      document.selection.primarySelectedId === textObject.id;

    const textContent = textObject.segments
      .map((segment) => segment.text)
      .join("");

    return (
      <g
        key={textObject.id}
        transform={`translate(${textObject.position.x} ${textObject.position.y}) rotate(${textObject.rotation})`}
        onClick={(event) =>
          onTextClick?.(event, textObject.id)
        }
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

          <pattern
            id="molecule-grid-small"
            width={gridSize}
            height={gridSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
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

        {arrowDraftStart && arrowDraftCurrent && (
          <line
            x1={arrowDraftStart.x}
            y1={arrowDraftStart.y}
            x2={arrowDraftCurrent.x}
            y2={arrowDraftCurrent.y}
            stroke="var(--md-arrow-color, #10B981)"
            strokeWidth="2.5"
            strokeDasharray="4 4"
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
            عنصر، پیوند، فلش یا ابزار مورد نظر را از نوار
            کناری انتخاب کنید.
          </p>
        </div>
      )}
    </div>
  );
}
