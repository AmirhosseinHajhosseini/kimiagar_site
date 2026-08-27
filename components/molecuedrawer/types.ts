export type ID = string;

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export type ElementSymbol =
  | "C"
  | "H"
  | "O"
  | "N"
  | "S"
  | "P"
  | "F"
  | "Cl"
  | "Br"
  | "I"
  | "B"
  | "Si"
  | "Na"
  | "K"
  | "Mg"
  | "Ca"
  | "Fe"
  | (string & {});

export type LineCap = "butt" | "round" | "square";

export type LineJoin = "miter" | "round" | "bevel";

export type DrawableObjectType =
  | "atom"
  | "bond"
  | "ring"
  | "functional-group"
  | "arrow"
  | "text"
  | "brush-stroke";

export interface StyleConfiguration {
  color: string;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
  fontSize: number;
  fontFamily: string;
  scale: number;
  rotation: number;
  dashPattern: number[];
  lineCap: LineCap;
  lineJoin: LineJoin;
  visible: boolean;
}

export type MetadataValue = string | number | boolean | null;

export type ObjectMetadata = Record<string, MetadataValue>;

export interface DrawableBase {
  id: ID;
  type: DrawableObjectType;
  selected: boolean;
  locked: boolean;
  visible: boolean;
  zIndex: number;
  style: StyleConfiguration;
  metadata?: ObjectMetadata;
}

/* -------------------------------------------------------------------------- */
/*                                    Atom                                    */
/* -------------------------------------------------------------------------- */

export type AtomDisplayMode = "label" | "ball-and-label";

export type RadicalType = "none" | "single" | "double";

export type PartialCharge =
  | "none"
  | "partial-positive"
  | "partial-negative";

export type ElectronDisplay =
  | "none"
  | "lone-pair"
  | "single-electron";

export type ChargeKind =
  | "formal-positive"
  | "formal-negative"
  | "formal-positive-double"
  | "formal-negative-double"
  | "partial-positive"
  | "partial-negative"
  | "remove";

export type ChargeValue =
  | -2
  | -1
  | 0
  | 1
  | 2
  | (number & {});

export interface Atom extends DrawableBase {
  type: "atom";

  element: ElementSymbol;
  position: Point;

  isotope?: number;

  formalCharge: ChargeValue;
  partialCharge: PartialCharge;
  electronDisplay: ElectronDisplay;

  radical: RadicalType;
  explicitHydrogens: number;
  showImplicitHydrogens: boolean;
  showLonePairs: boolean;
  aromatic: boolean;

  displayMode: AtomDisplayMode;
  sphereRadius: number;
  labelSize: number;

  chargeColor: string;
  partialChargeColor: string;
  radicalColor: string;
  lonePairColor: string;

  attachedBondIds: ID[];
}

/* -------------------------------------------------------------------------- */
/*                                    Bond                                    */
/* -------------------------------------------------------------------------- */

export type BondOrder = 1 | 2 | 3 | 1.5;

export type BondType =
  | "single"
  | "double"
  | "triple"
  | "aromatic"
  | "solid-wedge"
  | "hashed-wedge"
  | "wavy"
  | "dashed"
  | "bold"
  | "curved";

export type StereochemicalDirection =
  | "none"
  | "up"
  | "down"
  | "either";

export interface Bond extends DrawableBase {
  type: "bond";

  startAtomId: ID;
  endAtomId: ID;

  order: BondOrder;
  bondType: BondType;
  stereochemistry: StereochemicalDirection;

  curvedControlPoint?: Point;
  aromatic: boolean;
}

/* -------------------------------------------------------------------------- */
/*                                    Ring                                    */
/* -------------------------------------------------------------------------- */

export type RingKind =
  | "cyclopropane"
  | "cyclobutane"
  | "cyclopentane"
  | "cyclohexane"
  | "cycloheptane"
  | "cyclooctane"
  | "benzene"
  | "cyclopentadiene"
  | "cyclohexadiene"
  | "pyridine"
  | "pyrrole"
  | "furan"
  | "thiophene"
  | "imidazole"
  | "oxazole"
  | "thiazole"
  | "pyrimidine"
  | "naphthalene"
  | "anthracene"
  | "custom";

