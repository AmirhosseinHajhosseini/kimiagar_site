"use client";

import React, { useState } from "react";
import styles from "./molar-mass.module.css";

// دیتابیس کامل ۱۱۸ عنصر جدول تناوبی بر اساس مقادیر استاندارد IUPAC
const ELEMENT_WEIGHTS: { [key: string]: { name: string; weight: number } } = {
  H: { name: "هیدروژن", weight: 1.008 }, He: { name: "هلیم", weight: 4.0026 },
  Li: { name: "لیتیم", weight: 6.94 }, Be: { name: "بریلیم", weight: 9.0122 },
  B: { name: "بور", weight: 10.81 }, C: { name: "کربن", weight: 12.011 },
  N: { name: "نیتروژن", weight: 14.007 }, O: { name: "اکسیژن", weight: 15.999 },
  F: { name: "فلوئور", weight: 18.998 }, Ne: { name: "نئون", weight: 20.180 },
  Na: { name: "سدیم", weight: 22.990 }, Mg: { name: "منیزیم", weight: 24.305 },
  Al: { name: "آلومینیوم", weight: 26.982 }, Si: { name: "سیلیسیم", weight: 28.085 },
  P: { name: "فسفر", weight: 30.974 }, S: { name: "گوگرد", weight: 32.06 },
  Cl: { name: "کلر", weight: 35.45 }, Ar: { name: "آرگون", weight: 39.948 },
  K: { name: "پتاسیم", weight: 39.098 }, Ca: { name: "کلسیم", weight: 40.078 },
  Sc: { name: "اسکاندیم", weight: 44.956 }, Ti: { name: "تیتانیوم", weight: 47.867 },
  V: { name: "وانادیوم", weight: 50.942 }, Cr: { name: "کروم", weight: 51.996 },
  Mn: { name: "منگنز", weight: 54.938 }, Fe: { name: "آهن", weight: 55.845 },
  Co: { name: "کبالت", weight: 58.933 }, Ni: { name: "نیکل", weight: 58.693 },
  Cu: { name: "مس", weight: 63.546 }, Zn: { name: "روی", weight: 65.38 },
  Ga: { name: "گالیم", weight: 69.723 }, Ge: { name: "ژرمانیوم", weight: 72.630 },
  As: { name: "آرسنیک", weight: 74.922 }, Se: { name: "سلنیوم", weight: 78.971 },
  Br: { name: "برم", weight: 79.904 }, Kr: { name: "کریپتون", weight: 83.798 },
  Rb: { name: "روبیدیوم", weight: 85.468 }, Sr: { name: "استرانسیوم", weight: 87.62 },
  Y: { name: "ایتریوم", weight: 88.906 }, Zr: { name: "زیرکونیوم", weight: 91.224 },
  Nb: { name: "نیوبیوم", weight: 92.906 }, Mo: { name: "مولیبدن", weight: 95.95 },
  Tc: { name: "تکنسیوم", weight: 98 }, Ru: { name: "روتنیوم", weight: 101.07 },
  Rh: { name: "رودیوم", weight: 102.91 }, Pd: { name: "پالادیوم", weight: 106.42 },
  Ag: { name: "نقره", weight: 107.87 }, Cd: { name: "کادمیوم", weight: 112.41 },
  In: { name: "ایندیوم", weight: 114.82 }, Sn: { name: "قلع", weight: 118.71 },
  Sb: { name: "آنتیموان", weight: 121.76 }, Te: { name: "تلوریوم", weight: 127.60 },
  I: { name: "ید", weight: 126.90 }, Xe: { name: "گزنون", weight: 131.29 },
  Cs: { name: "سزیوم", weight: 132.91 }, Ba: { name: "باریم", weight: 137.33 },
  La: { name: "لانتان", weight: 138.91 }, Ce: { name: "سریم", weight: 140.12 },
  Pr: { name: "پرازئودیمیم", weight: 140.91 }, Nd: { name: "نئودیمیم", weight: 144.24 },
  Pm: { name: "پرومتیوم", weight: 145 }, Sm: { name: "ساماریوم", weight: 150.36 },
  Eu: { name: "اروپیم", weight: 151.96 }, Gd: { name: "گادولینیوم", weight: 157.25 },
  Tb: { name: "تربیوم", weight: 158.93 }, Dy: { name: "دیسپروزیوم", weight: 162.50 },
  Ho: { name: "هولمیوم", weight: 164.93 }, Er: { name: "اربیوم", weight: 167.26 },
  Tm: { name: "تولیوم", weight: 168.93 }, Yb: { name: "ایتربیوم", weight: 173.05 },
  Lu: { name: "لوتسیوم", weight: 174.97 }, Hf: { name: "هافنیوم", weight: 178.49 },
  Ta: { name: "تانتال", weight: 180.95 }, W: { name: "تنگستن", weight: 183.84 },
  Re: { name: "رنیوم", weight: 186.21 }, Os: { name: "اسمیوم", weight: 190.23 },
  Ir: { name: "ایریدیوم", weight: 192.22 }, Pt: { name: "پلاتین", weight: 195.08 },
  Au: { name: "طلا", weight: 196.97 }, Hg: { name: "جیوه", weight: 200.59 },
  Tl: { name: "تالیوم", weight: 204.38 }, Pb: { name: "سرب", weight: 207.2 },
  Bi: { name: "بیسموت", weight: 208.98 }, Po: { name: "پولونیوم", weight: 209 },
  At: { name: "استاتین", weight: 210 }, Rn: { name: "رادون", weight: 222 },
  Fr: { name: "فرانسیوم", weight: 223 }, Ra: { name: "رادیوم", weight: 226 },
  Ac: { name: "اکتینیوم", weight: 227 }, Th: { name: "توریوم", weight: 232.04 },
  Pa: { name: "پروتاکتینیوم", weight: 231.04 }, U: { name: "اورانیوم", weight: 238.03 },
  Np: { name: "نپتونیوم", weight: 237 }, Pu: { name: "پلوتونیوم", weight: 244 },
  Am: { name: "امریسیوم", weight: 243 }, Cm: { name: "کوریوم", weight: 247 },
  Bk: { name: "برکلیوم", weight: 247 }, Cf: { name: "کالیفرنیوم", weight: 251 },
  Es: { name: "اینشتینیوم", weight: 252 }, Fm: { name: "فرمیوم", weight: 257 },
  Md: { name: "مندلویوم", weight: 258 }, No: { name: "نوبلیوم", weight: 259 },
  Lr: { name: "لارنسیوم", weight: 262 }, Rf: { name: "رادرفوردیوم", weight: 267 },
  Db: { name: "دوبنیوم", weight: 270 }, Sg: { name: "سیبورگیوم", weight: 271 },
  Bh: { name: "بوریوم", weight: 270 }, Hs: { name: "هاسیوم", weight: 277 },
  Mt: { name: "مایتنریوم", weight: 276 }, Ds: { name: "دارمشتاتیوم", weight: 281 },
  Rg: { name: "رونتگنیوم", weight: 280 }, Cn: { name: "کوپرنیسیوم", weight: 285 },
  Nh: { name: "نیهونیوم", weight: 284 }, Fl: { name: "فلرویوم", weight: 289 },
  Mc: { name: "مسکوویوم", weight: 288 }, Lv: { name: "لیورموریوم", weight: 293 },
  Ts: { name: "تنسین", weight: 294 }, Og: { name: "اوگانسون", weight: 294 }
};

