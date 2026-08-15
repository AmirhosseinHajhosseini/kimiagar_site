"use client";

import React, { useState, useMemo } from "react";
import { elementsList } from "@/data/elements";
import styles from "./periodic-table.module.css";

type ElementKind = "metal" | "nonmetal" | "metalloid";
type FilterState = Record<ElementKind, boolean>;

// تابع دقیق برای دسته‌بندی ۱۱۸ عنصر بر اساس لیست کاربر
function getElementKind(atomicNumber: number): ElementKind {
  // ۱. شبه‌فلزات (Metalloids) - طبق لیست ۷ عنصر اصلی
  const metalloids = [5, 14, 32, 33, 51, 52, 84]; // B, Si, Ge, As, Sb, Te, Po
  if (metalloids.includes(atomicNumber)) return "metalloid";

  // ۲. نافلزات (Nonmetals)
  // هیدروژن + گروه کربن، نیتروژن، اکسیژن، هالوژن‌ها و گازهای نجیب
  const nonmetals = [
    1, // H
    6, // C
    7, 15, // N, P
    8, 16, 34, // O, S, Se
    9, 17, 35, 53, 85, // F, Cl, Br, I, At
    2, 10, 18, 36, 54, 86, 118 // He, Ne, Ar, Kr, Xe, Rn, Og
  ];
  if (nonmetals.includes(atomicNumber)) return "nonmetal";

  // ۳. فلزات (Metals)
  // بقیه عناصر (گروه ۱ و ۲، فلزات واسطه، لانتانیدها، اکتینیدها و فلزات اصلی)
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

export default function PeriodicTable() {
  const [selectedElement, setSelectedElement] = useState<any | null>(null);
  const [temp, setTemp] = useState(25);
  const [filters, setFilters] = useState<FilterState>({
    metal: true,
    nonmetal: true,
    metalloid: true,
  });

  const getPhase = (element: any) => {
    if (element.meltingPointC === undefined || element.boilingPointC === undefined) {
      return { label: "نامشخص", className: styles.unknown };
    }
    if (temp < element.meltingPointC) return { label: "جامد", className: styles.solid };
    if (temp < element.boilingPointC) return { label: "مایع", className: styles.liquid };
    return { label: "گاز", className: styles.gas };
  };

  const toggleFilter = (kind: ElementKind) => {
    setFilters(prev => ({ ...prev, [kind]: !prev[kind] }));
  };

  return (
    <main className={styles.container} dir="rtl">
      <header className={styles.titleSection}>
        <h1 className={styles.title}>جدول تناوبی</h1>
        <p className={styles.subtitle}>
          تفکیک تخصصی عناصر به فلزات، نافلزات و شبه‌فلزات بر اساس خواص فیزیکی و شیمیایی
        </p>
      </header>

      {/* بخش فیلترها */}
      <section className={styles.filterBar} aria-label="فیلتر دسته‌بندی عناصر">
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
            <span className={styles.filterStatus}>
              {filters[kind] ? "روشن" : "خاموش"}
            </span>
          </button>
        ))}
      </section>

      {/* گرید جدول */}
      <section className={styles.tableWrapper} dir="ltr">
        <div className={styles.grid}>
          {elementsList.map((el, index) => {
            const kind = getElementKind(el.atomicNumber);
            const isVisible = filters[kind];
            const isSelected = selectedElement?.atomicNumber === el.atomicNumber;

            return (
              <button
                key={el.atomicNumber || index}
                type="button"
                className={`
                  ${styles.elementCell} 
                  ${styles[kind]} 
                  ${!isVisible ? styles.dimmed : ""} 
                  ${isSelected ? styles.selected : ""}
                `}
                style={{
                  gridColumn: el.groupId,
                  gridRow: el.periodId,
                }}
                onClick={() => setSelectedElement(el)}
              >
                <span className={styles.number}>{el.atomicNumber}</span>
                <span className={styles.symbol}>{el.symbol}</span>
                <span className={styles.name}>{el.persianName}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* پنل جزئیات (نمایش در پایین جدول) */}
      <section className={styles.detailsCard}>
        {!selectedElement ? (
          <div className={styles.placeholder}>
            برای مشاهده جزئیات علمی و بررسی حالت فیزیکی، یک عنصر را انتخاب کنید.
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
              {/* کنترل دما */}
              <div className={styles.controlCard}>
                <h3 className={styles.cardTitle}>بررسی حالت فیزیکی</h3>
                <div className={styles.tempValue} dir="ltr">{temp} °C</div>
                <input
                  type="range"
                  min="-273"
                  max="4000"
                  step="1"
                  value={temp}
                  onChange={(e) => setTemp(Number(e.target.value))}
                  className={styles.rangeInput}
                />
                <div className={styles.tempScale} dir="ltr">
                  <span>-273°C</span>
                  <span>4000°C</span>
                </div>
                <div className={styles.currentPhase}>
                  <span>حالت در این دما:</span>
                  <span className={`${styles.phaseTag} ${getPhase(selectedElement).className}`}>
                    {getPhase(selectedElement).label}
                  </span>
                </div>
              </div>

              {/* جدول اطلاعات */}
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
                  <span>دوره / گروه:</span>
                  <strong>{selectedElement.periodId} / {selectedElement.groupId}</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>نقطه ذوب:</span>
                  <strong dir="ltr">{selectedElement.meltingPointC ?? "—"} °C</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>نقطه جوش:</span>
                  <strong dir="ltr">{selectedElement.boilingPointC ?? "—"} °C</strong>
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
