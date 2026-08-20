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

import {
  createDefaultStyle,
  createId,
  createInitialDocument,
} from "./chemistry/initialState";

import type {
  Atom,
  Bond,
  BondOrder,
  BondType,
  ElementSymbol,
  InteractionMode,
  MechanismDocument,
  ThemeState,
} from "./types";

import { useDocumentHistory } from "./useDocumentHistory";
import { getElementData } from "./chemistry/atomData";
import { getTheme } from "./theme";
import MoleculeToolbar from "./MoleculeToolbar";
import MoleculeSidebar from "./MoleculeSidebar";

import styles from "./MoleculeDrawer.module.css";

const STORAGE_KEY = "molecuedrawer-document";

const SVG_WIDTH = 1200;
const SVG_HEIGHT = 800;
const ATOM_RADIUS = 18;

type SimpleBondOrder = 1 | 2 | 3;

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

const createAtom = (
  element: ElementSymbol,
  position: Point,
): Atom => {
  const elementData = getElementData(element);

  return {
    id: createId("atom"),
    type: "atom",
    element,
    position,
    selected: false,
    locked: false,
    visible: true,
    zIndex: 1,

    style: createDefaultStyle({
      color: elementData.defaultTextColor,
      fillColor: "transparent",
      strokeColor: elementData.defaultColor,
      fontSize: 24,
    }),

    formalCharge: 0,
    radical: "none",
    explicitHydrogens: 0,
    showImplicitHydrogens: true,
    showLonePairs: false,
    aromatic: false,
    displayMode: "label",
    sphereRadius: ATOM_RADIUS,
    labelSize: 24,
    chargeColor: "#B91C1C",
    radicalColor: "#B91C1C",
    lonePairColor: "#2563EB",
    attachedBondIds: [],
  };
};

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

const getSimpleBondOrder = (
  order: BondOrder,
): SimpleBondOrder => {
  if (order === 2) {
    return 2;
  }

  if (order === 3) {
    return 3;
  }

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

  if (length === 0) {
    return [];
  }

  const normalX = -dy / length;
  const normalY = dx / length;
  const offset = 5;

  const createLine = (
    distance: number,
  ): BondLine => ({
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

const getWedgePoints = (
  start: Point,
  end: Point,
): string | null => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length === 0) {
    return null;
  }

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

const getHashedWedgeLines = (
  start: Point,
  end: Point,
): BondLine[] => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length === 0) {
    return [];
  }

  const normalX = -dy / length;
  const normalY = dx / length;

  const count = Math.max(
    5,
    Math.floor(length / 10),
  );

  const maxWidth = 14;

  return Array.from(
    { length: count },
    (_, index) => {
      const progress = (index + 1) / count;

      const centerX = start.x + dx * progress;
      const centerY = start.y + dy * progress;

      const halfWidth =
        (maxWidth * progress) / 2;

      return {
        x1: centerX - normalX * halfWidth,
        y1: centerY - normalY * halfWidth,
        x2: centerX + normalX * halfWidth,
        y2: centerY + normalY * halfWidth,
      };
    },
  );
};

