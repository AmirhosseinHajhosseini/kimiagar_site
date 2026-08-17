'use client';

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import styles from './molecular-drawer.module.css';
import {
  ATOM_RADIUS,
  ATOM_SELECT_RADIUS,
  BOND_SELECT_DISTANCE,
  BondType,
  CanvasState,
  ColorValue,
  DrawMode,
  ElementSymbol,
  ExportFormat,
  FreehandPath,
  Point,
  RingShape,
  TextLabel,
  ToolType,
  ArrowType,
  Atom,
  Bond,
  Arrow,
  Bracket,
  DEFAULT_ATOM_SYMBOL,
} from './types';
import { findAtomAt, findBondAt, getDistance, snapToGrid } from './geometry';

/* =========================================================
   Constants
========================================================= */

const FULLSCREEN_GOLD = '#d4af37';
const FULLSCREEN_GOLD_DARK = '#b8891d';
const DEFAULT_INK = '#0f172a';

const PALETTE_24: ColorValue[] = [
  '#000000',
  '#ffffff',
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#10b981',
  '#14b8a6',
  '#06b6d4',
  '#0ea5e9',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#d946ef',
  '#ec4899',
  '#f43f5e',
  '#7c3aed',
  '#475569',
  '#94a3b8',
  '#cbd5e1',
  '#f8fafc',
];

/* =========================================================
   Types
========================================================= */

type Molecule = CanvasState & {
  arrows: Arrow[];
  brackets: Bracket[];
  freehands: FreehandPath[];
  rings: RingShape[];
};

export interface CanvasRef {
  undo: () => void;
  redo: () => void;
  clear: () => void;
  setMolecule: (molecule: Molecule) => void;
  getMolecule: () => Molecule;
  exportAs: (format: ExportFormat) => void;
}

interface CanvasProps {
  selectedTool: ToolType;
  selectedElement: string;
  showGrid?: boolean;
  gridSize?: number;
  snapToGridEnabled?: boolean;
  zoom?: number;
  isFullscreen?: boolean;
  onMoleculeChange?: (molecule: Molecule) => void;
  onHistoryChange?: (history: { canUndo: boolean; canRedo: boolean }) => void;
  onSelectionChange?: (atomId: string | null, bondId: string | null) => void;
  onContextColorChange?: (payload: {
    target:
      | { kind: 'atom'; id: string }
      | { kind: 'bond'; id: string }
      | { kind: 'arrow'; id: string; arrowKind: 'mechanism' | 'reaction' }
      | { kind: 'bracket'; id: string }
      | { kind: 'text'; id: string }
      | { kind: 'path'; id: string }
      | { kind: 'ring'; id: string };
    color: string;
  }) => void;
  onRequestTextEdit?: (payload: { id?: string; x: number; y: number; initialText?: string }) => void;
  onRequestColorPaletteClose?: () => void;
}

type ReactionArrowKind = 'reaction' | 'equilibrium' | 'resonance' | 'retro';
type MechanismArrowKind = 'curved-full' | 'curved-fishhook';

type HistoryState = {
  past: Molecule[];
  present: Molecule;
  future: Molecule[];
};

type CanvasPoint = Point;

type ContextTarget =
  | { kind: 'atom'; id: string }
  | { kind: 'bond'; id: string }
  | { kind: 'arrow'; id: string; arrowKind: 'mechanism' | 'reaction' }
  | { kind: 'bracket'; id: string }
  | { kind: 'text'; id: string }
  | { kind: 'path'; id: string }
  | { kind: 'ring'; id: string }
  | null;

/* =========================================================
   Helpers
========================================================= */

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function createIdFactory() {
  let counter = 0;
  return () => `chem-${Date.now()}-${counter++}`;
}

function createEmptyMolecule(): Molecule {
  return {
    atoms: [],
    bonds: [],
    arrows: [],
    brackets: [],
    texts: [],
    freehands: [],
    rings: [],
    activeTool: 'select',
    selectedElement: DEFAULT_ATOM_SYMBOL,
  } as Molecule;
}

function safeFontSize(v?: number) {
  return typeof v === 'number' && Number.isFinite(v) ? Math.max(6, Math.min(72, v)) : 16;
}

function normalizePoint(p: CanvasPoint, gridSize: number, snap: boolean) {
  return snap ? { x: snapToGrid(p.x, gridSize), y: snapToGrid(p.y, gridSize) } : p;
}

function isBondTool(tool: ToolType) {
  return (
    tool === 'single-bond' ||
    tool === 'double-bond' ||
    tool === 'triple-bond' ||
    tool === 'wedge-bond' ||
    tool === 'dash-bond' ||
    tool === 'wavy-bond'
  );
}

