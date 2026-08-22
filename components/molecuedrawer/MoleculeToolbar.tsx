"use client";

import type { InteractionMode } from "./types";
import styles from "./MoleculeDrawer.module.css";

interface ToolbarItem {
  readonly mode: InteractionMode;
  readonly label: string;
  readonly icon: string;
  readonly shortcut: string;
}

const TOOLBAR_ITEMS: readonly ToolbarItem[] = [
  {
    mode: "select",
    label: "انتخاب",
    icon: "⌁",
    shortcut: "V",
  },
  {
    mode: "add-atom",
    label: "اتم",
    icon: "C",
    shortcut: "A",
  },
  {
    mode: "add-bond",
    label: "پیوند",
    icon: "／",
    shortcut: "B",
  },
  {
    mode: "add-ring",
    label: "حلقه",
    icon: "⬡",
    shortcut: "R",
  },
  {
    mode: "add-functional-group",
    label: "گروه عاملی",
    icon: "OH",
    shortcut: "G",
  },
  {
    mode: "add-arrow",
    label: "فلش مکانیزمی",
    icon: "↝",
    shortcut: "E",
  },
  {
    mode: "add-charge",
    label: "بار الکتریکی",
    icon: "±",
    shortcut: "Q",
  },
  {
    mode: "add-electron",
    label: "الکترون",
    icon: "••",
    shortcut: "L",
  },
  {
    mode: "add-text",
    label: "متن",
    icon: "T",
    shortcut: "T",
  },
  {
    mode: "brush",
    label: "قلم‌مو",
    icon: "✎",
    shortcut: "P",
  },
  {
    mode: "erase",
    label: "پاک‌کن",
    icon: "⌫",
    shortcut: "X",
  },
  {
    mode: "pan",
    label: "جابه‌جایی",
    icon: "✋",
    shortcut: "H",
  },
];

interface MoleculeToolbarProps {
  activeMode: InteractionMode;
  showGrid: boolean;
  snapToGrid?: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onModeChange: (mode: InteractionMode) => void;
  onToggleGrid: () => void;
  onToggleSnapToGrid?: () => void;
  onClearCanvas?: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export default function MoleculeToolbar({
  activeMode,
  showGrid,
  snapToGrid = false,
  canUndo,
  canRedo,
  onModeChange,
  onToggleGrid,
  onToggleSnapToGrid,
  onClearCanvas,
  onUndo,
  onRedo,
}: MoleculeToolbarProps) {
  return (
    <nav
      className={styles.toolbar}
      aria-label="نوار ابزار Molecule Drawer"
      dir="rtl"
    >
      <div className={styles.toolbarGroup}>
        {TOOLBAR_ITEMS.map((item) => {
          const isActive = activeMode === item.mode;

          return (
            <button
              key={item.mode}
              type="button"
              className={`${styles.toolButton} ${
                isActive ? styles.toolButtonActive : ""
              }`}
              aria-pressed={isActive}
              aria-label={item.label}
              title={`${item.label} — میانبر ${item.shortcut}`}
              onClick={() => onModeChange(item.mode)}
            >
              <span className={styles.toolIcon} aria-hidden="true">
                {item.icon}
              </span>
              <span className={styles.toolLabel}>{item.label}</span>
              <kbd>{item.shortcut}</kbd>
            </button>
          );
        })}
      </div>

      <div className={styles.toolbarDivider} aria-hidden="true" />

      <div className={styles.toolbarGroup}>
        <button
          type="button"
          className={`${styles.secondaryButton} ${
            showGrid ? styles.secondaryButtonActive : ""
          }`}
          onClick={onToggleGrid}
          aria-pressed={showGrid}
          aria-label={showGrid ? "مخفی کردن شبکه" : "نمایش شبکه"}
          title={showGrid ? "مخفی کردن شبکه" : "نمایش شبکه"}
        >
          <span aria-hidden="true">▦</span>
          شبکه
        </button>

        <button
          type="button"
          className={`${styles.secondaryButton} ${
            snapToGrid ? styles.secondaryButtonActive : ""
          }`}
          onClick={onToggleSnapToGrid}
          disabled={!onToggleSnapToGrid}
          aria-pressed={snapToGrid}
          aria-label="چسبیدن به شبکه"
          title={
            snapToGrid
              ? "غیرفعال کردن چسبیدن به شبکه"
              : "فعال کردن چسبیدن به شبکه"
          }
        >
          <span aria-hidden="true">⊞</span>
          چسبش
        </button>

        <button
          type="button"
          className={styles.secondaryButton}
          onClick={onUndo}
          disabled={!canUndo}
          aria-label="بازگشت"
          title="بازگشت آخرین تغییر"
        >
          <span aria-hidden="true">↶</span>
          بازگشت
        </button>

        <button
          type="button"
          className={styles.secondaryButton}
          onClick={onRedo}
          disabled={!canRedo}
          aria-label="انجام دوباره"
          title="انجام دوباره آخرین تغییر"
        >
          <span aria-hidden="true">↷</span>
          دوباره
        </button>

        <button
          type="button"
          className={styles.secondaryButton}
          onClick={onClearCanvas}
          disabled={!onClearCanvas}
          aria-label="پاک‌سازی کامل بوم"
          title="پاک‌سازی کامل بوم"
        >
          <span aria-hidden="true">⟳</span>
          پاک‌سازی
        </button>
      </div>
    </nav>
  );
}
