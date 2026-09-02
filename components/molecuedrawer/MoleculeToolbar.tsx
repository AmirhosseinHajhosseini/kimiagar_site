"use client";

import { useEffect, useState } from "react";
import type { InteractionMode, ThemeState } from "./types";
import styles from "./MoleculeDrawer.module.css";

import {
  DEFAULT_TEXT_TOOL_SETTINGS,
  TEXT_COLORS,
  type TextColorName,
  type TextSizeName,
  type TextToolSettingsValue,
} from "./chemistry/text-tool/types";

interface ToolbarItem {
  readonly mode: InteractionMode;
  readonly label: string;
  readonly icon: string;
}

const TOOLBAR_ITEMS: readonly ToolbarItem[] = [
  { mode: "select", label: "انتخاب", icon: "⌁" },
  { mode: "add-atom", label: "اتم", icon: "C" },
  { mode: "add-bond", label: "پیوند", icon: "／" },
  { mode: "add-ring", label: "حلقه", icon: "⬡" },
  {
    mode: "add-functional-group",
    label: "گروه عاملی",
    icon: "OH",
  },
  { mode: "add-arrow", label: "فلش مکانیزمی", icon: "↝" },
  { mode: "add-charge", label: "بار الکتریکی", icon: "±" },
  { mode: "add-electron", label: "الکترون", icon: "••" },
  { mode: "add-text", label: "متن", icon: "T" },
  { mode: "brush", label: "قلم‌مو", icon: "✎" },
  { mode: "erase", label: "پاک‌کن", icon: "⌫" },
];

const COLOR_OPTIONS: readonly TextColorName[] = [
  "red",
  "blue",
  "green",
  "black",
  "pink",
];

const SIZE_ORDER: readonly TextSizeName[] = ["small", "medium", "large"];

interface MoleculeToolbarProps {
  activeMode: InteractionMode;
  showGrid: boolean;
  snapToGrid?: boolean;
  canUndo: boolean;
  canRedo: boolean;
  themeMode: ThemeState["mode"];
  textToolSettings?: TextToolSettingsValue;

  onModeChange: (mode: InteractionMode) => void;
  onTextToolSettingsChange?: (settings: TextToolSettingsValue) => void;

