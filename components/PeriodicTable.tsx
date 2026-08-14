"use client";

import { useMemo, useState } from "react";
import {
  elementsList,
  type Element,
  type ElementCategory,
} from "@/data/elements";
import styles from "./periodic-table.module.css";

type FilterKey = "all" | "metals" | "nonmetals" | "metalloids";
type PhysicalState = "solid" | "liquid" | "gas" | "unknown";

const FILTER_CATEGORIES: Record<Exclude<FilterKey, "all">, ElementCategory[]> = {
  metals: [
    "alkali",
    "alkaline-earth",
    "transition",
    "post-transition",
    "lanthanide",
    "actinide",
  ],
  nonmetals: ["reactive-nonmetal", "halogen", "noble-gas"],
  metalloids: ["metalloid"],
};

const FILTER_LABELS: Record<FilterKey, string> = {
  all: "همه",
  metals: "فلزات",
  nonmetals: "نافلزها",
  metalloids: "شبه‌فلزها",
};

const STATE_LABEL: Record<PhysicalState, string> = {
  solid: "جامد",
  liquid: "مایع",
  gas: "گاز",
  unknown: "نامشخص",
};

const CATEGORY_LABELS: Record<ElementCategory, string> = {
  alkali: "فلز قلیایی",
  "alkaline-earth": "فلز قلیایی خاکی",
  transition: "فلز واسطه",
  "post-transition": "فلز پس‌واسطه",
  metalloid: "شبه‌فلز",
  "reactive-nonmetal": "نافلز واکنش‌پذیر",
  halogen: "هالوژن",
  "noble-gas": "گاز نجیب",
  lanthanide: "لانتانید",
  actinide: "اکتینید",
};

function isFBlock(element: Element): boolean {
  return element.category === "lanthanide" || element.category === "actinide";
}

function getPhysicalState(
  element: Element,
  temperature: number
): PhysicalState {
  const { meltingPoint, boilingPoint } = element;

  if (meltingPoint == null || boilingPoint == null) {
    if (
      element.state === "solid" ||
      element.state === "liquid" ||
      element.state === "gas"
    ) {
      return element.state;
    }

    return "unknown";
  }

  if (temperature < meltingPoint) {
    return "solid";
  }

  if (temperature < boilingPoint) {
    return "liquid";
  }

  return "gas";
}

function formatValue(
  value: number | string | null | undefined,
  unit = ""
): string {
  if (value == null || value === "") {
    return "—";
  }

  return `${value}${unit ? ` ${unit}` : ""}`;
}

function ElementCard({
  element,
  state,
  isSelected,
  isVisible,
  onSelect,
  useGridPosition,
}: {
  element: Element;
  state: PhysicalState;
  isSelected: boolean;
  isVisible: boolean;
  onSelect: (element: Element) => void;
  useGridPosition: boolean;
}) {
  const gridStyle = useGridPosition
    ? {
        gridColumn: element.group ?? 1,
        gridRow: element.period,
      }
    : undefined;

  return (
    <button
      type="button"
      className={[
        styles.elementCard,
        styles[element.category],
        isSelected ? styles.selected : "",
        isVisible ? "" : styles.dimmed,
      ]
        .filter(Boolean)
        .join(" ")}
      style={gridStyle}
      onClick={() => onSelect(element)}
      aria-label={`${element.persianName}، ${element.name}، عدد اتمی ${element.atomicNumber}`}
      aria-pressed={isSelected}
    >
      <span className={styles.atomicNumber}>{element.atomicNumber}</span>
      <strong className={styles.symbol}>{element.symbol}</strong>
      <span className={styles.elementName}>{element.persianName}</span>
      <span
        className={[
          styles.stateDot,
          styles[state],
          state === "unknown" ? styles.unknown : "",
        ]
          .filter(Boolean)
          .join(" ")}
        title={STATE_LABEL[state]}
        aria-label={`حالت فیزیکی: ${STATE_LABEL[state]}`}
      />
    </button>
  );
}

