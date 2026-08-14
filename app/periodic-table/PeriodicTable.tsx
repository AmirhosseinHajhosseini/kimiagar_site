"use client";

import React, { useMemo, useState } from "react";
import styles from "./periodic-table.module.css";
import { elementsList } from "@/data/elements";

export type ElementCategory =
  | "alkali"
  | "alkaline-earth"
  | "transition"
  | "post-transition"
  | "metalloid"
  | "reactive-nonmetal"
  | "noble-gas"
  | "lanthanide"
  | "actinide"
  | "halogen"
  | "unknown";

export interface Element {
  atomicNumber: number;
  symbol: string;
  name: string;
  persianName?: string;
  period: number;
  group: number | null;
  category: ElementCategory;
  atomicMass?: string | number;
  atomicRadius?: string | number;
  electronegativity?: string | number;
  ionizationEnergy?: string | number;
  electronConfiguration?: string;
  density?: string | number;
  stateOfMatter?: string;
}

const CATEGORY_LABEL_MAP: Record<ElementCategory, string> = {
  alkali: "فلزات قلیایی",
  "alkaline-earth": "فلزات قلیایی خاکی",
  transition: "فلزات واسطه",
  "post-transition": "فلزات پس‌واسطه",
  metalloid: "شبه‌فلزها",
  "reactive-nonmetal": "نافلزهای واکنش‌پذیر",
  "noble-gas": "گازهای نجیب",
  lanthanide: "لانتانیدها",
  actinide: "اکتینیدها",
  halogen: "هالوژن‌ها",
  unknown: "نامشخص",
};

const LEGEND_CATEGORIES: ElementCategory[] = [
  "alkali",
  "alkaline-earth",
  "transition",
  "post-transition",
  "metalloid",
  "reactive-nonmetal",
  "halogen",
  "noble-gas",
  "lanthanide",
  "actinide",
];

function formatValue(value: unknown, unit?: string): string {
  if (value === null || value === undefined || value === "") return "—";
  return `${value}${unit ? ` ${unit}` : ""}`;
}

function getCategoryClass(category: ElementCategory): string {
  const map: Record<ElementCategory, string | undefined> = {
    alkali: styles.alkali,
    "alkaline-earth": styles["alkaline-earth"],
    transition: styles.transition,
    "post-transition": styles["post-transition"],
    metalloid: styles.metalloid,
    "reactive-nonmetal": styles["reactive-nonmetal"],
    "noble-gas": styles["noble-gas"],
    lanthanide: styles.lanthanide,
    actinide: styles.actinide,
    halogen: styles.halogen,
    unknown: styles.unknown,
  };
  return map[category] ?? styles.unknown ?? "";
}

function getFullClass(category: ElementCategory): string {
  const map: Partial<Record<ElementCategory, string | undefined>> = {
    alkali: styles.alkaliFull,
    transition: styles.transitionFull,
    metalloid: styles.metalloidFull,
    "noble-gas": styles.nobleFull,
    lanthanide: styles.lanthanideFull,
    actinide: styles.actinideFull,
    halogen: styles.halogenFull,
  };
  return map[category] ?? "";
}