const getWavyPoints = (
  start: Point,
  end: Point,
): string | null => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length === 0) {
    return null;
  }

  const normalX = -dy / length;
  const normalY = dx / length;
  const amplitude = 5;

  const segments = Math.max(
    6,
    Math.floor(length / 12),
  );

  return Array.from(
    { length: segments + 1 },
    (_, index) => {
      const progress = index / segments;
      const direction =
        index % 2 === 0 ? 1 : -1;

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

const getBondTypeLabel = (
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
    case "bold":
      return "پررنگ";
    case "curved":
      return "خمیده";
    default:
      return "پیوند";
  }
};

const loadDocument = (): MechanismDocument => {
  if (typeof window === "undefined") {
    return createInitialDocument();
  }

  try {
    const savedDocument =
      window.localStorage.getItem(STORAGE_KEY);

    if (!savedDocument) {
      return createInitialDocument();
    }

    const parsedDocument: MechanismDocument =
      JSON.parse(savedDocument);

    if (
      !parsedDocument ||
      parsedDocument.title !== "Molecuedrawer" ||
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
  } = useDocumentHistory<MechanismDocument>(
    initialDocument,
  );

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
    (
      bondType: BondType,
      bondOrder: BondOrder,
    ) => {
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

  const setSelectedElement = useCallback(
    (element: string) => {
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
    updateDocument((currentDocument) => ({
      ...createInitialDocument(),
      theme: currentDocument.theme,
      viewport: currentDocument.viewport,
    }));
    setBondSelection([]);
  }, [updateDocument]);

  // حذف اتم به همراه تمام پیوندهای متصل به آن
  const deleteAtom = useCallback(
    (atomId: string) => {
      updateDocument((currentDocument) => ({
        ...currentDocument,
        objects: currentDocument.objects.filter((obj) => {
          if (obj.id === atomId) return false;
          if (
            obj.type === "bond" &&
            (obj.startAtomId === atomId || obj.endAtomId === atomId)
          ) {
            return false;
          }
          return true;
        }),
        selection: {
          ...currentDocument.selection,
          selectedIds: currentDocument.selection.selectedIds.filter(
            (id) => id !== atomId,
          ),
          primarySelectedId:
            currentDocument.selection.primarySelectedId === atomId
              ? null
              : currentDocument.selection.primarySelectedId,
        },
      }));
    },
    [updateDocument],
  );

  // حذف پیوند منفرد
  const deleteBond = useCallback(
    (bondId: string) => {
      updateDocument((currentDocument) => ({
        ...currentDocument,
        objects: currentDocument.objects.filter(
          (object) => object.id !== bondId,
        ),
        selection: {
          ...currentDocument.selection,
          selectedIds: currentDocument.selection.selectedIds.filter(
            (id) => id !== bondId,
          ),
          primarySelectedId:
            currentDocument.selection.primarySelectedId === bondId
              ? null
              : currentDocument.selection.primarySelectedId,
        },
      }));
    },
    [updateDocument],
  );

  // حذف المان انتخاب‌شده با کلید کیبورد
  const deleteSelected = useCallback(() => {
    const selectedId = document.selection.primarySelectedId;
    if (!selectedId) return;

    const target = document.objects.find((obj) => obj.id === selectedId);
    if (!target) return;

    if (target.type === "atom") {
      deleteAtom(selectedId);
    } else if (target.type === "bond") {
      deleteBond(selectedId);
    }
  }, [
    document.selection.primarySelectedId,
    document.objects,
    deleteAtom,
    deleteBond,
  ]);

  // کلیک روی اتم: در هر حالتی اول انتخاب می‌شود، بعد رفتار ابزار
  const handleAtomMouseDown = useCallback(
    (
      event: ReactMouseEvent<SVGGElement>,
      atomId: string,
    ) => {
      event.stopPropagation();

      // ۱) در همه حالت‌ها: اتم را انتخاب کن (حلقه طلایی + پنل ویژگی‌ها)
      updateDocument((currentDocument) => ({
        ...currentDocument,
        selection: {
          ...currentDocument.selection,
          selectedIds: [atomId],
          primarySelectedId: atomId,
        },
      }));

      // ۲) حالت پاک‌کن: حذف اتم و پیوندهای متصل
      if (document.tool.mode === "erase") {
        deleteAtom(atomId);
        return;
      }

      // ۳) حالت انتخاب: فعال‌سازی درگ
      if (document.tool.mode === "select") {
        setDraggingAtomId(atomId);
        return;
      }

      // ۴) حالت رسم پیوند
      if (document.tool.mode === "add-bond") {
        const clickedAtomExists = document.objects.some(
          (object): object is Atom =>
            object.type === "atom" && object.id === atomId,
        );

        if (!clickedAtomExists) return;

        setBondSelection((currentSelection) => {
          if (currentSelection.length === 0) {
            return [atomId];
          }

          if (currentSelection[0] === atomId) {
            return [];
          }

          const startAtomId = currentSelection[0];
          const endAtomId = atomId;

          updateDocument((currentDocument) => {
            const startAtomExists = currentDocument.objects.some(
              (object): object is Atom =>
                object.type === "atom" &&
                object.id === startAtomId,
            );

            const endAtomExists = currentDocument.objects.some(
              (object): object is Atom =>
                object.type === "atom" &&
                object.id === endAtomId,
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
      }
    },
    [
      document.tool.mode,
      document.objects,
      updateDocument,
      deleteAtom,
    ],
  );

  // کلیک روی پیوند: در همه حالت‌ها انتخاب می‌شود
  const handleBondClick = useCallback(
    (
      event: ReactMouseEvent<SVGGElement>,
      bondId: string,
    ) => {
      event.stopPropagation();

      // انتخاب پیوند
      updateDocument((currentDocument) => ({
        ...currentDocument,
        selection: {
          ...currentDocument.selection,
          selectedIds: [bondId],
          primarySelectedId: bondId,
        },
      }));

      // حالت پاک‌کن: حذف پیوند
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

  // حرکت ماوس روی Canvas برای جابجایی (Drag)
  const handleCanvasMouseMove = useCallback(
    (event: ReactMouseEvent<SVGSVGElement>) => {
      if (!draggingAtomId || document.tool.mode !== "select") {
        return;
      }

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
    if (draggingAtomId) {
      setDraggingAtomId(null);
    }
  }, [draggingAtomId]);

  // کلیک روی بوم: فقط وقتی روی پس‌زمینه خالی باشد
  const handleCanvasClick = useCallback(
    (event: ReactMouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current;

      // اگر روی خود اتم یا پیوند کلیک شده، اینجا کاری نکن
      if (!svg || event.target !== svg) {
        return;
      }

      // حالت انتخاب: کلیک روی فضای خالی = لغو انتخاب
      if (document.tool.mode === "select") {
        clearSelection();
        return;
      }

      // حالت پیوند: کلیک روی فضای خالی = لغو شروع پیوند
      if (document.tool.mode === "add-bond") {
        setBondSelection([]);
        return;
      }

      // فقط در حالت افزودن اتم، اتم جدید بساز
      if (document.tool.mode !== "add-atom") {
        return;
      }

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

      const atom = createAtom(
        document.tool.selectedElement,
        { x, y },
      );

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
      document.viewport.snapToGrid,
      document.viewport.gridSize,
      updateDocument,
      clearSelection,
    ],
  );

  const selectedObject = document.objects.find(
    (object) => object.id === document.selection.primarySelectedId,
  );

  const selectedAtom =
    selectedObject?.type === "atom" ? selectedObject : null;

  const selectedBond =
    selectedObject?.type === "bond" ? selectedObject : null;

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
  } as CSSProperties;

  const atoms = document.objects.filter(
    (object): object is Atom => object.type === "atom",
  );

  const bonds = document.objects.filter(
    (object): object is Bond => object.type === "bond",
  );

  const renderedBonds = bonds.map((bond) => {
    const atomA = atoms.find((atom) => atom.id === bond.startAtomId);
    const atomB = atoms.find((atom) => atom.id === bond.endAtomId);

    if (!atomA || !atomB) {
      return null;
    }

    const start = atomA.position;
    const end = atomB.position;

    const isSelected =
      document.selection.primarySelectedId === bond.id;

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
        {/* ناحیه نامرئی بزرگ برای کلیک راحت‌تر روی پیوند */}
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

  const renderedAtoms = atoms.map((atom) => {
    const elementData = getElementData(atom.element);

    const isSelected =
      document.selection.primarySelectedId === atom.id;

    const isBondStart = bondSelection[0] === atom.id;
    const isBondTarget = bondSelection.includes(atom.id);

    return (
      <g
        key={atom.id}
        transform={`translate(${atom.position.x} ${atom.position.y})`}
        aria-label={`اتم ${elementData.persianName}`}
        onMouseDown={(event) => handleAtomMouseDown(event, atom.id)}
        className={
          document.tool.mode === "add-bond" &&
          (isBondStart || isBondTarget)
            ? styles.atomSelected
            : undefined
        }
        style={{
          cursor:
            document.tool.mode === "select"
              ? "grab"
              : document.tool.mode === "erase"
                ? "pointer"
                : document.tool.mode === "add-bond"
                  ? "pointer"
                  : "pointer",
        }}
      >
        {/* ناحیه کلیک بزرگ‌تر (نامرئی) */}
        <circle
          r={ATOM_RADIUS + 8}
          fill="transparent"
          pointerEvents="all"
        />

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

  // کلیدهای میانبر: Undo/Redo و Delete
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

      // کلید حذف
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
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleUndo, handleRedo, deleteSelected]);

  return (
    <main
      className={`${styles.application} ${
        document.theme.mode === "dark"
          ? styles.dark
          : styles.light
      }`}
      style={cssVariables}
      dir="rtl"
    >
      <header className={styles.header}>
        <div className={styles.headerSide}>
          <span className={styles.statusDot} />
          <span className={styles.statusText}>
            سند جدید
          </span>
        </div>

        <h1 className={styles.title}>
          Molecuedrawer
        </h1>

        <div className={styles.headerSide}>
          <button
            type="button"
            className={styles.headerButton}
            onClick={toggleTheme}
            aria-label="تغییر حالت روشن و تاریک"
            title="تغییر حالت روشن و تاریک"
          >
            {document.theme.mode === "light"
              ? "☾"
              : "☀"}
          </button>

          <button
            type="button"
            className={styles.headerButton}
            onClick={clearCanvas}
            aria-label="پاک کردن بوم"
            title="پاک کردن بوم"
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
          onToggleGrid={toggleGrid}
          onToggleSnap={toggleSnapToGrid}
          onClearSelection={clearSelection}
        />

        <section
          className={styles.canvasArea}
          aria-label="ناحیه طراحی مولکول"
        >
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
                      : "افزودن پیوند"}
              </strong>
            </span>

            {document.tool.mode === "add-bond" && (
              <div className={styles.bondOrderControl}>
                <span className={styles.bondOrderLabel}>
                  نوع پیوند:
                </span>

                <div className={styles.bondOrderButtons}>
                  {[
                    {
                      type: "single" as const,
                      order: 1 as const,
                      label: "یگانه",
                    },
                    {
                      type: "double" as const,
                      order: 2 as const,
                      label: "دوگانه",
                    },
                    {
                      type: "triple" as const,
                      order: 3 as const,
                      label: "سه‌گانه",
                    },
                    {
                      type: "solid-wedge" as const,
                      order: 1 as const,
                      label: "گوه‌ای پر",
                    },
                    {
                      type: "hashed-wedge" as const,
                      order: 1 as const,
                      label: "گوه‌ای خط‌چین",
                    },
                    {
                      type: "dashed" as const,
                      order: 1 as const,
                      label: "خط‌چین",
                    },
                    {
                      type: "wavy" as const,
                      order: 1 as const,
                      label: "موج‌دار",
                    },
                  ].map((option) => {
                    const isActive =
                      document.tool.selectedBondType ===
                      option.type;

                    return (
                      <button
                        key={option.type}
                        type="button"
                        className={`${styles.bondOrderButton} ${
                          isActive
                            ? styles.bondOrderButtonActive
                            : ""
                        }`}
                        onClick={() =>
                          setSelectedBond(
                            option.type,
                            option.order,
                          )
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
              <strong>
                {Math.round(
                  document.viewport.zoom * 100,
                )}
                ٪
              </strong>
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
              {renderedAtoms}
            </svg>

            {document.objects.length === 0 && (
              <div
                className={styles.canvasWelcome}
                style={{ pointerEvents: "none" }}
              >
                <div className={styles.canvasIcon}>
                  ⌬
                </div>

                <h2>
                  محیط طراحی شیمیایی
                </h2>

                <p>
                  یک عنصر را انتخاب کنید و روی
                  بوم کلیک کنید.
                </p>

                <p className={styles.canvasHint}>
                  اتم انتخاب‌شده روی شبکه قرار
                  می‌گیرد.
                </p>
              </div>
            )}
          </div>
        </section>

        <aside
          className={styles.propertiesPanel}
          aria-label="پنل ویژگی‌ها"
        >
          <div className={styles.panelHeader}>
            <h2>ویژگی‌ها</h2>
          </div>

          {selectedAtom ? (
            <div className={styles.bondProperties}>
              <span className={styles.propertyBadge}>
                ATOM
              </span>

              <h3 className={styles.propertyTitle}>
                ویژگی‌های اتم
              </h3>

              <div className={styles.propertyRow}>
                <span>نماد عنصر</span>
                <strong>{selectedAtom.element}</strong>
              </div>

              <div className={styles.propertyRow}>
                <span>نام عنصر</span>
                <strong>
                  {getElementData(selectedAtom.element).persianName}
                </strong>
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
              <span className={styles.propertyBadge}>
                BOND
              </span>

              <h3 className={styles.propertyTitle}>
                ویژگی‌های پیوند
              </h3>

              <div className={styles.propertyRow}>
                <span>نوع پیوند</span>

                <strong>
                  {getBondTypeLabel(
                    selectedBond.bondType,
                  )}
                </strong>
              </div>

              <div className={styles.propertyRow}>
                <span>مرتبه پیوند</span>

                <strong>
                  {selectedBond.order}
                </strong>
              </div>

              <div className={styles.propertyRow}>
                <span>اتم اول</span>

                <strong>
                  {selectedStartAtom?.element ?? "-"}
                </strong>
              </div>

              <div className={styles.propertyRow}>
                <span>اتم دوم</span>

                <strong>
                  {selectedEndAtom?.element ?? "-"}
                </strong>
              </div>

              <button
                type="button"
                className={styles.propertyDeleteButton}
                onClick={() => deleteBond(selectedBond.id)}
              >
                حذف پیوند
              </button>
            </div>
          ) : (
            <div className={styles.emptyProperties}>
              <span className={styles.emptyPropertiesIcon}>
                ◇
              </span>

              <p>شیئی انتخاب نشده است</p>

              <small>
                پس از انتخاب اتم، پیوند یا آبجکت،
                ویژگی‌های آن نمایش داده می‌شود.
              </small>
            </div>
          )}
        </aside>
      </section>

      <footer className={styles.footer}>
        <span>آماده برای طراحی</span>

        <span>
          {document.objects.length} آبجکت
        </span>
      </footer>
    </main>
  );
}
