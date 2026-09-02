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
  PointerEvent as ReactPointerEvent,
  MouseEvent as ReactMouseEvent,
} from "react";

import { createInitialDocument } from "./chemistry/initialState";
import { createAtom, createBond } from "./chemistry/factories";
import {
  applyChargeToAtom,
  applyElectronToAtom,
} from "./chemistry/chargeUtils";

import {
  createMechanisticArrow,
  isValidMechanisticArrow,
  getArrowHeadGeometry,
  getArrowHeadPoints,
  getMechanisticArrowPath,
} from "./chemistry/mechanisticArrow";

import type { Point } from "./chemistry/shapeUtils";
import { getTheme } from "./theme";

import MoleculeToolbar from "./MoleculeToolbar";
import MoleculeSidebar, {
  type ReactionOperatorKind,
} from "./MoleculeSidebar";

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
  BrushStroke,
  ChargeKind,
  ElectronDisplay,
  ElementSymbol,
  InteractionMode,
  MechanismDocument,
  Ring,
  RingKind,
  StyleConfiguration,
  TextObject,
  TextSegment,
  ThemeState,
} from "./types";

import { renderBonds } from "./chemistry/renderBonds";
import { renderRings } from "./chemistry/renderRings";
import { renderArrows } from "./chemistry/renderArrows";
import { renderAtoms } from "./chemistry/renderAtoms";
import { CanvasDefs } from "./chemistry/CanvasDefs";
import { renderArrowPreview } from "./chemistry/renderArrowPreview";
import BrushLayer from "./chemistry/brush/BrushLayer";
import {
  DEFAULT_BRUSH_COLOR,
  DEFAULT_BRUSH_STROKE_WIDTH,
  DEFAULT_BRUSH_OPACITY,
  type BrushPath,
} from "./chemistry/brush/types";

import styles from "./MoleculeDrawer.module.css";

import {
  DEFAULT_TEXT_TOOL_SETTINGS,
  TEXT_COLORS,
  TEXT_SIZES,
  resolveFontFamily,
  type TextToolSettingsValue,
} from "./chemistry/text-tool/types";

// تابع یافتن تمام اتم‌های متصل به یکدیگر در یک مولکول یا حلقه
function getConnectedAtomIds(
  startAtomId: string,
  objects: MechanismDocument["objects"],
): Set<string> {
  const connected = new Set<string>([startAtomId]);
  const queue = [startAtomId];

  const bonds = objects.filter((obj): obj is Bond => obj.type === "bond");

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    for (const bond of bonds) {
      if (bond.startAtomId === currentId && !connected.has(bond.endAtomId)) {
        connected.add(bond.endAtomId);
        queue.push(bond.endAtomId);
      } else if (bond.endAtomId === currentId && !connected.has(bond.startAtomId)) {
        connected.add(bond.startAtomId);
        queue.push(bond.startAtomId);
      }
    }
  }

  return connected;
}


const STORAGE_KEY = "molecule-drawer-document";

const SVG_WIDTH = 1200;
const SVG_HEIGHT = 800;
const ATOM_RADIUS = 18;
const RING_DEFAULT_RADIUS = 54;

