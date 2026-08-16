"use client";

import React, { useMemo, useState } from "react";
import { elements } from "@/data/elements";
import styles from "./periodic-table.module.css";

type ElementKind = "metal" | "nonmetal" | "metalloid";
type FilterState = Record<ElementKind, boolean>;
type TrendType =
  | "none"
  | "atomicRadius"
  | "electronegativity"
  | "ionizationEnergy";
type ActiveTrend = Exclude<TrendType, "none">;

const trendLabels: Record<TrendType, string> = {
  none: "بدون روند",
  atomicRadius: "شعاع اتمی",
  electronegativity: "الکترونگاتیوی",
  ionizationEnergy: "انرژی یونش",
};

const trendRgb: Record<ActiveTrend, [number, number, number]> = {
  atomicRadius: [59, 130, 246],
  electronegativity: [34, 197, 94],
  ionizationEnergy: [249, 115, 22],
};

function getElementKind(atomicNumber: number): ElementKind {
  const metalloids = [5, 14, 32, 33, 51, 52, 84];
  if (metalloids.includes(atomicNumber)) return "metalloid";

  const nonmetals = [
    1, 2, 6, 7, 8, 9, 10, 15, 16, 17, 18, 34, 35, 36, 53, 54, 85, 86, 118,
  ];
  if (nonmetals.includes(atomicNumber)) return "nonmetal";

  return "metal";
}

function getKindLabel(kind: ElementKind) {
  const labels: Record<ElementKind, string> = {
    metal: "فلزات",
    nonmetal: "نافلزات",
    metalloid: "شبه‌فلزها",
  };
  return labels[kind];
}

function isLanthanide(atomicNumber: number) {
  return atomicNumber >= 58 && atomicNumber <= 71;
}

function isActinide(atomicNumber: number) {
  return atomicNumber >= 90 && atomicNumber <= 103;
}