function toolToBond(tool: ToolType): { type: BondType; order: 1 | 2 | 3 } {
  switch (tool) {
    case 'double-bond':
      return { type: 'double', order: 2 };
    case 'triple-bond':
      return { type: 'triple', order: 3 };
    case 'wedge-bond':
      return { type: 'wedge', order: 1 };
    case 'dash-bond':
      return { type: 'dash', order: 1 };
    case 'wavy-bond':
      return { type: 'wavy', order: 1 };
    default:
      return { type: 'single', order: 1 };
  }
}

function bondStroke(isFullscreen: boolean, explicit?: ColorValue, selected = false) {
  if (explicit) return explicit;
  if (isFullscreen) return FULLSCREEN_GOLD;
  return selected ? '#f59e0b' : '#1e293b';
}

function arrowStroke(isFullscreen: boolean, explicit?: ColorValue) {
  if (explicit) return explicit;
  return isFullscreen ? FULLSCREEN_GOLD : DEFAULT_INK;
}

function atomFill(atom: Atom) {
  if (atom.fillColor) return atom.fillColor;
  if (atom.color) return atom.color;
  switch (atom.symbol) {
    case 'O':
      return '#dc2626';
    case 'N':
      return '#2563eb';
    case 'S':
      return '#ca8a04';
    case 'Cl':
    case 'F':
    case 'Br':
    case 'I':
      return '#16a34a';
    default:
      return '#0f172a';
  }
}

function atomStroke(atom: Atom) {
  if (atom.strokeColor) return atom.strokeColor;
  if (atom.color) return atom.color;
  return '#e2e8f0';
}

/* =========================================================
   Component
========================================================= */

