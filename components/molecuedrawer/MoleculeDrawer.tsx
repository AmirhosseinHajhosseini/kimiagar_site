"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  CSSProperties,
  MouseEvent as ReactMouseEvent,
} from "react";

import {
  createDefaultStyle,
  createId,
  createInitialDocument,
} from "./chemistry/initialState";

import { getElementData } from "./chemistry/atomData";
import { RING_TEMPLATES } from "./chemistry/ringTemplates";
import { getTheme } from "./theme";
import MoleculeToolbar from "./MoleculeToolbar";
import MoleculeSidebar from "./MoleculeSidebar";
import { useDocumentHistory } from "./useDocumentHistory";

import type {
  Atom,
  ArrowType,
  Bond,
  BondOrder,
  BondType,
  ChargeKind,
  ElectronDisplay,
  ElementSymbol,
  InteractionMode,
  MechanismDocument,
  Ring,
  RingKind,
  ThemeState,
} from "./types";


import styles from "./MoleculeDrawer.module.css";

const STORAGE_KEY = "molecule-drawer-document";
const SVG_WIDTH = 1200;
const SVG_HEIGHT = 800;
const ATOM_RADIUS = 18;
const RING_DEFAULT_RADIUS = 54;

type SimpleBondOrder = 1 | 2 | 3;
type RingDeleteMode = "simple" | "structure";

type MoleculeCSSProperties = CSSProperties & {
  "--md-canvas-background"?: string;
  "--md-grid-color"?: string;
  "--md-grid-strong-color"?: string;
  "--md-surface-background"?: string;
  "--md-surface-elevated"?: string;
  "--md-border-color"?: string;
  "--md-text-primary"?: string;
  "--md-text-secondary"?: string;
  "--md-text-muted"?: string;
  "--md-title-color"?: string;
  "--md-bond-color"?: string;
  "--md-arrow-color"?: string;
  "--md-selection-color"?: string;
  "--md-focus-color"?: string;
};

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

