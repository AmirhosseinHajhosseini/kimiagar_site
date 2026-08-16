interface ElemInfo {
  atomicMass: number;
  monoisotopicMass: number;
  isMetal: boolean;
}

const ELEMENT_DATA: Record<string, ElemInfo> = {
  H:  { atomicMass: 1.008,   monoisotopicMass: 1.007825,  isMetal: false },
  He: { atomicMass: 4.0026,  monoisotopicMass: 4.002603,  isMetal: false },
  Li: { atomicMass: 6.94,    monoisotopicMass: 7.016004,  isMetal: true  },
  Be: { atomicMass: 9.0122,  monoisotopicMass: 9.012182,  isMetal: true  },
  B:  { atomicMass: 10.81,   monoisotopicMass: 11.009305, isMetal: false },
  C:  { atomicMass: 12.011,  monoisotopicMass: 12.000000, isMetal: false },
  N:  { atomicMass: 14.007,  monoisotopicMass: 14.003074, isMetal: false },
  O:  { atomicMass: 15.999,  monoisotopicMass: 15.994915, isMetal: false },
  F:  { atomicMass: 18.998,  monoisotopicMass: 18.998403, isMetal: false },
  Ne: { atomicMass: 20.180,  monoisotopicMass: 19.992440, isMetal: false },
  Na: { atomicMass: 22.990,  monoisotopicMass: 22.989769, isMetal: true  },
  Mg: { atomicMass: 24.305,  monoisotopicMass: 23.985042, isMetal: true  },
  Al: { atomicMass: 26.982,  monoisotopicMass: 26.981539, isMetal: true  },
  Si: { atomicMass: 28.085,  monoisotopicMass: 27.976927, isMetal: false },
  P:  { atomicMass: 30.974,  monoisotopicMass: 30.973762, isMetal: false },
  S:  { atomicMass: 32.06,   monoisotopicMass: 31.972071, isMetal: false },
  Cl: { atomicMass: 35.45,   monoisotopicMass: 34.968853, isMetal: false },
  Ar: { atomicMass: 39.948,  monoisotopicMass: 39.962383, isMetal: false },
  K:  { atomicMass: 39.098,  monoisotopicMass: 38.963707, isMetal: true  },
  Ca: { atomicMass: 40.078,  monoisotopicMass: 39.962591, isMetal: true  },
  Sc: { atomicMass: 44.956,  monoisotopicMass: 44.955912, isMetal: true  },
  Ti: { atomicMass: 47.867,  monoisotopicMass: 47.947947, isMetal: true  },
  V:  { atomicMass: 50.942,  monoisotopicMass: 50.943960, isMetal: true  },
  Cr: { atomicMass: 51.996,  monoisotopicMass: 51.940508, isMetal: true  },
  Mn: { atomicMass: 54.938,  monoisotopicMass: 54.938045, isMetal: true  },
  Fe: { atomicMass: 55.845,  monoisotopicMass: 55.934938, isMetal: true  },
  Co: { atomicMass: 58.933,  monoisotopicMass: 58.933195, isMetal: true  },
  Ni: { atomicMass: 58.693,  monoisotopicMass: 57.935343, isMetal: true  },
  Cu: { atomicMass: 63.546,  monoisotopicMass: 62.929598, isMetal: true  },
  Zn: { atomicMass: 65.38,   monoisotopicMass: 63.929142, isMetal: true  },
  Ga: { atomicMass: 69.723,  monoisotopicMass: 68.925574, isMetal: true  },
  Ge: { atomicMass: 72.630,  monoisotopicMass: 73.921178, isMetal: false },
  As: { atomicMass: 74.922,  monoisotopicMass: 74.921597, isMetal: false },
  Se: { atomicMass: 78.971,  monoisotopicMass: 79.916521, isMetal: false },
  Br: { atomicMass: 79.904,  monoisotopicMass: 78.918338, isMetal: false },
  Kr: { atomicMass: 83.798,  monoisotopicMass: 83.911507, isMetal: false },
  Rb: { atomicMass: 85.468,  monoisotopicMass: 84.911790, isMetal: true  },
  Sr: { atomicMass: 87.62,   monoisotopicMass: 87.905612, isMetal: true  },
  Ag: { atomicMass: 107.87,  monoisotopicMass: 106.905097, isMetal: true },
  Cd: { atomicMass: 112.41,  monoisotopicMass: 113.903358, isMetal: true },
  Sn: { atomicMass: 118.71,  monoisotopicMass: 119.902195, isMetal: true },
  I:  { atomicMass: 126.90,  monoisotopicMass: 126.904473, isMetal: false },
  Ba: { atomicMass: 137.33,  monoisotopicMass: 137.905247, isMetal: true },
  Pt: { atomicMass: 195.08,  monoisotopicMass: 194.964791, isMetal: true },
  Au: { atomicMass: 196.97,  monoisotopicMass: 196.966569, isMetal: true },
  Hg: { atomicMass: 200.59,  monoisotopicMass: 201.970643, isMetal: true },
  Pb: { atomicMass: 207.2,   monoisotopicMass: 207.976652, isMetal: true },
  U:  { atomicMass: 238.03,  monoisotopicMass: 238.050788, isMetal: true },
};

