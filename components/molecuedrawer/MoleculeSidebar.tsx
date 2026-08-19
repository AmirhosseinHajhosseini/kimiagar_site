"use client";

import { useState } from "react";

import { ELEMENTS } from "./constants";
import type {
  BondOrder,
  BondType,
  ElementSymbol,
  InteractionMode,
  MechanismDocument,
} from "./types";

import { getElementData } from "./chemistry/atomData";

import styles from "./MoleculeDrawer.module.css";

interface MoleculeSidebarProps {
  document: MechanismDocument;
  onModeChange: (mode: InteractionMode) => void;
  onElementChange: (element: ElementSymbol) => void;
  onBondChange: (
    bondType: BondType,
    bondOrder: BondOrder,
  ) => void;
  onToggleGrid: () => void;
  onToggleSnap: () => void;
  onClearSelection: () => void;
}

const BOND_TYPES: ReadonlyArray<{
  id: BondType;
  order: BondOrder;
  label: string;
  symbol: string;
}> = [
  {
    id: "single",
    order: 1,
    label: "پیوند یگانه",
    symbol: "—",
  },
  {
    id: "double",
    order: 2,
    label: "پیوند دوگانه",
    symbol: "=",
  },
  {
    id: "triple",
    order: 3,
    label: "پیوند سه‌گانه",
    symbol: "≡",
  },
  {
    id: "solid-wedge",
    order: 1,
    label: "گوه‌ای پر",
    symbol: "▲",
  },
  {
    id: "hashed-wedge",
    order: 1,
    label: "گوه‌ای خط‌چین",
    symbol: "▱",
  },
  {
    id: "dashed",
    order: 1,
    label: "خط‌چین",
    symbol: "┄",
  },
  {
    id: "wavy",
    order: 1,
    label: "موج‌دار",
    symbol: "〰",
  },
];

const RING_TYPES = [
  {
    id: "cyclopropane",
    label: "سیکلوپروپان",
    symbol: "△",
  },
  {
    id: "cyclobutane",
    label: "سیکلوبوتان",
    symbol: "□",
  },
  {
    id: "cyclopentane",
    label: "سیکلوپنتان",
    symbol: "⬠",
  },
  {
    id: "benzene",
    label: "بنزن",
    symbol: "⬡",
  },
] as const;

const FUNCTIONAL_GROUPS = [
  {
    id: "oh",
    label: "هیدروکسیل",
    symbol: "OH",
  },
  {
    id: "nh2",
    label: "آمینو",
    symbol: "NH₂",
  },
  {
    id: "cooh",
    label: "کربوکسیل",
    symbol: "COOH",
  },
  {
    id: "cho",
    label: "آلدهید",
    symbol: "CHO",
  },
  {
    id: "co",
    label: "کربونیل",
    symbol: "C=O",
  },
  {
    id: "no2",
    label: "نیترو",
    symbol: "NO₂",
  },
] as const;

type PaletteSelection = {
  type: "bond" | "ring" | "functional-group";
  id: string;
} | null;