export default function PeriodicTable() {
  const elements = useMemo(() => {
    return (elementsList as unknown as Element[]) ?? [];
  }, []);

  const defaultElement = useMemo(() => {
    return (
      elements.find((el) => el.symbol === "V") ??
      elements[0] ??
      null
    );
  }, [elements]);

  const [selectedElement, setSelectedElement] = useState<Element | null>(
    defaultElement
  );

  const maxPeriod = 7;
  const maxGroup = 18;

  const gridItems = useMemo(() => {
    const rows: (Element | null)[][] = Array.from({ length: maxPeriod }, () =>
      Array.from({ length: maxGroup }, () => null)
    );

    for (const el of elements) {
      if (el.period >= 1 && el.period <= maxPeriod) {
        if (el.group && el.group >= 1 && el.group <= maxGroup) {
          rows[el.period - 1][el.group - 1] = el;
        }
      }
    }

    return rows;
  }, [elements]);

  return (
    <main className={styles.container}>
      <section
        className={`${styles.detailPanel} ${
          selectedElement ? getFullClass(selectedElement.category) : ""
        }`}
        aria-live="polite"
      >
        <div className={styles.infoCard}>
          {selectedElement ? (
            <>
              <div className={styles.mainInfo}>
                <div
                  className={styles.hugeSymbol}
                  style={
                    {
                      "--accent-color": "currentColor",
                    } as React.CSSProperties
                  }
                >
                  {selectedElement.symbol}
                </div>

                <div className={styles.nameLabels}>
                  <h1 className={styles.engName}>{selectedElement.name}</h1>
                  {selectedElement.persianName && (
                    <span className={styles.perName}>
                      {selectedElement.persianName}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <label>عدد اتمی</label>
                  <span>{selectedElement.atomicNumber}</span>
                </div>

                <div className={styles.statItem}>
                  <label>جرم اتمی</label>
                  <span>{formatValue(selectedElement.atomicMass)}</span>
                </div>

                <div className={styles.statItem}>
                  <label>گروه / دوره</label>
                  <span>
                    {formatValue(selectedElement.group)} / {selectedElement.period}
                  </span>
                </div>

                <div className={styles.statItem}>
                  <label>الکترونگاتیوی</label>
                  <span>{formatValue(selectedElement.electronegativity)}</span>
                </div>

                <div className={styles.statItem}>
                  <label>انرژی یونش اول</label>
                  <span>
                    {formatValue(selectedElement.ionizationEnergy, "kJ/mol")}
                  </span>
                </div>

                <div className={styles.statItem}>
                  <label>شعاع اتمی</label>
                  <span>{formatValue(selectedElement.atomicRadius, "pm")}</span>
                </div>

                <div className={styles.statItem}>
                  <label>آرایش الکترونی</label>
                  <span className={styles.configText}>
                    {formatValue(selectedElement.electronConfiguration)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={styles.mainInfo}>
                <div className={styles.hugeSymbol}>?</div>
                <div className={styles.nameLabels}>
                  <h1 className={styles.engName}>Periodic Table</h1>
                  <span className={styles.perName}>روی یک عنصر کلیک کنید</span>
                </div>
              </div>

              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <label>راهنما</label>
                  <span>برای مشاهده جزئیات، روی هر خانه کلیک کنید.</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className={styles.legend} aria-label="راهنمای دسته‌بندی رنگ‌ها">
          {LEGEND_CATEGORIES.map((cat) => (
            <div key={cat} className={styles.legendItem}>
              <span className={getCategoryClass(cat)} />
              <span>{CATEGORY_LABEL_MAP[cat]}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.tableGrid} aria-label="جدول تناوبی عناصر">
        {gridItems.map((row, periodIndex) => (
          <React.Fragment key={`period-${periodIndex + 1}`}>
            <div className={styles.periodLabel} title={`دوره ${periodIndex + 1}`}>
              {periodIndex + 1}
            </div>

            {row.map((element, groupIndex) => {
              if (!element) {
                return (
                  <div
                    key={`empty-${periodIndex}-${groupIndex}`}
                    className={styles.emptyCell}
                    aria-hidden="true"
                  />
                );
              }

              const isActive =
                selectedElement?.atomicNumber === element.atomicNumber;

              return (
                <button
                  key={element.atomicNumber}
                  type="button"
                  className={`${styles.elementCard} ${getCategoryClass(
                    element.category
                  )} ${isActive ? styles.active : ""}`}
                  onClick={() => setSelectedElement(element)}
                  aria-label={`${element.name} (${element.symbol}) - عدد اتمی ${element.atomicNumber}`}
                  title={`${element.name} | ${element.persianName ?? ""}`}
                >
                  <span className={styles.atomicNumber}>
                    {element.atomicNumber}
                  </span>
                  <strong className={styles.symbol}>{element.symbol}</strong>
                  <span className={styles.elementName}>
                    {element.persianName || element.name}
                  </span>
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </section>
    </main>
  );
}

