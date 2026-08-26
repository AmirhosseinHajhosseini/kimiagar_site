import {
  createDefaultStyle,
  createId,
} from "./initialState";

import type {
  Atom,
  Bond,
  BondOrder,
  BondType,
  ElementSymbol,
  Ring,
  RingKind,
} from "../types";

import type { Point } from "./shapeUtils";

export const createAtom = (
  element: ElementSymbol,
  position: Point,
): Atom => ({
  id: createId("atom"),
  type: "atom",
  element,
  position,

  selected: false,
  locked: false,
  visible: true,
  zIndex: 1,

  style: createDefaultStyle({
    fillColor: "#FFFFFF",
    strokeColor: "#374151",
    strokeWidth: 2,
  }),

  formalCharge: 0,
  partialCharge: "none",
  electronDisplay: "none",

  radical: "none",
  explicitHydrogens: 0,
  showImplicitHydrogens: true,
  showLonePairs: false,
  aromatic: false,

  displayMode: "label",
  sphereRadius: 18,
  labelSize: 16,

  chargeColor: "#B91C1C",
  partialChargeColor: "#7C3AED",
  radicalColor: "#DC2626",
  lonePairColor: "#2563EB",

  attachedBondIds: [],
});

export const createBond = (
  startAtomId: string,
  endAtomId: string,
  bondType: BondType,
  order: BondOrder,
): Bond => ({
  id: createId("bond"),
  type: "bond",

  selected: true,
  locked: false,
  visible: true,
  zIndex: 0,

  style: createDefaultStyle({
    color: "#123b5d",
    fillColor: "transparent",
    strokeColor: "#123b5d",
    strokeWidth: 3,
    opacity: 1,
    fontSize: 16,
    lineCap: "round",
    lineJoin: "round",
  }),

  startAtomId,
  endAtomId,
  order,
  bondType,

  stereochemistry:
    bondType === "solid-wedge"
      ? "up"
      : bondType === "hashed-wedge"
        ? "down"
        : "none",

  aromatic: bondType === "aromatic",
});

export const createRingObject = (
  ringKind: RingKind,
  center: Point,
  radius: number,
  sides: number,
  atomIds: string[],
  bondIds: string[],
  aromatic: boolean,
): Ring => ({
  id: createId("ring"),
  type: "ring",

  selected: true,
  locked: false,
  visible: true,
  zIndex: 0,

  style: createDefaultStyle({
    color: aromatic ? "#8B5CF6" : "#123b5d",
    fillColor: "transparent",
    strokeColor: aromatic ? "#8B5CF6" : "#123b5d",
    strokeWidth: 3,
    opacity: 1,
    fontSize: 16,
    lineCap: "round",
    lineJoin: "round",
  }),

  ringKind,
  center,
  radius,
  sides,
  rotation: -Math.PI / 2,
  aromatic,
  atomIds,
  bondIds,
});
