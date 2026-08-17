export const ATOM_RADIUS = 18;
export const ATOM_SELECT_RADIUS = 24;
export const BOND_SELECT_DISTANCE = 10;

export const DEFAULT_ATOM_SYMBOL = 'C' as const;
export const DEFAULT_TOOL = 'atom' as const;

export const ELEMENTS = [
  'C',
  'H',
  'N',
  'O',
  'F',
  'P',
  'S',
  'Cl',
  'Br',
  'I',
  'Si',
  'B',
  'Na',
  'K',
  'Li',
  'Mg',
  'Ca',
  'Al',
  'Fe',
  'Cu',
  'Zn',
  'Ag',
  'Sn',
  'Se',
  'Ti',
  'Cr',
  'Mn',
  'Co',
  'Ni',
  'Pt',
  'Au',
] as const;

export type ElementSymbol = (typeof ELEMENTS)[number];

export const TOOL_GROUPS = {
  basic: ['select', 'erase', 'atom', 'text'],
  bonds: [
    'single-bond',
    'double-bond',
    'triple-bond',
    'wedge-bond',
    'dash-bond',
    'wavy-bond',
  ],
  rings: [
    'benzene-ring',
    'cyclopentane-ring',
    'cyclohexane-ring',
    'boat-conformation',
    'chair-conformation',
  ],
  electron: [
    'lone-pair',
    'bonding-pair',
    'radical',
    'positive-charge',
    'negative-charge',
    'partial-positive',
    'partial-negative',
  ],
  arrows: [
    'reaction-arrow',
    'equilibrium-arrow',
    'resonance-arrow',
    'retro-arrow',
    'curved-arrow',
    'fishhook-arrow',
  ],
  annotations: ['bracket', 'transition-state'],
  freehand: ['pen', 'plushand'],
} as const;

/**
 * همه ابزارهای قابل پشتیبانی در UI/Canvas
 */
export type ToolType =
  | 'select'
  | 'erase'
  | 'atom'
  | 'text'
  | 'pen'
  | 'plushand'
  | 'single-bond'
  | 'double-bond'
  | 'triple-bond'
  | 'wedge-bond'
  | 'dash-bond'
  | 'wavy-bond'
  | 'curved-arrow'
  | 'fishhook-arrow'
  | 'reaction-arrow'
  | 'equilibrium-arrow'
  | 'resonance-arrow'
  | 'retro-arrow'
  | 'bracket'
  | 'transition-state'
  | 'positive-charge'
  | 'negative-charge'
  | 'partial-positive'
  | 'partial-negative'
  | 'radical'
  | 'benzene-ring'
  | 'cyclopentane-ring'
  | 'cyclohexane-ring'
  | 'boat-conformation'
  | 'chair-conformation'
  | 'lone-pair'
  | 'bonding-pair';

export type BondType =
  | 'single'
  | 'double'
  | 'triple'
  | 'wedge'
  | 'dash'
  | 'wavy';

export type ArrowType =
  | 'reaction'
  | 'equilibrium'
  | 'resonance'
  | 'retro'
  | 'curved'
  | 'fishhook';

/**
 * حالت‌های اصلی تعامل در Canvas
 */
export type DrawMode =
  | 'idle'
  | 'select'
  | 'move'
  | 'draw-bond'
  | 'draw-arrow'
  | 'draw-bracket'
  | 'draw-text'
  | 'draw-freehand'
  | 'draw-ring'
  | 'place-atom'
  | 'place-electron'
  | 'erase';

/**
 * رنگ‌ها و styleهای پایه
 */
export type ColorValue = string;

export type Point = {
  x: number;
  y: number;
};

export type Size = {
  width: number;
  height: number;
};

/**
 * مدل اتم
 */
export type Atom = {
  id: string;
  x: number;
  y: number;
  symbol: string;
  charge?: number;
  partialCharge?: '+' | '-';
  radical?: boolean;
  lonePairs?: number;
  color?: ColorValue;
  strokeColor?: ColorValue;
  fillColor?: ColorValue;
  textColor?: ColorValue;
  selected?: boolean;
};

/**
 * مدل پیوند
 */
export type Bond = {
  id: string;
  fromAtomId?: string;
  toAtomId?: string;
  start: Point;
  end: Point;
  type: BondType;
  order?: 1 | 2 | 3;
  strokeColor?: ColorValue;
  fillColor?: ColorValue;
  selected?: boolean;
};

/**
 * مدل فلش
 */
export type Arrow = {
  id: string;
  start: Point;
  end: Point;
  type: ArrowType;
  strokeColor?: ColorValue;
  fillColor?: ColorValue;
  selected?: boolean;
};

/**
 * مدل متن
 */
export type TextLabel = {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize?: number;
  fontFamily?: string;
  color?: ColorValue;
  backgroundColor?: ColorValue;
  selected?: boolean;
};

/**
 * مدل براکت
 */
export type Bracket = {
  id: string;
  start: Point;
  end: Point;
  strokeColor?: ColorValue;
  fillColor?: ColorValue;
  selected?: boolean;
};

/**
 * مدل freehand / pen
 */
export type FreehandPath = {
  id: string;
  points: Point[];
  strokeColor?: ColorValue;
  strokeWidth?: number;
  fillColor?: ColorValue;
  selected?: boolean;
};

/**
 * مدل حلقه‌ها و کانفورماسیون‌ها
 */
export type RingShape = {
  id: string;
  center: Point;
  radius: number;
  sides?: number;
  type:
    | 'benzene-ring'
    | 'cyclopentane-ring'
    | 'cyclohexane-ring'
    | 'boat-conformation'
    | 'chair-conformation';
  strokeColor?: ColorValue;
  fillColor?: ColorValue;
  selected?: boolean;
};

/**
 * وضعیت کامل بوم
 */
export type CanvasState = {
  atoms: Atom[];
  bonds: Bond[];
  arrows: Arrow[];
  texts: TextLabel[];
  brackets: Bracket[];
  paths: FreehandPath[];
  rings: RingShape[];
  activeTool: ToolType;
  selectedElement: string;
};

/**
 * History / undo-redo
 */
export type HistorySnapshot<T> = {
  past: T[];
  present: T;
  future: T[];
};

/**
 * Callbacks
 */
export type HistoryChangePayload = {
  canUndo: boolean;
  canRedo: boolean;
};

export type ExportFormat = 'svg' | 'png' | 'json';
