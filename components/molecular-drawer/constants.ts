// components/molecular-drawer/constants.ts

export const ELEMENT_DATA: Record<string, { color: string; mass: number; valency: number }> = {
  'H':  { color: '#FFFFFF', mass: 1.008,  valency: 1 },
  'C':  { color: '#333333', mass: 12.011, valency: 4 },
  'N':  { color: '#3050F8', mass: 14.007, valency: 3 },
  'O':  { color: '#FF0D0D', mass: 15.999, valency: 2 },
  'F':  { color: '#90E050', mass: 18.998, valency: 1 },
  'Cl': { color: '#1FF01F', mass: 35.45,  valency: 1 },
  'Br': { color: '#A62929', mass: 79.904, valency: 1 },
  'I':  { color: '#940094', mass: 126.90, valency: 1 },
  'S':  { color: '#FFFF30', mass: 32.06,  valency: 2 },
  'P':  { color: '#FF8000', mass: 30.974, valency: 3 },
  'Na': { color: '#AB5CF2', mass: 22.990, valency: 1 },
  'K':  { color: '#8F40D4', mass: 39.098, valency: 1 },
  'Mg': { color: '#8AFF00', mass: 24.305, valency: 2 },
  'Ca': { color: '#3DFF00', mass: 40.078, valency: 2 },
  'Fe': { color: '#E06633', mass: 55.845, valency: 3 },
  'B':  { color: '#FFB5B5', mass: 10.81,  valency: 3 },
  'Si': { color: '#F0C8A0', mass: 28.085, valency: 4 },
};

export const DEFAULT_ELEMENT_COLOR = '#C8C8C8';