export default function PeriodicTable() {
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [temperature, setTemperature] = useState(25);

  const mainElements = useMemo(
    () => elementsList.filter((element) => !isFBlock(element)),
    []
  );

  const lanthanides = useMemo(
    () => elementsList.filter((element) => element.category === "lanthanide"),
    []
  );

  const actinides = useMemo(
    () => elementsList.filter((element) => element.category === "actinide"),
    []
  );

  const positionMap = useMemo(() => {
    const map = new Map<string, Element>();

    mainElements.forEach((element) => {
      if (element.group != null) {
        map.set(`${element.period}-${element.group}`, element);
      }
    });

    return map;
  }, [mainElements]);

  function isVisibleInFilter(element: Element): boolean {
    if (filter === "all") {
      return true;
    }

    return FILTER_CATEGORIES[filter].includes(element.category);
  }

  const gridCells = useMemo(() => {
    const cells = [];

    for (let period = 1; period <= 7; period += 1) {
      for (let group = 1; group <= 18; group += 1) {
        const element = positionMap.get(`${period}-${group}`);

        if (element) {
          const state = getPhysicalState(element, temperature);

          cells.push(
            <ElementCard
              key={`main-${period}-${group}`}
              element={element}
              state={state}
              isSelected={selectedElement?.atomicNumber === element.atomicNumber}
              isVisible={isVisibleInFilter(element)}
              onSelect={setSelectedElement}
              useGridPosition
            />
          );
        } else {
          cells.push(
            <div
              key={`empty-${period}-${group}`}
              className={styles.emptyCell}
              style={{ gridColumn: group, gridRow: period }}
              aria-hidden="true"
            />
          );
        }
      }
    }

    return cells;
  }, [positionMap, temperature, selectedElement, filter]);

  return (
    <div className={styles.container} dir="rtl">
      <header className={styles.header}>
        <p className={styles.eyebrow}>شیمی | Chemistry</p>
        <h1 className={styles.title}>جدول تناوبی عناصر</h1>
        <p className={styles.description}>
          روی هر عنصر کلیک کنید تا مشخصات کامل آن نمایش داده شود.
        </p>
      </header>

      <section
        className={styles.toolbar}
        aria-label="ابزارهای جدول تناوبی"
      >
        <div
          className={styles.filterGroup}
          aria-label="فیلتر دسته‌بندی عناصر"
        >
          {(
            ["all", "metals", "nonmetals", "metalloids"] as FilterKey[]
          ).map((filterKey) => (
            <button
              key={`filter-${filterKey}`}
              type="button"
              className={[
                styles.filterButton,
                filter === filterKey ? styles.filterButtonActive : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setFilter(filterKey)}
              aria-pressed={filter === filterKey}
            >
              {FILTER_LABELS[filterKey]}
            </button>
          ))}
        </div>

        <div className={styles.temperatureControl}>
          <label
            className={styles.controlLabel}
            htmlFor="temperature-range"
          >
            دمای محیط:
          </label>
          <output
            className={styles.temperatureValue}
            htmlFor="temperature-range"
          >
            {temperature}°C
          </output>
          <input
            id="temperature-range"
            type="range"
            className={styles.temperatureRange}
            min={-273}
            max={6000}
            step={1}
            value={temperature}
            onChange={(event) => setTemperature(Number(event.target.value))}
            aria-valuemin={-273}
            aria-valuemax={6000}
            aria-valuenow={temperature}
            aria-label="دمای محیط بر حسب درجه سلسیوس"
          />
        </div>
      </section>

      <div className={styles.tableWrapper}>
        <div className={styles.tableContent} dir="ltr">
          <div className={styles.groupLabels}>
            {Array.from({ length: 18 }, (_, index) => (
              <span
                key={`group-${index + 1}`}
                className={styles.groupLabel}
              >
                {index + 1}
              </span>
            ))}
          </div>

          <div className={styles.mainGrid} aria-label="جدول اصلی عناصر">
            {gridCells}
          </div>

          <div className={styles.fBlockSection} aria-label="عناصر بلوک اف">
            <div className={styles.fBlockRow}>
              <span className={styles.fBlockLabel}>لانتانیدها</span>
              {lanthanides.map((element) => (
                <ElementCard
                  key={`lanthanide-${element.atomicNumber}`}
                  element={element}
                  state={getPhysicalState(element, temperature)}
                  isSelected={
                    selectedElement?.atomicNumber === element.atomicNumber
                  }
                  isVisible={isVisibleInFilter(element)}
                  onSelect={setSelectedElement}
                  useGridPosition={false}
                />
              ))}
            </div>

            <div className={styles.fBlockRow}>
              <span className={styles.fBlockLabel}>اکتینیدها</span>
              {actinides.map((element) => (
                <ElementCard
                  key={`actinide-${element.atomicNumber}`}
                  element={element}
                  state={getPhysicalState(element, temperature)}
                  isSelected={
                    selectedElement?.atomicNumber === element.atomicNumber
                  }
                  isVisible={isVisibleInFilter(element)}
                  onSelect={setSelectedElement}
                  useGridPosition={false}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedElement && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedElement(null)}
          role="presentation"
        >
          <div
            className={styles.modalContent}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="element-modal-title"
            dir="rtl"
          >
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setSelectedElement(null)}
              aria-label="بستن پنجره اطلاعات"
            >
              ×
            </button>

            <div className={styles.modalHeader}>
              <div
                className={[
                  styles.modalSymbol,
                  styles[selectedElement.category],
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {selectedElement.symbol}
              </div>

              <div>
                <h2
                  id="element-modal-title"
                  className={styles.modalTitle}
                >
                  {selectedElement.persianName}{" "}
                  <span dir="ltr">({selectedElement.name})</span>
                </h2>

                <p className={styles.modalSubtitle}>
                  عدد اتمی {selectedElement.atomicNumber} · دوره{" "}
                  {selectedElement.period} · گروه{" "}
                  {selectedElement.group ?? "—"}
                </p>
              </div>
            </div>

            <table className={styles.detailsTable}>
              <tbody>
                <tr>
                  <th scope="row">دسته</th>
                  <td className={styles.persianValue}>
                    {CATEGORY_LABELS[selectedElement.category] ??
                      selectedElement.category}
                  </td>
                </tr>

                <tr>
                  <th scope="row">بلوک / حالت پایه</th>
                  <td>
                    {selectedElement.block ?? "—"} /{" "}
                    {STATE_LABEL[selectedElement.state as PhysicalState] ??
                      "نامشخص"}
                  </td>
                </tr>

                <tr>
                  <th scope="row">حالت در {temperature}°C</th>
                  <td className={styles.persianValue}>
                    {
                      STATE_LABEL[
                        getPhysicalState(selectedElement, temperature)
                      ]
                    }
                  </td>
                </tr>

                <tr>
                  <th scope="row">جرم اتمی</th>
                  <td dir="ltr">
                    {formatValue(selectedElement.atomicMass, "g/mol")}
                  </td>
                </tr>

                <tr>
                  <th scope="row">شعاع اتمی</th>
                  <td dir="ltr">
                    {formatValue(selectedElement.atomicRadius, "pm")}
                  </td>
                </tr>

                <tr>
                  <th scope="row">الکترونگاتیویته</th>
                  <td dir="ltr">
                    {formatValue(selectedElement.electronegativity)}
                  </td>
                </tr>

                <tr>
                  <th scope="row">انرژی یونش</th>
                  <td dir="ltr">
                    {formatValue(selectedElement.ionizationEnergy, "kJ/mol")}
                  </td>
                </tr>

                <tr>
                  <th scope="row">آرایش الکترونی</th>
                  <td dir="ltr">
                    {selectedElement.electronConfiguration ?? "—"}
                  </td>
                </tr>

                <tr>
                  <th scope="row">نقطه ذوب</th>
                  <td dir="ltr">
                    {formatValue(selectedElement.meltingPoint, "°C")}
                  </td>
                </tr>

                <tr>
                  <th scope="row">نقطه جوش</th>
                  <td dir="ltr">
                    {formatValue(selectedElement.boilingPoint, "°C")}
                  </td>
                </tr>

                <tr>
                  <th scope="row">چگالی</th>
                  <td dir="ltr">
                    {formatValue(selectedElement.density, "g/cm³")}
                  </td>
                </tr>

                <tr>
                  <th scope="row">کاشف / سال</th>
                  <td className={styles.persianValue}>
                    {selectedElement.discoveredBy ?? "—"} (
                    {selectedElement.discoveryYear ?? "—"})
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
