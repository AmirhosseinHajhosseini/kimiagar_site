'use client';

import React from 'react';
import clsx from 'clsx';
import {
  Pencil,
  CircleDot,
  Minus,
  Trash2,
  Undo2,
  Redo2,
  Eraser,
  Grid2X2,
  Search,
  Move,
  Type,
  RotateCcw,
  FlipHorizontal,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import { COMMON_ELEMENTS, ToolType } from './types';

interface ToolbarProps {
  selectedTool: ToolType;
  selectedElement: string;
  customElement: string;
  showGrid: boolean;
  zoom: number;
  onSelectTool: (tool: ToolType) => void;
  onSelectElement: (element: string) => void;
  onCustomElementChange: (value: string) => void;
  onCustomElementSubmit: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onToggleGrid: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
}

const TOOL_ITEMS: { tool: ToolType; label: string; icon: React.ReactNode }[] = [
  { tool: 'atom', label: 'Atom', icon: <Pencil size={16} /> },
  { tool: 'single-bond', label: 'Single', icon: <Minus size={16} /> },
  { tool: 'double-bond', label: 'Double', icon: <Minus size={16} /> },
  { tool: 'triple-bond', label: 'Triple', icon: <Minus size={16} /> },
  { tool: 'move', label: 'Move', icon: <Move size={16} /> },
  { tool: 'rotate', label: 'Rotate', icon: <RotateCcw size={16} /> },
  { tool: 'mirror', label: 'Mirror', icon: <FlipHorizontal size={16} /> },
  { tool: 'text', label: 'Text', icon: <Type size={16} /> },
  { tool: 'erase', label: 'Erase', icon: <Eraser size={16} /> },
];

export default function Toolbar({
  selectedTool,
  selectedElement,
  customElement,
  showGrid,
  zoom,
  onSelectTool,
  onSelectElement,
  onCustomElementChange,
  onCustomElementSubmit,
  onUndo,
  onRedo,
  onClear,
  onToggleGrid,
  onZoomIn,
  onZoomOut,
  onFit,
}: ToolbarProps) {
  return (
    <div className="sidebar toolbar">
      <div className="panelSection">
        <div className="panelTitle">Tools</div>
        <div className="toolGroup">
          {TOOL_ITEMS.map((item) => (
            <button
              key={item.tool}
              className={clsx('toolButton', selectedTool === item.tool && 'activeTool')}
              onClick={() => onSelectTool(item.tool)}
              type="button"
              aria-pressed={selectedTool === item.tool}
            >
              <span className="toolIcon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="panelSection">
        <div className="panelTitle">Elements</div>

        <div className="elementGrid">
          {COMMON_ELEMENTS.map((el) => (
            <button
              key={el}
              type="button"
              className={clsx('elementButton', selectedElement === el && 'activeElement')}
              onClick={() => onSelectElement(el)}
            >
              {el}
            </button>
          ))}
        </div>

        <div className="customElementForm">
          <input
            type="text"
            value={customElement}
            onChange={(e) => onCustomElementChange(e.target.value)}
            placeholder="Custom element"
            className="customInput"
          />
          <button type="button" className="customSubmitBtn" onClick={onCustomElementSubmit}>
            Add
          </button>
        </div>
      </div>

      <div className="panelSection">
        <div className="panelTitle">Actions</div>
        <div className="actionStack">
          <button className="actionButtonFull" type="button" onClick={onUndo}>
            <Undo2 size={16} /> Undo
          </button>
          <button className="actionButtonFull" type="button" onClick={onRedo}>
            <Redo2 size={16} /> Redo
          </button>
          <button className="actionButtonFull danger" type="button" onClick={onClear}>
            <Trash2 size={16} /> Clear
          </button>
          <button className="actionButtonFull" type="button" onClick={onToggleGrid}>
            <Grid2X2 size={16} /> {showGrid ? 'Hide Grid' : 'Show Grid'}
          </button>
          <button className="actionButtonFull" type="button" onClick={onZoomIn}>
            <ZoomIn size={16} /> Zoom In
          </button>
          <button className="actionButtonFull" type="button" onClick={onZoomOut}>
            <ZoomOut size={16} /> Zoom Out
          </button>
          <button className="actionButtonFull" type="button" onClick={onFit}>
            <Maximize2 size={16} /> Fit
          </button>
        </div>

        <div className="zoomBadge">Zoom: {Math.round(zoom * 100)}%</div>
      </div>
    </div>
  );
}
