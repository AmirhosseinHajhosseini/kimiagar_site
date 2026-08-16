"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  calculateProperties,
  type CalculationResult,
} from "../../scripts/parser";
import styles from "./calculator.module.css";

const AVOGADRO = 6.02214076e23;

const PRESETS = [
  "H2O", "C6H12O6", "NaCl", "C2H5OH", "Ca(NO3)2",
  "H2SO4", "CuSO4·5H2O", "CH3COOH", "NH4+", "SO4^2-"
];

const HISTORY_KEY = "chem-calc-history";

interface HistoryEntry {
  formula: string;
  molarMass: number;
  timestamp: number;
}
// تابعی برای استانداردسازی حروف فرمول‌های شیمیایی
const normalizeFormula = (rawFormula: string): string => {
  if (!rawFormula) return "";
  // تبدیل حروف اول المان‌ها به بزرگ و حروف بعدی به کوچک
  // برای مثال: nacl -> NaCl, h2o -> H2O, c6h12o6 -> C6H12O6
  return rawFormula.replace(/[a-zA-Z]+/g, (match) => {
    if (match.length === 1) return match.toUpperCase();
    return match.charAt(0).toUpperCase() + match.slice(1).toLowerCase();
  });
};

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
function faNum(input: number | string): string {
  return String(input).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

function formatMass(n: number): string {
  if (n === 0) return faNum(0);
  if (Math.abs(n) >= 1e6 || Math.abs(n) < 1e-4) return faNum(n.toExponential(3));
  return faNum(n.toLocaleString("en-US", { maximumFractionDigits: 4 }));
}

export default function Calculator() {
  const [formula, setFormula] = useState("");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [activeTab, setActiveTab] = useState<"results" | "converter">("results");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [convValue, setConvValue] = useState("1");
  const [convUnit, setConvUnit] = useState<"mol" | "g" | "particles">("mol");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  }, []);

  const addToHistory = useCallback((formula: string, molarMass: number) => {
    setHistory((prev) => {
      const next = [{ formula, molarMass, timestamp: Date.now() }, ...prev.filter((h) => h.formula !== formula)].slice(0, 6);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const calculate = useCallback((raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    setFormula(trimmed);
    const res = calculateProperties(trimmed);
    setResult(res);
    setActiveTab("results");
    if (res.isValid) addToHistory(trimmed, res.totalMolarMass);
  }, [addToHistory]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try { localStorage.removeItem(HISTORY_KEY); } catch {}
  }, []);

  const bondType = result?.isValid && result.elements.length > 0
    ? (result.elements.length === 1 ? "عنصر خالص" : result.isIonic ? "یونی" : "کووالانسی")
    : "—";

  const molarMass = result?.isValid ? result.totalMolarMass : 0;

  const conversions = useMemo(() => {
    const v = parseFloat(convValue);
    if (!Number.isFinite(v) || v <= 0 || !molarMass) return null;
    let mol = convUnit === "mol" ? v : convUnit === "g" ? v / molarMass : v / AVOGADRO;
    return { mol, grams: mol * molarMass, particles: mol * AVOGADRO };
  }, [convValue, convUnit, molarMass]);

  const copyAnalysis = async () => {
    if (!result?.isValid) return;
    const lines = [
      `فرمول: ${result.formula}`,
      `جرم مولی: ${result.totalMolarMass} g/mol`,
      `جرم مونوایزوتوپی: ${result.monoisotopicMass} Da`,
      `تعداد اتم: ${result.atomCount}`,
      `بار: ${result.charge}`,
      `نوع پیوند: ${bondType}`,
      `قطبیت: ${result.estimatedPolarity}`
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <section className={styles.wrap}>
      {/* بخش هدر لوکس */}
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>محاسبه‌گر خواص فیزیکوشیمیایی</h1>
        <p className={styles.heroSubtitle}>
          موتور محاسباتی پیشرفته برای تعیین جرم مولی دقیق، بررسی قطبیت، ظرفیت‌های پیوندی و ویژگی‌های ترمودینامیکی
        </p>
      </div>

      <div className={styles.inputCard}>
        <div className={styles.labelRow}>🧪 فرمول شیمیایی</div>
        <div className={styles.inputRow}>
          <input
            className={styles.input} dir="ltr" type="text" value={formula}
            placeholder="مثلاً Ca(NO3)2 یا CuSO4·5H2O"
            onChange={(e) => setFormula(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") calculate(formula); }}
          />
          <button className={styles.calcBtn} onClick={() => calculate(formula)}>محاسبه</button>
        </div>

        {result && !result.isValid && <div className={styles.error}>{result.error}</div>}

        <div className={styles.presets}>
          {PRESETS.map((p) => (
            <button
              key={p}
              className={`${styles.preset} ${formula === p ? styles.presetActive : ""}`}
              onClick={() => calculate(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {result?.isValid && (
        <>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === "results" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("results")}
            >
              نتایج
            </button>
            <button
              className={`${styles.tab} ${activeTab === "converter" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("converter")}
            >
              مبدل
            </button>
          </div>

          {activeTab === "results" ? (
            <>
              <div className={styles.statsGrid}>
                <Stat label="جرم مولی" value={`${formatMass(result.totalMolarMass)} g/mol`} />
                <Stat label="جرم مونوایزوتوپی" value={`${formatMass(result.monoisotopicMass)} Da`} />
                <Stat label="تعداد اتم" value={faNum(result.atomCount)} />
                <Stat label="بار" value={result.charge === 0 ? "خنثی" : faNum(result.charge)} />
                <Stat label="نوع پیوند" value={bondType} />
                <Stat label="قطبیت" value={result.estimatedPolarity} />
                <Stat label="پیوند هیدروژنی" value={result.canFormHydrogenBonds ? "دارد" : "ندارد"} />
                <Stat label="فرمول تجربی" value={result.empiricalFormula || "—"} />
              </div>

              <div className={styles.composition}>
                <h3 className={styles.compTitle}>| ترکیب عنصری</h3>
                <div className={styles.compositionGrid}>
                  {result.elements.map((el) => (
                    <div key={el.symbol} className={styles.compCard}>
                      <span className={styles.compSymbol}>{el.symbol}</span>
                      <div className={styles.compPct}>{faNum(el.weightPercentage)}%</div>
                      <div className={styles.compBar}>
                        <span
                          className={styles.compBarFill}
                          style={{ width: `${el.weightPercentage}%` }}
                        />
                      </div>
                      <div className={styles.compCount}>{faNum(el.count)} اتم</div>
                    </div>
                  ))}
                </div>
              </div>

              <button className={styles.copyBtn} onClick={copyAnalysis}>
                {copied ? "کپی شد ✓" : "کپی آنالیز"}
              </button>
            </>
          ) : (
            <div className={styles.converter}>
              <div className={styles.converterTitle}>🌡️ مبدل واحد</div>

              <div className={styles.converterRow}>
                <input
                  className={styles.converterInput}
                  dir="ltr"
                  type="number"
                  value={convValue}
                  onChange={(e) => setConvValue(e.target.value)}
                />
                <select
                  className={styles.converterSelect}
                  value={convUnit}
                  onChange={(e) => setConvUnit(e.target.value as "mol" | "g" | "particles")}
                >
                  <option value="mol">مول (mol)</option>
                  <option value="g">گرم (g)</option>
                  <option value="particles">ذره (particle)</option>
                </select>
              </div>

              {conversions && (
                <div className={styles.converterResults}>
                  <div className={styles.converterResult}>
                    <span>مول:</span>
                    <strong>{formatMass(conversions.mol)}</strong>
                  </div>
                  <div className={styles.converterResult}>
                    <span>گرم:</span>
                    <strong>{formatMass(conversions.grams)}</strong>
                  </div>
                  <div className={styles.converterResult}>
                    <span>ذرات:</span>
                    <strong>{formatMass(conversions.particles)}</strong>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {history.length > 0 && (
        <div className={styles.history}>
          <div className={styles.historyHeader}>
            <h3 className={styles.historyTitle}>🕘 تاریخچه محاسبات</h3>
            <button className={styles.historyClear} onClick={clearHistory}>پاک‌سازی</button>
          </div>
          <ul className={styles.historyList}>
            {history.map((h) => (
              <li key={h.timestamp}>
                <button className={styles.historyItem} onClick={() => calculate(h.formula)}>
                  <span dir="ltr" className={styles.historyFormula}>{h.formula}</span>
                  <span className={styles.historyMass}>{faNum(h.molarMass)} g/mol</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
    </div>
  );
}
