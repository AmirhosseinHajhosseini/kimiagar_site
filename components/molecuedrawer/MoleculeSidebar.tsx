"use client";

import { useState, type ReactNode } from "react";
import { ELEMENTS } from "./constants";
import { getElementData } from "./chemistry/atomData";
import type {
  ArrowType,
  BondOrder,
  BondType,
  ChargeKind,
  ElectronDisplay,
  ElementSymbol,
  InteractionMode,
  MechanismDocument,
  RingKind,
} from "./types";
import styles from "./MoleculeDrawer.module.css";

export type ReactionOperatorKind =
  | "plus"
  | "heat"
  | "light"
  | "bracket"
  | "equilibrium-constant";

export interface MoleculeSidebarProps {
  document: MechanismDocument;
  onModeChange: (mode: InteractionMode) => void;
  onElementChange: (element: ElementSymbol) => void;
  onBondChange: (bondType: BondType, bondOrder: BondOrder) => void;
  onRingChange: (ringKind: RingKind) => void;
  onChargeChange: (charge: ChargeKind) => void;
  onElectronChange: (electronDisplay: ElectronDisplay) => void;
  onArrowChange: (arrowType: ArrowType) => void;
  onFunctionalGroupChange: (groupId: string) => void;
  onOperatorSelect?: (operator: ReactionOperatorKind) => void;
  onToggleGrid: () => void;
  onToggleSnap: () => void;
  onClearSelection: () => void;
}

const GENERAL_TOOLS: ReadonlyArray<{
  id: Extract<InteractionMode, "select" | "pan" | "brush" | "add-text">;
  label: string;
  icon: string;
}> = [
  { id: "select", label: "انتخاب", icon: "⌁" },
  { id: "pan", label: "جابه‌جایی بوم", icon: "✋" },
  { id: "brush", label: "قلم‌مو", icon: "🖌️" },
  { id: "add-text", label: "متن / برچسب", icon: "🔤" },
];

const BOND_TYPES: ReadonlyArray<{
  id: BondType;
  order: BondOrder;
  label: string;
  symbol: string;
}> = [
  { id: "single", order: 1, label: "پیوند یگانه", symbol: "—" },
  { id: "double", order: 2, label: "پیوند دوگانه", symbol: "=" },
  { id: "triple", order: 3, label: "پیوند سه‌گانه", symbol: "≡" },
  { id: "aromatic", order: 1.5, label: "پیوند آروماتیک", symbol: "⌁" },
  { id: "solid-wedge", order: 1, label: "گوه‌ای پر", symbol: "▲" },
  { id: "hashed-wedge", order: 1, label: "گوه‌ای خط‌چین", symbol: "▱" },
  { id: "dashed", order: 1, label: "پیوند خط‌چین", symbol: "┄" },
  { id: "wavy", order: 1, label: "پیوند موج‌دار", symbol: "〰" },
];

const RING_TYPES: ReadonlyArray<{
  id: RingKind;
  label: string;
  symbol: string;
}> = [
  { id: "cyclopropane", label: "سیکلوپروپان", symbol: "△" },
  { id: "cyclobutane", label: "سیکلوبوتان", symbol: "□" },
  { id: "cyclopentane", label: "سیکلوپنتان", symbol: "⬠" },
  { id: "cyclohexane", label: "سیکلوهگزان", symbol: "⬡" },
  { id: "benzene", label: "بنزن", symbol: "⌬" },
];

const FUNCTIONAL_GROUPS: ReadonlyArray<{
  id: string;
  label: string;
  symbol: string;
}> = [
  { id: "oh", label: "هیدروکسیل", symbol: "OH" },
  { id: "nh2", label: "آمینو", symbol: "NH₂" },
  { id: "cooh", label: "کربوکسیل", symbol: "COOH" },
  { id: "cho", label: "آلدهید", symbol: "CHO" },
  { id: "co", label: "کربونیل", symbol: "C=O" },
  { id: "no2", label: "نیترو", symbol: "NO₂" },
  { id: "so3h", label: "سولفونیک اسید", symbol: "SO₃H" },
  { id: "cn", label: "سیانو / نیتریل", symbol: "C≡N" },
];

