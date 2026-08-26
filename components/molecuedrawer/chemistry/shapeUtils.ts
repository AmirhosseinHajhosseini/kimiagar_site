import type {
  BondOrder,
  BondType,
  RingKind,
} from "../types";

export type SimpleBondOrder = 1 | 2 | 3;

export type Point = {
  x: number;
  y: number;
};

export type BondLine = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export const getSimpleBondOrder = (
  order: BondOrder,
): SimpleBondOrder => {
  if (order >= 3) return 3;
  if (order === 2) return 2;
  return 1;
};

export const getBondLines = (
  start: Point,
  end: Point,
  order: SimpleBondOrder,
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

export const getWedgePoints = (
  start: Point,
  end: Point,
): string | null => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length === 0) return null;

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

export const getHashedWedgeLines = (
  start: Point,
  end: Point,
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

export const getWavyPoints = (
  start: Point,
  end: Point,
): string | null => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length === 0) return null;

  const normalX = -dy / length;
  const normalY = dx / length;
  const amplitude = 5;
  const segments = Math.max(6, Math.floor(length / 12));

  return Array.from(
    { length: segments + 1 },
    (_, index) => {
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
    },
  ).join(" ");
};

export const getBondTypeLabel = (
  bondType: BondType,
): string => {
  switch (bondType) {
    case "single":
      return "یگانه";
    case "double":
      return "دوگانه";
    case "triple":
      return "سه‌گانه";
    case "aromatic":
      return "آروماتیک";
    case "solid-wedge":
      return "گوه‌ای پر";
    case "hashed-wedge":
      return "گوه‌ای خط‌چین";
    case "dashed":
      return "خط‌چین";
    case "wavy":
      return "موج‌دار";
    default:
      return "پیوند";
  }
};

export const getRingLabel = (
  ringKind: RingKind,
): string => {
  switch (ringKind) {
    case "cyclopropane":
      return "سیکلوپروپان";
    case "cyclobutane":
      return "سیکلوبوتان";
    case "cyclopentane":
      return "سیکلوپنتان";
    case "cyclohexane":
      return "سیکلوهگزان";
    case "benzene":
      return "بنزن";
    default:
      return "حلقه";
  }
};