export default function MoleculeSidebar({
  document,
  onModeChange,
  onElementChange,
  onBondChange,
  onToggleGrid,
  onToggleSnap,
  onClearSelection,
}: MoleculeSidebarProps) {
  const [paletteSelection, setPaletteSelection] =
    useState<PaletteSelection>(null);

  const selectPaletteItem = (
    type: PaletteSelection extends infer T
      ? T extends { type: infer U }
        ? U
        : never
      : never,
    id: string,
    mode: InteractionMode,
  ) => {
    setPaletteSelection({ type, id });
    onModeChange(mode);
  };

  const handleBondChange = (
    bondType: BondType,
    bondOrder: BondOrder,
  ) => {
    setPaletteSelection({
      type: "bond",
      id: bondType,
    });

    onBondChange(bondType, bondOrder);
  };

  return (
    <aside
      className={styles.leftSidebar}
      aria-label="پنل ابزارهای شیمیایی"
    >
      <section className={styles.sidebarSection}>
        <h2 className={styles.sidebarTitle}>
          ابزارها
        </h2>

        <button
          type="button"
          className={`${styles.sidebarAction} ${
            document.tool.mode === "select"
              ? styles.sidebarActionActive
              : ""
          }`}
          onClick={() => {
            setPaletteSelection(null);
            onModeChange("select");
          }}
        >
          <span aria-hidden="true">⌁</span>
          انتخاب
        </button>

        <button
          type="button"
          className={`${styles.sidebarAction} ${
            document.tool.mode === "pan"
              ? styles.sidebarActionActive
              : ""
          }`}
          onClick={() => {
            setPaletteSelection(null);
            onModeChange("pan");
          }}
        >
          <span aria-hidden="true">✋</span>
          جابه‌جایی بوم
        </button>

        <button
          type="button"
          className={styles.sidebarAction}
          onClick={onClearSelection}
        >
          <span aria-hidden="true">×</span>
          لغو انتخاب
        </button>
      </section>

      <section className={styles.sidebarSection}>
        <h2 className={styles.sidebarTitle}>
          اتم‌ها
        </h2>

        <div className={styles.elementGrid}>
          {ELEMENTS.map((element) => {
            const elementData =
              getElementData(element);

            const isActive =
              document.tool.selectedElement ===
                element &&
              document.tool.mode === "add-atom";

            return (
              <button
                key={element}
                type="button"
                className={`${styles.elementButton} ${
                  isActive
                    ? styles.elementButtonActive
                    : ""
                }`}
                onClick={() => {
                  setPaletteSelection(null);
                  onElementChange(element);
                }}
                title={`${elementData.name} - ${elementData.persianName}`}
                aria-label={`افزودن عنصر ${elementData.persianName}`}
                aria-pressed={isActive}
              >
                <span
                  className={styles.elementSymbol}
                  style={{
                    backgroundColor:
                      elementData.defaultColor,
                    color:
                      elementData.defaultTextColor,
                  }}
                >
                  {element}
                </span>

                <span className={styles.elementName}>
                  {elementData.persianName}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className={styles.sidebarSection}>
        <h2 className={styles.sidebarTitle}>
          پیوندها
        </h2>

        <div className={styles.elementGrid}>
          {BOND_TYPES.map((bond) => {
            const isActive =
              document.tool.mode === "add-bond" &&
              document.tool.selectedBondType ===
                bond.id &&
              document.tool.selectedBondOrder ===
                bond.order;

            return (
              <button
                key={bond.id}
                type="button"
                className={`${styles.elementButton} ${
                  isActive
                    ? styles.elementButtonActive
                    : ""
                }`}
                onClick={() =>
                  handleBondChange(
                    bond.id,
                    bond.order,
                  )
                }
                aria-pressed={isActive}
                title={bond.label}
              >
                <span
                  className={styles.elementSymbol}
                  aria-hidden="true"
                >
                  {bond.symbol}
                </span>

                <span className={styles.elementName}>
                  {bond.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className={styles.sidebarSection}>
        <h2 className={styles.sidebarTitle}>
          حلقه‌ها
        </h2>

        <div className={styles.elementGrid}>
          {RING_TYPES.map((ring) => {
            const isActive =
              paletteSelection?.type === "ring" &&
              paletteSelection.id === ring.id &&
              document.tool.mode === "add-ring";

            return (
              <button
                key={ring.id}
                type="button"
                className={`${styles.elementButton} ${
                  isActive
                    ? styles.elementButtonActive
                    : ""
                }`}
                onClick={() =>
                  selectPaletteItem(
                    "ring",
                    ring.id,
                    "add-ring",
                  )
                }
                aria-pressed={isActive}
                title={ring.label}
              >
                <span
                  className={styles.elementSymbol}
                  aria-hidden="true"
                >
                  {ring.symbol}
                </span>

                <span className={styles.elementName}>
                  {ring.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className={styles.sidebarSection}>
        <h2 className={styles.sidebarTitle}>
          گروه‌های عاملی
        </h2>

        <div className={styles.elementGrid}>
          {FUNCTIONAL_GROUPS.map((group) => {
            const isActive =
              paletteSelection?.type ===
                "functional-group" &&
              paletteSelection.id === group.id &&
              document.tool.mode ===
                "add-functional-group";

            return (
              <button
                key={group.id}
                type="button"
                className={`${styles.elementButton} ${
                  isActive
                    ? styles.elementButtonActive
                    : ""
                }`}
                onClick={() =>
                  selectPaletteItem(
                    "functional-group",
                    group.id,
                    "add-functional-group",
                  )
                }
                aria-pressed={isActive}
                title={group.label}
              >
                <span
                  className={styles.elementSymbol}
                  aria-hidden="true"
                >
                  {group.symbol}
                </span>

                <span className={styles.elementName}>
                  {group.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className={styles.sidebarSection}>
        <h2 className={styles.sidebarTitle}>
          نمایش
        </h2>

        <label className={styles.switchRow}>
          <span>شبکه</span>

          <input
            type="checkbox"
            checked={document.viewport.showGrid}
            onChange={onToggleGrid}
          />
        </label>

        <label className={styles.switchRow}>
          <span>چسبیدن به شبکه</span>

          <input
            type="checkbox"
            checked={document.viewport.snapToGrid}
            onChange={onToggleSnap}
          />
        </label>
      </section>

      <section className={styles.sidebarSection}>
        <h2 className={styles.sidebarTitle}>
          وضعیت
        </h2>

        <div className={styles.infoCard}>
          <span>ابزار فعال</span>
          <strong>{document.tool.mode}</strong>
        </div>

        <div className={styles.infoCard}>
          <span>تعداد آبجکت‌ها</span>
          <strong>{document.objects.length}</strong>
        </div>
      </section>
    </aside>
  );
}