function getElement(symbol: string): ElemInfo | undefined {
  return ELEMENT_DATA[symbol];
}

export interface ElementDetail {
  symbol: string;
  count: number;
  molarMass: number;
  monoisotopicMass: number;
  totalElementMass: number;
  weightPercentage: string;
}

export interface CalculationResult {
  isValid: boolean;
  formula: string;
  totalMolarMass: number;
  monoisotopicMass: number;
  atomCount: number;
  charge: number;
  elements: ElementDetail[];
  isIonic: boolean;
  estimatedPolarity: string;
  canFormHydrogenBonds: boolean;
  empiricalFormula: string;
  error?: string;
}

interface Token {
  type: "element" | "number" | "open" | "close" | "hydrate" | "charge";
  value: string;
}

function tokenize(formula: string): Token[] {
  const tokens: Token[] = [];
  const regex = /([A-Z][a-z]?)|(\d+)|([\(\)\[\]])|([·.])|(\^\d*[+-])|([+-]\d*)/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(formula)) !== null) {
    if (m[1]) tokens.push({ type: "element", value: m[1] });
    else if (m[2]) tokens.push({ type: "number", value: m[2] });
    else if (m[3]) tokens.push({ type: m[3] === "(" || m[3] === "[" ? "open" : "close", value: m[3] });
    else if (m[4]) tokens.push({ type: "hydrate", value: m[4] });
    else if (m[5]) tokens.push({ type: "charge", value: m[5] });
    else if (m[6]) tokens.push({ type: "charge", value: m[6] });
  }
  return tokens;
}

function merge(target: Record<string, number>, src: Record<string, number>) {
  for (const k in src) target[k] = (target[k] || 0) + src[k];
}

function parseCharge(raw: string): number {
  const s = raw.replace("^", "").trim();
  let m = s.match(/^([+-])(\d*)$/);
  if (m) {
    const sign = m[1] === "+" ? 1 : -1;
    return sign * (m[2] ? parseInt(m[2], 10) : 1);
  }
  m = s.match(/^(\d*)([+-])$/);
  if (m) {
    const sign = m[2] === "+" ? 1 : -1;
    return sign * (m[1] ? parseInt(m[1], 10) : 1);
  }
  return 0;
}