const CanvasInner = (
  {
    selectedTool,
    selectedElement,
    showGrid = true,
    gridSize = 24,
    snapToGridEnabled = true,
    zoom = 1,
    isFullscreen = false,
    onMoleculeChange,
    onHistoryChange,
    onSelectionChange,
    onContextColorChange,
    onRequestTextEdit,
    onRequestColorPaletteClose,
  }: CanvasProps,
  ref: React.Ref<CanvasRef>,
) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const makeId = useMemo(() => createIdFactory(), []);

  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: createEmptyMolecule(),
    future: [],
  });

  const [selectedAtomId, setSelectedAtomId] = useState<string | null>(null);
  const [selectedBondId, setSelectedBondId] = useState<string | null>(null);

  const [bondStartAtomId, setBondStartAtomId] = useState<string | null>(null);

  const [dragMode, setDragMode] = useState<DrawMode>('idle');
  const [dragStart, setDragStart] = useState<CanvasPoint | null>(null);
  const [dragCurrent, setDragCurrent] = useState<CanvasPoint | null>(null);
  const [dragAtomId, setDragAtomId] = useState<string | null>(null);
  const [dragSnapshot, setDragSnapshot] = useState<Molecule | null>(null);
  const [didDrag, setDidDrag] = useState(false);

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    target: ContextTarget;
  }>({
    visible: false,
    x: 0,
    y: 0,
    target: null,
  });

  const molecule = history.present;

  const commit = useCallback((nextPresent: Molecule) => {
    setHistory((prev) => ({
      past: [...prev.past, deepClone(prev.present)],
      present: deepClone(nextPresent),
      future: [],
    }));
  }, []);

  const replacePresent = useCallback((nextPresent: Molecule) => {
    setHistory((prev) => ({ ...prev, present: deepClone(nextPresent) }));
  }, []);

  useEffect(() => {
    onHistoryChange?.({
      canUndo: history.past.length > 0,
      canRedo: history.future.length > 0,
    });
    onMoleculeChange?.(deepClone(history.present));
  }, [history, onHistoryChange, onMoleculeChange]);

  useEffect(() => {
    onSelectionChange?.(selectedAtomId, selectedBondId);
  }, [selectedAtomId, selectedBondId, onSelectionChange]);

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (!prev.past.length) return prev;
      const previous = prev.past[prev.past.length - 1];
      return {
        past: prev.past.slice(0, -1),
        present: deepClone(previous),
        future: [deepClone(prev.present), ...prev.future],
      };
    });
    setSelectedAtomId(null);
    setSelectedBondId(null);
  }, []);

  const redo = useCallback(() => {
    setHistory((prev) => {
      if (!prev.future.length) return prev;
      const next = prev.future[0];
      return {
        past: [...prev.past, deepClone(prev.present)],
        present: deepClone(next),
        future: prev.future.slice(1),
      };
    });
    setSelectedAtomId(null);
    setSelectedBondId(null);
  }, []);

  const clear = useCallback(() => {
    setHistory((prev) => ({
      past: [...prev.past, deepClone(prev.present)],
      present: createEmptyMolecule(),
      future: [],
    }));
    setSelectedAtomId(null);
    setSelectedBondId(null);
    setBondStartAtomId(null);
  }, []);

  const exportAs = useCallback(
    (format: ExportFormat) => {
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(molecule, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'molecule.json';
        a.click();
        URL.revokeObjectURL(url);
        return;
      }

      if (format === 'png' && canvasRef.current) {
        const a = document.createElement('a');
        a.href = canvasRef.current.toDataURL('image/png');
        a.download = 'molecule.png';
        a.click();
        return;
      }

      if (format === 'svg') {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="100%" height="100%" fill="white"/></svg>`;
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'molecule.svg';
        a.click();
        URL.revokeObjectURL(url);
      }
    },
    [molecule],
  );

  useImperativeHandle(
    ref,
    () => ({
      undo,
      redo,
      clear,
      setMolecule: (mol) => replacePresent(deepClone(mol)),
      getMolecule: () => deepClone(history.present),
      exportAs,
    }),
    [undo, redo, clear, replacePresent, history.present, exportAs],
  );

  const screenToCanvas = useCallback(
    (clientX: number, clientY: number) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return {
        x: (clientX - rect.left) / zoom,
        y: (clientY - rect.top) / zoom,
      };
    },
    [zoom],
  );

  const getAtomAtPosition = useCallback(
    (x: number, y: number) => findAtomAt(molecule.atoms, x, y, ATOM_SELECT_RADIUS),
    [molecule.atoms],
  );

  const getBondAtPosition = useCallback(
    (x: number, y: number) => findBondAt(molecule.bonds, molecule.atoms, x, y, BOND_SELECT_DISTANCE),
    [molecule.bonds, molecule.atoms],
  );

  const upsertMolecule = useCallback(
    (updater: (mol: Molecule) => Molecule) => {
      commit(updater(molecule));
    },
    [commit, molecule],
  );

  const drawArrowHead = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      angle: number,
      fishhook = false,
      size = 11,
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();

      if (fishhook) {
        ctx.moveTo(0, 0);
        ctx.lineTo(-size, -size * 0.55);
        ctx.stroke();
      } else {
        ctx.moveTo(0, 0);
        ctx.lineTo(-size, -size * 0.5);
        ctx.lineTo(-size * 0.7, 0);
        ctx.lineTo(-size, size * 0.5);
        ctx.closePath();
        ctx.fillStyle = String(ctx.strokeStyle);
        ctx.fill();
      }

      ctx.restore();
    },
    [],
  );

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.scale(zoom, zoom);

      const drawWidth = width / zoom;
      const drawHeight = height / zoom;

      if (showGrid) {
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
        ctx.lineWidth = 1;
        for (let x = 0; x <= drawWidth; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, drawHeight);
          ctx.stroke();
        }
        for (let y = 0; y <= drawHeight; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(drawWidth, y);
          ctx.stroke();
        }
      }

      molecule.freehands.forEach((path) => {
        if (path.points.length < 2) return;
        const stroke = path.strokeColor || path.color || (isFullscreen ? FULLSCREEN_GOLD : DEFAULT_INK);
        ctx.strokeStyle = stroke;
        ctx.lineWidth = path.strokeWidth || 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(path.points[0].x, path.points[0].y);
        for (let i = 1; i < path.points.length; i += 1) ctx.lineTo(path.points[i].x, path.points[i].y);
        ctx.stroke();
      });

      molecule.bonds.forEach((bond) => {
        const a1 = molecule.atoms.find((a) => a.id === bond.atom1Id);
        const a2 = molecule.atoms.find((a) => a.id === bond.atom2Id);
        if (!a1 || !a2) return;

        const dx = a2.x - a1.x;
        const dy = a2.y - a1.y;
        const len = Math.hypot(dx, dy) || 1;
        const ox = (-dy / len) * 4;
        const oy = (dx / len) * 4;
        const stroke = bondStroke(isFullscreen, bond.strokeColor || bond.color, bond.id === selectedBondId);

        ctx.strokeStyle = stroke;
        ctx.fillStyle = stroke;
        ctx.lineWidth = 2.4;
        ctx.lineCap = 'round';

        if (bond.type === 'wedge') {
          const pX = (-dy / len) * 5;
          const pY = (dx / len) * 5;
          ctx.beginPath();
          ctx.moveTo(a1.x, a1.y);
          ctx.lineTo(a2.x + pX, a2.y + pY);
          ctx.lineTo(a2.x - pX, a2.y - pY);
          ctx.closePath();
          ctx.fill();
        } else if (bond.type === 'dash') {
          const steps = 6;
          for (let i = 1; i <= steps; i += 1) {
            const t = i / steps;
            const px = a1.x + dx * t;
            const py = a1.y + dy * t;
            const w = (i / steps) * 6;
            const sx = (-dy / len) * w;
            const sy = (dx / len) * w;
            ctx.beginPath();
            ctx.moveTo(px - sx, py - sy);
            ctx.lineTo(px + sx, py + sy);
            ctx.stroke();
          }
        } else if (bond.type === 'wavy') {
          const segments = 12;
          ctx.beginPath();
          for (let i = 0; i <= segments; i += 1) {
            const t = i / segments;
            const px = a1.x + dx * t;
            const py = a1.y + dy * t;
            const wave = Math.sin(t * Math.PI * 6) * 3;
            const wx = px + (-dy / len) * wave;
            const wy = py + (dx / len) * wave;
            if (i === 0) ctx.moveTo(wx, wy);
            else ctx.lineTo(wx, wy);
          }
          ctx.stroke();
        } else {
          const line = (offset = 0) => {
            ctx.beginPath();
            ctx.moveTo(a1.x + ox * offset, a1.y + oy * offset);
            ctx.lineTo(a2.x + ox * offset, a2.y + oy * offset);
            ctx.stroke();
          };

          if (bond.order === 1) line(0);
          else if (bond.order === 2) {
            line(1.2);
            line(-1.2);
          } else {
            line(0);
            line(2);
            line(-2);
          }
        }
      });

      molecule.rings.forEach((ring) => {
        const stroke = ring.strokeColor || (isFullscreen ? FULLSCREEN_GOLD : DEFAULT_INK);
        ctx.strokeStyle = stroke;
        ctx.fillStyle = stroke;
        ctx.lineWidth = 2;

        const sides = ring.sides || (ring.type === 'cyclopentane-ring' ? 5 : 6);
        const pts: Point[] = [];
        for (let i = 0; i < sides; i += 1) {
          const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
          pts.push({
            x: ring.center.x + Math.cos(angle) * ring.radius,
            y: ring.center.y + Math.sin(angle) * ring.radius,
          });
        }

        if (pts.length) {
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i += 1) ctx.lineTo(pts[i].x, pts[i].y);
          ctx.closePath();
          ctx.stroke();
        }
      });

      molecule.arrows.forEach((arrow) => {
        const stroke = arrowStroke(isFullscreen, arrow.strokeColor || arrow.color);
        ctx.strokeStyle = stroke;
        ctx.fillStyle = stroke;
        ctx.lineWidth = 2.2;

        if (arrow.type === 'equilibrium') {
          const midY = (arrow.start.y + arrow.end.y) / 2;
          ctx.beginPath();
          ctx.moveTo(arrow.start.x, midY - 3);
          ctx.lineTo(arrow.end.x, midY - 3);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(arrow.end.x, midY + 3);
          ctx.lineTo(arrow.start.x, midY + 3);
          ctx.stroke();
          drawArrowHead(ctx, arrow.end.x, midY - 3, Math.atan2(arrow.end.y - arrow.start.y, arrow.end.x - arrow.start.x));
          drawArrowHead(ctx, arrow.start.x, midY + 3, Math.atan2(arrow.start.y - arrow.end.y, arrow.start.x - arrow.end.x));
        } else if (arrow.type === 'resonance') {
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.moveTo(arrow.start.x, arrow.start.y);
          ctx.lineTo(arrow.end.x, arrow.end.y);
          ctx.stroke();
          ctx.setLineDash([]);
          drawArrowHead(ctx, arrow.end.x, arrow.end.y, Math.atan2(arrow.end.y - arrow.start.y, arrow.end.x - arrow.start.x));
        } else if (arrow.type === 'retro') {
          ctx.beginPath();
          ctx.moveTo(arrow.start.x, arrow.start.y);
          ctx.lineTo(arrow.end.x, arrow.end.y);
          ctx.stroke();
          drawArrowHead(ctx, arrow.start.x, arrow.start.y, Math.atan2(arrow.start.y - arrow.end.y, arrow.start.x - arrow.end.x));
        } else {
          ctx.beginPath();
          ctx.moveTo(arrow.start.x, arrow.start.y);
          ctx.lineTo(arrow.end.x, arrow.end.y);
          ctx.stroke();
          drawArrowHead(ctx, arrow.end.x, arrow.end.y, Math.atan2(arrow.end.y - arrow.start.y, arrow.end.x - arrow.start.x));
        }
      });

      molecule.brackets.forEach((bracket) => {
        const stroke = bracket.strokeColor || bracket.color || (isFullscreen ? FULLSCREEN_GOLD : DEFAULT_INK);
        ctx.strokeStyle = stroke;
        ctx.fillStyle = stroke;
        ctx.lineWidth = 2;
        const corner = 16;

        ctx.beginPath();
        ctx.moveTo(bracket.start.x + corner, bracket.start.y);
        ctx.lineTo(bracket.start.x, bracket.start.y);
        ctx.lineTo(bracket.start.x, bracket.end.y);
        ctx.lineTo(bracket.start.x + corner, bracket.end.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(bracket.end.x - corner, bracket.start.y);
        ctx.lineTo(bracket.end.x, bracket.start.y);
        ctx.lineTo(bracket.end.x, bracket.end.y);
        ctx.lineTo(bracket.end.x - corner, bracket.end.y);
        ctx.stroke();
      });

      molecule.texts.forEach((text) => {
        const stroke = text.color || text.strokeColor || (isFullscreen ? FULLSCREEN_GOLD : DEFAULT_INK);
        ctx.fillStyle = stroke;
        ctx.font = `${safeFontSize(text.fontSize)}px Arial`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(text.text, text.x, text.y);
      });

      molecule.atoms.forEach((atom) => {
        const fill = atomFill(atom);
        const stroke = atomStroke(atom);

        ctx.beginPath();
        ctx.arc(atom.x, atom.y, ATOM_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = atom.id === selectedAtomId ? bondStroke(isFullscreen, undefined, true) : stroke;
        ctx.lineWidth = atom.id === selectedAtomId ? 2.5 : 1.8;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(atom.symbol, atom.x, atom.y);

        if (typeof atom.charge === 'number' && atom.charge !== 0) {
          ctx.fillStyle = isFullscreen ? FULLSCREEN_GOLD : DEFAULT_INK;
          ctx.font = 'bold 12px Arial';
          ctx.fillText(atom.charge > 0 ? '+' : '-', atom.x + 14, atom.y - 12);
        }

        if (atom.radical) {
          ctx.beginPath();
          ctx.arc(atom.x + 13, atom.y - 13, 2, 0, Math.PI * 2);
          ctx.fillStyle = isFullscreen ? FULLSCREEN_GOLD : DEFAULT_INK;
          ctx.fill();
        }
      });

      if (dragMode === 'draw-bond' && dragStart && dragCurrent) {
        ctx.strokeStyle = isFullscreen ? `${FULLSCREEN_GOLD}99` : 'rgba(15, 23, 42, 0.55)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(dragStart.x, dragStart.y);
        ctx.lineTo(dragCurrent.x, dragCurrent.y);
        ctx.stroke();
      }

      if (dragMode === 'draw-arrow' && dragStart && dragCurrent) {
        ctx.strokeStyle = isFullscreen ? `${FULLSCREEN_GOLD}99` : 'rgba(220, 38, 38, 0.55)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(dragStart.x, dragStart.y);
        ctx.lineTo(dragCurrent.x, dragCurrent.y);
        ctx.stroke();
      }

      if (dragMode === 'draw-freehand' && dragSnapshot?.plushands?.length) {
        const active = dragSnapshot.freehands[dragSnapshot.freehands.length - 1];
        if (active.points.length > 1) {
          ctx.strokeStyle = active.strokeColor || active.color || (isFullscreen ? FULLSCREEN_GOLD : DEFAULT_INK);
          ctx.lineWidth = active.strokeWidth || 2;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(active.points[0].x, active.points[0].y);
          for (let i = 1; i < active.points.length; i += 1) ctx.lineTo(active.points[i].x, active.points[i].y);
          ctx.stroke();
        }
      }

      ctx.restore();
    },
    [
      zoom,
      showGrid,
      gridSize,
      molecule,
      selectedAtomId,
      selectedBondId,
      dragMode,
      dragStart,
      dragCurrent,
      isFullscreen,
      drawArrowHead,
    ],
  );

  const resizeCanvas = useCallback(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const rect = wrapper.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(ctx, rect.width, rect.height);
  }, [draw]);

  useEffect(() => {
    resizeCanvas();
  }, [resizeCanvas, molecule, zoom, selectedAtomId, selectedBondId, dragMode, dragStart, dragCurrent, isFullscreen]);

  useEffect(() => {
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  const applyAtomStyle = useCallback(
    (atomId: string, patch: Partial<Atom>) => {
      upsertMolecule((mol) => ({
        ...mol,
        atoms: mol.atoms.map((a) => (a.id === atomId ? { ...a, ...patch } : a)),
      }));
    },
    [upsertMolecule],
  );

  const applyColorToTarget = useCallback(
    (color: string) => {
      const target = contextMenu.target;
      if (!target) return;

      if (target.kind === 'atom') {
        applyAtomStyle(target.id, { color, fillColor: color, strokeColor: color });
      } else if (target.kind === 'bond') {
        upsertMolecule((mol) => ({
          ...mol,
          bonds: mol.bonds.map((b) => (b.id === target.id ? { ...b, color, strokeColor: color } : b)),
        }));
      } else if (target.kind === 'arrow') {
        upsertMolecule((mol) => ({
          ...mol,
          arrows: mol.arrows.map((a) => (a.id === target.id ? { ...a, color, strokeColor: color } : a)),
        }));
      } else if (target.kind === 'bracket') {
        upsertMolecule((mol) => ({
          ...mol,
          brackets: mol.brackets.map((b) => (b.id === target.id ? { ...b, color, strokeColor: color } : b)),
        }));
      } else if (target.kind === 'text') {
        upsertMolecule((mol) => ({
          ...mol,
          texts: mol.texts.map((t) => (t.id === target.id ? { ...t, color } : t)),
        }));
      } else if (target.kind === 'path') {
        upsertMolecule((mol) => ({
          ...mol,
          freehands: mol.freehands.map((p) => (p.id === target.id ? { ...p, color, strokeColor: color } : p)),
        }));
      } else if (target.kind === 'ring') {
        upsertMolecule((mol) => ({
          ...mol,
          rings: mol.rings.map((r) => (r.id === target.id ? { ...r, strokeColor: color } : r)),
        }));
      }

      setContextMenu((prev) => ({ ...prev, visible: false, target: null }));
      onRequestColorPaletteClose?.();
    },
    [contextMenu.target, applyAtomStyle, onRequestColorPaletteClose, upsertMolecule],
  );

  const handleContextMenu = (event: React.MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const { x, y } = screenToCanvas(event.clientX, event.clientY);

    const atom = getAtomAtPosition(x, y);
    const bond = getBondAtPosition(x, y);

    const target: ContextTarget = atom
      ? { kind: 'atom', id: atom.id }
      : bond
      ? { kind: 'bond', id: bond.id }
      : null;

    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      target,
    });
  };

  const commitText = useCallback(
    (text: string, x: number, y: number, id?: string, fontSize = 16) => {
      upsertMolecule((mol) => ({
        ...mol,
        texts: id
          ? mol.texts.map((t) => (t.id === id ? { ...t, text, fontSize } : t))
          : [...mol.texts, { id: makeId(), x, y, text, fontSize }],
      }));
    },
    [makeId, upsertMolecule],
  );

  const addRing = useCallback(
    (type: RingShape['type'], cx: number, cy: number) => {
      const radius = type === 'boat-conformation' || type === 'chair-conformation' ? 42 : 38;
      const sides = type === 'cyclopentane-ring' ? 5 : 6;

      const ring: RingShape = {
        id: makeId(),
        center: { x: cx, y: cy },
        radius,
        sides,
        type,
      };

      const newAtoms: Atom[] = [];
      const newBonds: Bond[] = [];
      for (let i = 0; i < sides; i += 1) {
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
        newAtoms.push({
          id: makeId(),
          symbol: 'C',
          x: cx + Math.cos(angle) * radius,
          y: cy + Math.sin(angle) * radius,
        });
      }

      for (let i = 0; i < sides; i += 1) {
        const next = (i + 1) % sides;
        const isDouble = type === 'benzene-ring' && i % 2 === 0;
        newBonds.push({
          id: makeId(),
          atom1Id: newAtoms[i].id,
          atom2Id: newAtoms[next].id,
          type: isDouble ? 'double' : 'single',
          order: isDouble ? 2 : 1,
        });
      }

      commit({
        ...molecule,
        rings: [...molecule.rings, ring],
        atoms: [...molecule.atoms, ...newAtoms],
        bonds: [...molecule.bonds, ...newBonds],
      });
    },
    [makeId, molecule, commit],
  );

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = screenToCanvas(event.clientX, event.clientY);
    const clickedAtom = getAtomAtPosition(x, y);
    const clickedBond = getBondAtPosition(x, y);

    if (selectedTool === 'select') {
      setSelectedAtomId(clickedAtom?.id ?? null);
      setSelectedBondId(clickedBond?.id ?? null);
      return;
    }

    if (selectedTool === 'erase') {
      if (clickedAtom) {
        commit({
          ...molecule,
          atoms: molecule.atoms.filter((a) => a.id !== clickedAtom.id),
          bonds: molecule.bonds.filter((b) => b.atom1Id !== clickedAtom.id && b.atom2Id !== clickedAtom.id),
        });
        return;
      }
      if (clickedBond) {
        commit({
          ...molecule,
          bonds: molecule.bonds.filter((b) => b.id !== clickedBond.id),
        });
        return;
      }
    }

    if (selectedTool === 'pen' || selectedTool === 'plushand') {
      setDragMode('draw-freehand');
      setDragStart({ x, y });
      setDragCurrent({ x, y });
      const next = deepClone(molecule);
      next.freehands = [...next.freehands, { id: makeId(), points: [{ x, y }], strokeWidth: 2 }];
      setDragSnapshot(next);
      replacePresent(next);
      setDidDrag(false);
      return;
    }

    if (selectedTool === 'reaction-arrow' || selectedTool === 'equilibrium-arrow' || selectedTool === 'resonance-arrow' || selectedTool === 'retro-arrow' || selectedTool === 'curved-arrow' || selectedTool === 'fishhook-arrow') {
      setDragMode('draw-arrow');
      setDragStart({ x, y });
      setDragCurrent({ x, y });
      return;
    }

    if (selectedTool === 'atom') {
      if (!clickedAtom) {
        const pos = normalizePoint({ x, y }, gridSize, snapToGridEnabled);
        commit({
          ...molecule,
          atoms: [
            ...molecule.atoms,
            {
              id: makeId(),
              symbol: (selectedElement || DEFAULT_ATOM_SYMBOL) as ElementSymbol,
              x: pos.x,
              y: pos.y,
            },
          ],
        });
      }
      return;
    }

    if (selectedTool === 'text') {
      onRequestTextEdit?.({ x, y, initialText: '' });
      return;
    }

    if (selectedTool === 'positive-charge' && clickedAtom) {
      applyAtomStyle(clickedAtom.id, { charge: 1 });
      return;
    }

    if (selectedTool === 'negative-charge' && clickedAtom) {
      applyAtomStyle(clickedAtom.id, { charge: -1 });
      return;
    }

    if (selectedTool === 'partial-positive' && clickedAtom) {
      applyAtomStyle(clickedAtom.id, { text: `${clickedAtom.symbol}δ+` });
      return;
    }

    if (selectedTool === 'partial-negative' && clickedAtom) {
      applyAtomStyle(clickedAtom.id, { text: `${clickedAtom.symbol}δ−` });
      return;
    }

    if (selectedTool === 'radical' && clickedAtom) {
      applyAtomStyle(clickedAtom.id, { radical: true });
      return;
    }

    if (selectedTool === 'lone-pair' && clickedAtom) {
      commit({
        ...molecule,
        freehands: molecule.freehands,
      });
      return;
    }

    if (selectedTool === 'bonding-pair' && clickedAtom) {
      commit({
        ...molecule,
        freehands: molecule.freehands,
      });
      return;
    }

    if (selectedTool === 'benzene-ring') {
      addRing('benzene-ring', x, y);
      return;
    }

    if (selectedTool === 'cyclopentane-ring') {
      addRing('cyclopentane-ring', x, y);
      return;
    }

    if (selectedTool === 'cyclohexane-ring') {
      addRing('cyclohexane-ring', x, y);
      return;
    }

    if (selectedTool === 'boat-conformation') {
      addRing('boat-conformation', x, y);
      return;
    }

    if (selectedTool === 'chair-conformation') {
      addRing('chair-conformation', x, y);
      return;
    }

    if (isBondTool(selectedTool) && clickedAtom) {
      if (!bondStartAtomId) {
        setBondStartAtomId(clickedAtom.id);
        return;
      }

      if (bondStartAtomId !== clickedAtom.id) {
        const bondDef = toolToBond(selectedTool);
        commit({
          ...molecule,
          bonds: [
            ...molecule.bonds,
            {
              id: makeId(),
              atom1Id: bondStartAtomId,
              atom2Id: clickedAtom.id,
              type: bondDef.type,
              order: bondDef.order,
            },
          ],
        });
      }

      setBondStartAtomId(null);
      return;
    }

    if (clickedAtom && selectedTool === 'single-bond') {
      setDragMode('move-atom');
      setDragAtomId(clickedAtom.id);
      setDragSnapshot(deepClone(molecule));
      setDragStart({ x, y });
      setDidDrag(false);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = screenToCanvas(event.clientX, event.clientY);

    if (dragMode === 'move-atom' && dragAtomId && dragSnapshot && dragStart) {
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) setDidDrag(true);

      const next = {
        ...dragSnapshot,
        atoms: dragSnapshot.atoms.map((a) => (a.id === dragAtomId ? { ...a, x: a.x + dx, y: a.y + dy } : a)),
      };
      replacePresent(next);
      return;
    }

    if (dragMode === 'draw-freehand' && dragSnapshot) {
      const next = deepClone(molecule);
      const active = next.freehands[next.freehands.length - 1];
      active.points.push({ x, y });
      replacePresent(next);
      setDragSnapshot(next);
      setDidDrag(true);
      return;
    }

    if (dragMode !== 'idle') {
      setDragCurrent({ x, y });
    }
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = screenToCanvas(event.clientX, event.clientY);

    if (dragMode === 'move-atom' && dragSnapshot) {
      commit(molecule);
    }

    if (dragMode === 'draw-freehand' && dragSnapshot) {
      commit(dragSnapshot);
    }

    if (dragMode === 'draw-arrow' && dragStart && getDistance(dragStart.x, dragStart.y, x, y) > 15) {
      const arrowType: ArrowType =
        selectedTool === 'curved-arrow' || selectedTool === 'fishhook-arrow'
          ? 'curved'
          : selectedTool === 'retro-arrow'
          ? 'retro'
          : selectedTool === 'resonance-arrow'
          ? 'resonance'
          : selectedTool === 'equilibrium-arrow'
          ? 'equilibrium'
          : 'reaction';

      commit({
        ...molecule,
        arrows: [
          ...molecule.arrows,
          {
            id: makeId(),
            start: dragStart,
            end: { x, y },
            type: arrowType,
          } as Arrow,
        ],
      });
    }

    setDragMode('idle');
    setDragAtomId(null);
    setDragStart(null);
    setDragCurrent(null);
    setDragSnapshot(null);
    setDidDrag(false);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (didDrag) return;

    const { x, y } = screenToCanvas(event.clientX, event.clientY);
    const clickedAtom = getAtomAtPosition(x, y);
    const clickedBond = getBondAtPosition(x, y);

    if (selectedTool === 'select') {
      setSelectedAtomId(clickedAtom?.id ?? null);
      setSelectedBondId(clickedBond?.id ?? null);
      return;
    }

    if (selectedTool === 'single-bond' || selectedTool === 'double-bond' || selectedTool === 'triple-bond' || selectedTool === 'wedge-bond' || selectedTool === 'dash-bond' || selectedTool === 'wavy-bond') {
      if (clickedAtom) {
        if (!bondStartAtomId) {
          setBondStartAtomId(clickedAtom.id);
        } else if (bondStartAtomId !== clickedAtom.id) {
          const bondDef = toolToBond(selectedTool);
          commit({
            ...molecule,
            bonds: [
              ...molecule.bonds,
              {
                id: makeId(),
                atom1Id: bondStartAtomId,
                atom2Id: clickedAtom.id,
                type: bondDef.type,
                order: bondDef.order,
              },
            ],
          });
          setBondStartAtomId(null);
        }
      }
      return;
    }

    if (selectedTool === 'positive-charge' && clickedAtom) {
      applyAtomStyle(clickedAtom.id, { charge: 1 });
      return;
    }

    if (selectedTool === 'negative-charge' && clickedAtom) {
      applyAtomStyle(clickedAtom.id, { charge: -1 });
      return;
    }

    if (selectedTool === 'partial-positive' && clickedAtom) {
      applyAtomStyle(clickedAtom.id, { text: `${clickedAtom.symbol}δ+` });
      return;
    }

    if (selectedTool === 'partial-negative' && clickedAtom) {
      applyAtomStyle(clickedAtom.id, { text: `${clickedAtom.symbol}δ−` });
      return;
    }

    if (selectedTool === 'radical' && clickedAtom) {
      applyAtomStyle(clickedAtom.id, { radical: true });
      return;
    }

    if (selectedTool === 'atom') {
      if (!clickedAtom) {
        const pos = normalizePoint({ x, y }, gridSize, snapToGridEnabled);
        commit({
          ...molecule,
          atoms: [
            ...molecule.atoms,
            {
              id: makeId(),
              symbol: (selectedElement || DEFAULT_ATOM_SYMBOL) as ElementSymbol,
              x: pos.x,
              y: pos.y,
            },
          ],
        });
      }
      return;
    }

    if (selectedTool === 'text') {
      onRequestTextEdit?.({ x, y, initialText: '' });
      return;
    }
  };

  useEffect(() => {
    if (!contextMenu.visible) return;
    const close = () => setContextMenu((prev) => ({ ...prev, visible: false, target: null }));
    window.addEventListener('click', close);
    window.addEventListener('contextmenu', close);
    return () => {
      window.removeEventListener('click', close);
      window.removeEventListener('contextmenu', close);
    };
  }, [contextMenu.visible]);

  return (
    <div ref={wrapperRef} className={styles.canvasArea}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onContextMenu={handleContextMenu}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleCanvasClick}
      />

      {contextMenu.visible && contextMenu.target && (
        <div className={styles.contextMenu} style={{ left: contextMenu.x, top: contextMenu.y }}>
          <div className={styles.contextMenuTitle}>Color Palette</div>
          <div className={styles.colorGrid}>
            {PALETTE_24.map((color) => (
              <button
                key={color}
                type="button"
                className={styles.colorSwatch}
                style={{ backgroundColor: color }}
                onClick={() => applyColorToTarget(color)}
                aria-label={color}
              />
            ))}
          </div>
        </div>
      )}

      {onRequestTextEdit && selectedTool === 'text' && (
        <div className={styles.textEditorHint}>برای ثبت متن، از callback والد استفاده کن.</div>
      )}
    </div>
  );
};

const Canvas = forwardRef<CanvasRef, CanvasProps>(CanvasInner);
Canvas.displayName = 'Canvas';

export default Canvas;