export interface Ring extends DrawableBase {
  type: "ring";

  ringKind: RingKind;
  center: Point;
  radius: number;
  sides: number;
  rotation: number;

  aromatic: boolean;

  atomIds: ID[];
  bondIds: ID[];

  heteroatom?: ElementSymbol;
}

/* -------------------------------------------------------------------------- */
/*                              Functional Group                              */
/* -------------------------------------------------------------------------- */

export type FunctionalGroupCategory =
  | "hydrocarbon"
  | "oxygen"
  | "nitrogen"
  | "sulfur"
  | "halogen"
  | "other";

export interface FunctionalGroup extends DrawableBase {
  type: "functional-group";

  groupId: string;
  name: string;
  persianName?: string;

  category: FunctionalGroupCategory;

  atomIds: ID[];
  bondIds: ID[];

  attachmentAtomId?: ID;
  attachmentBondId?: ID;

  position: Point;
  rotation: number;
  scale: number;
}

/* -------------------------------------------------------------------------- */
/*                                    Arrow                                   */
/* -------------------------------------------------------------------------- */

export type ArrowType =
  | "electron-pair"
  | "single-electron"
  | "curved-reaction"
  | "straight-reaction"
  | "resonance"
  | "equilibrium"
  | "retrosynthesis"
  | "dashed-reaction"
  | "reversible-reaction"
  | "bond-breaking"
  | "bond-forming"
  | "proton-transfer"
  | "charge-transfer"
  | "mechanistic-annotation";

/**
 * برای سازگاری با تمام مقدارهای برگشتی از arrowPresets.
 * وجود `(string & {})` مانع خطای TS2322 برای presetهای جدید می‌شود.
 */
export type ArrowPathStyle =
  | "straight"
  | "curved"
  | "resonance"
  | (string & {});

export type ArrowHeadType =
  | "full"
  | "fishhook"
  | "half"
  | "double"
  | "none";

export interface Arrow extends DrawableBase {
  type: "arrow";

  arrowType: ArrowType;

  start: Point;
  end: Point;
  controlPoints: Point[];

  curvature: number;

  arrowHead: ArrowHeadType;
  arrowHeadSize: number;

  label?: string;
  reactionStepId?: ID;

  backgroundContrast: boolean;
}

/* -------------------------------------------------------------------------- */
/*                                    Text                                    */
/* -------------------------------------------------------------------------- */

export interface TextSegment {
  id: ID;
  text: string;
  mode: "normal" | "subscript" | "superscript";

  semanticType?:
    | "normal"
    | "charge"
    | "isotope"
    | "greek"
    | "chemical-symbol"
    | "reaction-condition";
}

export type TextAlignment = "start" | "middle" | "end";

export interface TextObject extends DrawableBase {
  type: "text";

  position: Point;
  segments: TextSegment[];

  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  alignment: TextAlignment;

  editable: boolean;
  rotation: number;
  maxWidth?: number;
}

/* -------------------------------------------------------------------------- */
/*                                Brush Stroke                                */
/* -------------------------------------------------------------------------- */

export type BrushPreset =
  | "fine-pen"
  | "standard-pen"
  | "thick-marker"
  | "mechanism-highlight"
  | "eraser";

export interface BrushStroke extends DrawableBase {
  type: "brush-stroke";

  points: Point[];
  smoothPath: string;

  brushPreset: BrushPreset;
  eraser: boolean;
}

/* -------------------------------------------------------------------------- */
/*                              Drawable Object                               */
/* -------------------------------------------------------------------------- */

export type DrawableObject =
  | Atom
  | Bond
  | Ring
  | FunctionalGroup
  | Arrow
  | TextObject
  | BrushStroke;

/* -------------------------------------------------------------------------- */
/*                                Molecule                                    */
/* -------------------------------------------------------------------------- */

export interface Molecule {
  id: ID;
  name: string;
  atomIds: ID[];
  bondIds: ID[];
}

/* -------------------------------------------------------------------------- */
/*                              Reaction Step                                 */
/* -------------------------------------------------------------------------- */