const CHARGES: ReadonlyArray<{
  id: ChargeKind;
  label: string;
  symbol: string;
}> = [
  { id: "formal-positive", label: "بار رسمی مثبت (+1)", symbol: "⊕" },
  { id: "formal-negative", label: "بار رسمی منفی (-1)", symbol: "⊖" },
  { id: "formal-positive-double", label: "بار رسمی مثبت (+2)", symbol: "²⁺" },
  { id: "formal-negative-double", label: "بار رسمی منفی (-2)", symbol: "²⁻" },
  { id: "partial-positive", label: "بار جزئی مثبت", symbol: "δ⁺" },
  { id: "partial-negative", label: "بار جزئی منفی", symbol: "δ⁻" },
  { id: "remove", label: "حذف بار", symbol: "○" },
];

const ELECTRONS: ReadonlyArray<{
  id: ElectronDisplay;
  label: string;
  symbol: string;
}> = [
  { id: "lone-pair", label: "جفت‌الکترون ناپیوندی", symbol: "••" },
  { id: "single-electron", label: "رادیکال / تک‌الکترون", symbol: "•" },
  { id: "none", label: "حذف نمایش الکترون", symbol: "○" },
];

const REACTION_OPERATORS: ReadonlyArray<{
  id: ReactionOperatorKind;
  label: string;
  symbol: string;
}> = [
  { id: "plus", label: "عملگر جمع واکنش", symbol: "+" },
  { id: "heat", label: "حرارت / گرما", symbol: "Δ" },
  { id: "light", label: "شرایط نوری / تابش", symbol: "hν" },
  { id: "bracket", label: "براکت / حالت گذار", symbol: "[ ]‡" },
  { id: "equilibrium-constant", label: "ثابت تعادل", symbol: "K" },
];

const ARROW_TYPES: ReadonlyArray<{
  id: ArrowType;
  label: string;
  symbol: string;
}> = [
  { id: "straight-reaction", label: "فلش مستقیم واکنش", symbol: "→" },
  { id: "curved-reaction", label: "فلش خمیده مکانیسمی", symbol: "↷" },
  { id: "electron-pair", label: "فلش جفت‌الکترونی", symbol: "↷" },
  { id: "single-electron", label: "فلش تک‌الکترونی", symbol: "↝" },
  { id: "resonance", label: "فلش رزونانسی", symbol: "↔" },
  { id: "equilibrium", label: "فلش تعادلی", symbol: "⇌" },
  { id: "reversible-reaction", label: "فلش برگشت‌پذیر", symbol: "⇄" },
  { id: "retrosynthesis", label: "فلش رتروسنتزی", symbol: "⇒" },
  { id: "dashed-reaction", label: "فلش خط‌چین", symbol: "⇢" },
  { id: "bond-breaking", label: "فلش شکستن پیوند", symbol: "↷" },
  { id: "bond-forming", label: "فلش تشکیل پیوند", symbol: "↷" },
  { id: "proton-transfer", label: "فلش انتقال پروتون", symbol: "H⁺→" },
  { id: "charge-transfer", label: "فلش انتقال بار", symbol: "⊕→" },
  { id: "mechanistic-annotation", label: "فلش توضیح مکانیسم", symbol: "⤷" },
];

type PaletteSelection =
  | {
      type:
        | "bond"
        | "ring"
        | "functional-group"
        | "charge"
        | "electron"
        | "arrow"
        | "operator"
        | "tool";
      id: string;
    }
  | null;

function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.sidebarSection}>
      <h2 className={styles.sidebarTitle}>{title}</h2>
      {children}
    </section>
  );
}

