"use client";

import type { InteractionMode } from "./types";
import styles from "./MoleculeDrawer.module.css";

interface ToolbarItem {
  mode: InteractionMode;
  label: string;
  icon: string;
  shortcut: string;
}

const toolbarItems: readonly ToolbarItem[] = [
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
];

interface MoleculeToolbarProps {
  activeMode: InteractionMode;
  showGrid: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onModeChange: (mode: InteractionMode) => void;
  onToggleGrid: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export default function MoleculeToolbar({
  activeMode,
  showGrid,
  canUndo,
  canRedo,
  onModeChange,
  onToggleGrid,
  onUndo,
  onRedo,
}: MoleculeToolbarProps) {
  return (
    <nav
      className={styles.toolbar}
      aria-label="نوار ابزار Molecuedrawer"
    >
      <div className={styles.toolbarGroup}>
        {toolbarItems.map((item) => {
          const isActive =
            activeMode === item.mode;

          return (
            <button
              key={item.mode}
              type="button"
              className={`${styles.toolButton} ${
                isActive
                  ? styles.toolButtonActive
                  : ""
              }`}
              onClick={() =>
                onModeChange(item.mode)
              }
              aria-pressed={isActive}
              aria-label={item.label}
              title={`${item.label} — میانبر ${item.shortcut}`}
            >
              <span className={styles.toolIcon}>
                {item.icon}
              </span>

              <span className={styles.toolLabel}>
                {item.label}
              </span>

              <kbd>{item.shortcut}</kbd>
            </button>
          );
        })}
      </div>

      <div className={styles.toolbarDivider} />

      <div className={styles.toolbarGroup}>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={onToggleGrid}
          aria-pressed={showGrid}
          title="نمایش یا مخفی کردن شبکه"
        >
          <span>▦</span>
          شبکه
        </button>

        <button
          type="button"
          className={styles.secondaryButton}
          onClick={onUndo}
          disabled={!canUndo}
          title="بازگشت آخرین تغییر"
          aria-label="بازگشت"
        >
          ↶ بازگشت
        </button>

        <button
          type="button"
          className={styles.secondaryButton}
          onClick={onRedo}
          disabled={!canRedo}
          title="انجام دوباره آخرین تغییر"
          aria-label="انجام دوباره"
        >
          ↷ دوباره
        </button>
      </div>
    </nav>
  );
}
