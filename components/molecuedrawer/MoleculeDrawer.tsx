"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  CSSProperties,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from "react";

import { createInitialDocument } from "./chemistry/initialState";
import { createAtom, createBond } from "./chemistry/factories";

import {
  createMechanisticArrow,
  getArrowHeadGeometry,
  getArrowHeadPoints,
  getMechanisticArrowPath,
  isValidMechanisticArrow,
} from "./chemistry/mechanisticArrow";

import {
  getBondLines,
  getBondTypeLabel,
  getHashedWedgeLines,
  getRingLabel,
  getSimpleBondOrder,
  getWavyPoints,
  getWedgePoints,
} from "./chemistry/shapeUtils";

import type { Point } from "./chemistry/shapeUtils";

import { getElementData } from "./chemistry/atomData";
import { getTheme } from "./theme";

import MoleculeToolbar from "./MoleculeToolbar";
import MoleculeSidebar from "./MoleculeSidebar";
import { useDocumentHistory } from "./useDocumentHistory";

import {
  createRingAtPoint as createRingAction,
  deleteAtom as deleteAtomAction,
  deleteBond as deleteBondAction,
  deleteRing as deleteRingAction,
  type RingDeleteMode,
} from "./chemistry/documentActions";

import {
  getArrowHeadForType,
  getArrowPreset,
} from "./chemistry/arrowPresets";

import {
  getFunctionalGroup,
  instantiateFunctionalGroup,
} from "./chemistry/functionalGroups";