function parseFormula(formula: string): { counts: Record<string, number>; charge: number } {
  const tokens = tokenize(formula.replace(/\s+/g, ""));
  if (tokens.length === 0) throw new Error("فرمول خالی است.");

  let pos = 0;
  let charge = 0;
  const counts: Record<string, number> = {};

  const peek = () => tokens[pos];
  const next = () => tokens[pos++];

  const parseCount = (): number => {
    if (peek() && peek().type === "number") return parseInt(next().value, 10);
    return 1;
  };

  const parseGroup = (outerMult: number): Record<string, number> => {
    const t = peek();
    if (!t) throw new Error("فرمول ناقص است.");
    const group: Record<string, number> = {};

    if (t.type === "element") {
      next();
      if (!getElement(t.value)) throw new Error(`عنصر "${t.value}" شناخته نشد.`);
      const count = parseCount() * outerMult;
      group[t.value] = (group[t.value] || 0) + count;
      return group;
    }

    if (t.type === "open") {
      next();
      const inner: Record<string, number> = {};
      while (peek() && peek().type !== "close") {
        merge(inner, parseGroup(1));
      }
      if (!peek()) throw new Error("پرانتز بسته نشده است.");
      next();
      const closeMult = parseCount() * outerMult;
      for (const s in inner) group[s] = (group[s] || 0) + inner[s] * closeMult;
      return group;
    }

    throw new Error("عبارت نامعتبر در فرمول.");
  };

  while (pos < tokens.length) {
    const t = peek();
    if (t.type === "hydrate") {
      next();
      if (!peek()) throw new Error("فرمول پس از نقطه هیدرات ناقص است.");
      merge(counts, parseGroup(parseCount()));
    } else if (t.type === "charge") {
      next();
      charge += parseCharge(t.value);
    } else if (t.type === "close") {
      throw new Error("پرانتز بدون شروع وجود دارد.");
    } else {
      merge(counts, parseGroup(1));
    }
  }

  if (Object.keys(counts).length === 0) throw new Error("فرمول معتبر نیست.");
  return { counts, charge };
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function empiricalFormula(counts: Record<string, number>): string {
  const values = Object.values(counts);
  if (values.length === 0) return "";
  let g = values[0];
  for (const v of values) g = gcd(g, v);
  return Object.keys(counts)
    .map((s) => {
      const n = counts[s] / g;
      return n === 1 ? s : `${s}${n}`;
    })
    .join("");
}

const NONPOLAR_SET = new Set([
  "H2", "N2", "O2", "F2", "Cl2", "Br2", "I2",
  "CO2", "CH4", "CCl4", "C6H6", "C2H2", "C2H4", "BF3", "P4", "S8",
]);

function estimatePolarity(formula: string, symbols: string[], isIonic: boolean): string {
  if (symbols.length === 1) return "غیرقطبی (عنصر خالص)";
  if (isIonic) return "قطبی (ترکیب یونی)";
  if (NONPOLAR_SET.has(formula)) return "غیرقطبی";
  return "قطبی";
}

export function calculateProperties(formula: string): CalculationResult {
  try {
    const { counts, charge } = parseFormula(formula);
    const entries = Object.entries(counts);

    let totalMass = 0;
    let monoMass = 0;
    let atomCount = 0;

    for (const [symbol, count] of entries) {
      const el = getElement(symbol)!;
      totalMass += el.atomicMass * count;
      monoMass += el.monoisotopicMass * count;
      atomCount += count;
    }

    const details: ElementDetail[] = entries.map(([symbol, count]) => {
      const el = getElement(symbol)!;
      const mass = el.atomicMass * count;
      return {
        symbol,
        count,
        molarMass: el.atomicMass,
        monoisotopicMass: el.monoisotopicMass,
        totalElementMass: parseFloat(mass.toFixed(4)),
        weightPercentage: ((mass / totalMass) * 100).toFixed(2),
      };
    });
    details.sort((a, b) => parseFloat(b.weightPercentage) - parseFloat(a.weightPercentage));

    const symbols = Object.keys(counts);
    const hasMetal = symbols.some((s) => getElement(s)?.isMetal);
    const hasNonmetal = symbols.some((s) => !getElement(s)?.isMetal);
    const isIonic = charge !== 0 || (hasMetal && hasNonmetal && symbols.length > 1);

    const hasH = !!counts["H"];
    const hasFON = !!(counts["F"] || counts["O"] || counts["N"]);

    return {
      isValid: true,
      formula,
      totalMolarMass: parseFloat(totalMass.toFixed(4)),
      monoisotopicMass: parseFloat(monoMass.toFixed(6)),
      atomCount,
      charge,
      elements: details,
      isIonic,
      estimatedPolarity: estimatePolarity(formula, symbols, isIonic),
      canFormHydrogenBonds: hasH && hasFON,
      empiricalFormula: empiricalFormula(counts),
    };
  } catch (err: any) {
    return {
      isValid: false,
      formula,
      totalMolarMass: 0,
      monoisotopicMass: 0,
      atomCount: 0,
      charge: 0,
      elements: [],
      isIonic: false,
      estimatedPolarity: "نامشخص",
      canFormHydrogenBonds: false,
      empiricalFormula: "",
      error: err?.message || "خطای ناشناخته",
    };
  }
}

