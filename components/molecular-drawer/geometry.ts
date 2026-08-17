import {
  Atom,
  Bond,
  Point,
  ATOM_RADIUS,
  ATOM_SELECT_RADIUS,
  BOND_SELECT_DISTANCE,
} from './types';

export function getDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.hypot(dx, dy);
}

export function getMidpoint(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): Point {
  return {
    x: (x1 + x2) / 2,
    y: (y1 + y2) / 2,
  };
}

export function getAngle(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return Math.atan2(y2 - y1, x2 - x1);
}

export function normalizeAngle(angle: number): number {
  let a = angle;
  while (a < -Math.PI) a += Math.PI * 2;
  while (a > Math.PI) a -= Math.PI * 2;
  return a;
}

export function angleToDegrees(angle: number): number {
  return (angle * 180) / Math.PI;
}

export function degreesToAngle(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function projectPoint(
  x: number,
  y: number,
  angle: number,
  distance: number
): Point {
  return {
    x: x + Math.cos(angle) * distance,
    y: y + Math.sin(angle) * distance,
  };
}

export function snapToGrid(value: number, gridSize: number): number {
  if (!gridSize || gridSize <= 0) return value;
  return Math.round(value / gridSize) * gridSize;
}

export function snapPointToGrid(point: Point, gridSize: number): Point {
  return {
    x: snapToGrid(point.x, gridSize),
    y: snapToGrid(point.y, gridSize),
  };
}

export function getCenterOfAtoms(atoms: Atom[]): Point {
  if (!atoms.length) return { x: 0, y: 0 };

  const sum = atoms.reduce(
    (acc, atom) => {
      acc.x += atom.x;
      acc.y += atom.y;
      return acc;
    },
    { x: 0, y: 0 }
  );

  return {
    x: sum.x / atoms.length,
    y: sum.y / atoms.length,
  };
}

export function getBoundingBoxOfAtoms(atoms: Atom[]) {
  if (!atoms.length) {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };
  }

  let minX = atoms[0].x;
  let maxX = atoms[0].x;
  let minY = atoms[0].y;
  let maxY = atoms[0].y;

  for (const atom of atoms) {
    minX = Math.min(minX, atom.x);
    maxX = Math.max(maxX, atom.x);
    minY = Math.min(minY, atom.y);
    maxY = Math.max(maxY, atom.y);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function pointInCircle(
  point: Point,
  center: Point,
  radius: number
): boolean {
  return getDistance(point.x, point.y, center.x, center.y) <= radius;
}

export function pointNearAtom(atom: Atom, x: number, y: number): boolean {
  return getDistance(atom.x, atom.y, x, y) <= ATOM_SELECT_RADIUS;
}

export function findAtomAt(
  atoms: Atom[],
  x: number,
  y: number,
  radius = ATOM_SELECT_RADIUS
): Atom | null {
  let nearest: Atom | null = null;
  let nearestDistance = Infinity;

  for (const atom of atoms) {
    const dist = getDistance(atom.x, atom.y, x, y);
    if (dist <= radius && dist < nearestDistance) {
      nearest = atom;
      nearestDistance = dist;
    }
  }

  return nearest;
}

function pointToSegmentDistance(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0 && dy === 0) {
    return getDistance(px, py, x1, y1);
  }

  const t =
    ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);

  const clampedT = Math.max(0, Math.min(1, t));

  const projX = x1 + clampedT * dx;
  const projY = y1 + clampedT * dy;

  return getDistance(px, py, projX, projY);
}

export function getPointToLineDistance(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return pointToSegmentDistance(px, py, x1, y1, x2, y2);
}

export function findBondAt(
  bonds: Bond[],
  atoms: Atom[],
  x: number,
  y: number,
  threshold = BOND_SELECT_DISTANCE
): Bond | null {
  let nearest: Bond | null = null;
  let nearestDistance = Infinity;

  for (const bond of bonds) {
    const a1 = atoms.find((a) => a.id === bond.atom1Id);
    const a2 = atoms.find((a) => a.id === bond.atom2Id);
    if (!a1 || !a2) continue;

    const dist = pointToSegmentDistance(x, y, a1.x, a1.y, a2.x, a2.y);

    if (dist <= threshold && dist < nearestDistance) {
      nearest = bond;
      nearestDistance = dist;
    }
  }

  return nearest;
}

export function isPointNearBond(
  bond: Bond,
  atoms: Atom[],
  x: number,
  y: number,
  threshold = BOND_SELECT_DISTANCE
): boolean {
  const a1 = atoms.find((a) => a.id === bond.atom1Id);
  const a2 = atoms.find((a) => a.id === bond.atom2Id);
  if (!a1 || !a2) return false;

  return pointToSegmentDistance(x, y, a1.x, a1.y, a2.x, a2.y) <= threshold;
}

export function rotatePoint(
  point: Point,
  center: Point,
  angle: number
): Point {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = point.x - center.x;
  const dy = point.y - center.y;

  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
}

export function mirrorPointHorizontally(point: Point, centerX: number): Point {
  return {
    x: centerX - (point.x - centerX),
    y: point.y,
  };
}

export function mirrorPointVertically(point: Point, centerY: number): Point {
  return {
    x: point.x,
    y: centerY - (point.y - centerY),
  };
}

export function translatePoint(point: Point, dx: number, dy: number): Point {
  return {
    x: point.x + dx,
    y: point.y + dy,
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function almostEqual(a: number, b: number, epsilon = 1e-6): boolean {
  return Math.abs(a - b) <= epsilon;
}

export function pointEquals(a: Point, b: Point, epsilon = 1e-6): boolean {
  return almostEqual(a.x, b.x, epsilon) && almostEqual(a.y, b.y, epsilon);
}

export function segmentMidpoint(a: Point, b: Point): Point {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}

export function perpendicularOffset(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  distance: number
): Point {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;

  return {
    x: (-dy / len) * distance,
    y: (dx / len) * distance,
  };
}

export function getAtomRadius(): number {
  return ATOM_RADIUS;
}

export function getAtomSelectRadius(): number {
  return ATOM_SELECT_RADIUS;
}

export function getBondSelectDistance(): number {
  return BOND_SELECT_DISTANCE;
}
