import type {
  Atom,
  Bond,
  MechanismDocument,
  Ring,
  RingKind,
} from "../types";

import { createAtom, createBond, createRingObject } from "./factories";
import { RING_TEMPLATES } from "./ringTemplates";
import type { Point } from "./shapeUtils";

export type RingDeleteMode = "simple" | "structure";

function updateSelectionAfterDelete(
  document: MechanismDocument,
  removedIds: Set<string>,
): MechanismDocument["selection"] {
  return {
    ...document.selection,
    selectedIds: document.selection.selectedIds.filter(
      (id) => !removedIds.has(id),
    ),
    primarySelectedId: removedIds.has(
      document.selection.primarySelectedId ?? "",
    )
      ? null
      : document.selection.primarySelectedId,
  };
}

export function deleteAtom(
  document: MechanismDocument,
  atomId: string,
): MechanismDocument {
  const removedIds = new Set<string>([atomId]);

  for (const object of document.objects) {
    if (
      object.type === "ring" &&
      object.atomIds.includes(atomId)
    ) {
      removedIds.add(object.id);
    }

    if (
      object.type === "bond" &&
      (object.startAtomId === atomId ||
        object.endAtomId === atomId)
    ) {
      removedIds.add(object.id);
    }
  }

  return {
    ...document,
    objects: document.objects.filter(
      (object) => !removedIds.has(object.id),
    ),
    selection: updateSelectionAfterDelete(document, removedIds),
  };
}

export function deleteBond(
  document: MechanismDocument,
  bondId: string,
): MechanismDocument {
  const removedIds = new Set<string>([bondId]);

  for (const object of document.objects) {
    if (
      object.type === "ring" &&
      object.bondIds.includes(bondId)
    ) {
      removedIds.add(object.id);
    }
  }

  return {
    ...document,
    objects: document.objects
      .filter((object) => !removedIds.has(object.id))
      .map((object) => {
        if (object.type !== "atom") return object;

        return {
          ...object,
          attachedBondIds: object.attachedBondIds.filter(
            (id) => id !== bondId,
          ),
        };
      }),
    selection: updateSelectionAfterDelete(document, removedIds),
  };
}

export function deleteRing(
  document: MechanismDocument,
  ringId: string,
  mode: RingDeleteMode = "simple",
): MechanismDocument {
  const ring = document.objects.find(
    (object): object is Ring =>
      object.type === "ring" && object.id === ringId,
  );

  if (!ring) return document;

  if (mode === "simple") {
    const removedIds = new Set([ringId]);

    return {
      ...document,
      objects: document.objects.filter(
        (object) => object.id !== ringId,
      ),
      selection: updateSelectionAfterDelete(document, removedIds),
    };
  }

  const ringAtomIds = new Set(ring.atomIds);
  const ringBondIds = new Set(ring.bondIds);
  const atomsToKeep = new Set<string>();

  for (const object of document.objects) {
    if (object.type !== "bond") continue;
    if (ringBondIds.has(object.id)) continue;

    if (ringAtomIds.has(object.startAtomId)) {
      atomsToKeep.add(object.startAtomId);
    }

    if (ringAtomIds.has(object.endAtomId)) {
      atomsToKeep.add(object.endAtomId);
    }
  }

  const atomsToDelete = new Set(
    [...ringAtomIds].filter(
      (atomId) => !atomsToKeep.has(atomId),
    ),
  );

  const bondsToDelete = new Set(ringBondIds);

  for (const object of document.objects) {
    if (object.type !== "bond") continue;

    if (
      atomsToDelete.has(object.startAtomId) ||
      atomsToDelete.has(object.endAtomId)
    ) {
      bondsToDelete.add(object.id);
    }
  }

  const removedIds = new Set<string>([
    ring.id,
    ...atomsToDelete,
    ...bondsToDelete,
  ]);

  return {
    ...document,
    objects: document.objects.filter(
      (object) => !removedIds.has(object.id),
    ),
    selection: updateSelectionAfterDelete(document, removedIds),
  };
}

export function createRingAtPoint(
  document: MechanismDocument,
  ringKind: RingKind,
  center: Point,
): MechanismDocument {
  const template = RING_TEMPLATES[ringKind];

  if (!template) return document;

  const { sides, alternatingDoubleBonds, aromatic } = template;
  const radius = 54;

  const atoms: Atom[] = Array.from({ length: sides }, (_, index) => {
    const angle = (Math.PI * 2 * index) / sides - Math.PI / 2;

    return createAtom("C", {
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    });
  });

  const atomIds = atoms.map((atom) => atom.id);

  const bonds: Bond[] = Array.from({ length: sides }, (_, index) => {
    const isDoubleBond =
      alternatingDoubleBonds === true && index % 2 === 0;

    const order = aromatic
      ? 1.5
      : isDoubleBond
        ? 2
        : 1;

    const bondType = aromatic
      ? "aromatic"
      : isDoubleBond
        ? "double"
        : "single";

    return createBond(
      atomIds[index],
      atomIds[(index + 1) % sides],
      bondType,
      order,
    );
  });

  const bondIds = bonds.map((bond) => bond.id);

  const ring = createRingObject(
    template.ringKind,
    center,
    radius,
    sides,
    atomIds,
    bondIds,
    aromatic,
  );

  return {
    ...document,
    objects: [
      ...document.objects,
      ...atoms,
      ...bonds,
      ring,
    ],
    selection: {
      ...document.selection,
      selectedIds: [ring.id],
      primarySelectedId: ring.id,
    },
  };
}