const REACTION_OPERATOR_TEXT: Record<ReactionOperatorKind, string> = {
  plus: "+",
  heat: "Δ",
  light: "hν",
  bracket: "[ ]‡",
  "equilibrium-constant": "K",
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

    const parsedDocument = JSON.parse(savedDocument) as MechanismDocument;

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

  const [brushPaths, setBrushPaths] = useState<BrushPath[]>([]);
  const [activeBrushPath, setActiveBrushPath] = useState<BrushPath | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [bondSelection, setBondSelection] = useState<string[]>([]);
  const [arrowStartPoint, setArrowStartPoint] = useState<Point | null>(null);
  const [arrowCurrentPoint, setArrowCurrentPoint] = useState<Point | null>(null);
  const [draggingAtomId, setDraggingAtomId] = useState<string | null>(null);
  const [textToolSettings, setTextToolSettings] =
    useState<TextToolSettingsValue>(DEFAULT_TEXT_TOOL_SETTINGS);
  const [pendingOperatorText, setPendingOperatorText] = useState<string | null>(
    null,
  );

  const isDrawingBrushRef = useRef(false);
  const isDraggingArrowRef = useRef(false);
  const suppressCanvasClickRef = useRef(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const lastDragPointRef = useRef<Point | null>(null);

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
      if (mode !== "add-text") {
        setPendingOperatorText(null);
      }

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

  const handleOperatorSelect = useCallback(
    (operator: ReactionOperatorKind) => {
      setPendingOperatorText(REACTION_OPERATOR_TEXT[operator]);
      setInteractionMode("add-text");
    },
    [setInteractionMode],
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
    (ringId: string, mode: RingDeleteMode = "simple") => {
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
        objects: currentDocument.objects.filter((object) => object.id !== arrowId),
        selection: {
          ...currentDocument.selection,
          selectedIds: currentDocument.selection.selectedIds.filter(
            (id) => id !== arrowId,
          ),
          primarySelectedId:
            currentDocument.selection.primarySelectedId === arrowId
              ? null
              : currentDocument.selection.primarySelectedId,
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
        const instantiated = instantiateFunctionalGroup(group, position);
        const atomIdMap = new Map<string, string>();

        const newAtoms: Atom[] = instantiated.atoms.map((item) => {
          const atom = createAtom(item.element, item.position);
          atomIdMap.set(item.key, atom.id);
          return atom;
        });

        const newBonds: Bond[] = instantiated.bonds
          .map((item) => {
            const startAtomId = atomIdMap.get(item.fromKey);
            const endAtomId = atomIdMap.get(item.toKey);

            if (!startAtomId || !endAtomId) {
              return null;
            }

            return createBond(startAtomId, endAtomId, "single", item.order);
          })
          .filter((bond): bond is Bond => bond !== null);

        return {
          ...currentDocument,
          objects: [...currentDocument.objects, ...newAtoms, ...newBonds],
          selection: {
            ...currentDocument.selection,
            selectedIds: newAtoms.map((atom) => atom.id),
            primarySelectedId: newAtoms[0]?.id ?? null,
          },
        };
      });
    },
    [updateDocument],
  );
  const getCanvasPoint = useCallback(
    (
      event: ReactPointerEvent<SVGSVGElement> | ReactMouseEvent<SVGSVGElement>,
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

      let x = Math.max(padding, Math.min(SVG_WIDTH - padding, svgPoint.x));
      let y = Math.max(padding, Math.min(SVG_HEIGHT - padding, svgPoint.y));

      if (document.viewport.snapToGrid) {
        const gridSize = document.viewport.gridSize || 20;

        x = Math.round(x / gridSize) * gridSize;
        y = Math.round(y / gridSize) * gridSize;

        x = Math.max(padding, Math.min(SVG_WIDTH - padding, x));
        y = Math.max(padding, Math.min(SVG_HEIGHT - padding, y));
      }

      return { x, y };
    },
    [document.viewport.snapToGrid, document.viewport.gridSize],
  );

  const addMechanisticArrow = useCallback(
    (start: Point, end: Point) => {
      if (!isValidMechanisticArrow(start, end)) {
        return;
      }

      const arrowType = document.tool.selectedArrowType;

      const arrow: Arrow = {
        ...createMechanisticArrow(start, end, arrowType),
        arrowHead: getArrowHeadForType(arrowType),
      };

      updateDocument((currentDocument) => ({
        ...currentDocument,
        objects: [
          ...currentDocument.objects.map((object) => ({
            ...object,
            selected: false,
          })),
          arrow,
        ],
        selection: {
          ...currentDocument.selection,
          selectedIds: [arrow.id],
          primarySelectedId: arrow.id,
        },
      }));
    },
    [document.tool.selectedArrowType, updateDocument],
  );

    const handleAtomPointerDown = useCallback(
    (event: ReactPointerEvent<SVGGElement>, atomId: string) => {
      event.stopPropagation();

      // ۱. حالت پاک‌کن
      if (document.tool.mode === "erase") {
        deleteAtom(atomId);
        return;
      }

      // ۲. حالت انتخاب و جابه‌جایی
           // ۲. حالت انتخاب و شروع جابه‌جایی اتم/حلقه
      if (document.tool.mode === "select") {
        const atom = document.objects.find(
          (obj): obj is Atom => obj.type === "atom" && obj.id === atomId,
        );

        if (atom) {
          setDraggingAtomId(atomId);
          lastDragPointRef.current = { ...atom.position };
        }

        try {
          (event.currentTarget as Element).setPointerCapture(event.pointerId);
        } catch {}

        updateDocument((currentDocument) => ({
          ...currentDocument,
          selection: {
            ...currentDocument.selection,
            selectedIds: [atomId],
            primarySelectedId: atomId,
          },
        }));
        return;
      }


      // ۳. حالت ساخت پیوند (حل باگ اصلی)
      if (document.tool.mode === "add-bond") {
        if (bondSelection.length === 0) {
          // انتخاب اتم اول
          setBondSelection([atomId]);
        } else if (bondSelection[0] === atomId) {
          // اگر روی همان اتم دوباره کلیک کرد، لغو انتخاب
          setBondSelection([]);
        } else {
          // انتخاب اتم دوم و ساخت پیوند
          const startAtomId = bondSelection[0];
          const endAtomId = atomId;

          const bondType = document.tool.selectedBondType || "single";
          const bondOrder = document.tool.selectedBondOrder || 1;

          updateDocument((currentDocument) => {
            // جلوگیری از ساخت پیوند تکراری بین دو اتم
            const exists = currentDocument.objects.some(
  (obj): obj is Bond =>
    obj.type === "bond" &&
    ((obj.startAtomId === startAtomId && obj.endAtomId === endAtomId) ||
      (obj.startAtomId === endAtomId && obj.endAtomId === startAtomId)),
);

            if (exists) {
              return currentDocument;
            }

            const newBond = createBond(
              startAtomId,
              endAtomId,
              bondType,
              bondOrder,
            );

            return {
              ...currentDocument,
              objects: [...currentDocument.objects, newBond],
              selection: {
                ...currentDocument.selection,
                selectedIds: [newBond.id],
                primarySelectedId: newBond.id,
              },
            };
          });

          // ریست کردن انتخاب بعد از تشکیل پیوند
          setBondSelection([]);
        }
        return;
      }

      // ۴. حالت افزودن بار الکتریکی
      if (document.tool.mode === "add-charge") {
        updateDocument((currentDoc) => {
          const targetAtom = currentDoc.objects.find(
            (object): object is Atom =>
              object.type === "atom" && object.id === atomId,
          );

          if (!targetAtom) {
            return currentDoc;
          }

          const updatedAtom = applyChargeToAtom(
            targetAtom,
            currentDoc.tool.selectedCharge,
          );

          return {
            ...currentDoc,
            objects: currentDoc.objects.map((object) =>
              object.id === atomId ? updatedAtom : object,
            ),
          };
        });
        return;
      }

      // ۵. حالت افزودن الکترون
      if (document.tool.mode === "add-electron") {
        updateDocument((currentDoc) => {
          const targetAtom = currentDoc.objects.find(
            (object): object is Atom =>
              object.type === "atom" && object.id === atomId,
          );

          if (!targetAtom) {
            return currentDoc;
          }

          const updatedAtom = applyElectronToAtom(
            targetAtom,
            currentDoc.tool.selectedElectronDisplay,
          );

          return {
            ...currentDoc,
            objects: currentDoc.objects.map((object) =>
              object.id === atomId ? updatedAtom : object,
            ),
          };
        });
        return;
      }

      // ۶. حالت الحاق حلقه به اتم
      if (document.tool.mode === "add-ring") {
        const ringKind = document.tool.selectedRingKind;
        const atomPosition = document.objects.find(
          (object): object is Atom =>
            object.type === "atom" && object.id === atomId,
        )?.position;

        createRingAtPoint(ringKind, atomPosition ?? { x: 0, y: 0 });
        return;
      }

      // انتخاب پیش‌فرض برای بقیه حالت‌ها
      updateDocument((currentDocument) => ({
        ...currentDocument,
        selection: {
          ...currentDocument.selection,
          selectedIds: [atomId],
          primarySelectedId: atomId,
        },
      }));
    },
    [
      document.tool.mode,
      document.tool.selectedBondType,
      document.tool.selectedBondOrder,
      document.tool.selectedRingKind,
      document.objects,
      bondSelection,
      updateDocument,
      deleteAtom,
      createRingAtPoint,
    ],
  );


  const handleBondPointerDown = useCallback(
    (event: ReactPointerEvent<SVGGElement>, bondId: string) => {
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

  const handleRingPointerDown = useCallback(
    (event: ReactPointerEvent<SVGGElement>, ringId: string) => {
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

  const handleArrowPointerDown = useCallback(
    (event: ReactPointerEvent<SVGGElement>, arrowId: string) => {
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
    [document.tool.mode, deleteArrow, updateDocument],
  );

  const handleCanvasPointerDown = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      if (document.tool.mode === "brush") {
        const point = getCanvasPoint(event, 0);

        if (!point) {
          return;
        }

        try {
          (event.currentTarget as Element).setPointerCapture(event.pointerId);
        } catch {}

        event.preventDefault();

        const path: BrushPath = {
          id: crypto.randomUUID(),
          points: [point],
          color: DEFAULT_BRUSH_COLOR,
          strokeWidth: DEFAULT_BRUSH_STROKE_WIDTH,
          opacity: DEFAULT_BRUSH_OPACITY,
        };

        isDrawingBrushRef.current = true;
        setActiveBrushPath(path);
        return;
      }

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

      try {
        (event.currentTarget as Element).setPointerCapture(event.pointerId);
      } catch {}

      suppressCanvasClickRef.current = false;
      isDraggingArrowRef.current = false;

      setArrowStartPoint(point);
      setArrowCurrentPoint(point);
    },
    [document.tool.mode, getCanvasPoint],
  );

   const handleCanvasPointerMove = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>) => {
      const coords = getCanvasPoint(e, 0);
      if (!coords) return;

      // منطق جابه‌جایی گروهی حلقه و اتم‌های متصل
      if (
        document.tool.mode === "select" &&
        draggingAtomId &&
        lastDragPointRef.current
      ) {
        const dx = coords.x - lastDragPointRef.current.x;
        const dy = coords.y - lastDragPointRef.current.y;

        if (dx !== 0 || dy !== 0) {
          const connectedIds = getConnectedAtomIds(
            draggingAtomId,
            document.objects,
          );

          updateDocument((currentDoc) => ({
            ...currentDoc,
            objects: currentDoc.objects.map((obj) => {
              if (obj.type === "atom" && connectedIds.has(obj.id)) {
                return {
                  ...obj,
                  position: {
                    x: obj.position.x + dx,
                    y: obj.position.y + dy,
                  },
                };
              }
              if (
                obj.type === "ring" &&
                obj.atomIds.some((id) => connectedIds.has(id))
              ) {
                return {
                  ...obj,
                  center: {
                    x: obj.center.x + dx,
                    y: obj.center.y + dy,
                  },
                };
              }
              return obj;
            }),
          }));

          lastDragPointRef.current = coords;
        }
        return;
      }

      if (document.tool.mode === "brush" && isDrawingBrushRef.current) {
        setActiveBrushPath((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            points: [...prev.points, coords],
          };
        });
        return;
      }

      if (document.tool.mode === "add-arrow" && arrowStartPoint) {
        isDraggingArrowRef.current = true;
        setArrowCurrentPoint(coords);
      }
    },
    [
      document.tool.mode,
      draggingAtomId,
      document.objects,
      arrowStartPoint,
      getCanvasPoint,
      updateDocument,
    ],
  );


  const handleCanvasPointerUp = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>) => {
      try {
        if ((e.currentTarget as Element).hasPointerCapture(e.pointerId)) {
          (e.currentTarget as Element).releasePointerCapture(e.pointerId);
        }
      } catch {}

      if (document.tool.mode === "brush" && isDrawingBrushRef.current) {
        isDrawingBrushRef.current = false;

        if (activeBrushPath && activeBrushPath.points.length > 0) {
          const stroke: BrushStroke = {
            id: activeBrushPath.id || `brush-${Date.now()}`,
            type: "brush-stroke",
            points: activeBrushPath.points,
            smoothPath: "",
            brushPreset: "pen" as any,
            eraser: false,
            selected: false,
            locked: false,
            visible: true,
            zIndex: 1,
            style: {
              color: activeBrushPath.color || DEFAULT_BRUSH_COLOR,
              fillColor: "none",
              strokeColor: activeBrushPath.color || DEFAULT_BRUSH_COLOR,
              strokeWidth: activeBrushPath.strokeWidth || DEFAULT_BRUSH_STROKE_WIDTH,
              opacity: activeBrushPath.opacity ?? DEFAULT_BRUSH_OPACITY,
              fontSize: 14,
              fontFamily: "inherit",
              scale: 1,
              rotation: 0,
              dashPattern: [],
              lineCap: "round",
              lineJoin: "round",
              visible: true,
            },
          };

          updateDocument((currentDocument) => ({
            ...currentDocument,
            objects: [...currentDocument.objects, stroke],
          }));
        }

        setActiveBrushPath(null);
        return;
      }

      if (
        document.tool.mode === "add-arrow" &&
        arrowStartPoint &&
        arrowCurrentPoint &&
        isDraggingArrowRef.current
      ) {
        addMechanisticArrow(arrowStartPoint, arrowCurrentPoint);
        suppressCanvasClickRef.current = true;
      }
      setArrowStartPoint(null);
      setArrowCurrentPoint(null);
      setDraggingAtomId(null);
      lastDragPointRef.current = null; // 👈 این خط اضافه شود
      isDraggingArrowRef.current = false;

    },
    [
      document.tool.mode,
      arrowStartPoint,
      arrowCurrentPoint,
      activeBrushPath,
      addMechanisticArrow,
      updateDocument,
    ],
  );

  const handleCanvasClick = useCallback(
    (event: ReactMouseEvent<SVGSVGElement>) => {
      if (suppressCanvasClickRef.current) {
        suppressCanvasClickRef.current = false;
        return;
      }

      if (event.target !== event.currentTarget) {
        return;
      }

      const point = getCanvasPoint(event, 8);

      if (!point) {
        return;
      }

      if (document.tool.mode === "add-text") {
        let enteredText = pendingOperatorText;

        if (!enteredText) {
          const promptInput = window.prompt("متن موردنظر را وارد کنید:", "متن");

          if (!promptInput?.trim()) {
            return;
          }

          enteredText = promptInput.trim();
        }

        const dynamicFont = resolveFontFamily(enteredText);

        const textObject: TextObject = {
          id: crypto.randomUUID(),
          type: "text",
          selected: false,
          locked: false,
          visible: true,
          zIndex: 0,
          position: point,
          segments: [
            {
              id: crypto.randomUUID(),
              text: enteredText,
              mode: "normal",
              semanticType: "normal",
            },
          ],
          fontWeight: "normal",
          fontStyle: "normal",
          alignment: "middle",
          editable: true,
          rotation: 0,
          style: {
            color: TEXT_COLORS[textToolSettings.color],
            fillColor: "transparent",
            strokeColor: "transparent",
            strokeWidth: 0,
            opacity: 1,
            visible: true,
            fontSize: TEXT_SIZES[textToolSettings.size],
            fontFamily: dynamicFont,
            scale: 1,
            rotation: 0,
            dashPattern: [],
            lineCap: "round",
            lineJoin: "round",
          },
        };

        if (pendingOperatorText) {
          setPendingOperatorText(null);
        }

        updateDocument((currentDocument) => ({
          ...currentDocument,
          objects: [...currentDocument.objects, textObject],
          selection: {
            ...currentDocument.selection,
            selectedIds: [textObject.id],
            primarySelectedId: textObject.id,
          },
        }));

        return;
      }

      if (document.tool.mode === "add-functional-group") {
        const groupId = document.tool.selectedFunctionalGroup;

        if (!groupId) {
          return;
        }

        const fgPoint = getCanvasPoint(event, ATOM_RADIUS);

        if (!fgPoint) {
          return;
        }

        addFunctionalGroupAtPoint(groupId, fgPoint);
        return;
      }

      if (document.tool.mode === "add-ring") {
        const ringPoint = getCanvasPoint(event, RING_DEFAULT_RADIUS);

        if (!ringPoint) {
          return;
        }

        createRingAtPoint(document.tool.selectedRingKind, ringPoint);
        return;
      }

      if (document.tool.mode !== "add-atom") {
        if (document.tool.mode === "select") {
          clearSelection();
        }
        return;
      }

      const atomPoint = getCanvasPoint(event, ATOM_RADIUS);

      if (!atomPoint) {
        return;
      }

      const atom = createAtom(document.tool.selectedElement, atomPoint);

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
      document.tool.selectedFunctionalGroup,
      pendingOperatorText,
      textToolSettings,
      getCanvasPoint,
      createRingAtPoint,
      addFunctionalGroupAtPoint,
      updateDocument,
      clearSelection,
    ],
  );

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
    "--md-arrow-selected-color": isDarkMode ? "#ff8787" : "#dc2626",
    "--md-selection-color": theme.chemistry.selectionColor,
    "--md-focus-color": theme.controls.focus,
  } as MoleculeCSSProperties;

  const atoms = useMemo(
    () =>
      document.objects.filter((object): object is Atom => object.type === "atom"),
    [document.objects],
  );

  const bonds = useMemo(
    () =>
      document.objects.filter((object): object is Bond => object.type === "bond"),
    [document.objects],
  );

  const rings = useMemo(
    () =>
      document.objects.filter((object): object is Ring => object.type === "ring"),
    [document.objects],
  );

  const arrows = useMemo(
    () =>
      document.objects.filter((object): object is Arrow => object.type === "arrow"),
    [document.objects],
  );

  const texts = useMemo(
    () =>
      document.objects.filter((object): object is TextObject => object.type === "text"),
    [document.objects],
  );

  const renderedBonds = renderBonds({
    bonds,
    atoms,
    primarySelectedId: document.selection.primarySelectedId,
    bondSelection,
    onBondClick: handleBondPointerDown as any,
    styles,
  });

  const renderedRings = renderRings({
    rings,
    atoms,
    primarySelectedId: document.selection.primarySelectedId,
    onRingClick: handleRingPointerDown as any,
  });

  const renderedAtoms = renderAtoms({
    atoms,
    selectedAtomId: document.selection.primarySelectedId,
    onAtomMouseDown: handleAtomPointerDown as any,
    atomRadius: ATOM_RADIUS,
  });

  const renderedArrows = renderArrows({
    arrows,
    primarySelectedId: document.selection.primarySelectedId,
    onArrowMouseDown: handleArrowPointerDown as any,
  });

  const arrowPreview = useMemo(() => {
    if (!arrowStartPoint || !arrowCurrentPoint) {
      return null;
    }

    const arrowType = document.tool.selectedArrowType;
    const preset = getArrowPreset(arrowType);

    const previewArrow: Arrow = {
      ...createMechanisticArrow(arrowStartPoint, arrowCurrentPoint, arrowType),
      arrowHead: preset.head,
    };

    const geometry = getArrowHeadGeometry(previewArrow);
    const isCurved = preset.pathStyle === "curved";

    const path = isCurved
      ? getMechanisticArrowPath(previewArrow)
      : `M ${arrowStartPoint.x} ${arrowStartPoint.y} L ${arrowCurrentPoint.x} ${arrowCurrentPoint.y}`;

    return {
      path,
      headPoints: getArrowHeadPoints(geometry),
      arrowHead: preset.head,
      pathStyle: preset.pathStyle,
    };
  }, [arrowStartPoint, arrowCurrentPoint, document.tool.selectedArrowType]);

  const handleChargeChange = (charge: ChargeKind) => {
    const delta = charge.startsWith("+")
      ? 1
      : charge.startsWith("-")
        ? -1
        : 0;

    updateDocument((currentDocument) => ({
      ...currentDocument,
      tool: {
        ...currentDocument.tool,
        selectedCharge: charge,
        selectedChargeDelta: delta,
        mode: "add-charge",
      },
    }));

    setBondSelection([]);
  };

  const handleElectronChange = (display: ElectronDisplay) => {
    updateDocument((currentDocument) => ({
      ...currentDocument,
      tool: {
        ...currentDocument.tool,
        selectedElectronDisplay: display,
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

  const handleFunctionalGroupChange = (groupId: string) => {
    updateDocument((currentDocument) => ({
      ...currentDocument,
      tool: {
        ...currentDocument.tool,
        selectedFunctionalGroup: groupId,
        mode: "add-functional-group",
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
        <div className={styles.loading}>در حال بارگذاری محیط رسم مولکول...</div>
      </main>
    );
  }

  const selectedIds = document.selection.selectedIds;

  const applicationClassName = [
    styles.application,
    isDarkMode ? styles.dark : styles.light,
  ]
    .filter(Boolean)
    .join(" ");

  const canvasClassName = [
    styles.canvasWrapper,
    document.viewport.showGrid ? styles.gridVisible : styles.gridHidden,
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
              {document.updatedAt
                ? `آخرین تغییر: ${new Date(
                    document.updatedAt,
                  ).toLocaleTimeString("fa-IR")}`
                : "آماده رسم"}
            </span>
          </div>

          <div className={styles.headerControls}>
            <button
              type="button"
              className={styles.headerButton}
              onClick={toggleGrid}
              title="نمایش یا مخفی‌کردن شبکه"
            >
              {document.viewport.showGrid ? "مخفی‌کردن شبکه" : "نمایش شبکه"}
            </button>

            <button
              type="button"
              className={styles.headerButton}
              onClick={toggleSnapToGrid}
              title="چسبیدن به شبکه"
            >
              چسبیدن به شبکه: {document.viewport.snapToGrid ? "روشن" : "خاموش"}
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
          textToolSettings={textToolSettings}
          onTextToolSettingsChange={setTextToolSettings}
        />

        <div className={styles.editorLayout}>
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
              onOperatorSelect={handleOperatorSelect}
              onToggleGrid={toggleGrid}
              onToggleSnap={toggleSnapToGrid}
              onClearSelection={clearSelection}
            />
          </aside>

          <section className={canvasClassName} aria-label="بوم رسم ساختار مولکولی">
            <svg
              ref={svgRef}
              className={styles.canvas}
              width={SVG_WIDTH}
              height={SVG_HEIGHT}
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              role="img"
              aria-label="Molecule drawing canvas"
              style={{ touchAction: "none" }}
              onPointerDown={handleCanvasPointerDown}
              onPointerMove={handleCanvasPointerMove}
              onPointerUp={handleCanvasPointerUp}
              onPointerCancel={handleCanvasPointerUp}
              onClick={handleCanvasClick}
            >
              <CanvasDefs />

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

              <g className={styles.textLayer}>
                {texts.map((textObject) => {
                  const isSelected =
                    document.selection.primarySelectedId === textObject.id;

                  const textContent = textObject.segments
                    .map((segment) => segment.text)
                    .join("");

                  const textColor =
                    textObject.style.color || "var(--md-text-primary)";

                  const finalFontFamily =
                    textObject.style.fontFamily || resolveFontFamily(textContent);

                  return (
                    <text
                      key={textObject.id}
                      x={textObject.position.x}
                      y={textObject.position.y}
                      fill={textColor}
                      fontSize={textObject.style.fontSize}
                      fontFamily={finalFontFamily}
                      fontWeight={textObject.fontWeight}
                      fontStyle={textObject.fontStyle}
                      opacity={textObject.style.opacity}
                      textAnchor={textObject.alignment}
                      dominantBaseline="middle"
                      pointerEvents="all"
                      style={{
                        cursor:
                          document.tool.mode === "erase"
                            ? "not-allowed"
                            : "pointer",
                        userSelect: "none",
                      }}
                      stroke={isSelected ? "var(--md-selection-color)" : "none"}
                      strokeWidth={isSelected ? 2 : 0}
                      onClick={(event) => {
                        event.stopPropagation();

                        if (document.tool.mode === "erase") {
                          updateDocument((currentDocument) => ({
                            ...currentDocument,
                            objects: currentDocument.objects.filter(
                              (object) => object.id !== textObject.id,
                            ),
                            selection: {
                              ...currentDocument.selection,
                              selectedIds: [],
                              primarySelectedId: null,
                            },
                          }));

                          return;
                        }

                        updateDocument((currentDocument) => ({
                          ...currentDocument,
                          selection: {
                            ...currentDocument.selection,
                            selectedIds: [textObject.id],
                            primarySelectedId: textObject.id,
                          },
                        }));
                      }}
                    >
                      {textContent}
                    </text>
                  );
                })}
              </g>

              {renderArrowPreview({
                preview: arrowPreview,
                className: styles.arrowPreview,
              })}

              <BrushLayer
                paths={document.objects
                  .filter((obj): obj is BrushStroke => obj.type === "brush-stroke")
                  .map((stroke) => ({
                    id: stroke.id,
                    points: stroke.points,
                    color: stroke.style.strokeColor || stroke.style.color || "#000000",
                    strokeWidth: stroke.style.strokeWidth || 3,
                    opacity: stroke.style.opacity ?? 1,
                  }))}
                activePath={activeBrushPath}
                eraserMode={document.tool.mode === "erase"}
                onDeletePath={(id) => {
                  updateDocument((current) => ({
                    ...current,
                    objects: current.objects.filter((obj) => obj.id !== id),
                  }));
                }}
              />

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
              {document.tool.mode === "brush"
                ? "برای رسم آزاد، با قلم یا ماوس روی بوم بکشید."
                : document.tool.mode === "add-arrow"
                  ? "برای رسم فلش مکانیسمی، روی بوم لمس کرده و بکشید."
                  : document.tool.mode === "add-text"
                    ? pendingOperatorText
                      ? `عملگر «${pendingOperatorText}» انتخاب شده است. روی بوم کلیک کنید تا درج شود.`
                      : "برای درج متن روی بوم کلیک کنید."
                    : document.tool.mode === "add-atom"
                      ? "برای افزودن اتم روی بوم کلیک کنید."
                      : document.tool.mode === "add-bond"
                        ? "دو اتم را به‌ترتیب انتخاب کنید."
                        : document.tool.mode === "add-charge"
                          ? "روی اتم مورد نظر کلیک کنید تا بار الکتریکی اعمال شود."
                          : document.tool.mode === "add-electron"
                            ? "روی اتم مورد نظر کلیک کنید تا الکترون اعمال شود."
                            : `ابزار فعلی: ${document.tool.mode}`}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