  onToggleGrid: () => void;
  onToggleSnapToGrid?: () => void;
  onClearCanvas: () => void;
  onToggleTheme: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export default function MoleculeToolbar({
  activeMode,
  showGrid,
  snapToGrid = false,
  canUndo,
  canRedo,
  themeMode,
  textToolSettings = DEFAULT_TEXT_TOOL_SETTINGS,
  onModeChange,
  onTextToolSettingsChange,
  onToggleGrid,
  onToggleSnapToGrid,
  onClearCanvas,
  onToggleTheme,
  onUndo,
  onRedo,
}: MoleculeToolbarProps) {
  const [isTextSettingsOpen, setIsTextSettingsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  useEffect(() => {
    if (!isTextSettingsOpen) return;

    const handleClickOutside = () => {
      setIsTextSettingsOpen(false);
    };

    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [isTextSettingsOpen]);

  const updateTextSettings = (patch: Partial<TextToolSettingsValue>) => {
    onTextToolSettingsChange?.({
      ...textToolSettings,
      ...patch,
    });
  };

  const handleNextColor = () => {
    const currentIndex = COLOR_OPTIONS.indexOf(textToolSettings.color);
    const nextIndex = (currentIndex + 1) % COLOR_OPTIONS.length;
    updateTextSettings({ color: COLOR_OPTIONS[nextIndex] });
  };

  const handleDecreaseSize = () => {
    const currentIndex = SIZE_ORDER.indexOf(textToolSettings.size);
    if (currentIndex > 0) {
      updateTextSettings({ size: SIZE_ORDER[currentIndex - 1] });
    }
  };

  const handleIncreaseSize = () => {
    const currentIndex = SIZE_ORDER.indexOf(textToolSettings.size);
    if (currentIndex < SIZE_ORDER.length - 1) {
      updateTextSettings({ size: SIZE_ORDER[currentIndex + 1] });
    }
  };

  const currentHexColor =
    TEXT_COLORS[textToolSettings.color] ?? TEXT_COLORS.red;

  return (
    <nav
      className={styles.toolbar}
      aria-label="نوار ابزار Molecule Drawer"
      dir="rtl"
    >
      <div className={styles.toolbarGroup}>
        {TOOLBAR_ITEMS.map((item) => {
          const isActive = activeMode === item.mode;
          const isTextTool = item.mode === "add-text";

          if (isTextTool) {
            return (
              <div
                key={item.mode}
                style={{ position: "relative" }}
                onContextMenu={(event) => event.preventDefault()}
              >
                <button
                  type="button"
                  className={`${styles.toolButton} ${
                    isActive ? styles.toolButtonActive : ""
                  }`}
                  aria-pressed={isActive}
                  aria-label="متن"
                  title="متن — کلیک راست برای تغییر رنگ و اندازه"
                  onClick={() => onModeChange("add-text")}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    const rect = event.currentTarget.getBoundingClientRect();
                    setMenuPosition({
                      top: rect.bottom + 8,
                      left: rect.left + rect.width / 2,
                    });

                    onModeChange("add-text");
                    setIsTextSettingsOpen((open) => !open);
                  }}
                >
                  <span
                    className={styles.toolIcon}
                    aria-hidden="true"
                    style={{ color: currentHexColor, fontWeight: 900 }}
                  >
                    T
                  </span>

                  <span className={styles.toolLabel}>متن</span>
                  <kbd>T</kbd>
                </button>

                {isTextSettingsOpen && (
                  <div
                    className={styles.compactTextMenu}
                    role="dialog"
                    aria-label="تنظیمات متن"
                    style={{
                      position: "fixed",
                      top: `${menuPosition.top}px`,
                      left: `${menuPosition.left}px`,
                      transform: "translateX(-50%)",
                      zIndex: 2147483647,
                    }}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={(event) => event.stopPropagation()}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                  >
                    {/* دکمه انتخاب / چرخش بین رنگ‌ها */}
                    <button
                      type="button"
                      className={styles.compactColorButton}
                      style={{ backgroundColor: currentHexColor }}
                      aria-label={`تغییر رنگ متن (فعلی: ${textToolSettings.color})`}
                      title="کلیک برای تغییر رنگ"
                      onClick={handleNextColor}
                    />

                    {/* دکمه کاهش اندازه */}
                    <button
                      type="button"
                      className={styles.compactSizeButton}
                      aria-label="کاهش اندازه متن"
                      title="کوچک‌تر"
                      onClick={handleDecreaseSize}
                      disabled={textToolSettings.size === "small"}
                    >
                      A−
                    </button>

                    {/* نمایش اندازه فعلی */}
                    <span
                      className={styles.compactSizeValue}
                      aria-label={`اندازه متن: ${textToolSettings.size}`}
                    >
                      {textToolSettings.size === "small"
                        ? "S"
                        : textToolSettings.size === "medium"
                          ? "M"
                          : "L"}
                    </span>

                    {/* دکمه افزایش اندازه */}
                    <button
                      type="button"
                      className={styles.compactSizeButton}
                      aria-label="افزایش اندازه متن"
                      title="بزرگ‌تر"
                      onClick={handleIncreaseSize}
                      disabled={textToolSettings.size === "large"}
                    >
                      A+
                    </button>
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={item.mode}
              type="button"
              className={`${styles.toolButton} ${
                isActive ? styles.toolButtonActive : ""
              }`}
              aria-pressed={isActive}
              aria-label={item.label}
              title={item.label}
              onClick={() => onModeChange(item.mode)}
            >
              <span className={styles.toolIcon} aria-hidden="true">
                {item.icon}
              </span>

              <span className={styles.toolLabel}>{item.label}</span>
             
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
          onClick={onToggleTheme}
          aria-label="تغییر تم"
          title="تغییر حالت تم"
        >
          <span aria-hidden="true">
            {themeMode === "light" ? "🌙" : "☀️"}
          </span>
          {themeMode === "light" ? "تم تاریک" : "تم روشن"}
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
          className={`${styles.secondaryButton} ${styles.dangerButton}`}
          onClick={onClearCanvas}
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