export default function MoleculeSidebar({
  document,
  onModeChange,
  onElementChange,
  onBondChange,
  onRingChange,
  onChargeChange,
  onElectronChange,
  onArrowChange,
  onFunctionalGroupChange,
  onOperatorSelect,
  onToggleGrid,
  onToggleSnap,
  onClearSelection: _onClearSelection,
}: MoleculeSidebarProps) {
  const [paletteSelection, setPaletteSelection] =
    useState<PaletteSelection>(null);

  const handleModeChange = (
    mode: Extract<InteractionMode, "select" | "pan" | "brush" | "add-text">,
  ) => {
    setPaletteSelection({ type: "tool", id: mode });
    onModeChange(mode);
  };

  const handleElementChange = (element: ElementSymbol) => {
    setPaletteSelection(null);
    onModeChange("add-atom");
    onElementChange(element);
  };

  const handleBondChange = (bondType: BondType, bondOrder: BondOrder) => {
    setPaletteSelection({ type: "bond", id: bondType });
    onModeChange("add-bond");
    onBondChange(bondType, bondOrder);
  };

  const handleRingChange = (ringKind: RingKind) => {
    setPaletteSelection({ type: "ring", id: ringKind });
    onModeChange("add-ring");
    onRingChange(ringKind);
  };

  const handleFunctionalGroupChange = (groupId: string) => {
    setPaletteSelection({ type: "functional-group", id: groupId });
    onModeChange("add-functional-group");
    onFunctionalGroupChange(groupId);
  };

  const handleChargeChange = (charge: ChargeKind) => {
    setPaletteSelection({ type: "charge", id: charge });
    onModeChange("add-charge");
    onChargeChange(charge);
  };

  const handleElectronChange = (electron: ElectronDisplay) => {
    setPaletteSelection({ type: "electron", id: electron });
    onModeChange("add-electron");
    onElectronChange(electron);
  };

  const handleArrowChange = (arrowType: ArrowType) => {
    setPaletteSelection({ type: "arrow", id: arrowType });
    onModeChange("add-arrow");
    onArrowChange(arrowType);
  };

  const handleOperatorChange = (operator: ReactionOperatorKind) => {
    setPaletteSelection({ type: "operator", id: operator });

    if (onOperatorSelect) {
      onOperatorSelect(operator);
      return;
    }

    onModeChange("add-text");
  };

  return (
    <aside className={styles.leftSidebar} aria-label="پنل ابزارهای شیمیایی">
      <SidebarSection title="اتم‌ها">
        <div className={styles.elementGrid}>
          {ELEMENTS.map((element) => {
            const elementData = getElementData(element);
            const isActive =
              document.tool.mode === "add-atom" &&
              document.tool.selectedElement === element;

            return (
              <button
                key={element}
                type="button"
                className={`${styles.elementButton} ${
                  isActive ? styles.elementButtonActive : ""
                }`}
                onClick={() => handleElementChange(element)}
                title={`${elementData.name} - ${elementData.persianName}`}
                aria-label={`افزودن عنصر ${elementData.persianName}`}
                aria-pressed={isActive}
              >
                <span
                  className={styles.elementSymbol}
                  style={{
                    backgroundColor: elementData.defaultColor,
                    color: elementData.defaultTextColor,
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
      </SidebarSection>

      <SidebarSection title="پیوندها">
        <div className={styles.elementGrid}>
          {BOND_TYPES.map((bond) => {
            const isActive =
              document.tool.mode === "add-bond" &&
              document.tool.selectedBondType === bond.id;

            return (
              <button
                key={bond.id}
                type="button"
                className={`${styles.elementButton} ${
                  isActive ? styles.elementButtonActive : ""
                }`}
                onClick={() => handleBondChange(bond.id, bond.order)}
                title={bond.label}
                aria-label={bond.label}
                aria-pressed={isActive}
              >
                <span className={styles.elementSymbol} aria-hidden="true">
                  {bond.symbol}
                </span>
                <span className={styles.elementName}>{bond.label}</span>
              </button>
            );
          })}
        </div>
      </SidebarSection>

      <SidebarSection title="ابزارهای عمومی">
        <div className={styles.toolColumn}>
          {GENERAL_TOOLS.map((tool) => {
            const isActive = document.tool.mode === tool.id;

            return (
              <button
                key={tool.id}
                type="button"
                className={`${styles.elementButton} ${
                  isActive ? styles.elementButtonActive : ""
                } ${styles.toolColumnButton}`}
                onClick={() => handleModeChange(tool.id)}
                title={tool.label}
                aria-label={tool.label}
                aria-pressed={isActive}
              >
                <span className={styles.elementSymbol} aria-hidden="true">
                  {tool.icon}
                </span>
                <span className={styles.elementName}>{tool.label}</span>
              </button>
            );
          })}
        </div>
      </SidebarSection>

      <SidebarSection title="حلقه‌ها">
        <div className={styles.elementGrid}>
          {RING_TYPES.map((ring) => {
            const isActive =
              document.tool.mode === "add-ring" &&
              document.tool.selectedRingKind === ring.id;

            return (
              <button
                key={ring.id}
                type="button"
                className={`${styles.elementButton} ${
                  isActive ? styles.elementButtonActive : ""
                }`}
                onClick={() => handleRingChange(ring.id)}
                title={`افزودن ${ring.label}`}
                aria-label={`افزودن ${ring.label}`}
                aria-pressed={isActive}
              >
                <span className={styles.elementSymbol} aria-hidden="true">
                  {ring.symbol}
                </span>
                <span className={styles.elementName}>{ring.label}</span>
              </button>
            );
          })}
        </div>
      </SidebarSection>

      <SidebarSection title="گروه‌های عاملی">
        <div className={styles.elementGrid}>
          {FUNCTIONAL_GROUPS.map((group) => {
            const isActive =
              document.tool.mode === "add-functional-group" &&
              paletteSelection?.type === "functional-group" &&
              paletteSelection.id === group.id;

            return (
              <button
                key={group.id}
                type="button"
                className={`${styles.elementButton} ${
                  isActive ? styles.elementButtonActive : ""
                }`}
                onClick={() => handleFunctionalGroupChange(group.id)}
                title={group.label}
                aria-label={`افزودن گروه ${group.label}`}
                aria-pressed={isActive}
              >
                <span className={styles.elementSymbol} aria-hidden="true">
                  {group.symbol}
                </span>
                <span className={styles.elementName}>{group.label}</span>
              </button>
            );
          })}
        </div>
      </SidebarSection>

      <SidebarSection title="بارهای الکتریکی">
        <div className={styles.elementGrid}>
          {CHARGES.map((charge) => {
            const isActive =
              document.tool.mode === "add-charge" &&
              document.tool.selectedCharge === charge.id;

            const isPartial =
              charge.id === "partial-positive" ||
              charge.id === "partial-negative";

            return (
              <button
                key={charge.id}
                type="button"
                className={`${styles.elementButton} ${
                  isActive ? styles.elementButtonActive : ""
                }`}
                onClick={() => handleChargeChange(charge.id)}
                title={charge.label}
                aria-label={charge.label}
                aria-pressed={isActive}
              >
                <span
                  className={`${styles.elementSymbol} ${
                    isPartial ? styles.partialChargeSymbol : ""
                  }`}
                  aria-hidden="true"
                >
                  {charge.symbol}
                </span>
                <span className={styles.elementName}>{charge.label}</span>
              </button>
            );
          })}
        </div>
      </SidebarSection>

      <SidebarSection title="الکترون‌ها">
        <div className={styles.elementGrid}>
          {ELECTRONS.map((electron) => {
            const isActive =
              document.tool.mode === "add-electron" &&
              document.tool.selectedElectronDisplay === electron.id;

            return (
              <button
                key={electron.id}
                type="button"
                className={`${styles.elementButton} ${
                  isActive ? styles.elementButtonActive : ""
                }`}
                onClick={() => handleElectronChange(electron.id)}
                title={electron.label}
                aria-label={electron.label}
                aria-pressed={isActive}
              >
                <span className={styles.elementSymbol} aria-hidden="true">
                  {electron.symbol}
                </span>
                <span className={styles.elementName}>{electron.label}</span>
              </button>
            );
          })}
        </div>
      </SidebarSection>

      <SidebarSection title="فلش‌ها و مکانیسم">
        <div className={styles.arrowColumn}>
          {ARROW_TYPES.map((arrow) => {
            const isActive =
              document.tool.mode === "add-arrow" &&
              document.tool.selectedArrowType === arrow.id;

            return (
              <button
                key={arrow.id}
                type="button"
                className={`${styles.elementButton} ${
                  isActive ? styles.elementButtonActive : ""
                } ${styles.arrowColumnButton}`}
                onClick={() => handleArrowChange(arrow.id)}
                title={arrow.label}
                aria-label={arrow.label}
                aria-pressed={isActive}
              >
                <span className={styles.elementSymbol} aria-hidden="true">
                  {arrow.symbol}
                </span>
                <span className={styles.elementName}>{arrow.label}</span>
              </button>
            );
          })}
        </div>
      </SidebarSection>

      <SidebarSection title="عملگرهای واکنش">
        <div className={styles.elementGrid}>
          {REACTION_OPERATORS.map((operator) => {
            const isActive =
              paletteSelection?.type === "operator" &&
              paletteSelection.id === operator.id;

            return (
              <button
                key={operator.id}
                type="button"
                className={`${styles.elementButton} ${
                  isActive ? styles.elementButtonActive : ""
                }`}
                onClick={() => handleOperatorChange(operator.id)}
                title={operator.label}
                aria-label={operator.label}
                aria-pressed={isActive}
              >
                <span className={styles.elementSymbol} aria-hidden="true">
                  {operator.symbol}
                </span>
                <span className={styles.elementName}>{operator.label}</span>
              </button>
            );
          })}
        </div>
      </SidebarSection>

      <SidebarSection title="نمایش">
        <label className={styles.switchRow}>
          <span>شبکه</span>
          <input
            type="checkbox"
            checked={document.viewport.showGrid}
            onChange={onToggleGrid}
            aria-label="نمایش شبکه"
          />
        </label>

        <label className={styles.switchRow}>
          <span>چسبیدن به شبکه</span>
          <input
            type="checkbox"
            checked={document.viewport.snapToGrid}
            onChange={onToggleSnap}
            aria-label="فعال‌سازی چسبیدن به شبکه"
          />
        </label>
      </SidebarSection>

      <SidebarSection title="وضعیت">
        <div className={styles.infoCard}>
          <span>ابزار فعال</span>
          <strong>{document.tool.mode}</strong>
        </div>

        {document.tool.mode === "add-ring" && (
          <div className={styles.infoCard}>
            <span>حلقه انتخاب‌شده</span>
            <strong>
              {RING_TYPES.find(
                (ring) => ring.id === document.tool.selectedRingKind,
              )?.label ?? document.tool.selectedRingKind}
            </strong>
          </div>
        )}

        {document.tool.mode === "add-charge" && (
          <div className={styles.infoCard}>
            <span>بار انتخاب‌شده</span>
            <strong>
              {CHARGES.find(
                (charge) => charge.id === document.tool.selectedCharge,
              )?.label ?? document.tool.selectedCharge}
            </strong>
          </div>
        )}

        {document.tool.mode === "add-arrow" && (
          <div className={styles.infoCard}>
            <span>فلش انتخاب‌شده</span>
            <strong>
              {ARROW_TYPES.find(
                (arrow) => arrow.id === document.tool.selectedArrowType,
              )?.label ?? document.tool.selectedArrowType}
            </strong>
          </div>
        )}

        <div className={styles.infoCard}>
          <span>تعداد آبجکت‌ها</span>
          <strong>{document.objects.length}</strong>
        </div>
      </SidebarSection>
    </aside>
  );
}