const createAtom = (element: ElementSymbol, position: Point): Atom => ({
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


const createBond = (
  startAtomId: string,
  endAtomId: string,
  bondType: BondType,
  order: BondOrder,
): Bond => {
  return {
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
  };
};

const createRingObject = (
  ringKind: RingKind,
  center: Point,
  radius: number,
  sides: number,
  atomIds: string[],
  bondIds: string[],
  aromatic: boolean,
): Ring => {
  return {
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
  };
};

const getSimpleBondOrder = (order: BondOrder): SimpleBondOrder => {
  if (order >= 3) return 3;
  if (order === 2) return 2;
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

  if (order === 1) return [createLine(0)];
  if (order === 2) return [createLine(-offset), createLine(offset)];

  return [
    createLine(0),
    createLine(-offset * 1.8),
    createLine(offset * 1.8),
  ];
};

const getWedgePoints = (start: Point, end: Point): string | null => {
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

const getHashedWedgeLines = (start: Point, end: Point): BondLine[] => {
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

const getWavyPoints = (start: Point, end: Point): string | null => {
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

    const x = start.x + dx * progress + normalX * amplitude * direction;
    const y = start.y + dy * progress + normalY * amplitude * direction;

    return `${x},${y}`;
  }).join(" ");
};

const getBondTypeLabel = (bondType: BondType): string => {
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

const getRingLabel = (ringKind: RingKind): string => {
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

const loadDocument = (): MechanismDocument => {
  if (typeof window === "undefined") {
    return createInitialDocument();
  }

  try {
    const savedDocument = window.localStorage.getItem(STORAGE_KEY);

    if (!savedDocument) {
      return createInitialDocument();
    }

    const parsedDocument: MechanismDocument = JSON.parse(savedDocument);

    if (
      !parsedDocument ||
      parsedDocument.title !== "MoleculeDrawer" ||
      !Array.isArray(parsedDocument.objects)
    ) {
      return createInitialDocument();
    }

    return parsedDocument;
  } catch {
    return createInitialDocument();
  }
};

export default function MoleculeDrawer() {
  const initialDocument = useMemo(() => createInitialDocument(), []);

  const {
    document,
    updateDocument: updateHistoryDocument,
    undo,
    redo,
    resetHistory,
    canUndo,
    canRedo,
  } = useDocumentHistory<MechanismDocument>(initialDocument);

  const [isReady, setIsReady] = useState(false);
  const [bondSelection, setBondSelection] = useState<string[]>([]);
  const [draggingAtomId, setDraggingAtomId] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const theme = useMemo(
    () => getTheme(document.theme.mode),
    [document.theme.mode],
  );

  useEffect(() => {
    const savedDocument = loadDocument();
    resetHistory(savedDocument);
    setIsReady(true);
  }, [resetHistory]);

  useEffect(() => {
    if (!isReady || typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(document));
  }, [document, isReady]);

  const updateDocument = useCallback(
    (updater: (currentDocument: MechanismDocument) => MechanismDocument) => {
      updateHistoryDocument((currentDocument) => {
        const nextDocument = updater(currentDocument);
        return {
          ...nextDocument,
          updatedAt: new Date().toISOString(),
        };
      });
    },
    [updateHistoryDocument],
  );

  const handleUndo = useCallback(() => {
    undo();
    setBondSelection([]);
  }, [undo]);

  const handleRedo = useCallback(() => {
    redo();
    setBondSelection([]);
  }, [redo]);

  const setInteractionMode = useCallback(
    (mode: InteractionMode) => {
      updateDocument((currentDocument) => ({
        ...currentDocument,
        tool: {
          ...currentDocument.tool,
          mode,
        },
        contextMenu: {
          ...currentDocument.contextMenu,
          isOpen: false,
        },
      }));
      setBondSelection([]);
    },
    [updateDocument],
  );

  const setSelectedBond = useCallback(
    (bondType: BondType, bondOrder: BondOrder) => {
      updateDocument((currentDocument) => ({
        ...currentDocument,
        tool: {
          ...currentDocument.tool,
          mode: "add-bond",
          selectedBondType: bondType,
          selectedBondOrder: bondOrder,
        },
      }));
      setBondSelection([]);
    },
    [updateDocument],
  );

  const setSelectedElement = useCallback(
    (element: ElementSymbol) => {
      updateDocument((currentDocument) => ({
        ...currentDocument,
        tool: {
          ...currentDocument.tool,
          selectedElement: element,
          mode: "add-atom",
        },
      }));
      setBondSelection([]);
    },
    [updateDocument],
  );

  const setSelectedRing = useCallback(
    (ringKind: RingKind) => {
      updateDocument((currentDocument) => ({
        ...currentDocument,
        tool: {
          ...currentDocument.tool,
          selectedRingKind: ringKind,
          mode: "add-ring",
        },
      }));
      setBondSelection([]);
    },
    [updateDocument],
  );

  const toggleTheme = useCallback(() => {
    updateDocument((currentDocument) => {
      const nextMode: ThemeState["mode"] =
        currentDocument.theme.mode === "light" ? "dark" : "light";

      return {
        ...currentDocument,
        theme: {
          mode: nextMode,
        },
      };
    });
  }, [updateDocument]);

  const toggleGrid = useCallback(() => {
    updateDocument((currentDocument) => ({
      ...currentDocument,
      viewport: {
        ...currentDocument.viewport,
        showGrid: !currentDocument.viewport.showGrid,
      },
    }));
  }, [updateDocument]);

  const toggleSnapToGrid = useCallback(() => {
    updateDocument((currentDocument) => ({
      ...currentDocument,
      viewport: {
        ...currentDocument.viewport,
        snapToGrid: !currentDocument.viewport.snapToGrid,
      },
    }));
  }, [updateDocument]);

  const clearSelection = useCallback(() => {
    updateDocument((currentDocument) => ({
      ...currentDocument,
      selection: {
        ...currentDocument.selection,
        selectedIds: [],
        primarySelectedId: null,
      },
    }));
    setBondSelection([]);
  }, [updateDocument]);

  const clearCanvas = useCallback(() => {
    const confirmed = window.confirm(
      "آیا مطمئن هستید که می‌خواهید بوم را پاک کنید و صفحه را رفرش کنید؟",
    );
    if (!confirmed) return;

    window.localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }, []);

  const deleteAtom = useCallback(
    (atomId: string) => {
      updateDocument((currentDocument) => {
        const relatedRingIds = new Set<string>();
        const relatedBondIds = new Set<string>();

        currentDocument.objects.forEach((object) => {
          if (
            object.type === "ring" &&
            object.atomIds.includes(atomId)
          ) {
            relatedRingIds.add(object.id);
          }

          if (
            object.type === "bond" &&
            (
              object.startAtomId === atomId ||
              object.endAtomId === atomId
            )
          ) {
            relatedBondIds.add(object.id);
          }
        });

        const removedIds = new Set<string>([
          atomId,
          ...relatedRingIds,
          ...relatedBondIds,
        ]);

        return {
          ...currentDocument,
          objects: currentDocument.objects.filter(
            (object) => !removedIds.has(object.id),
          ),
          selection: {
            ...currentDocument.selection,
            selectedIds:
              currentDocument.selection.selectedIds.filter(
                (id) => !removedIds.has(id),
              ),
            primarySelectedId: removedIds.has(
              currentDocument.selection.primarySelectedId ?? "",
            )
              ? null
              : currentDocument.selection.primarySelectedId,
          },
        };
      });

      setBondSelection([]);
    },
    [updateDocument],
  );

  const deleteBond = useCallback(
    (bondId: string) => {
      updateDocument((currentDocument) => {
        const relatedRingIds = new Set<string>();

        currentDocument.objects.forEach((obj) => {
          if (obj.type === "ring" && obj.bondIds.includes(bondId)) {
            relatedRingIds.add(obj.id);
          }
        });

        const removedIds = new Set<string>([bondId, ...relatedRingIds]);

        return {
          ...currentDocument,
          objects: currentDocument.objects
            .filter((obj) => !removedIds.has(obj.id))
            .map((obj) => {
              if (obj.type !== "atom") return obj;
              return {
                ...obj,
                attachedBondIds: obj.attachedBondIds.filter(
                  (id) => id !== bondId,
                ),
              };
            }),
          selection: {
            ...currentDocument.selection,
            selectedIds: currentDocument.selection.selectedIds.filter(
              (id) => !removedIds.has(id),
            ),
            primarySelectedId: removedIds.has(
              currentDocument.selection.primarySelectedId ?? "",
            )
              ? null
              : currentDocument.selection.primarySelectedId,
          },
        };
      });

      setBondSelection([]);
    },
    [updateDocument],
  );

  const deleteRing = useCallback(
    (ringId: string, mode: RingDeleteMode = "simple") => {
      updateDocument((currentDocument) => {
        const ring = currentDocument.objects.find(
          (object): object is Ring =>
            object.type === "ring" && object.id === ringId,
        );

        if (!ring) return currentDocument;

        if (mode === "simple") {
          return {
            ...currentDocument,
            objects: currentDocument.objects.filter(
              (object) => object.id !== ringId,
            ),
            selection: {
              ...currentDocument.selection,
              selectedIds: currentDocument.selection.selectedIds.filter(
                (id) => id !== ringId,
              ),
              primarySelectedId:
                currentDocument.selection.primarySelectedId === ringId
                  ? null
                  : currentDocument.selection.primarySelectedId,
            },
          };
        }

        const ringAtomIds = new Set(ring.atomIds);
        const ringBondIds = new Set(ring.bondIds);

        const atomsToKeep = new Set<string>();

        currentDocument.objects.forEach((object) => {
          if (object.type !== "bond") return;
          if (ringBondIds.has(object.id)) return;

          if (ringAtomIds.has(object.startAtomId)) {
            atomsToKeep.add(object.startAtomId);
          }

          if (ringAtomIds.has(object.endAtomId)) {
            atomsToKeep.add(object.endAtomId);
          }
        });

        const atomsToDelete = new Set(
          [...ringAtomIds].filter((atomId) => !atomsToKeep.has(atomId)),
        );

        const bondsToDelete = new Set<string>(ringBondIds);

        currentDocument.objects.forEach((object) => {
          if (object.type !== "bond") return;

          if (
            atomsToDelete.has(object.startAtomId) ||
            atomsToDelete.has(object.endAtomId)
          ) {
            bondsToDelete.add(object.id);
          }
        });

        const removedIds = new Set<string>([
          ring.id,
          ...atomsToDelete,
          ...bondsToDelete,
        ]);

        return {
          ...currentDocument,
          objects: currentDocument.objects.filter(
            (object) => !removedIds.has(object.id),
          ),
          selection: {
            ...currentDocument.selection,
            selectedIds: currentDocument.selection.selectedIds.filter(
              (id) => !removedIds.has(id),
            ),
            primarySelectedId: removedIds.has(
              currentDocument.selection.primarySelectedId ?? "",
            )
              ? null
              : currentDocument.selection.primarySelectedId,
          },
        };
      });
    },
    [updateDocument],
  );

  const deleteSelected = useCallback(() => {
    const selectedId = document.selection.primarySelectedId;
    if (!selectedId) return;

    const target = document.objects.find((obj) => obj.id === selectedId);
    if (!target) return;

    if (target.type === "atom") {
      deleteAtom(selectedId);
    } else if (target.type === "bond") {
      deleteBond(selectedId);
    } else if (target.type === "ring") {
      deleteRing(selectedId, "simple");
    }
  }, [
    document.selection.primarySelectedId,
    document.objects,
    deleteAtom,
    deleteBond,
    deleteRing,
  ]);

  const createRingAtPoint = useCallback(
    (ringKind: RingKind, center: Point) => {
      const template = RING_TEMPLATES[ringKind];
      if (!template) return;

      const sides = template.sides;
      const radius = RING_DEFAULT_RADIUS;

      const atoms: Atom[] = [];
      const bonds: Bond[] = [];

      for (let i = 0; i < sides; i++) {
        const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
        const x = center.x + radius * Math.cos(angle);
        const y = center.y + radius * Math.sin(angle);
        atoms.push(createAtom("C", { x, y }));
      }

      const atomIds = atoms.map((atom) => atom.id);

      for (let i = 0; i < sides; i++) {
        const startAtomId = atomIds[i];
        const endAtomId = atomIds[(i + 1) % sides];
        const isDoubleBond =
          template.alternatingDoubleBonds === true && i % 2 === 0;

        bonds.push(
          createBond(
            startAtomId,
            endAtomId,
            template.aromatic
              ? "aromatic"
              : isDoubleBond
                ? "double"
                : "single",
            template.aromatic ? 1.5 : isDoubleBond ? 2 : 1,
          ),
        );
      }

      const bondIds = bonds.map((bond) => bond.id);

      const ring = createRingObject(
        template.ringKind,
        center,
        radius,
        sides,
        atomIds,
        bondIds,
        template.aromatic,
      );

      updateDocument((currentDocument) => ({
        ...currentDocument,
        objects: [...currentDocument.objects, ...atoms, ...bonds, ring],
        selection: {
          ...currentDocument.selection,
          selectedIds: [ring.id],
          primarySelectedId: ring.id,
        },
      }));
    },
    [updateDocument],
  );

  const handleAtomMouseDown = useCallback(
    (event: ReactMouseEvent<SVGGElement>, atomId: string) => {
      event.stopPropagation();

      updateDocument((currentDocument) => ({
        ...currentDocument,
        selection: {
          ...currentDocument.selection,
          selectedIds: [atomId],
          primarySelectedId: atomId,
        },
      }));

      if (document.tool.mode === "erase") {
        deleteAtom(atomId);
        return;
      }

      if (document.tool.mode === "select") {
        setDraggingAtomId(atomId);
        return;
      }

      if (document.tool.mode === "add-bond") {
        setBondSelection((currentSelection) => {
          if (currentSelection.length === 0) return [atomId];
          if (currentSelection[0] === atomId) return [];

          const startAtomId = currentSelection[0];
          const endAtomId = atomId;

          updateDocument((currentDocument) => {
            const startAtomExists = currentDocument.objects.some(
              (object): object is Atom =>
                object.type === "atom" && object.id === startAtomId,
            );

            const endAtomExists = currentDocument.objects.some(
              (object): object is Atom =>
                object.type === "atom" && object.id === endAtomId,
            );

            if (!startAtomExists || !endAtomExists) {
              return currentDocument;
            }

            const alreadyExists = currentDocument.objects.some(
              (object): object is Bond =>
                object.type === "bond" &&
                ((object.startAtomId === startAtomId &&
                  object.endAtomId === endAtomId) ||
                  (object.startAtomId === endAtomId &&
                    object.endAtomId === startAtomId)),
            );

            if (alreadyExists) {
              return currentDocument;
            }

            const bond = createBond(
              startAtomId,
              endAtomId,
              currentDocument.tool.selectedBondType,
              currentDocument.tool.selectedBondOrder,
            );

            const nextObjects = currentDocument.objects.map((object) => {
              if (object.type !== "atom") return object;

              if (object.id === startAtomId || object.id === endAtomId) {
                return {
                  ...object,
                  attachedBondIds: [
                    ...new Set([...object.attachedBondIds, bond.id]),
                  ],
                };
              }

              return object;
            });

            return {
              ...currentDocument,
              objects: [...nextObjects, bond],
              selection: {
                ...currentDocument.selection,
                selectedIds: [bond.id],
                primarySelectedId: bond.id,
              },
            };
          });

          return [];
        });

        return;
      }

      if (document.tool.mode === "add-ring") {
        const ringKind = document.tool.selectedRingKind;
        const atomPosition = document.objects.find(
          (o): o is Atom => o.id === atomId && o.type === "atom",
        )?.position;

        createRingAtPoint(ringKind, atomPosition ?? { x: 0, y: 0 });
      }
    },
    [
      document.tool.mode,
      document.tool.selectedBondOrder,
      document.tool.selectedBondType,
      document.tool.selectedRingKind,
      document.objects,
      updateDocument,
      deleteAtom,
      createRingAtPoint,
    ],
  );

  const handleBondClick = useCallback(
    (event: ReactMouseEvent<SVGGElement>, bondId: string) => {
      event.stopPropagation();

      updateDocument((currentDocument) => ({
        ...currentDocument,
        selection: {
          ...currentDocument.selection,
          selectedIds: [bondId],
          primarySelectedId: bondId,
        },
      }));

      if (document.tool.mode === "erase") {
        deleteBond(bondId);
      }
    },
    [document.tool.mode, deleteBond, updateDocument],
  );

  const handleRingClick = useCallback(
    (event: ReactMouseEvent<SVGGElement>, ringId: string) => {
      event.stopPropagation();

      updateDocument((currentDocument) => ({
        ...currentDocument,
        selection: {
          ...currentDocument.selection,
          selectedIds: [ringId],
          primarySelectedId: ringId,
        },
      }));

      if (document.tool.mode === "erase") {
        deleteRing(ringId, "simple");
      }
    },
    [document.tool.mode, deleteRing, updateDocument],
  );

  const handleCanvasMouseMove = useCallback(
    (event: ReactMouseEvent<SVGSVGElement>) => {
      if (!draggingAtomId || document.tool.mode !== "select") return;

      const svg = svgRef.current;
      if (!svg) return;

      const screenMatrix = svg.getScreenCTM();
      if (!screenMatrix) return;

      const svgPoint = new DOMPoint(
        event.clientX,
        event.clientY,
      ).matrixTransform(screenMatrix.inverse());

      let x = Math.max(
        ATOM_RADIUS,
        Math.min(SVG_WIDTH - ATOM_RADIUS, svgPoint.x),
      );
      let y = Math.max(
        ATOM_RADIUS,
        Math.min(SVG_HEIGHT - ATOM_RADIUS, svgPoint.y),
      );

      if (document.viewport.snapToGrid) {
        const gridSize = document.viewport.gridSize || 20;
        x = Math.round(x / gridSize) * gridSize;
        y = Math.round(y / gridSize) * gridSize;
      }

      updateDocument((currentDocument) => ({
        ...currentDocument,
        objects: currentDocument.objects.map((obj) =>
          obj.id === draggingAtomId && obj.type === "atom"
            ? { ...obj, position: { x, y } }
            : obj,
        ),
      }));
    },
    [
      draggingAtomId,
      document.tool.mode,
      document.viewport.snapToGrid,
      document.viewport.gridSize,
      updateDocument,
    ],
  );

  const handleCanvasMouseUp = useCallback(() => {
    if (draggingAtomId) setDraggingAtomId(null);
  }, [draggingAtomId]);

  const handleCanvasClick = useCallback(
    (event: ReactMouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg || event.target !== svg) return;

      if (document.tool.mode === "select") {
        clearSelection();
        return;
      }

      if (document.tool.mode === "add-bond") {
        setBondSelection([]);
        return;
      }

      const screenMatrix = svg.getScreenCTM();
      if (!screenMatrix) return;

      const svgPoint = new DOMPoint(
        event.clientX,
        event.clientY,
      ).matrixTransform(screenMatrix.inverse());

      if (document.tool.mode === "add-ring") {
        let x = Math.max(
          RING_DEFAULT_RADIUS,
          Math.min(SVG_WIDTH - RING_DEFAULT_RADIUS, svgPoint.x),
        );
        let y = Math.max(
          RING_DEFAULT_RADIUS,
          Math.min(SVG_HEIGHT - RING_DEFAULT_RADIUS, svgPoint.y),
        );

        if (document.viewport.snapToGrid) {
          const gridSize = document.viewport.gridSize || 20;
          x = Math.round(x / gridSize) * gridSize;
          y = Math.round(y / gridSize) * gridSize;
        }

        createRingAtPoint(document.tool.selectedRingKind, { x, y });
        return;
      }

      if (document.tool.mode !== "add-atom") return;

      let x = Math.max(
        ATOM_RADIUS,
        Math.min(SVG_WIDTH - ATOM_RADIUS, svgPoint.x),
      );
      let y = Math.max(
        ATOM_RADIUS,
        Math.min(SVG_HEIGHT - ATOM_RADIUS, svgPoint.y),
      );

      if (document.viewport.snapToGrid) {
        const gridSize = document.viewport.gridSize || 20;
        x = Math.round(x / gridSize) * gridSize;
        y = Math.round(y / gridSize) * gridSize;
      }

      const atom = createAtom(document.tool.selectedElement, { x, y });

      updateDocument((currentDocument) => ({
        ...currentDocument,
        objects: [...currentDocument.objects, atom],
        selection: {
          ...currentDocument.selection,
          selectedIds: [atom.id],
          primarySelectedId: atom.id,
        },
      }));
    },
    [
      document.tool.mode,
      document.tool.selectedElement,
      document.tool.selectedRingKind,
      document.viewport.snapToGrid,
      document.viewport.gridSize,
      updateDocument,
      clearSelection,
      createRingAtPoint,
    ],
  );

  const selectedObject = document.objects.find(
    (object) => object.id === document.selection.primarySelectedId,
  );

  const selectedAtom = selectedObject?.type === "atom" ? selectedObject : null;
  const selectedBond = selectedObject?.type === "bond" ? selectedObject : null;
  const selectedRing = selectedObject?.type === "ring" ? selectedObject : null;

  const selectedStartAtom = selectedBond
    ? document.objects.find(
        (object): object is Atom =>
          object.type === "atom" && object.id === selectedBond.startAtomId,
      )
    : null;

  const selectedEndAtom = selectedBond
    ? document.objects.find(
        (object): object is Atom =>
          object.type === "atom" && object.id === selectedBond.endAtomId,
      )
    : null;

  const cssVariables = {
    "--md-canvas-background": theme.canvas.background,
    "--md-grid-color": theme.canvas.grid,
    "--md-grid-strong-color": theme.canvas.gridStrong,
    "--md-surface-background": theme.surface.background,
    "--md-surface-elevated": theme.surface.elevated,
    "--md-border-color": theme.surface.border,
    "--md-text-primary": theme.text.primary,
    "--md-text-secondary": theme.text.secondary,
    "--md-text-muted": theme.text.muted,
    "--md-title-color": theme.text.title,
    "--md-bond-color": theme.chemistry.bondColor,
    "--md-arrow-color": theme.chemistry.arrowColor,
    "--md-selection-color": theme.chemistry.selectionColor,
    "--md-focus-color": theme.controls.focus,
  } as MoleculeCSSProperties;

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
    const atomA = atoms.find((atom) => atom.id === bond.startAtomId);
    const atomB = atoms.find((atom) => atom.id === bond.endAtomId);

    if (!atomA || !atomB) return null;

    const start = atomA.position;
    const end = atomB.position;

    const isSelected =
      document.selection.primarySelectedId === bond.id ||
      bondSelection.includes(bond.id);

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

        if (!points) return null;

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

        if (!points) return null;

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
        className={`${styles.bond} ${
          isSelected ? styles.bondSelected : ""
        }`}
        data-bond-id={bond.id}
        onClick={(event) => handleBondClick(event, bond.id)}
        style={{ cursor: "pointer" }}
      >
        <line
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          stroke="transparent"
          strokeWidth={18}
          className={styles.bondHitArea}
        />

        {renderBondShape()}
      </g>
    );
  });

  const renderedRings = rings.map((ring) => {
    const points = ring.atomIds
      .map((atomId) => atoms.find((atom) => atom.id === atomId))
      .filter((atom): atom is Atom => Boolean(atom))
      .map((atom) => atom.position);

    const isSelected = document.selection.primarySelectedId === ring.id;
    if (points.length < 3) return null;

    const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(" ");

    return (
      <g
        key={ring.id}
        onClick={(event) => handleRingClick(event, ring.id)}
        style={{ cursor: "pointer" }}
      >
        <polygon
          points={polygonPoints}
          fill="transparent"
          stroke={
            isSelected ? "var(--md-selection-color)" : ring.style.strokeColor
          }
          strokeWidth={ring.style.strokeWidth}
          opacity={ring.style.opacity}
        />
        {ring.aromatic && (
          <circle
            cx={ring.center.x}
            cy={ring.center.y}
            r={ring.radius * 0.45}
            fill="none"
            stroke={
              isSelected ? "var(--md-selection-color)" : ring.style.strokeColor
            }
            strokeWidth={2}
            opacity={0.9}
            pointerEvents="none"
          />
        )}
        <polygon
          points={polygonPoints}
          fill="transparent"
          stroke="transparent"
          strokeWidth={20}
          opacity={0}
        />
      </g>
    );
  });

  const renderedAtoms = atoms.map((atom) => {
    const elementData = getElementData(atom.element);
    const isSelected = document.selection.primarySelectedId === atom.id;
    const isBondStart = bondSelection[0] === atom.id;
    const isBondTarget = bondSelection.includes(atom.id);

    return (
      <g
        key={atom.id}
        transform={`translate(${atom.position.x} ${atom.position.y})`}
        aria-label={`اتم ${elementData.persianName}`}
        onMouseDown={(event) => handleAtomMouseDown(event, atom.id)}
        className={
          document.tool.mode === "add-bond" && (isBondStart || isBondTarget)
            ? styles.atomSelected
            : undefined
        }
        style={{
          cursor: document.tool.mode === "select" ? "grab" : "pointer",
        }}
      >
        <circle r={ATOM_RADIUS + 8} fill="transparent" pointerEvents="all" />

        {isSelected && (
          <circle
            r={ATOM_RADIUS + 4}
            fill="none"
            stroke="var(--md-selection-color)"
            strokeWidth="3"
            opacity="0.9"
            pointerEvents="none"
          />
        )}

        <circle
          r={ATOM_RADIUS}
          fill={elementData.defaultColor}
          stroke={elementData.defaultColor}
          strokeWidth="2"
        />

        <text
          x="0"
          y="8"
          textAnchor="middle"
          fill={elementData.defaultTextColor}
          fontSize={atom.labelSize}
          fontFamily={atom.style.fontFamily}
          fontWeight="700"
          pointerEvents="none"
        >
          {atom.element}
        </text>
      </g>
    );
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;

      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteSelected();
        return;
      }

      if (!(event.ctrlKey || event.metaKey)) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        handleUndo();
        return;
      }

      if (key === "y" || (key === "z" && event.shiftKey)) {
        event.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo, deleteSelected]);

  const handleChargeChange = (charge: ChargeKind) => {
  updateDocument((currentDocument) => ({
    ...currentDocument,
    tool: {
      ...currentDocument.tool,
      selectedCharge: charge,
      mode: "add-charge",
    },
  }));
  setBondSelection([]);
};

