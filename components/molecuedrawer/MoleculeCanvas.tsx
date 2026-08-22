"use client";

import type { MouseEvent as ReactMouseEvent } from "react";
import type { Atom, Bond, MechanismDocument, Ring } from "./types";
import { getElementData } from "./chemistry/atomData";
import styles from "./MoleculeDrawer.module.css";

const SVG_WIDTH = 1200;
const SVG_HEIGHT = 800;
const ATOM_RADIUS = 18;

type Point = {
  x: number;
  y: number;
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

  onAtomMouseDown: (
    event: ReactMouseEvent<SVGGElement>,
    atomId: string,
  ) => void;

  onBondClick: (
    event: ReactMouseEvent<SVGGElement>,
    bondId: string,
  ) => void;

  onRingClick: (
    event: ReactMouseEvent<SVGGElement>,
    ringId: string,
  ) => void;

  onCanvasClick: (
    event: ReactMouseEvent<SVGSVGElement>,
  ) => void;

  onCanvasMouseMove: (
    event: ReactMouseEvent<SVGSVGElement>,
  ) => void;

  onCanvasMouseUp: () => void;
}

const getSimpleBondOrder = (order: number): SimpleBondOrder => {
  if (order === 2) return 2;
  if (order === 3) return 3;
  return 1;
};

const getBondLines = (
  start: Point,
  end: Point,
  order: SimpleBondOrder,
): BondLine[] => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length === 0) {
    return [];
  }

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
  end: Point,
): string | null => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length === 0) {
    return null;
  }

  const normalX = -dy / length;
  const normalY = dx / length;
  const width = 14;

  const leftX = end.x + normalX * width;
  const leftY = end.y + normalY * width;
  const rightX = end.x - normalX * width;
  const rightY = end.y - normalY * width;

  return [
    `${start.x},${start.y}`,
    `${leftX},${leftY}`,
    `${rightX},${rightY}`,
  ].join(" ");
};

const getHashedWedgeLines = (
  start: Point,
  end: Point,
): BondLine[] => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length === 0) {
    return [];
  }

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
  end: Point,
): string | null => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length === 0) {
    return null;
  }

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
  onAtomMouseDown,
  onBondClick,
  onRingClick,
  onCanvasClick,
  onCanvasMouseMove,
  onCanvasMouseUp,
}: MoleculeCanvasProps) {
  const atoms = document.objects.filter(
    (object): object is Atom => object.type === "atom",
  );

  const bonds = document.objects.filter(
    (object): object is Bond => object.type === "bond",
  );

  const rings = document.objects.filter(
    (object): object is Ring => object.type === "ring",
  );

  const renderedBonds = bonds.map((bond) => {
    const atomA = atoms.find(
      (atom) => atom.id === bond.startAtomId,
    );

    const atomB = atoms.find(
      (atom) => atom.id === bond.endAtomId,
    );

    if (!atomA || !atomB) {
      return null;
    }

    const start = atomA.position;
    const end = atomB.position;

    const isSelected =
      document.selection.primarySelectedId === bond.id;

    const strokeColor = isSelected
      ? "var(--md-selection-color)"
      : bond.style.strokeColor;

    const commonLineProps = {
      stroke: strokeColor,
      strokeWidth: bond.style.strokeWidth,
      strokeLinecap: bond.style.lineCap,
      strokeLinejoin: bond.style.lineJoin,
      opacity: bond.style.opacity,
    };

    const renderBondShape = () => {
      if (bond.bondType === "solid-wedge") {
        const points = getWedgePoints(start, end);

        if (!points) {
          return null;
        }

        return (
          <polygon
            points={points}
            fill={strokeColor}
            opacity={bond.style.opacity}
          />
        );
      }

      if (bond.bondType === "hashed-wedge") {
        const lines = getHashedWedgeLines(start, end);

        return (
          <>
            {lines.map((line, index) => (
              <line
                key={`${bond.id}-hash-${index}`}
                {...line}
                {...commonLineProps}
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
            {...commonLineProps}
            strokeDasharray="8 6"
          />
        );
      }

      if (bond.bondType === "wavy") {
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
    };

    return (
      <g
        key={bond.id}
        className={styles.moleculeObject}
        onClick={(event) => onBondClick(event, bond.id)}
        aria-label="Molecular bond"
      >
        {renderBondShape()}
      </g>
    );
  });

  const renderedRings = rings.map((ring) => {
    const points = ring.atomIds
      .map(
        (atomId) =>
          atoms.find((atom) => atom.id === atomId)?.position,
      )
      .filter((position): position is Point => Boolean(position));

    if (points.length < 3) {
      return null;
    }

    const polygonPoints = points
      .map((point) => `${point.x},${point.y}`)
      .join(" ");

    return (
      <polygon
        key={ring.id}
        points={polygonPoints}
        className={styles.moleculeObject}
        onClick={(event) => onRingClick(event, ring.id)}
        aria-label="Molecular ring"
      />
    );
  });

  const renderedAtoms = atoms.map((atom) => {
    const element = getElementData(atom.element);

    const isSelected =
      document.selection.primarySelectedId === atom.id;

    const isMultiSelected =
      document.selection.selectedIds.includes(atom.id) &&
      !isSelected;

    const fillColor = element.defaultColor;

    return (
      <g
        key={atom.id}
        className={styles.moleculeObject}
        onMouseDown={(event) => onAtomMouseDown(event, atom.id)}
        onClick={(event) => event.stopPropagation()}
        aria-label={`Atom ${atom.element}`}
      >
        <circle
          cx={atom.position.x}
          cy={atom.position.y}
          r={ATOM_RADIUS}
          fill={fillColor}
          stroke={
            isSelected
              ? "var(--md-selection-color)"
              : "var(--md-border-color)"
          }
          strokeWidth={isMultiSelected ? 3 : 1.5}
        />

        <text
          x={atom.position.x}
          y={atom.position.y + 4}
          textAnchor="middle"
          className={styles.atomLabel}
        >
          {atom.element}
        </text>
      </g>
    );
  });

  return (
    <div className={styles.canvasPlaceholder}>
      <svg
        width={SVG_WIDTH}
        height={SVG_HEIGHT}
        className={styles.canvas}
        onClick={onCanvasClick}
        onMouseMove={onCanvasMouseMove}
        onMouseUp={onCanvasMouseUp}
        role="img"
        aria-label="Molecule drawing canvas"
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="currentColor"
            />
          </marker>
        </defs>

        <g className={styles.gridLayer}>
          <defs>
            <pattern
              id="gridPattern"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="var(--md-grid-color)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>

          <rect
            width="100%"
            height="100%"
            fill="url(#gridPattern)"
          />
        </g>

        {renderedBonds}
        {renderedRings}
        {renderedAtoms}
      </svg>

      {document.objects.length === 0 && (
        <div className={styles.emptyCanvas}>
          <p>No molecule drawn yet</p>
        </div>
      )}

      {bondSelection.length > 0 && (
        <div className={styles.selectionHint}>
          {bondSelection.length} bond(s) selected
        </div>
      )}
    </div>
  );
}
