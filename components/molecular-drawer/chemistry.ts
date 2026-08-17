// components/molecular-drawer/chemistry.ts

import { Atom, Bond, Molecule } from './types';
import { ELEMENT_DATA } from './constants';

export interface ChemicalProperties {
  formula: string;
  molecularWeight: number;
  atomCounts: Record<string, number>;
  totalBonds: number;
  warnings: string[];
}

/**
 * شمارش تعداد هر اتم در مولکول
 */
export const countAtoms = (atoms: Atom[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  atoms.forEach((atom) => {
    const el = atom.element.trim();
    if (!el) return;
    counts[el] = (counts[el] || 0) + 1;
  });
  return counts;
};

/**
 * تولید فرمول شیمیایی استاندارد (سیستم Hill: ابتدا C سپس H و بقیه به ترتیب الفبا)
 */
export const generateHillFormula = (atomCounts: Record<string, number>): string => {
  const elements = Object.keys(atomCounts);
  if (elements.length === 0) return '—';

  let formula = '';

  // اگر کربن وجود دارد
  if (atomCounts['C']) {
    formula += `C${atomCounts['C'] > 1 ? atomCounts['C'] : ''}`;
    if (atomCounts['H']) {
      formula += `H${atomCounts['H'] > 1 ? atomCounts['H'] : ''}`;
    }
  }

  // اضافه کردن بقیه عناصر به ترتیب الفبا
  elements
    .filter((el) => {
      if (atomCounts['C']) {
        return el !== 'C' && el !== 'H';
      }
      return true;
    })
    .sort()
    .forEach((el) => {
      formula += `${el}${atomCounts[el] > 1 ? atomCounts[el] : ''}`;
    });

  return formula;
};

/**
 * محاسبه جرم مولی دقیق (g/mol)
 */
export const calculateMolecularWeight = (atomCounts: Record<string, number>): number => {
  let totalMass = 0;
  Object.entries(atomCounts).forEach(([element, count]) => {
    const data = ELEMENT_DATA[element];
    const mass = data ? data.mass : 0;
    totalMass += mass * count;
  });
  return parseFloat(totalMass.toFixed(3));
};

/**
 * بررسی ظرفیت پیوندی (Valence Check) و هشدارهای ساختاری
 */
export const validateStructure = (atoms: Atom[], bonds: Bond[]): string[] => {
  const warnings: string[] = [];

  atoms.forEach((atom) => {
    const elData = ELEMENT_DATA[atom.element];
    if (!elData) return;

    // مجموع مرتبه پیوندهای متصل به این اتم
    const currentValency = bonds.reduce((sum, bond) => {
      if (bond.atom1Id === atom.id || bond.atom2Id === atom.id) {
        return sum + bond.order;
      }
      return sum;
    }, 0);

    if (currentValency > elData.valency) {
      warnings.push(`اتم ${atom.element} (کد: ${atom.id.slice(0, 4)}) بیشتر از ظرفیت مجاز (${elData.valency}) پیوند دارد.`);
    }
  });

  return warnings;
};

/**
 * تحلیل کامل مشخصات مولکول
 */
export const analyzeMolecule = (molecule: Molecule): ChemicalProperties => {
  const atomCounts = countAtoms(molecule.atoms);
  const formula = generateHillFormula(atomCounts);
  const molecularWeight = calculateMolecularWeight(atomCounts);
  const warnings = validateStructure(molecule.atoms, molecule.bonds);

  return {
    formula,
    molecularWeight,
    atomCounts,
    totalBonds: molecule.bonds.length,
    warnings,
  };
};

/**
 * پارسر ساده برای ورودی متن فرمول مانند H2SO4 یا CH3COOH
 */
export const parseFormulaString = (formula: string): Record<string, number> => {
  const regex = /([A-Z][a-z]*)(\d*)/g;
  const counts: Record<string, number> = {};
  let match;

  while ((match = regex.exec(formula)) !== null) {
    if (!match[1]) continue;
    const element = match[1];
    const quantity = match[2] ? parseInt(match[2], 10) : 1;
    counts[element] = (counts[element] || 0) + quantity;
  }

  return counts;
};