interface ElementCount {
  symbol: string;
  count: number;
  unitWeight: number;
  totalWeight: number;
  percentage: number;
}

export default function MolarMassCalculator() {
  const [formula, setFormula] = useState("");
  const [result, setResult] = useState<{
    totalMass: number;
    breakdown: ElementCount[];
  } | null>(null);
  const [error, setError] = useState("");

  const calculateMolarMass = (input: string) => {
    setError("");
    setResult(null);
    const cleaned = input.replace(/\s+/g, ""); 
    if (!cleaned) return;

    try {
      const counts: { [symbol: string]: number } = {};

      const parseFormula = (str: string, multiplier: number = 1) => {
        let i = 0;
        while (i < str.length) {
          if (str[i] === "(") {
            let bracketDepth = 1;
            let j = i + 1;
            while (j < str.length && bracketDepth > 0) {
              if (str[j] === "(") bracketDepth++;
              if (str[j] === ")") bracketDepth--;
              j++;
            }
            if (bracketDepth > 0) throw new Error("خطا: پرانتز بسته نشده است.");

            const subFormula = str.substring(i + 1, j - 1);
            i = j;

            let countStr = "";
            while (i < str.length && /[0-9.]/.test(str[i])) {
              countStr += str[i];
              i++;
            }
            const subMultiplier = countStr ? parseFloat(countStr) : 1;
            parseFormula(subFormula, multiplier * subMultiplier);
          } else if (/[A-Z]/.test(str[i])) {
            let symbol = str[i];
            i++;
            if (i < str.length && /[a-z]/.test(str[i])) {
              symbol += str[i];
              i++;
            }

            if (!ELEMENT_WEIGHTS[symbol]) {
              throw new Error(`خطا: عنصر ناشناخته "${symbol}"`);
            }

            let countStr = "";
            while (i < str.length && /[0-9.]/.test(str[i])) {
              countStr += str[i];
              i++;
            }
            const count = countStr ? parseFloat(countStr) : 1;
            counts[symbol] = (counts[symbol] || 0) + count * multiplier;
          } else if (str[i] === "·" || str[i] === ".") {
            i++;
            let coeffStr = "";
            while (i < str.length && /[0-9.]/.test(str[i])) {
              coeffStr += str[i];
              i++;
            }
            const coeff = coeffStr ? parseFloat(coeffStr) : 1;
            const remaining = str.substring(i);
            parseFormula(remaining, multiplier * coeff);
            break;
          } else {
            throw new Error(`خطا: نویسه نامعتبر "${str[i]}"`);
          }
        }
      };

      parseFormula(cleaned);

      let totalMass = 0;
      const breakdown: ElementCount[] = [];

      for (const symbol in counts) {
        const count = counts[symbol];
        const unitWeight = ELEMENT_WEIGHTS[symbol].weight;
        const totalWeight = count * unitWeight;
        totalMass += totalWeight;
        breakdown.push({
          symbol,
          count,
          unitWeight,
          totalWeight,
          percentage: 0
        });
      }

      breakdown.forEach(item => {
        item.percentage = (item.totalWeight / totalMass) * 100;
      });

      setResult({
        totalMass: parseFloat(totalMass.toFixed(4)),
        breakdown: breakdown.sort((a, b) => b.totalWeight - a.totalWeight)
      });
    } catch (err: any) {
      setError(err.message || "فرمول وارد شده معتبر نیست.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      calculateMolarMass(formula);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🧪 محاسبه‌گر جرم مولی کیمیاگر</h2>
      <p className={styles.subtitle}>
        فرمول شیمیایی را وارد کنید (مثال: <code dir="ltr">H2O</code>،{" "}
        <code dir="ltr">Ca(OH)2</code> یا <code dir="ltr">CuSO4.5H2O</code>)
      </p>

      <div className={styles.inputGroup}>
        <input
          type="text"
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="مثال: C6H12O6"
          className={styles.input}
          dir="ltr"
        />
        <button
          onClick={() => calculateMolarMass(formula)}
          className={styles.button}
        >
          محاسبه
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {result && (
        <div className={styles.resultCard}>
          <div className={styles.totalMassSection}>
            <span className={styles.label}>جرم مولی کل:</span>
            <span className={styles.value}>
              {result.totalMass} <small>g/mol</small>
            </span>
          </div>

          <h3 className={styles.tableTitle}>آنالیز و درصد جرمی عناصر:</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>عنصر</th>
                  <th>نام</th>
                  <th>تعداد</th>
                  <th>جرم اتمی</th>
                  <th>جرم کل (g/mol)</th>
                  <th>درصد جرمی</th>
                </tr>
              </thead>
              <tbody>
                {result.breakdown.map((item) => (
                  <tr key={item.symbol}>
                    <td className={styles.symbolCell}>{item.symbol}</td>
                    <td>{ELEMENT_WEIGHTS[item.symbol].name}</td>
                    <td>{item.count}</td>
                    <td>{item.unitWeight}</td>
                    <td>{item.totalWeight.toFixed(4)}</td>
                    <td>
                      <div className={styles.percentageWrapper}>
                        <div
                          className={styles.bar}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                        <span className={styles.percentageText}>
                          {item.percentage.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