import type {
  Atom,
  Arrow,
  ArrowHeadType,
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

type AtomPalette = {
  fill: string;
  text: string;
};

/**
 * رنگ‌های نمایش اتم بر پایه استاندارد رایج CPK.
 * text رنگ نماد عنصر داخل دایره است.
 */
const ELEMENT_PALETTES: Record<string, AtomPalette> = {
  H: {
    fill: "#E2E8F0",
    text: "#1E293B",
  },
  C: {
    fill: "#334155",
    text: "#FFFFFF",
  },
  N: {
    fill: "#2563EB",
    text: "#FFFFFF",
  },
  O: {
    fill: "#DC2626",
    text: "#FFFFFF",
  },
  F: {
    fill: "#16A34A",
    text: "#FFFFFF",
  },
  Cl: {
    fill: "#059669",
    text: "#FFFFFF",
  },
  Br: {
    fill: "#92400E",
    text: "#FFFFFF",
  },
  I: {
    fill: "#7C3AED",
    text: "#FFFFFF",
  },
  S: {
    fill: "#EAB308",
    text: "#1F2937",
  },
  P: {
    fill: "#EA580C",
    text: "#FFFFFF",
  },
  B: {
    fill: "#D97706",
    text: "#FFFFFF",
  },
  Si: {
    fill: "#64748B",
    text: "#FFFFFF",
  },
  Na: {
    fill: "#7C3AED",
    text: "#FFFFFF",
  },
  K: {
    fill: "#8B5CF6",
    text: "#FFFFFF",
  },
  Ca: {
    fill: "#22C55E",
    text: "#FFFFFF",
  },
  Mg: {
    fill: "#65A30D",
    text: "#FFFFFF",
  },
  Fe: {
    fill: "#B45309",
    text: "#FFFFFF",
  },
  Cu: {
    fill: "#C2410C",
    text: "#FFFFFF",
  },
  Zn: {
    fill: "#94A3B8",
    text: "#1F2937",
  },
};

/**
 * اگر عنصری در لیست بالا نبود، از رنگ‌های atomData استفاده می‌شود.
 */
const getAtomPalette = (
  element: string,
  fallbackFill: string,
  fallbackText: string
): AtomPalette => {
  return (
    ELEMENT_PALETTES[element] ?? {
      fill: fallbackFill || "#64748B",
      text: fallbackText || "#FFFFFF",
    }
  );
};


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
  "--md-arrow-selected-color"?: string;
  "--md-selection-color"?: string;
  "--md-focus-color"?: string;
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

    const parsedDocument = JSON.parse(
      savedDocument,
    ) as MechanismDocument;

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
  const initialDocument = useMemo(
    () => createInitialDocument(),
    [],
  );

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
  const [arrowStartPoint, setArrowStartPoint] =
    useState<Point | null>(null);
  const [arrowCurrentPoint, setArrowCurrentPoint] =
    useState<Point | null>(null);
  const [draggingAtomId, setDraggingAtomId] =
    useState<string | null>(null);

  const isDraggingArrowRef = useRef(false);
  const suppressCanvasClickRef = useRef(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  /*
   * document در این کامپوننت، state برنامه است؛
   * بنابراین document.theme.mode صحیح است.
   * فقط نباید از window.document.theme.mode استفاده شود.
   */
  const isDarkMode = document.theme.mode === "dark";

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
    if (!isReady || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(document),
    );
  }, [document, isReady]);

  const updateDocument = useCallback(
    (
      updater: (
        currentDocument: MechanismDocument,
      ) => MechanismDocument,
    ) => {
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

  const handleFunctionalGroupChange = useCallback(
    (groupId: string) => {
      updateDocument((currentDocument) => ({
        ...currentDocument,
        tool: {
          ...currentDocument.tool,
          mode: "add-functional-group",
          selectedFunctionalGroup: groupId,
        },
      }));

      setBondSelection([]);
    },
    [updateDocument],
  );

  const toggleTheme = useCallback(() => {
    updateDocument((currentDocument) => {
      const nextMode: ThemeState["mode"] =
        currentDocument.theme.mode === "light"
          ? "dark"
          : "light";

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

    if (!confirmed) {
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }, []);

  const deleteAtom = useCallback(
    (atomId: string) => {
      updateDocument((currentDocument) =>
        deleteAtomAction(currentDocument, atomId),
      );

      setBondSelection([]);
    },
    [updateDocument],
  );

  const deleteBond = useCallback(
    (bondId: string) => {
      updateDocument((currentDocument) =>
        deleteBondAction(currentDocument, bondId),
      );

      setBondSelection([]);
    },
    [updateDocument],
  );

  const deleteRing = useCallback(
    (
      ringId: string,
      mode: RingDeleteMode = "simple",
    ) => {
      updateDocument((currentDocument) =>
        deleteRingAction(currentDocument, ringId, mode),
      );

      setBondSelection([]);
    },
    [updateDocument],
  );

  const deleteArrow = useCallback(
    (arrowId: string) => {
      updateDocument((currentDocument) => ({
        ...currentDocument,
        objects: currentDocument.objects.filter(
          (object) => object.id !== arrowId,
        ),
        selection: {
          ...currentDocument.selection,
          selectedIds: [],
          primarySelectedId: null,
        },
      }));

      setBondSelection([]);
    },
    [updateDocument],
  );

  const createRingAtPoint = useCallback(
    (ringKind: RingKind, center: Point) => {
      updateDocument((currentDocument) =>
        createRingAction(currentDocument, ringKind, center),
      );
    },
    [updateDocument],
  );

  const addFunctionalGroupAtPoint = useCallback(
    (groupId: string, position: Point) => {
      const group = getFunctionalGroup(groupId);

      if (!group) {
        return;
      }

      updateDocument((currentDocument) => {
        const instantiated = instantiateFunctionalGroup(
          group,
          position,
        );

        const atomIdMap = new Map<string, string>();

        const newAtoms: Atom[] = instantiated.atoms.map(
          (item) => {
            const atom = createAtom(
              item.element,
              item.position,
            );

            atomIdMap.set(item.key, atom.id);

            return atom;
          },
        );

        const newBonds: Bond[] = instantiated.bonds
          .map((item) => {
            const startAtomId = atomIdMap.get(item.fromKey);
            const endAtomId = atomIdMap.get(item.toKey);

            if (!startAtomId || !endAtomId) {
              return null;
            }

            return createBond(
              startAtomId,
              endAtomId,
              "single",
              item.order,
            );
          })
          .filter(
            (bond): bond is Bond => bond !== null,
          );

        return {
          ...currentDocument,
          objects: [
            ...currentDocument.objects,
            ...newAtoms,
            ...newBonds,
          ],
          selection: {
            ...currentDocument.selection,
            selectedIds: newAtoms.map(
              (atom) => atom.id,
            ),
            primarySelectedId: newAtoms[0]?.id ?? null,
          },
        };
      });
    },
    [updateDocument],
  );

  const getCanvasPoint = useCallback(
    (
      event: ReactMouseEvent<SVGSVGElement>,
      padding: number,
    ): Point | null => {
      const svg = svgRef.current;

      if (!svg) {
        return null;
      }

      const screenMatrix = svg.getScreenCTM();

      if (!screenMatrix) {
        return null;
      }

      const svgPoint = new DOMPoint(
        event.clientX,
        event.clientY,
      ).matrixTransform(screenMatrix.inverse());

      let x = Math.max(
        padding,
        Math.min(
          SVG_WIDTH - padding,
          svgPoint.x,
        ),
      );

      let y = Math.max(
        padding,
        Math.min(
          SVG_HEIGHT - padding,
          svgPoint.y,
        ),
      );

      if (document.viewport.snapToGrid) {
        const gridSize =
          document.viewport.gridSize || 20;

        x = Math.round(x / gridSize) * gridSize;
        y = Math.round(y / gridSize) * gridSize;

        x = Math.max(
          padding,
          Math.min(
            SVG_WIDTH - padding,
            x,
          ),
        );

        y = Math.max(
          padding,
          Math.min(
            SVG_HEIGHT - padding,
            y,
          ),
        );
      }

      return { x, y };
    },
    [
      document.viewport.snapToGrid,
      document.viewport.gridSize,
    ],
  );

  const addMechanisticArrow = useCallback(
    (start: Point, end: Point) => {
      if (!isValidMechanisticArrow(start, end)) {
        return;
      }

      const arrowType =
        document.tool.selectedArrowType;

      const arrow: Arrow = {
        ...createMechanisticArrow(
          start,
          end,
          arrowType,
        ),
        arrowHead: getArrowHeadForType(
          arrowType,
        ),
      };

      updateDocument((currentDocument) => ({
        ...currentDocument,
        objects: [
          ...currentDocument.objects.map(
            (object) => ({
              ...object,
              selected: false,
            }),
          ),
          arrow,
        ],
        selection: {
          ...currentDocument.selection,
          selectedIds: [arrow.id],
          primarySelectedId: arrow.id,
        },
      }));
    },
    [
      document.tool.selectedArrowType,
      updateDocument,
    ],
  );

  const deleteSelected = useCallback(() => {
    const selectedId =
      document.selection.primarySelectedId;

    if (!selectedId) {
      return;
    }

    const target = document.objects.find(
      (object) => object.id === selectedId,
    );

    if (!target) {
      return;
    }

    if (target.type === "atom") {
      deleteAtom(selectedId);
    } else if (target.type === "bond") {
      deleteBond(selectedId);
    } else if (target.type === "ring") {
      deleteRing(selectedId, "simple");
    } else if (target.type === "arrow") {
      deleteArrow(selectedId);
    }
  }, [
    document.selection.primarySelectedId,
    document.objects,
    deleteAtom,
    deleteBond,
    deleteRing,
    deleteArrow,
  ]);

  const handleAtomMouseDown = useCallback(
    (
      event: ReactMouseEvent<SVGGElement>,
      atomId: string,
    ) => {
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
          if (currentSelection.length === 0) {
            return [atomId];
          }

          const startAtomId = currentSelection[0];

          if (startAtomId === atomId) {
            return [];
          }

          const endAtomId = atomId;

          updateDocument((currentDocument) => {
            const startAtomExists =
              currentDocument.objects.some(
                (object): object is Atom =>
                  object.type === "atom" &&
                  object.id === startAtomId,
              );

            const endAtomExists =
              currentDocument.objects.some(
                (object): object is Atom =>
                  object.type === "atom" &&
                  object.id === endAtomId,
              );

            if (
              !startAtomExists ||
              !endAtomExists
            ) {
              return currentDocument;
            }

            const alreadyExists =
              currentDocument.objects.some(
                (object): object is Bond =>
                  object.type === "bond" &&
                  (
                    (
                      object.startAtomId ===
                        startAtomId &&
                      object.endAtomId === endAtomId
                    ) ||
                    (
                      object.startAtomId === endAtomId &&
                      object.endAtomId === startAtomId
                    )
                  ),
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

            return {
              ...currentDocument,
              objects: [
                ...currentDocument.objects,
                bond,
              ],
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
        const ringKind =
          document.tool.selectedRingKind;

        const atomPosition =
          document.objects.find(
            (object): object is Atom =>
              object.type === "atom" &&
              object.id === atomId,
          )?.position;

        createRingAtPoint(
          ringKind,
          atomPosition ?? { x: 0, y: 0 },
        );
      }
    },
    [
      document.tool.mode,
      document.tool.selectedRingKind,
      document.objects,
      updateDocument,
      deleteAtom,
      createRingAtPoint,
    ],
  );

  const handleBondClick = useCallback(
    (
      event: ReactMouseEvent<SVGGElement>,
      bondId: string,
    ) => {
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
    [
      document.tool.mode,
      deleteBond,
      updateDocument,
    ],
  );

  const handleRingClick = useCallback(
    (
      event: ReactMouseEvent<SVGGElement>,
      ringId: string,
    ) => {
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
    [
      document.tool.mode,
      deleteRing,
      updateDocument,
    ],
  );

  const handleArrowMouseDown = useCallback(
    (
      event: ReactMouseEvent<SVGGElement>,
      arrowId: string,
    ) => {
      event.stopPropagation();

      if (document.tool.mode === "erase") {
        deleteArrow(arrowId);
        return;
      }

      updateDocument((currentDocument) => ({
        ...currentDocument,
        selection: {
          ...currentDocument.selection,
          selectedIds: [arrowId],
          primarySelectedId: arrowId,
        },
      }));
    },
    [
      document.tool.mode,
      deleteArrow,
      updateDocument,
    ],
  );

  const handleCanvasMouseDown = useCallback(
    (event: ReactMouseEvent<SVGSVGElement>) => {
      if (document.tool.mode !== "add-arrow") {
        return;
      }

      if (event.target !== event.currentTarget) {
        return;
      }

      const point = getCanvasPoint(event, 8);

      if (!point) {
        return;
      }

      suppressCanvasClickRef.current = false;
      isDraggingArrowRef.current = false;

      setArrowStartPoint(point);
      setArrowCurrentPoint(point);
    },
    [
      document.tool.mode,
      getCanvasPoint,
    ],
  );

  const handleCanvasMouseMove = useCallback(
    (event: ReactMouseEvent<SVGSVGElement>) => {
      if (
        document.tool.mode === "add-arrow" &&
        arrowStartPoint
      ) {
        const point = getCanvasPoint(event, 8);

        if (!point) {
          return;
        }

        const distance = Math.hypot(
          point.x - arrowStartPoint.x,
          point.y - arrowStartPoint.y,
        );

        if (distance >= 3) {
          isDraggingArrowRef.current = true;
        }

        setArrowCurrentPoint(point);
        return;
      }

      if (
        draggingAtomId === null ||
        document.tool.mode !== "select"
      ) {
        return;
      }

      const point = getCanvasPoint(
        event,
        ATOM_RADIUS,
      );

      if (!point) {
        return;
      }

      updateDocument((currentDocument) => ({
        ...currentDocument,
        objects: currentDocument.objects.map(
          (object) =>
            object.type === "atom" &&
            object.id === draggingAtomId
              ? {
                  ...object,
                  position: point,
                }
              : object,
        ),
      }));
    },
    [
      document.tool.mode,
      arrowStartPoint,
      draggingAtomId,
      getCanvasPoint,
      updateDocument,
    ],
  );

  const handleCanvasMouseUp = useCallback(() => {
    if (
      document.tool.mode === "add-arrow" &&
      arrowStartPoint &&
      arrowCurrentPoint &&
      isDraggingArrowRef.current
    ) {
      addMechanisticArrow(
        arrowStartPoint,
        arrowCurrentPoint,
      );

      suppressCanvasClickRef.current = true;
    }

    setArrowStartPoint(null);
    setArrowCurrentPoint(null);
    setDraggingAtomId(null);
    isDraggingArrowRef.current = false;
  }, [
    document.tool.mode,
    arrowStartPoint,
    arrowCurrentPoint,
    addMechanisticArrow,
  ]);

  const handleCanvasClick = useCallback(
    (event: ReactMouseEvent<SVGSVGElement>) => {
      if (suppressCanvasClickRef.current) {
        suppressCanvasClickRef.current = false;
        return;
      }

      if (event.target !== event.currentTarget) {
        return;
      }

      if (
        document.tool.mode ===
        "add-functional-group"
      ) {
        const groupId =
          document.tool.selectedFunctionalGroup;

        if (!groupId) {
          return;
        }

        const point = getCanvasPoint(
          event,
          ATOM_RADIUS,
        );

        if (!point) {
          return;
        }

        addFunctionalGroupAtPoint(
          groupId,
          point,
        );
        return;
      }

      if (document.tool.mode === "add-ring") {
        const point = getCanvasPoint(
          event,
          RING_DEFAULT_RADIUS,
        );

        if (!point) {
          return;
        }

        createRingAtPoint(
          document.tool.selectedRingKind,
          point,
        );
        return;
      }

      if (document.tool.mode !== "add-atom") {
        if (document.tool.mode === "select") {
          clearSelection();
        }

        return;
      }

      const point = getCanvasPoint(
        event,
        ATOM_RADIUS,
      );

      if (!point) {
        return;
      }

      const atom = createAtom(
        document.tool.selectedElement,
        point,
      );

      updateDocument((currentDocument) => ({
        ...currentDocument,
        objects: [
          ...currentDocument.objects,
          atom,
        ],
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
      document.tool.selectedFunctionalGroup,
      getCanvasPoint,
      createRingAtPoint,
      addFunctionalGroupAtPoint,
      updateDocument,
      clearSelection,
    ],
  );

  const selectedObject = document.objects.find(
    (object) =>
      object.id ===
      document.selection.primarySelectedId,
  );

  const selectedAtom =
    selectedObject?.type === "atom"
      ? selectedObject
      : null;

  const selectedBond =
    selectedObject?.type === "bond"
      ? selectedObject
      : null;

  const selectedRing =
    selectedObject?.type === "ring"
      ? selectedObject
      : null;

  const selectedArrow =
    selectedObject?.type === "arrow"
      ? selectedObject
      : null;

  const selectedStartAtom = selectedBond
    ? document.objects.find(
        (object): object is Atom =>
          object.type === "atom" &&
          object.id === selectedBond.startAtomId,
      )
    : null;

  const selectedEndAtom = selectedBond
    ? document.objects.find(
        (object): object is Atom =>
          object.type === "atom" &&
          object.id === selectedBond.endAtomId,
      )
    : null;

  const cssVariables = {
    "--md-canvas-background":
      theme.canvas.background,
    "--md-grid-color": theme.canvas.grid,
    "--md-grid-strong-color":
      theme.canvas.gridStrong,
    "--md-surface-background":
      theme.surface.background,
    "--md-surface-elevated":
      theme.surface.elevated,
    "--md-border-color": theme.surface.border,
    "--md-text-primary": theme.text.primary,
    "--md-text-secondary":
      theme.text.secondary,
    "--md-text-muted": theme.text.muted,
    "--md-title-color": theme.text.title,
    "--md-bond-color":
      theme.chemistry.bondColor,
    "--md-arrow-color":
      theme.chemistry.arrowColor,
    "--md-arrow-selected-color":
      isDarkMode ? "#ff8787" : "#dc2626",
    "--md-selection-color":
      theme.chemistry.selectionColor,
    "--md-focus-color":
      theme.controls.focus,
  } as MoleculeCSSProperties;

  const atoms = document.objects.filter(
    (object): object is Atom =>
      object.type === "atom",
  );

  const bonds = document.objects.filter(
    (object): object is Bond =>
      object.type === "bond",
  );

  const rings = document.objects.filter(
    (object): object is Ring =>
      object.type === "ring",
  );

  const arrows = document.objects.filter(
    (object): object is Arrow =>
      object.type === "arrow",
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
      document.selection.primarySelectedId ===
        bond.id ||
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
        const points = getWedgePoints(
          start,
          end,
        );

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
        const lines = getHashedWedgeLines(
          start,
          end,
        );

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
        const points = getWavyPoints(
          start,
          end,
        );

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
        className={`${styles.bond} ${
          isSelected
            ? styles.bondSelected
            : ""
        }`}
        data-bond-id={bond.id}
        onClick={(event) =>
          handleBondClick(event, bond.id)
        }
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

        {renderBondShape()}
      </g>
    );
  });

  const renderedRings = rings.map((ring) => {
    const points = ring.atomIds
      .map((atomId) =>
        atoms.find(
          (atom) => atom.id === atomId,
        ),
      )
      .filter(
        (atom): atom is Atom =>
          Boolean(atom),
      )
      .map((atom) => atom.position);

    const isSelected =
      document.selection.primarySelectedId ===
      ring.id;

    if (points.length < 3) {
      return null;
    }

    const polygonPoints = points
      .map((point) => `${point.x},${point.y}`)
      .join(" ");

    const ringStroke = isSelected
      ? "var(--md-selection-color)"
      : ring.style.strokeColor;

    return (
      <g
        key={ring.id}
        onClick={(event) =>
          handleRingClick(event, ring.id)
        }
        style={{ cursor: "pointer" }}
      >
        <polygon
          points={polygonPoints}
          fill="transparent"
          stroke={ringStroke}
          strokeWidth={ring.style.strokeWidth}
          opacity={ring.style.opacity}
        />

        {ring.aromatic && (
          <circle
            cx={ring.center.x}
            cy={ring.center.y}
            r={ring.radius * 0.45}
            fill="none"
            stroke={ringStroke}
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
  const atomData =
    atom as unknown as Record<string, unknown>;

  const position =
    (
      atomData.position as
        | { x?: number; y?: number }
        | undefined
    ) ??
    (
      atomData.coordinates as
        | { x?: number; y?: number }
        | undefined
    ) ??
    (
      atomData.point as
        | { x?: number; y?: number }
        | undefined
    );

  const x =
    position?.x ??
    (atomData.cx as number | undefined) ??
    0;

  const y =
    position?.y ??
    (atomData.cy as number | undefined) ??
    0;

  const symbol =
    (atomData.element as string | undefined) ??
    (atomData.symbol as string | undefined) ??
    (atomData.label as string | undefined) ??
    "C";

  const atomPalette = getAtomPalette(
    symbol,
    "#64748B",
    "#FFFFFF"
  );

  const isSelected =
    selectedAtom?.id === atom.id;

  return (
    <g
      key={atom.id}
      transform={`translate(${x}, ${y})`}
      style={{ cursor: "pointer" }}
      onMouseDown={(event) =>
        handleAtomMouseDown(event, atom.id)
      }
    >
      {/* حلقهٔ انتخاب */}
      {isSelected && (
        <circle
          r={18}
          fill="transparent"
          stroke="var(--md-selection-stroke, #3b82f6)"
          strokeWidth={2}
          strokeDasharray="4 3"
          pointerEvents="none"
        />
      )}

      {/* دایرهٔ رنگی اتم */}
      <circle
        r={13}
        fill={atomPalette.fill}
        stroke={atomPalette.fill}
        strokeWidth={1.5}
      />

      {/* نماد عنصر */}
      <text
        x={0}
        y={1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={atomPalette.text}
        fontSize={12}
        fontWeight={700}
        pointerEvents="none"
      >
        {symbol}
      </text>
    </g>
  );
});


  const renderedArrows = arrows.map((arrow) => {
    const isSelected =
      document.selection.primarySelectedId ===
      arrow.id;

    const preset = getArrowPreset(
      arrow.arrowType,
    );

    const strokeColor = isSelected
      ? "var(--md-arrow-selected-color)"
      : "var(--md-arrow-color)";

    const strokeWidth = arrow.style.strokeWidth;
    const arrowHead =
      arrow.arrowHead ?? preset.head;

    const start = arrow.start;
    const end = arrow.end;

    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const length = Math.hypot(
      deltaX,
      deltaY,
    );

    const unitX =
      length > 0 ? deltaX / length : 1;
    const unitY =
      length > 0 ? deltaY / length : 0;

    const normalX = -unitY;
    const normalY = unitX;

    const makePoint = (
      x: number,
      y: number,
      offset = 0,
    ): Point => ({
      x: x + normalX * offset,
      y: y + normalY * offset,
    });

    const getHeadGeometryForLine = (
      from: Point,
      to: Point,
    ) => {
      const headLength = Math.max(
        10,
        strokeWidth * 4,
      );

      const headWidth = Math.max(
        7,
        strokeWidth * 2.6,
      );

      const lineDx = to.x - from.x;
      const lineDy = to.y - from.y;
      const lineLength =
        Math.hypot(lineDx, lineDy) || 1;

      const lineUnitX =
        lineDx / lineLength;
      const lineUnitY =
        lineDy / lineLength;

      const lineNormalX = -lineUnitY;
      const lineNormalY = lineUnitX;

      const baseX =
        to.x - lineUnitX * headLength;
      const baseY =
        to.y - lineUnitY * headLength;

      return {
        tip: to,
        left: {
          x: baseX + lineNormalX * headWidth,
          y: baseY + lineNormalY * headWidth,
        },
        right: {
          x: baseX - lineNormalX * headWidth,
          y: baseY - lineNormalY * headWidth,
        },
      };
    };

    const renderArrowHead = (
      from: Point,
      to: Point,
      headType: ArrowHeadType,
      key: string,
    ): ReactNode => {
      if (headType === "none") {
        return null;
      }

      const geometry =
        getHeadGeometryForLine(from, to);

      const isOpenHead =
        headType === "fishhook" ||
        headType === "half";

      const points = [
        `${geometry.left.x},${geometry.left.y}`,
        `${geometry.tip.x},${geometry.tip.y}`,
        `${geometry.right.x},${geometry.right.y}`,
      ].join(" ");

      if (isOpenHead) {
        return (
          <polyline
            key={key}
            points={points}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            pointerEvents="none"
          />
        );
      }

      return (
        <polygon
          key={key}
          points={points}
          fill={strokeColor}
          stroke={strokeColor}
          strokeWidth={1}
          strokeLinejoin="round"
          pointerEvents="none"
        />
      );
    };

    const renderLine = (
      from: Point,
      to: Point,
      key: string,
      dasharray?: string,
    ) => (
      <path
        key={key}
        d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap={arrow.style.lineCap}
        strokeLinejoin={arrow.style.lineJoin}
        strokeDasharray={dasharray}
        opacity={arrow.style.opacity}
        pointerEvents="none"
      />
    );

    const renderHitArea = (path: string) => (
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={24}
        pointerEvents="stroke"
      />
    );

    const renderSingleStraightArrow = (
      dasharray?: string,
    ) => {
      const path = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;

      return (
        <>
          {renderHitArea(path)}
          {renderLine(
            start,
            end,
            "line",
            dasharray,
          )}
          {renderArrowHead(
            start,
            end,
            arrowHead,
            "head",
          )}
        </>
      );
    };

    const renderCurvedArrow = () => {
      const path =
        getMechanisticArrowPath(arrow);

      const geometry =
        getArrowHeadGeometry(arrow);

      const isOpenHead =
        arrowHead === "fishhook" ||
        arrowHead === "half";

      const headPoints =
        getArrowHeadPoints(geometry);

      return (
        <>
          {renderHitArea(path)}

          <path
            d={path}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap={arrow.style.lineCap}
            strokeLinejoin={arrow.style.lineJoin}
            strokeDasharray={
              preset.strokeDasharray ??
              arrow.style.dashPattern?.join(" ")
            }
            opacity={arrow.style.opacity}
            pointerEvents="none"
          />

          {arrowHead === "none" ? null : isOpenHead ? (
            <polyline
              points={[
                `${geometry.left.x},${geometry.left.y}`,
                `${geometry.tip.x},${geometry.tip.y}`,
                `${geometry.right.x},${geometry.right.y}`,
              ].join(" ")}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap={arrow.style.lineCap}
              strokeLinejoin={arrow.style.lineJoin}
              pointerEvents="none"
            />
          ) : (
            <polygon
              points={headPoints}
              fill={strokeColor}
              stroke={strokeColor}
              strokeWidth={1}
              strokeLinejoin="round"
              pointerEvents="none"
            />
          )}
        </>
      );
    };

    const renderResonanceArrow = () => {
      const offset = 7;

      const topStart = makePoint(
        start.x,
        start.y,
        -offset,
      );

      const topEnd = makePoint(
        end.x,
        end.y,
        -offset,
      );

      const bottomStart = makePoint(
        start.x,
        start.y,
        offset,
      );

      const bottomEnd = makePoint(
        end.x,
        end.y,
        offset,
      );

      const hitPath =
        `M ${start.x} ${start.y} L ${end.x} ${end.y}`;

      return (
        <>
          {renderHitArea(hitPath)}

          {renderLine(
            topStart,
            topEnd,
            "resonance-top",
          )}

          {renderArrowHead(
            topStart,
            topEnd,
            "full",
            "resonance-top-head",
          )}

          {renderLine(
            bottomEnd,
            bottomStart,
            "resonance-bottom",
          )}

          {renderArrowHead(
            bottomEnd,
            bottomStart,
            "full",
            "resonance-bottom-head",
          )}
        </>
      );
    };

    const renderEquilibriumArrow = () => {
      const offset = 7;
      const shortening = Math.min(
        18,
        length * 0.2,
      );

      const topStart = makePoint(
        start.x,
        start.y,
        -offset,
      );

      const topEnd = makePoint(
        end.x - unitX * shortening,
        end.y - unitY * shortening,
        -offset,
      );

      const bottomStart = makePoint(
        start.x + unitX * shortening,
        start.y + unitY * shortening,
        offset,
      );

      const bottomEnd = makePoint(
        end.x,
        end.y,
        offset,
      );

      const hitPath =
        `M ${start.x} ${start.y} L ${end.x} ${end.y}`;

      return (
        <>
          {renderHitArea(hitPath)}

          {renderLine(
            topStart,
            topEnd,
            "equilibrium-top",
          )}

          {renderArrowHead(
            topStart,
            topEnd,
            "full",
            "equilibrium-top-head",
          )}

          {renderLine(
            bottomEnd,
            bottomStart,
            "equilibrium-bottom",
          )}

          {renderArrowHead(
            bottomEnd,
            bottomStart,
            "full",
            "equilibrium-bottom-head",
          )}
        </>
      );
    };

    const renderReversibleArrow = () => {
      const offset = 7;

      const topStart = makePoint(
        start.x,
        start.y,
        -offset,
      );

      const topEnd = makePoint(
        end.x,
        end.y,
        -offset,
      );

      const bottomStart = makePoint(
        start.x,
        start.y,
        offset,
      );

      const bottomEnd = makePoint(
        end.x,
        end.y,
        offset,
      );

      const hitPath =
        `M ${start.x} ${start.y} L ${end.x} ${end.y}`;

      return (
        <>
          {renderHitArea(hitPath)}

          {renderLine(
            topStart,
            topEnd,
            "reversible-top",
          )}

          {renderArrowHead(
            topStart,
            topEnd,
            "full",
            "reversible-top-head",
          )}

          {renderLine(
            bottomEnd,
            bottomStart,
            "reversible-bottom",
          )}

          {renderArrowHead(
            bottomEnd,
            bottomStart,
            "full",
            "reversible-bottom-head",
          )}
        </>
      );
    };

    const renderRetrosynthesisArrow = () => {
      const offset = 3.5;

      const upperStart = makePoint(
        start.x,
        start.y,
        -offset,
      );

      const upperEnd = makePoint(
        end.x,
        end.y,
        -offset,
      );

      const lowerStart = makePoint(
        start.x,
        start.y,
        offset,
      );

      const lowerEnd = makePoint(
        end.x,
        end.y,
        offset,
      );

      const hitPath =
        `M ${start.x} ${start.y} L ${end.x} ${end.y}`;

      return (
        <>
          {renderHitArea(hitPath)}

          {renderLine(
            upperStart,
            upperEnd,
            "retro-upper",
            "7 4",
          )}

          {renderLine(
            lowerStart,
            lowerEnd,
            "retro-lower",
            "7 4",
          )}

          {renderArrowHead(
            upperStart,
            upperEnd,
            "full",
            "retro-head",
          )}
        </>
      );
    };

    const renderAnnotationArrow = () => {
      const path =
        `M ${start.x} ${start.y} L ${end.x} ${end.y}`;

      return (
        <>
          {renderHitArea(path)}

          <path
            d={path}
            fill="none"
            stroke={strokeColor}
            strokeWidth={Math.max(
              1,
              strokeWidth * 0.75,
            )}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={
              preset.strokeDasharray ?? "5 5"
            }
            opacity={arrow.style.opacity}
            pointerEvents="none"
          />

          {renderArrowHead(
            start,
            end,
            "half",
            "annotation-head",
          )}
        </>
      );
    };

    let arrowContent: ReactNode;

    switch (preset.pathStyle) {
      case "straight":
        arrowContent =
          renderSingleStraightArrow();
        break;

      case "dashed":
        arrowContent =
          renderSingleStraightArrow(
            preset.strokeDasharray ?? "8 6",
          );
        break;

      case "curved":
        arrowContent = renderCurvedArrow();
        break;

      case "resonance":
        arrowContent = renderResonanceArrow();
        break;

      case "equilibrium":
        arrowContent =
          renderEquilibriumArrow();
        break;

      case "reversible":
        arrowContent =
          renderReversibleArrow();
        break;

      case "retrosynthesis":
        arrowContent =
          renderRetrosynthesisArrow();
        break;

      case "annotation":
        arrowContent =
          renderAnnotationArrow();
        break;

      default:
        arrowContent =
          renderSingleStraightArrow();
    }

    const presetLabel = preset.showLabel
      ? preset.id === "proton-transfer"
        ? "H⁺"
        : preset.id === "charge-transfer"
          ? "±"
          : preset.id ===
              "mechanistic-annotation"
            ? "مکانیسم"
            : undefined
      : undefined;

    const displayedLabel =
      arrow.label || presetLabel;

    return (
      <g
        key={arrow.id}
        data-arrow-id={arrow.id}
        onMouseDown={(event) =>
          handleArrowMouseDown(
            event,
            arrow.id,
          )
        }
      >
        {arrowContent}

        {displayedLabel && (
          <text
            x={(start.x + end.x) / 2}
            y={(start.y + end.y) / 2 - 14}
            textAnchor="middle"
            fill={strokeColor}
            fontSize={arrow.style.fontSize}
            fontFamily={arrow.style.fontFamily}
            fontWeight={700}
            pointerEvents="none"
          >
            {displayedLabel}
          </text>
        )}
      </g>
    );
  });

  const arrowPreview = useMemo(() => {
    if (
      !arrowStartPoint ||
      !arrowCurrentPoint
    ) {
      return null;
    }

    const arrowType =
      document.tool.selectedArrowType;

    const preset = getArrowPreset(
      arrowType,
    );

    const previewArrow: Arrow = {
      ...createMechanisticArrow(
        arrowStartPoint,
        arrowCurrentPoint,
        arrowType,
      ),
      arrowHead: preset.head,
    };

    const geometry =
      getArrowHeadGeometry(previewArrow);

    const isCurved =
      preset.pathStyle === "curved";

    const path = isCurved
      ? getMechanisticArrowPath(previewArrow)
      : `M ${arrowStartPoint.x} ${arrowStartPoint.y} L ${arrowCurrentPoint.x} ${arrowCurrentPoint.y}`;

    return {
      path,
      geometry,
      headPoints:
        getArrowHeadPoints(geometry),
      arrowHead: preset.head,
      strokeDasharray:
        preset.strokeDasharray,
      pathStyle: preset.pathStyle,
    };
  }, [
    arrowStartPoint,
    arrowCurrentPoint,
    document.tool.selectedArrowType,
  ]);

  const handleChargeChange = (
    charge: ChargeKind,
  ) => {
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

  const handleElectronChange = (
    electron: ElectronDisplay,
  ) => {
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

  const handleArrowChange = (
    arrowType: ArrowType,
  ) => {
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
    const handleElementChange = (element: ElementSymbol) => {
    updateDocument((currentDocument) => ({
      ...currentDocument,
      tool: {
        ...currentDocument.tool,
        selectedElement: element,
        mode: "add-atom",
      },
    }));
    setBondSelection([]);
  };

  const handleBondChange = (bondType: BondType, bondOrder: BondOrder) => {
    updateDocument((currentDocument) => ({
      ...currentDocument,
      tool: {
        ...currentDocument.tool,
        selectedBondType: bondType,
        selectedBondOrder: bondOrder,
        mode: "add-bond",
      },
    }));
    setBondSelection([]);
  };

  const handleRingChange = (ringKind: RingKind) => {
    updateDocument((currentDocument) => ({
      ...currentDocument,
      tool: {
        ...currentDocument.tool,
        selectedRingKind: ringKind,
        mode: "add-ring",
      },
    }));
    setBondSelection([]);
  };


    if (!isReady) {
    return (
      <main
        className={`${styles.application} ${
          isDarkMode ? styles.dark : styles.light
        }`}
        style={cssVariables}
      >
        <div className={styles.loading}>
          در حال بارگذاری محیط رسم مولکول...
        </div>
      </main>
    );
  }

  const selectedObjectId = document.selection.primarySelectedId;
  const selectedIds = document.selection.selectedIds;

  const applicationClassName = [
    styles.application,
    isDarkMode ? styles.dark : styles.light,
  ]
    .filter(Boolean)
    .join(" ");

  const canvasClassName = [
    styles.canvasWrapper,
    document.viewport.showGrid
      ? styles.gridVisible
      : styles.gridHidden,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main
      className={applicationClassName}
      style={cssVariables}
      data-theme={document.theme.mode}
    >
      <section className={styles.workspace}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <h1>Molecule Drawer</h1>
            <span className={styles.documentStatus}>
              {document.objects.length} شیء
            </span>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.headerButton}
              onClick={handleUndo}
              disabled={!canUndo}
              title="واگردانی"
            >
              ↶
            </button>

            <button
              type="button"
              className={styles.headerButton}
              onClick={handleRedo}
              disabled={!canRedo}
              title="انجام دوباره"
            >
              ↷
            </button>

            <button
              type="button"
              className={styles.headerButton}
              onClick={toggleGrid}
              title="نمایش/مخفی‌کردن شبکه"
            >
              {document.viewport.showGrid
                ? "مخفی‌کردن شبکه"
                : "نمایش شبکه"}
            </button>

            <button
              type="button"
              className={styles.headerButton}
              onClick={toggleSnapToGrid}
              title="چسبیدن به شبکه"
            >
              چسبیدن به شبکه:{" "}
              {document.viewport.snapToGrid ? "روشن" : "خاموش"}
            </button>

            <button
              type="button"
              className={styles.headerButton}
              onClick={toggleTheme}
              title="تغییر حالت رنگی"
            >
              {isDarkMode ? "☀️ روشن" : "🌙 تیره"}
            </button>

            <button
              type="button"
              className={`${styles.headerButton} ${styles.dangerButton}`}
              onClick={clearCanvas}
              title="پاک‌کردن بوم"
            >
              پاک‌کردن
            </button>
          </div>
        </header>

        {/* نوار ابزار افقی بالای صفحه */}
        <MoleculeToolbar
          activeMode={document.tool.mode}
          showGrid={document.viewport.showGrid}
          snapToGrid={document.viewport.snapToGrid}
          canUndo={canUndo}
          canRedo={canRedo}
          themeMode={document.theme.mode}
          onModeChange={setInteractionMode}
          onToggleGrid={toggleGrid}
          onToggleSnapToGrid={toggleSnapToGrid}
          onClearCanvas={clearCanvas}
          onToggleTheme={toggleTheme}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />

        <div className={styles.editorLayout}>
          {/* ستون کناری برای ابزارها و پنل عناصر */}
          <aside className={styles.sidebar}>
                       <MoleculeSidebar
              document={document}
              onModeChange={setInteractionMode}
              onElementChange={handleElementChange}
              onBondChange={handleBondChange}
              onRingChange={handleRingChange}
              onChargeChange={handleChargeChange}
              onElectronChange={handleElectronChange}
              onArrowChange={handleArrowChange}
              onFunctionalGroupChange={handleFunctionalGroupChange}
              onToggleGrid={toggleGrid}
              onToggleSnap={toggleSnapToGrid}
              onClearSelection={clearSelection}
            />

          </aside>

          {/* بوم اصلی SVG */}
          <section
            className={canvasClassName}
            aria-label="بوم رسم ساختار مولکولی"
          >
            <svg
              ref={svgRef}
              className={styles.canvas}
              width={SVG_WIDTH}
              height={SVG_HEIGHT}
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              role="img"
              aria-label="Molecule drawing canvas"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              onClick={handleCanvasClick}
            >
              <defs>
                <pattern
                  id="md-small-grid"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 20 0 L 0 0 0 20"
                    fill="none"
                    stroke="var(--md-grid-color)"
                    strokeWidth="0.7"
                  />
                </pattern>

                <pattern
                  id="md-large-grid"
                  width="100"
                  height="100"
                  patternUnits="userSpaceOnUse"
                >
                  <rect
                    width="100"
                    height="100"
                    fill="url(#md-small-grid)"
                  />

                  <path
                    d="M 100 0 L 0 0 0 100"
                    fill="none"
                    stroke="var(--md-grid-strong-color)"
                    strokeWidth="1"
                  />
                </pattern>

                <marker
                  id="md-preview-arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="8"
                  refY="5"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path
                    d="M 0 0 L 10 5 L 0 10 Z"
                    fill="var(--md-arrow-color)"
                  />
                </marker>
              </defs>

              {document.viewport.showGrid && (
                <rect
                  x={0}
                  y={0}
                  width={SVG_WIDTH}
                  height={SVG_HEIGHT}
                  fill="url(#md-large-grid)"
                  pointerEvents="none"
                />
              )}

              <g className={styles.ringsLayer}>{renderedRings}</g>
              <g className={styles.bondsLayer}>{renderedBonds}</g>
              <g className={styles.arrowsLayer}>{renderedArrows}</g>
              <g className={styles.atomsLayer}>{renderedAtoms}</g>

              {arrowPreview && (
                <g className={styles.arrowPreview} pointerEvents="none">
                  {arrowPreview.pathStyle === "curved" ? (
                    <path
                      d={arrowPreview.path}
                      fill="none"
                      stroke="var(--md-arrow-color)"
                      strokeWidth={2}
                      strokeDasharray="6 5"
                      strokeLinecap="round"
                      markerEnd="url(#md-preview-arrowhead)"
                      opacity={0.8}
                    />
                  ) : (
                    <>
                      <path
                        d={arrowPreview.path}
                        fill="none"
                        stroke="var(--md-arrow-color)"
                        strokeWidth={2}
                        strokeDasharray="6 5"
                        strokeLinecap="round"
                        markerEnd="url(#md-preview-arrowhead)"
                        opacity={0.8}
                      />

                      {arrowPreview.arrowHead !== "none" && (
                        <polygon
                          points={arrowPreview.headPoints}
                          fill="var(--md-arrow-color)"
                          opacity={0.8}
                        />
                      )}
                    </>
                  )}
                </g>
              )}

              {selectedIds.length > 0 && (
                <text
                  x={20}
                  y={SVG_HEIGHT - 20}
                  className={styles.selectionInfo}
                  fill="var(--md-text-muted)"
                  fontSize={12}
                  pointerEvents="none"
                >
                  انتخاب‌شده: {selectedIds.length}
                </text>
              )}
            </svg>

            <div className={styles.canvasHint}>
              {document.tool.mode === "add-arrow"
                ? "برای رسم فلش، روی بوم کلیک کرده و بکشید."
                : document.tool.mode === "add-atom"
                  ? "برای افزودن اتم روی بوم کلیک کنید."
                  : document.tool.mode === "add-bond"
                    ? "دو اتم را به‌ترتیب انتخاب کنید."
                    : "ابزار موردنظر را از نوار ابزار انتخاب کنید."}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
