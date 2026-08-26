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
} from "react";

import { createInitialDocument } from "./chemistry/initialState";
import { createAtom, createBond } from "./chemistry/factories";
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
  getFunctionalGroup,
  instantiateFunctionalGroup,
} from "./chemistry/functionalGroups";

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
      if (!group) return;

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

            if (!startAtomId || !endAtomId) return null;

            return createBond(
              startAtomId,
              endAtomId,
              "single",
              item.order,
            );
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
          if (currentSelection.length === 0) {
            return [atomId];
          }

          const startAtomId = currentSelection[0];

          if (startAtomId === atomId) {
            return [];
          }

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

            return {
              ...currentDocument,
              objects: [...currentDocument.objects, bond],
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
          (object): object is Atom =>
            object.type === "atom" && object.id === atomId,
        )?.position;

        createRingAtPoint(ringKind, atomPosition ?? { x: 0, y: 0 });
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

  const getCanvasPoint = useCallback(
    (
      event: ReactMouseEvent<SVGSVGElement>,
      padding: number,
    ): Point | null => {
      const svg = svgRef.current;
      if (!svg) return null;

      const screenMatrix = svg.getScreenCTM();
      if (!screenMatrix) return null;

      const svgPoint = new DOMPoint(
        event.clientX,
        event.clientY,
      ).matrixTransform(screenMatrix.inverse());

      let x = Math.max(
        padding,
        Math.min(SVG_WIDTH - padding, svgPoint.x),
      );

      let y = Math.max(
        padding,
        Math.min(SVG_HEIGHT - padding, svgPoint.y),
      );

      if (document.viewport.snapToGrid) {
        const gridSize = document.viewport.gridSize || 20;

        x = Math.round(x / gridSize) * gridSize;
        y = Math.round(y / gridSize) * gridSize;

        x = Math.max(
          padding,
          Math.min(SVG_WIDTH - padding, x),
        );

        y = Math.max(
          padding,
          Math.min(SVG_HEIGHT - padding, y),
        );
      }

      return { x, y };
    },
    [
      document.viewport.snapToGrid,
      document.viewport.gridSize,
    ],
  );

  const handleCanvasMouseMove = useCallback(
    (event: ReactMouseEvent<SVGSVGElement>) => {
      if (
        draggingAtomId === null ||
        document.tool.mode !== "select"
      ) {
        return;
      }

      const point = getCanvasPoint(event, ATOM_RADIUS);
      if (!point) return;

      updateDocument((currentDocument) => ({
        ...currentDocument,
        objects: currentDocument.objects.map((object) =>
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
      draggingAtomId,
      document.tool.mode,
      getCanvasPoint,
      updateDocument,
    ],
  );

  const handleCanvasMouseUp = useCallback(() => {
    setDraggingAtomId(null);
  }, []);

  const handleCanvasClick = useCallback(
    (event: ReactMouseEvent<SVGSVGElement>) => {
      if (event.target !== event.currentTarget) {
        return;
      }

      if (document.tool.mode === "add-functional-group") {
        const groupId = document.tool.selectedFunctionalGroup;
        if (!groupId) return;

        const point = getCanvasPoint(event, ATOM_RADIUS);
        if (!point) return;

        addFunctionalGroupAtPoint(groupId, point);
        return;
      }

      if (document.tool.mode === "add-ring") {
        const point = getCanvasPoint(
          event,
          RING_DEFAULT_RADIUS,
        );

        if (!point) return;

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

      const point = getCanvasPoint(event, ATOM_RADIUS);
      if (!point) return;

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
            strokeWidth={3}
            opacity={0.9}
            pointerEvents="none"
          />
        )}

        <circle
          r={ATOM_RADIUS}
          fill={elementData.defaultColor}
          stroke={elementData.defaultColor}
          strokeWidth={2}
        />

        <text
          x={0}
          y={8}
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
      </header>

      <MoleculeToolbar
        activeMode={document.tool.mode}
        showGrid={document.viewport.showGrid}
        canUndo={canUndo}
        canRedo={canRedo}
        themeMode={document.theme.mode}
        onModeChange={setInteractionMode}
        onToggleGrid={toggleGrid}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClearCanvas={clearCanvas}
        onToggleTheme={toggleTheme}
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
          onFunctionalGroupChange={handleFunctionalGroupChange}
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
                        : document.tool.mode === "add-functional-group"
                          ? "افزودن گروه عاملی"
                          : document.tool.mode === "add-charge"
                            ? "افزودن بار"
                            : document.tool.mode === "add-electron"
                              ? "افزودن الکترون"
                              : document.tool.mode === "add-arrow"
                                ? "افزودن پیکان"
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
                      document.tool.selectedBondType === option.type &&
                      document.tool.selectedBondOrder === option.order;

                    return (
                      <button
                        key={option.type}
                        type="button"
                        className={`${styles.bondOrderButton} ${
                          isActive ? styles.bondOrderButtonActive : ""
                        }`}
                        onClick={() => setSelectedBond(option.type, option.order)}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <span>
              بزرگ‌نمایی: <strong>{Math.round(document.viewport.zoom * 100)}٪</strong>
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
