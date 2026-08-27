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

/**
 * تبدیل مرتبه پیوند به عدد صحیح ۱، ۲ یا ۳
 */
export const getSimpleBondOrder = (
  order: BondOrder,
): SimpleBondOrder => {
  if (order >= 3) return 3;
  if (order === 2) return 2;
  return 1;
};

/**
 * محاسبه خطوط پیوند متناسب با مرتبه پیوند (تکی، دوگانه، سه‌گانه)
 */
export const getBondLines = (
  start: Point,
  end: Point,
  order: SimpleBondOrder,
): BondLine[] => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);

  if (length === 0) return [];

  const normalX = -dy / length;
  const normalY = dx / length;
  const offset = 3.8;

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
    createLine(-offset * 1.6),
    createLine(offset * 1.6),
  ];
};

/**
 * محاسبه نقاط مثلث پیوند گوه‌ای توپر (Solid Wedge)
 */
export const getWedgePoints = (
  start: Point,
  end: Point,
): string | null => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);

  if (length === 0) return null;

  const normalX = -dy / length;
  const normalY = dx / length;
  // عرض متناسب با مقیاس استاندارد
  const halfWidth = Math.min(5.5, length * 0.14);

  const leftX = end.x + normalX * halfWidth;
  const leftY = end.y + normalY * halfWidth;
  const rightX = end.x - normalX * halfWidth;
  const rightY = end.y - normalY * halfWidth;

  return `${start.x},${start.y} ${leftX},${leftY} ${rightX},${rightY}`;
};

/**
 * محاسبه خطوط پیوند گوه‌ای خط‌چین (Hashed Wedge)
 */
export const getHashedWedgeLines = (
  start: Point,
  end: Point,
): BondLine[] => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);

  if (length === 0) return [];

  const normalX = -dy / length;
  const normalY = dx / length;
  const count = Math.max(5, Math.floor(length / 8));
  const maxHalfWidth = Math.min(5.5, length * 0.14);

  return Array.from({ length: count }, (_, index) => {
    const progress = (index + 1) / count;

    const centerX = start.x + dx * progress;
    const centerY = start.y + dy * progress;

    const currentHalfWidth = maxHalfWidth * progress;

    return {
      x1: centerX - normalX * currentHalfWidth,
      y1: centerY - normalY * currentHalfWidth,
      x2: centerX + normalX * currentHalfWidth,
      y2: centerY + normalY * currentHalfWidth,
    };
  });
};

/**
 * محاسبه نقاط چندضلعی باز برای پیوند موج‌دار (Wavy Bond)
 * با تضمین اتصال دقیق به ابتدا و انتهای اتم‌ها
 */
export const getWavyPoints = (
  start: Point,
  end: Point,
): string | null => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);

  if (length === 0) return null;

  const normalX = -dy / length;
  const normalY = dx / length;
  const amplitude = 3.5;
  const wavesCount = Math.max(3, Math.round(length / 14));
  const totalPoints = wavesCount * 2;

  const points: string[] = [];

  for (let i = 0; i <= totalPoints; i++) {
    const progress = i / totalPoints;
    // نقاط شروع و پایان بدون انحراف (دامنه صفر) باقی می‌مانند
    const currentAmp =
      i === 0 || i === totalPoints
        ? 0
        : (i % 2 === 1 ? 1 : -1) * amplitude;

    const x = start.x + dx * progress + normalX * currentAmp;
    const y = start.y + dy * progress + normalY * currentAmp;

    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }

  return points.join(" ");
};

/**
 * دریافت برچسب فارسی انواع پیوندها
 */
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

/**
 * دریافت برچسب فارسی حلقه‌های از پیش تعریف شده
 */
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