export default function PeriodicTable() {
  const [selectedElement, setSelectedElement] = useState<
    (typeof elements)[number] | null
  >(null);
  const [temp, setTemp] = useState(25);
  const [activeTrend, setActiveTrend] = useState<TrendType>("none");
  const [filters, setFilters] = useState<FilterState>({
    metal: true,
    nonmetal: true,
    metalloid: true,
  });

  const trendMap = useMemo(() => {
    if (activeTrend === "none") return new Map<number, number>();

    const valid = elements
      .map((el) => el[activeTrend])
      .filter((value): value is number => Number.isFinite(value) && value > 0);

    const min = valid.length ? Math.min(...valid) : 0;
    const max = valid.length ? Math.max(...valid) : 1;

    const map = new Map<number, number>();
    if (max === min) return map;

    for (const el of elements) {
      const value = el[activeTrend];
      if (Number.isFinite(value) && value > 0) {
        map.set(el.atomicNumber, (value - min) / (max - min));
      }
    }

    return map;
  }, [activeTrend]);

  const getPhase = (element: (typeof elements)[number]) => {
    if (element.meltingPointC == null || element.boilingPointC == null) {
      return { label: "نامشخص", className: styles.phaseUnknown };
    }
    if (temp < element.meltingPointC) {
      return { label: "جامد", className: styles.phaseSolid };
    }
    if (temp < element.boilingPointC) {
      return { label: "مایع", className: styles.phaseLiquid };
    }
    return { label: "گاز", className: styles.phaseGas };
  };

  const toggleFilter = (kind: ElementKind) => {
    setFilters((prev) => ({ ...prev, [kind]: !prev[kind] }));
  };

  const getTrendGradient = (): React.CSSProperties | undefined => {
    if (activeTrend === "none") return undefined;
    const [r, g, b] = trendRgb[activeTrend];
    return {
      background: `linear-gradient(to left, rgba(${r}, ${g}, ${b}, 0.1), rgb(${r}, ${g}, ${b}))`,
    };
  };

  const mainElements = elements.filter(
    (el) => !isLanthanide(el.atomicNumber) && !isActinide(el.atomicNumber)
  );

  const lanthanides = elements.filter((el) => isLanthanide(el.atomicNumber));
  const actinides = elements.filter((el) => isActinide(el.atomicNumber));

 const renderElement = (el: (typeof elements)[number], index?: number) => {
  const kind = getElementKind(el.atomicNumber);
  const isVisible = filters[kind];
  const isSelected = selectedElement?.atomicNumber === el.atomicNumber;
  const normalized = trendMap.get(el.atomicNumber);
  const trendValue = activeTrend !== "none" ? el[activeTrend] : null;

  // تشخیص اینکه آیا عنصر در ردیف‌های پایین (f-block) است یا جدول اصلی
  const isFBlock = isLanthanide(el.atomicNumber) || isActinide(el.atomicNumber);

  let trendStyle: React.CSSProperties | undefined;
  if (activeTrend !== "none" && normalized != null) {
    const [r, g, b] = trendRgb[activeTrend];
    trendStyle = {
      background: `rgba(${r}, ${g}, ${b}, ${(0.1 + normalized * 0.5).toFixed(2)})`,
      borderColor: `rgb(${r}, ${g}, ${b})`,
    };
  }

  return (
    <button
      key={el.atomicNumber || index}
      type="button"
      className={`${styles.elementCell} ${styles[kind]} ${
        !isVisible ? styles.dimmed : ""
      } ${isSelected ? styles.selected : ""} ${
        activeTrend !== "none" ? styles.hasTrend : ""
      }`}
      style={{
        // اگر f-block بود، اجازه بده ترتیب طبیعی (flex/grid) چیدمان را تعیین کند
        // اگر در جدول اصلی بود، از مختصات گروه و دوره استفاده کن
        gridColumn: isFBlock ? "auto" : (el.groupId || undefined),
        gridRow: isFBlock ? "auto" : (el.periodId || undefined),
        ...trendStyle,
      }}
      onClick={() => setSelectedElement(el)}
    >
      <span className={styles.number}>{el.atomicNumber}</span>
      <span className={styles.symbol}>{el.symbol}</span>
      <span className={styles.name}>{el.persianName}</span>

      {activeTrend !== "none" && (
        <span className={styles.trendValueDisplay}>
          {trendValue ?? "—"}
        </span>
      )}
    </button>
  );
};


  return (
    <main className={styles.container} dir="rtl">
      <header className={styles.titleSection}>
        <h1 className={styles.title}>جدول تناوبی عناصر</h1>
        <p className={styles.subtitle}>
          تحلیل تخصصی خواص فیزیکی، روندهای تناوبی و تغییرات فاز در دماهای مختلف
        </p>
      </header>

      <section className={styles.topControls}>
        <div className={styles.filterBar} aria-label="فیلتر دسته‌بندی عناصر">
          {(["metal", "nonmetal", "metalloid"] as ElementKind[]).map((kind) => (
            <button
              key={kind}
              type="button"
              className={`${styles.filterButton} ${styles[`filter-${kind}`]} ${
                filters[kind] ? styles.filterActive : styles.filterInactive
              }`}
              onClick={() => toggleFilter(kind)}
            >
              <span className={styles.filterDot} />
              <span>{getKindLabel(kind)}</span>
            </button>
          ))}
        </div>

        <div className={styles.trendSelector}>
          <span className={styles.trendLabel}>نمایش روند:</span>

          <div className={styles.trendButtons}>
            {(Object.keys(trendLabels) as TrendType[]).map((key) => (
              <button
                key={key}
                type="button"
                className={`${styles.trendTab} ${
                  activeTrend === key ? styles.trendTabActive : ""
                }`}
                onClick={() => setActiveTrend(key)}
              >
                {trendLabels[key]}
              </button>
            ))}
          </div>

          {activeTrend !== "none" && (
            <div className={styles.trendLegend}>
              <span>کم</span>
              <div className={styles.trendGradient} style={getTrendGradient()} />
              <span>زیاد</span>
            </div>
          )}
        </div>
      </section>

      <section className={styles.tableWrapper} dir="ltr">
        <div className={styles.grid}>
          {mainElements.map((el, index) => renderElement(el, index))}
        </div>

        <div className={styles.fBlockContainer}>
          <div className={styles.fBlockRow}>
            <div className={styles.fBlockLabel}>لانتانیدها</div>
            {lanthanides.map((el, index) => renderElement(el, index))}
          </div>

          <div className={styles.fBlockRow}>
            <div className={styles.fBlockLabel}>اکتینیدها</div>
            {actinides.map((el, index) => renderElement(el, index))}
          </div>
        </div>
      </section>

      <section className={styles.detailsCard}>
        {!selectedElement ? (
          <div className={styles.placeholder}>
            برای مشاهده جزئیات علمی، بررسی روندها و تغییرات حالت فیزیکی، یک عنصر را انتخاب کنید.
          </div>
        ) : (
          <div className={styles[getElementKind(selectedElement.atomicNumber)]}>
            <div className={styles.detailsHeader}>
              <div className={styles.detailsSymbol}>{selectedElement.symbol}</div>
              <div>
                <h2 className={styles.detailsName}>{selectedElement.persianName}</h2>
                <p className={styles.detailsNameEn}>{selectedElement.name}</p>
              </div>
              <div className={styles.selectedKind}>
                {getKindLabel(getElementKind(selectedElement.atomicNumber))}
              </div>
            </div>

            <div className={styles.detailsContent}>
              <div className={styles.controlCard}>
                <h3 className={styles.cardTitle}>شبیه‌ساز فاز فیزیکی</h3>
                <div className={styles.tempValue} dir="ltr">
                  {temp} °C
                </div>

                <div className={styles.sliderContainer}>
                  <input
                    type="range"
                    min="-273"
                    max="4000"
                    step="1"
                    value={temp}
                    onChange={(e) => setTemp(Number(e.target.value))}
                    className={styles.rangeInput}
                  />
                  <div className={styles.tempScale}>
                    <span>-273°C</span>
                    <span>4000°C</span>
                  </div>
                </div>

                <div className={styles.currentPhase}>
                  <span>حالت در این دما:</span>
                  <span
                    className={`${styles.phaseTag} ${
                      getPhase(selectedElement).className
                    }`}
                  >
                    {getPhase(selectedElement).label}
                  </span>
                </div>
              </div>

              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span>عدد اتمی:</span>
                  <strong>{selectedElement.atomicNumber}</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>جرم اتمی:</span>
                  <strong>{selectedElement.atomicMass}</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>شعاع اتمی:</span>
                  <strong>{selectedElement.atomicRadius ?? "—"} pm</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>الکترونگاتیوی:</span>
                  <strong>{selectedElement.electronegativity ?? "—"}</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>انرژی یونش:</span>
                  <strong>{selectedElement.ionizationEnergy ?? "—"} kJ/mol</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>نقطه ذوب / جوش:</span>
                  <strong dir="ltr">
                    {selectedElement.meltingPointC ?? "—"} /{" "}
                    {selectedElement.boilingPointC ?? "—"} °C
                  </strong>
                </div>
                <div className={styles.detailItemWide}>
                  <span>آرایش الکترونی:</span>
                  <strong dir="ltr">{selectedElement.electronConfiguration}</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