const handleElectronChange = (electron: ElectronDisplay) => {
  updateDocument((currentDocument) => ({
    ...currentDocument,
    tool: {
      ...currentDocument.tool,
      selectedElectronDisplay: electron,
      mode: "add-electron",
    },
  }));
  setBondSelection([]);
};

const handleArrowChange = (arrowType: ArrowType) => {
  updateDocument((currentDocument) => ({
    ...currentDocument,
    tool: {
      ...currentDocument.tool,
      selectedArrowType: arrowType,
      mode: "add-arrow",
    },
  }));
  setBondSelection([]);
};


  return (
    <main
      className={`${styles.application} ${
        document.theme.mode === "dark" ? styles.dark : styles.light
      }`}
      style={cssVariables}
      dir="rtl"
    >
      <header className={styles.header}>
        <div className={styles.headerSide}>
          <span className={styles.statusDot} />
          <span className={styles.statusText}>سند جدید</span>
        </div>

        <h1 className={styles.title}>MoleculeDrawer</h1>

        <div className={styles.headerSide}>
          <button
            type="button"
            className={styles.headerButton}
            onClick={toggleTheme}
            aria-label="تغییر حالت روشن و تاریک"
            title="تغییر حالت روشن و تاریک"
          >
            {document.theme.mode === "light" ? "☾" : "☀"}
          </button>

          <button
            type="button"
            className={styles.headerButton}
            onClick={clearCanvas}
            aria-label="پاک کردن بوم و رفرش"
            title="پاک کردن بوم و رفرش صفحه"
          >
            پاک‌سازی
          </button>
        </div>
      </header>

      <MoleculeToolbar
        activeMode={document.tool.mode}
        showGrid={document.viewport.showGrid}
        canUndo={canUndo}
        canRedo={canRedo}
        onModeChange={setInteractionMode}
        onToggleGrid={toggleGrid}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />

      <section className={styles.workspace}>
       <MoleculeSidebar
  document={document}
  onModeChange={setInteractionMode}
  onElementChange={setSelectedElement}
  onBondChange={setSelectedBond}
  onRingChange={setSelectedRing}
  onClearSelection={clearSelection}
  onChargeChange={handleChargeChange}
  onElectronChange={handleElectronChange}
  onArrowChange={handleArrowChange}
  onToggleGrid={toggleGrid}
  onToggleSnap={toggleSnapToGrid}
/>



        <section className={styles.canvasArea} aria-label="ناحیه طراحی مولکول">
          <div className={styles.canvasToolbar}>
            <span>
              ابزار فعال:{" "}
              <strong>
                {document.tool.mode === "select"
                  ? "انتخاب و جابجایی"
                  : document.tool.mode === "erase"
                    ? "پاک‌کن"
                    : document.tool.mode === "add-atom"
                      ? "افزودن اتم"
                      : document.tool.mode === "add-ring"
                        ? "افزودن حلقه"
                        : "افزودن پیوند"}
              </strong>
            </span>

            {document.tool.mode === "add-bond" && (
              <div className={styles.bondOrderControl}>
                <span className={styles.bondOrderLabel}>نوع پیوند:</span>
                <div className={styles.bondOrderButtons}>
                  {[
                    { type: "single" as const, order: 1 as const, label: "یگانه" },
                    { type: "double" as const, order: 2 as const, label: "دوگانه" },
                    { type: "triple" as const, order: 3 as const, label: "سه‌گانه" },
                    { type: "solid-wedge" as const, order: 1 as const, label: "گوه‌ای پر" },
                    { type: "hashed-wedge" as const, order: 1 as const, label: "گوه‌ای خط‌چین" },
                    { type: "dashed" as const, order: 1 as const, label: "خط‌چین" },
                    { type: "wavy" as const, order: 1 as const, label: "موج‌دار" },
                  ].map((option) => {
                    const isActive =
                      document.tool.selectedBondType === option.type;

                    return (
                      <button
                        key={option.type}
                        type="button"
                        className={`${styles.bondOrderButton} ${
                          isActive ? styles.bondOrderButtonActive : ""
                        }`}
                        onClick={() =>
                          setSelectedBond(option.type, option.order)
                        }
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <span>
              بزرگ‌نمایی:{" "}
              <strong>{Math.round(document.viewport.zoom * 100)}٪</strong>
            </span>
          </div>

          <div className={styles.canvasPlaceholder}>
            <svg
              ref={svgRef}
              className={styles.moleculeCanvas}
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label="بوم طراحی مولکول"
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            >
              <defs>
                <pattern
                  id="molecule-grid-small"
                  width={document.viewport.gridSize}
                  height={document.viewport.gridSize}
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d={`M ${document.viewport.gridSize} 0 L 0 0 0 ${document.viewport.gridSize}`}
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
              {renderedAtoms}
            </svg>

            {document.objects.length === 0 && (
              <div
                className={styles.canvasWelcome}
                style={{ pointerEvents: "none" }}
              >
                <div className={styles.canvasIcon}>⌬</div>
                <h2>محیط طراحی شیمیایی</h2>
                <p>یک عنصر را انتخاب کنید و روی بوم کلیک کنید.</p>
                <p className={styles.canvasHint}>
                  اتم انتخاب‌شده روی شبکه قرار می‌گیرد.
                </p>
              </div>
            )}
          </div>
        </section>

        <aside className={styles.propertiesPanel} aria-label="پنل ویژگی‌ها">
          <div className={styles.panelHeader}>
            <h2>ویژگی‌ها</h2>
          </div>

          {selectedAtom ? (
            <div className={styles.bondProperties}>
              <span className={styles.propertyBadge}>ATOM</span>
              <h3 className={styles.propertyTitle}>ویژگی‌های اتم</h3>

              <div className={styles.propertyRow}>
                <span>نماد عنصر</span>
                <strong>{selectedAtom.element}</strong>
              </div>

              <div className={styles.propertyRow}>
                <span>نام عنصر</span>
                <strong>{getElementData(selectedAtom.element).persianName}</strong>
              </div>

              <div className={styles.propertyRow}>
                <span>موقعیت X</span>
                <strong>{Math.round(selectedAtom.position.x)}</strong>
              </div>

              <div className={styles.propertyRow}>
                <span>موقعیت Y</span>
                <strong>{Math.round(selectedAtom.position.y)}</strong>
              </div>

              <button
                type="button"
                className={styles.propertyDeleteButton}
                onClick={() => deleteAtom(selectedAtom.id)}
              >
                حذف اتم
              </button>
            </div>
          ) : selectedBond ? (
            <div className={styles.bondProperties}>
              <span className={styles.propertyBadge}>BOND</span>
              <h3 className={styles.propertyTitle}>ویژگی‌های پیوند</h3>

              <div className={styles.propertyRow}>
                <span>نوع پیوند</span>
                <strong>{getBondTypeLabel(selectedBond.bondType)}</strong>
              </div>

              <div className={styles.propertyRow}>
                <span>مرتبه پیوند</span>
                <strong>{selectedBond.order}</strong>
              </div>

              <div className={styles.propertyRow}>
                <span>اتم اول</span>
                <strong>{selectedStartAtom?.element ?? "-"}</strong>
              </div>

              <div className={styles.propertyRow}>
                <span>اتم دوم</span>
                <strong>{selectedEndAtom?.element ?? "-"}</strong>
              </div>

              <button
                type="button"
                className={styles.propertyDeleteButton}
                onClick={() => deleteBond(selectedBond.id)}
              >
                حذف پیوند
              </button>
            </div>
          ) : selectedRing ? (
            <div className={styles.bondProperties}>
              <span className={styles.propertyBadge}>RING</span>

              <h3 className={styles.propertyTitle}>ویژگی‌های حلقه</h3>

              <div className={styles.propertyRow}>
                <span>نوع حلقه</span>
                <strong>{getRingLabel(selectedRing.ringKind)}</strong>
              </div>

              <div className={styles.propertyRow}>
                <span>آروماتیک</span>
                <strong>{selectedRing.aromatic ? "بله" : "خیر"}</strong>
              </div>

              <div className={styles.propertyRow}>
                <span>تعداد اتم‌ها</span>
                <strong>{selectedRing.atomIds.length}</strong>
              </div>

              <div className={styles.propertyRow}>
                <span>تعداد پیوندها</span>
                <strong>{selectedRing.bondIds.length}</strong>
              </div>

              <div className={styles.propertyRow}>
                <span>شعاع</span>
                <strong>{Math.round(selectedRing.radius)}</strong>
              </div>

              <div className={styles.ringDeleteActions}>
                <button
                  type="button"
                  className={styles.propertyDeleteButton}
                  onClick={() => deleteRing(selectedRing.id, "simple")}
                >
                  حذف ساده حلقه
                </button>

                <button
                  type="button"
                  className={`${styles.propertyDeleteButton} ${styles.propertyDeleteStructureButton}`}
                  onClick={() => deleteRing(selectedRing.id, "structure")}
                >
                  حذف کل ساختار حلقه
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.emptyProperties}>
              <span className={styles.emptyPropertiesIcon}>◇</span>
              <p>شیئی انتخاب نشده است</p>
              <small>
                پس از انتخاب اتم، پیوند یا حلقه، ویژگی‌های آن نمایش داده می‌شود.
              </small>
            </div>
          )}
        </aside>
      </section>

      <footer className={styles.footer}>
        <span>آماده برای طراحی</span>
        <span>{document.objects.length} آبجکت</span>
      </footer>
    </main>
  );
}