export interface ReactionStep {
  id: ID;
  name: string;

  reactantMoleculeIds: ID[];
  productMoleculeIds: ID[];

  arrowIds: ID[];
  conditionTextIds: ID[];

  metadata?: ObjectMetadata;
}

/* -------------------------------------------------------------------------- */
/*                              Selection State                               */
/* -------------------------------------------------------------------------- */

export interface SelectionState {
  selectedIds: ID[];
  primarySelectedId: ID | null;

  isBoxSelecting: boolean;
  boxStart: Point | null;
  boxEnd: Point | null;
}

/* -------------------------------------------------------------------------- */
/*                             Interaction State                              */
/* -------------------------------------------------------------------------- */

export type InteractionMode =
  | "select"
  | "add-atom"
  | "add-bond"
  | "add-ring"
  | "add-functional-group"
  | "add-charge"
  | "add-electron"
  | "add-arrow"
  | "add-text"
  | "brush"
  | "erase"
  | "pan";

/* -------------------------------------------------------------------------- */
/*                              Viewport State                                */
/* -------------------------------------------------------------------------- */

export interface ViewportState {
  offset: Point;
  zoom: number;
  minZoom: number;
  maxZoom: number;

  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;

  isPanning: boolean;
}

/* -------------------------------------------------------------------------- */
/*                             Context Menu State                             */
/* -------------------------------------------------------------------------- */

export interface ContextMenuState {
  isOpen: boolean;
  position: Point;

  targetId: ID | null;
  targetType: DrawableObjectType | "canvas" | null;
}

/* -------------------------------------------------------------------------- */
/*                                Tool State                                  */
/* -------------------------------------------------------------------------- */

export interface ToolState {
  mode: InteractionMode;

  selectedElement: ElementSymbol;
  selectedBondType: BondType;
  selectedBondOrder: BondOrder;
  selectedRingKind: RingKind;

  selectedCharge: ChargeKind;
  selectedElectronDisplay: ElectronDisplay;

  selectedArrowType: ArrowType;
  selectedBrushPreset: BrushPreset;
  selectedFunctionalGroup?: string;
}

/* -------------------------------------------------------------------------- */
/*                                Theme State                                 */
/* -------------------------------------------------------------------------- */

export interface ThemeState {
  mode: "light" | "dark";
}

/* -------------------------------------------------------------------------- */
/*                              Mechanism Document                            */
/* -------------------------------------------------------------------------- */

export interface MechanismDocument {
  id: ID;
  title: string;

  objects: DrawableObject[];

  molecules: Molecule[];
  reactionSteps: ReactionStep[];

  selection: SelectionState;
  viewport: ViewportState;
  contextMenu: ContextMenuState;
  tool: ToolState;
  theme: ThemeState;

  version: number;
  updatedAt: string;
}

/* -------------------------------------------------------------------------- */
/*                              History Entry                                 */
/* -------------------------------------------------------------------------- */

export interface HistoryEntry {
  id: ID;
  label: string;
  document: MechanismDocument;
  timestamp: number;
}

/* -------------------------------------------------------------------------- */
/*                         Chemistry Validation Message                       */
/* -------------------------------------------------------------------------- */

export interface ChemistryValidationMessage {
  level: "info" | "warning" | "error";
  code: string;
  message: string;
  objectIds: ID[];
}

/* -------------------------------------------------------------------------- */
/*                                Type Guards                                 */
/* -------------------------------------------------------------------------- */

export const isAtom = (
  object: DrawableObject,
): object is Atom => object.type === "atom";

export const isBond = (
  object: DrawableObject,
): object is Bond => object.type === "bond";

export const isRing = (
  object: DrawableObject,
): object is Ring => object.type === "ring";

export const isFunctionalGroup = (
  object: DrawableObject,
): object is FunctionalGroup =>
  object.type === "functional-group";

export const isArrow = (
  object: DrawableObject,
): object is Arrow => object.type === "arrow";

export const isTextObject = (
  object: DrawableObject,
): object is TextObject => object.type === "text";

export const isBrushStroke = (
  object: DrawableObject,
): object is BrushStroke =>
  object.type === "brush-stroke";
