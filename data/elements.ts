export interface ElementData {
  atomicNumber: number;
  symbol: string;
  name: string;
  persianName: string;
  groupId: number; // ستون ۱ تا ۱۸
  periodId: number; // ردیف ۱ تا ۷ برای عناصر اصلی، ردیف ۹ و ۱۰ برای لانتانیدها و اکتینیدها
  atomicMass: number;
  meltingPointC?: number;
  boilingPointC?: number;
  electronConfiguration: string;
  category: string;
}

export const elementsList: ElementData[] = [
  // دوره ۱
  { atomicNumber: 1, symbol: "H", name: "Hydrogen", persianName: "هیدروژن", groupId: 1, periodId: 1, atomicMass: 1.008, meltingPointC: -259.16, boilingPointC: -252.87, electronConfiguration: "1s1", category: "nonmetal" },
  { atomicNumber: 2, symbol: "He", name: "Helium", persianName: "هلیم", groupId: 18, periodId: 1, atomicMass: 4.0026, meltingPointC: -272.2, boilingPointC: -268.93, electronConfiguration: "1s2", category: "noble-gas" },

  // دوره ۲
  { atomicNumber: 3, symbol: "Li", name: "Lithium", persianName: "لیتیم", groupId: 1, periodId: 2, atomicMass: 6.94, meltingPointC: 180.54, boilingPointC: 1342, electronConfiguration: "[He] 2s1", category: "alkali-metal" },
  { atomicNumber: 4, symbol: "Be", name: "Beryllium", persianName: "بریلیم", groupId: 2, periodId: 2, atomicMass: 9.0122, meltingPointC: 1287, boilingPointC: 2469, electronConfiguration: "[He] 2s2", category: "alkaline-earth" },
  { atomicNumber: 5, symbol: "B", name: "Boron", persianName: "بور", groupId: 13, periodId: 2, atomicMass: 10.81, meltingPointC: 2075, boilingPointC: 4000, electronConfiguration: "[He] 2s2 2p1", category: "metalloid" },
  { atomicNumber: 6, symbol: "C", name: "Carbon", persianName: "کربن", groupId: 14, periodId: 2, atomicMass: 12.011, meltingPointC: 3550, boilingPointC: 4827, electronConfiguration: "[He] 2s2 2p2", category: "nonmetal" },
  { atomicNumber: 7, symbol: "N", name: "Nitrogen", persianName: "نیتروژن", groupId: 15, periodId: 2, atomicMass: 14.007, meltingPointC: -210.0, boilingPointC: -195.79, electronConfiguration: "[He] 2s2 2p3", category: "nonmetal" },
  { atomicNumber: 8, symbol: "O", name: "Oxygen", persianName: "اکسیژن", groupId: 16, periodId: 2, atomicMass: 15.999, meltingPointC: -218.79, boilingPointC: -182.96, electronConfiguration: "[He] 2s2 2p4", category: "nonmetal" },
  { atomicNumber: 9, symbol: "F", name: "Fluorine", persianName: "فلوئور", groupId: 17, periodId: 2, atomicMass: 18.998, meltingPointC: -219.67, boilingPointC: -188.11, electronConfiguration: "[He] 2s2 2p5", category: "halogen" },
  { atomicNumber: 10, symbol: "Ne", name: "Neon", persianName: "نئون", groupId: 18, periodId: 2, atomicMass: 20.180, meltingPointC: -248.59, boilingPointC: -246.08, electronConfiguration: "[He] 2s2 2p6", category: "noble-gas" },

  // دوره ۳
  { atomicNumber: 11, symbol: "Na", name: "Sodium", persianName: "سدیم", groupId: 1, periodId: 3, atomicMass: 22.990, meltingPointC: 97.79, boilingPointC: 883, electronConfiguration: "[Ne] 3s1", category: "alkali-metal" },
  { atomicNumber: 12, symbol: "Mg", name: "Magnesium", persianName: "منیزیم", groupId: 2, periodId: 3, atomicMass: 24.305, meltingPointC: 650, boilingPointC: 1090, electronConfiguration: "[Ne] 3s2", category: "alkaline-earth" },
  { atomicNumber: 13, symbol: "Al", name: "Aluminum", persianName: "آلومینیوم", groupId: 13, periodId: 3, atomicMass: 26.982, meltingPointC: 660.32, boilingPointC: 2519, electronConfiguration: "[Ne] 3s2 3p1", category: "post-transition-metal" },
  { atomicNumber: 14, symbol: "Si", name: "Silicon", persianName: "سیلیسیم", groupId: 14, periodId: 3, atomicMass: 28.085, meltingPointC: 1414, boilingPointC: 3265, electronConfiguration: "[Ne] 3s2 3p2", category: "metalloid" },
  { atomicNumber: 15, symbol: "P", name: "Phosphorus", persianName: "فسفر", groupId: 15, periodId: 3, atomicMass: 30.974, meltingPointC: 44.15, boilingPointC: 280.5, electronConfiguration: "[Ne] 3s2 3p3", category: "nonmetal" },
  { atomicNumber: 16, symbol: "S", name: "Sulfur", persianName: "گوگرد", groupId: 16, periodId: 3, atomicMass: 32.06, meltingPointC: 115.21, boilingPointC: 444.6, electronConfiguration: "[Ne] 3s2 3p4", category: "nonmetal" },
  { atomicNumber: 17, symbol: "Cl", name: "Chlorine", persianName: "کلر", groupId: 17, periodId: 3, atomicMass: 35.45, meltingPointC: -101.5, boilingPointC: -34.04, electronConfiguration: "[Ne] 3s2 3p5", category: "halogen" },
  { atomicNumber: 18, symbol: "Ar", name: "Argon", persianName: "آرگون", groupId: 18, periodId: 3, atomicMass: 39.948, meltingPointC: -189.34, boilingPointC: -185.85, electronConfiguration: "[Ne] 3s2 3p6", category: "noble-gas" },

  // دوره ۴
  { atomicNumber: 19, symbol: "K", name: "Potassium", persianName: "پتاسیم", groupId: 1, periodId: 4, atomicMass: 39.098, meltingPointC: 63.5, boilingPointC: 759, electronConfiguration: "[Ar] 4s1", category: "alkali-metal" },
  { atomicNumber: 20, symbol: "Ca", name: "Calcium", persianName: "کلسیم", groupId: 2, periodId: 4, atomicMass: 40.078, meltingPointC: 842, boilingPointC: 1484, electronConfiguration: "[Ar] 4s2", category: "alkaline-earth" },
  { atomicNumber: 21, symbol: "Sc", name: "Scandium", persianName: "اسکاندیم", groupId: 3, periodId: 4, atomicMass: 44.956, meltingPointC: 1541, boilingPointC: 2836, electronConfiguration: "[Ar] 3d1 4s2", category: "transition-metal" },
  { atomicNumber: 22, symbol: "Ti", name: "Titanium", persianName: "تیتانیم", groupId: 4, periodId: 4, atomicMass: 47.867, meltingPointC: 1668, boilingPointC: 3287, electronConfiguration: "[Ar] 3d2 4s2", category: "transition-metal" },
  { atomicNumber: 23, symbol: "V", name: "Vanadium", persianName: "وانادیم", groupId: 5, periodId: 4, atomicMass: 50.942, meltingPointC: 1910, boilingPointC: 3407, electronConfiguration: "[Ar] 3d3 4s2", category: "transition-metal" },
  { atomicNumber: 24, symbol: "Cr", name: "Chromium", persianName: "کروم", groupId: 6, periodId: 4, atomicMass: 51.996, meltingPointC: 1907, boilingPointC: 2671, electronConfiguration: "[Ar] 3d5 4s1", category: "transition-metal" },
  { atomicNumber: 25, symbol: "Mn", name: "Manganese", persianName: "منگنز", groupId: 7, periodId: 4, atomicMass: 54.938, meltingPointC: 1246, boilingPointC: 2061, electronConfiguration: "[Ar] 3d5 4s2", category: "transition-metal" },
  { atomicNumber: 26, symbol: "Fe", name: "Iron", persianName: "آهن", groupId: 8, periodId: 4, atomicMass: 55.845, meltingPointC: 1538, boilingPointC: 2862, electronConfiguration: "[Ar] 3d6 4s2", category: "transition-metal" },
  { atomicNumber: 27, symbol: "Co", name: "Cobalt", persianName: "کبالت", groupId: 9, periodId: 4, atomicMass: 58.933, meltingPointC: 1495, boilingPointC: 2900, electronConfiguration: "[Ar] 3d7 4s2", category: "transition-metal" },
  { atomicNumber: 28, symbol: "Ni", name: "Nickel", persianName: "نیکل", groupId: 10, periodId: 4, atomicMass: 58.693, meltingPointC: 1455, boilingPointC: 2913, electronConfiguration: "[Ar] 3d8 4s2", category: "transition-metal" },
  { atomicNumber: 29, symbol: "Cu", name: "Copper", persianName: "مس", groupId: 11, periodId: 4, atomicMass: 63.546, meltingPointC: 1085, boilingPointC: 2562, electronConfiguration: "[Ar] 3d10 4s1", category: "transition-metal" },
  { atomicNumber: 30, symbol: "Zn", name: "Zinc", persianName: "روی", groupId: 12, periodId: 4, atomicMass: 65.38, meltingPointC: 419.53, boilingPointC: 907, electronConfiguration: "[Ar] 3d10 4s2", category: "transition-metal" },
  { atomicNumber: 31, symbol: "Ga", name: "Gallium", persianName: "گالیوم", groupId: 13, periodId: 4, atomicMass: 69.723, meltingPointC: 29.76, boilingPointC: 2204, electronConfiguration: "[Ar] 3d10 4s2 4p1", category: "post-transition-metal" },
  { atomicNumber: 32, symbol: "Ge", name: "Germanium", persianName: "ژرمانیوم", groupId: 14, periodId: 4, atomicMass: 72.630, meltingPointC: 938.25, boilingPointC: 2833, electronConfiguration: "[Ar] 3d10 4s2 4p2", category: "metalloid" },
  { atomicNumber: 33, symbol: "As", name: "Arsenic", persianName: "آرسنیک", groupId: 15, periodId: 4, atomicMass: 74.922, meltingPointC: 817, boilingPointC: 614, electronConfiguration: "[Ar] 3d10 4s2 4p3", category: "metalloid" },
  { atomicNumber: 34, symbol: "Se", name: "Selenium", persianName: "سلنیوم", groupId: 16, periodId: 4, atomicMass: 78.971, meltingPointC: 221, boilingPointC: 685, electronConfiguration: "[Ar] 3d10 4s2 4p4", category: "nonmetal" },
  { atomicNumber: 35, symbol: "Br", name: "Bromine", persianName: "برم", groupId: 17, periodId: 4, atomicMass: 79.904, meltingPointC: -7.2, boilingPointC: 58.8, electronConfiguration: "[Ar] 3d10 4s2 4p5", category: "halogen" },
  { atomicNumber: 36, symbol: "Kr", name: "Krypton", persianName: "کریپتون", groupId: 18, periodId: 4, atomicMass: 83.798, meltingPointC: -157.36, boilingPointC: -153.22, electronConfiguration: "[Ar] 3d10 4s2 4p6", category: "noble-gas" },

  // دوره ۵
  { atomicNumber: 37, symbol: "Rb", name: "Rubidium", persianName: "روبیدیم", groupId: 1, periodId: 5, atomicMass: 85.468, meltingPointC: 39.3, boilingPointC: 688, electronConfiguration: "[Kr] 5s1", category: "alkali-metal" },
  { atomicNumber: 38, symbol: "Sr", name: "Strontium", persianName: "استرانسیم", groupId: 2, periodId: 5, atomicMass: 87.62, meltingPointC: 777, boilingPointC: 1382, electronConfiguration: "[Kr] 5s2", category: "alkaline-earth" },
  { atomicNumber: 39, symbol: "Y", name: "Yttrium", persianName: "ایتریم", groupId: 3, periodId: 5, atomicMass: 88.906, meltingPointC: 1526, boilingPointC: 3336, electronConfiguration: "[Kr] 4d1 5s2", category: "transition-metal" },
  { atomicNumber: 40, symbol: "Zr", name: "Zirconium", persianName: "زیرکونیم", groupId: 4, periodId: 5, atomicMass: 91.224, meltingPointC: 1855, boilingPointC: 4409, electronConfiguration: "[Kr] 4d2 5s2", category: "transition-metal" },
  { atomicNumber: 41, symbol: "Nb", name: "Niobium", persianName: "نیوبیم", groupId: 5, periodId: 5, atomicMass: 92.906, meltingPointC: 2477, boilingPointC: 4744, electronConfiguration: "[Kr] 4d4 5s1", category: "transition-metal" },
  { atomicNumber: 42, symbol: "Mo", name: "Molybdenum", persianName: "مولیبدن", groupId: 6, periodId: 5, atomicMass: 95.95, meltingPointC: 2623, boilingPointC: 4639, electronConfiguration: "[Kr] 4d5 5s1", category: "transition-metal" },
  { atomicNumber: 43, symbol: "Tc", name: "Technetium", persianName: "تکنسیم", groupId: 7, periodId: 5, atomicMass: 98, meltingPointC: 2157, boilingPointC: 4265, electronConfiguration: "[Kr] 4d5 5s2", category: "transition-metal" },
  { atomicNumber: 44, symbol: "Ru", name: "Ruthenium", persianName: "روتنیوم", groupId: 8, periodId: 5, atomicMass: 101.07, meltingPointC: 2334, boilingPointC: 4150, electronConfiguration: "[Kr] 4d7 5s1", category: "transition-metal" },
  { atomicNumber: 45, symbol: "Rh", name: "Rhodium", persianName: "رودیم", groupId: 9, periodId: 5, atomicMass: 102.91, meltingPointC: 1964, boilingPointC: 3695, electronConfiguration: "[Kr] 4d8 5s1", category: "transition-metal" },
  { atomicNumber: 46, symbol: "Pd", name: "Palladium", persianName: "پالادیم", groupId: 10, periodId: 5, atomicMass: 106.42, meltingPointC: 1554.9, boilingPointC: 2963, electronConfiguration: "[Kr] 4d10", category: "transition-metal" },
  { atomicNumber: 47, symbol: "Ag", name: "Silver", persianName: "نقره", groupId: 11, periodId: 5, atomicMass: 107.87, meltingPointC: 961.78, boilingPointC: 2162, electronConfiguration: "[Kr] 4d10 5s1", category: "transition-metal" },
  { atomicNumber: 48, symbol: "Cd", name: "Cadmium", persianName: "کادمیم", groupId: 12, periodId: 5, atomicMass: 112.41, meltingPointC: 321.07, boilingPointC: 767, electronConfiguration: "[Kr] 4d10 5s2", category: "transition-metal" },
  { atomicNumber: 49, symbol: "In", name: "Indium", persianName: "ایندیوم", groupId: 13, periodId: 5, atomicMass: 114.82, meltingPointC: 156.6, boilingPointC: 2072, electronConfiguration: "[Kr] 4d10 5s2 5p1", category: "post-transition-metal" },
  { atomicNumber: 50, symbol: "Sn", name: "Tin", persianName: "قلع", groupId: 14, periodId: 5, atomicMass: 118.71, meltingPointC: 231.93, boilingPointC: 2602, electronConfiguration: "[Kr] 4d10 5s2 5p2", category: "post-transition-metal" },
  { atomicNumber: 51, symbol: "Sb", name: "Antimony", persianName: "آنتیموان", groupId: 15, periodId: 5, atomicMass: 121.76, meltingPointC: 630.63, boilingPointC: 1587, electronConfiguration: "[Kr] 4d10 5s2 5p3", category: "metalloid" },
  { atomicNumber: 52, symbol: "Te", name: "Tellurium", persianName: "تلوریوم", groupId: 16, periodId: 5, atomicMass: 127.6, meltingPointC: 449.51, boilingPointC: 988, electronConfiguration: "[Kr] 4d10 5s2 5p4", category: "metalloid" },
  { atomicNumber: 53, symbol: "I", name: "Iodine", persianName: "ید", groupId: 17, periodId: 5, atomicMass: 126.9, meltingPointC: 113.7, boilingPointC: 184.3, electronConfiguration: "[Kr] 4d10 5s2 5p5", category: "halogen" },
  { atomicNumber: 54, symbol: "Xe", name: "Xenon", persianName: "زنون", groupId: 18, periodId: 5, atomicMass: 131.29, meltingPointC: -111.7, boilingPointC: -108, electronConfiguration: "[Kr] 4d10 5s2 5p6", category: "noble-gas" },

  // دوره ۶
  { atomicNumber: 55, symbol: "Cs", name: "Cesium", persianName: "سزیم", groupId: 1, periodId: 6, atomicMass: 132.91, meltingPointC: 28.44, boilingPointC: 671, electronConfiguration: "[Xe] 6s1", category: "alkali-metal" },
  { atomicNumber: 56, symbol: "Ba", name: "Barium", persianName: "باریم", groupId: 2, periodId: 6, atomicMass: 137.33, meltingPointC: 727, boilingPointC: 1897, electronConfiguration: "[Xe] 6s2", category: "alkaline-earth" },
  
  // لانتانیدها (قرار گرفته در ردیف ۹ برای جلوگیری از گسیختگی شبکه گرید)
  { atomicNumber: 57, symbol: "La", name: "Lanthanum", persianName: "لانتان", groupId: 4, periodId: 9, atomicMass: 138.91, meltingPointC: 920, boilingPointC: 3464, electronConfiguration: "[Xe] 5d1 6s2", category: "lanthanide" },
  { atomicNumber: 58, symbol: "Ce", name: "Cerium", persianName: "سریم", groupId: 5, periodId: 9, atomicMass: 140.12, meltingPointC: 798, boilingPointC: 3443, electronConfiguration: "[Xe] 4f1 5d1 6s2", category: "lanthanide" },
  { atomicNumber: 59, symbol: "Pr", name: "Praseodymium", persianName: "پرازئودیمیم", groupId: 6, periodId: 9, atomicMass: 140.91, meltingPointC: 931, boilingPointC: 3520, electronConfiguration: "[Xe] 4f3 6s2", category: "lanthanide" },
  { atomicNumber: 60, symbol: "Nd", name: "Neodymium", persianName: "نئودیمیم", groupId: 7, periodId: 9, atomicMass: 144.24, meltingPointC: 1021, boilingPointC: 3074, electronConfiguration: "[Xe] 4f4 6s2", category: "lanthanide" },
  { atomicNumber: 61, symbol: "Pm", name: "Promethium", persianName: "پرومتیم", groupId: 8, periodId: 9, atomicMass: 145, meltingPointC: 1042, boilingPointC: 3000, electronConfiguration: "[Xe] 4f5 6s2", category: "lanthanide" },
  { atomicNumber: 62, symbol: "Sm", name: "Samarium", persianName: "ساماریم", groupId: 9, periodId: 9, atomicMass: 150.36, meltingPointC: 1072, boilingPointC: 1794, electronConfiguration: "[Xe] 4f6 6s2", category: "lanthanide" },
  { atomicNumber: 63, symbol: "Eu", name: "Europium", persianName: "یوروپیم", groupId: 10, periodId: 9, atomicMass: 151.96, meltingPointC: 822, boilingPointC: 1529, electronConfiguration: "[Xe] 4f7 6s2", category: "lanthanide" },
  { atomicNumber: 64, symbol: "Gd", name: "Gadolinium", persianName: "گادولینیوم", groupId: 11, periodId: 9, atomicMass: 157.25, meltingPointC: 1313, boilingPointC: 3273, electronConfiguration: "[Xe] 4f7 5d1 6s2", category: "lanthanide" },
  { atomicNumber: 65, symbol: "Tb", name: "Terbium", persianName: "تربیم", groupId: 12, periodId: 9, atomicMass: 158.93, meltingPointC: 1356, boilingPointC: 3230, electronConfiguration: "[Xe] 4f9 6s2", category: "lanthanide" },
  { atomicNumber: 66, symbol: "Dy", name: "Dysprosium", persianName: "دیسپروزیم", groupId: 13, periodId: 9, atomicMass: 162.5, meltingPointC: 1412, boilingPointC: 2567, electronConfiguration: "[Xe] 4f10 6s2", category: "lanthanide" },
  { atomicNumber: 67, symbol: "Ho", name: "Holmium", persianName: "هولمیم", groupId: 14, periodId: 9, atomicMass: 164.93, meltingPointC: 1474, boilingPointC: 2700, electronConfiguration: "[Xe] 4f11 6s2", category: "lanthanide" },
  { atomicNumber: 68, symbol: "Er", name: "Erbium", persianName: "اربیوم", groupId: 15, periodId: 9, atomicMass: 167.26, meltingPointC: 1529, boilingPointC: 2868, electronConfiguration: "[Xe] 4f12 6s2", category: "lanthanide" },
  { atomicNumber: 70, symbol: "Yb", name: "Ytterbium", persianName: "ایتربیم", groupId: 16, periodId: 9, atomicMass: 173.05, meltingPointC: 819, boilingPointC: 1196, electronConfiguration: "[Xe] 4f14 6s2", category: "lanthanide" },
  { atomicNumber: 71, symbol: "Lu", name: "Lutetium", persianName: "لوتسیم", groupId: 17, periodId: 9, atomicMass: 174.97, meltingPointC: 1663, boilingPointC: 3402, electronConfiguration: "[Xe] 4f14 5d1 6s2", category: "lanthanide" },

  // فلزات واسطه دوره ۶
  { atomicNumber: 72, symbol: "Hf", name: "Hafnium", persianName: "هافنیم", groupId: 4, periodId: 6, atomicMass: 178.49, meltingPointC: 2233, boilingPointC: 4603, electronConfiguration: "[Xe] 4f14 5d2 6s2", category: "transition-metal" },
  { atomicNumber: 73, symbol: "Ta", name: "Tantalum", persianName: "تانتال", groupId: 5, periodId: 6, atomicMass: 180.95, meltingPointC: 3017, boilingPointC: 5458, electronConfiguration: "[Xe] 4f14 5d3 6s2", category: "transition-metal" },
  { atomicNumber: 74, symbol: "W", name: "Tungsten", persianName: "تنگستن", groupId: 6, periodId: 6, atomicMass: 183.84, meltingPointC: 3422, boilingPointC: 5555, electronConfiguration: "[Xe] 4f14 5d4 6s2", category: "transition-metal" },
  { atomicNumber: 75, symbol: "Re", name: "Rhenium", persianName: "رنیم", groupId: 7, periodId: 6, atomicMass: 186.21, meltingPointC: 3186, boilingPointC: 5596, electronConfiguration: "[Xe] 4f14 5d5 6s2", category: "transition-metal" },
  { atomicNumber: 76, symbol: "Os", name: "Osmium", persianName: "اسمیم", groupId: 8, periodId: 6, atomicMass: 190.23, meltingPointC: 3033, boilingPointC: 5012, electronConfiguration: "[Xe] 4f14 5d6 6s2", category: "transition-metal" },
  { atomicNumber: 77, symbol: "Ir", name: "Iridium", persianName: "ایریدیم", groupId: 9, periodId: 6, atomicMass: 192.22, meltingPointC: 2446, boilingPointC: 4428, electronConfiguration: "[Xe] 4f14 5d7 6s2", category: "transition-metal" },
  { atomicNumber: 78, symbol: "Pt", name: "Platinum", persianName: "پلاتین", groupId: 10, periodId: 6, atomicMass: 195.08, meltingPointC: 1768.3, boilingPointC: 3825, electronConfiguration: "[Xe] 4f14 5d9 6s1", category: "transition-metal" },
  { atomicNumber: 79, symbol: "Au", name: "Gold", persianName: "طلا", groupId: 11, periodId: 6, atomicMass: 196.97, meltingPointC: 1064.18, boilingPointC: 2856, electronConfiguration: "[Xe] 4f14 5d10 6s1", category: "transition-metal" },
  { atomicNumber: 80, symbol: "Hg", name: "Mercury", persianName: "جیوه", groupId: 12, periodId: 6, atomicMass: 200.59, meltingPointC: -38.83, boilingPointC: 356.73, electronConfiguration: "[Xe] 4f14 5d10 6s2", category: "transition-metal" },
  { atomicNumber: 81, symbol: "Tl", name: "Thallium", persianName: "تالیوم", groupId: 13, periodId: 6, atomicMass: 204.38, meltingPointC: 304, boilingPointC: 1473, electronConfiguration: "[Xe] 4f14 5d10 6s2 6p1", category: "post-transition-metal" },
  { atomicNumber: 82, symbol: "Pb", name: "Lead", persianName: "سرب", groupId: 14, periodId: 6, atomicMass: 207.2, meltingPointC: 327.46, boilingPointC: 1749, electronConfiguration: "[Xe] 4f14 5d10 6s2 6p2", category: "post-transition-metal" },
  { atomicNumber: 83, symbol: "Bi", name: "Bismuth", persianName: "بیسموت", groupId: 15, periodId: 6, atomicMass: 208.98, meltingPointC: 271.3, boilingPointC: 1564, electronConfiguration: "[Xe] 6s2 6p3", category: "post-transition-metal" },
  { atomicNumber: 84, symbol: "Po", name: "Polonium", persianName: "پولونیم", groupId: 16, periodId: 6, atomicMass: 209, meltingPointC: 254, boilingPointC: 962, electronConfiguration: "[Xe] 6s2 6p4", category: "metalloid" },
  { atomicNumber: 85, symbol: "At", name: "Astatine", persianName: "استاتین", groupId: 17, periodId: 6, atomicMass: 210, meltingPointC: 302, boilingPointC: 337, electronConfiguration: "[Xe] 6s2 6p5", category: "halogen" },
  { atomicNumber: 86, symbol: "Rn", name: "Radon", persianName: "رادون", groupId: 18, periodId: 6, atomicMass: 222, meltingPointC: -71, boilingPointC: -61.7, electronConfiguration: "[Xe] 6s2 6p6", category: "noble-gas" },

  // دوره ۷
  { atomicNumber: 87, symbol: "Fr", name: "Francium", persianName: "فرانسیم", groupId: 1, periodId: 7, atomicMass: 223, meltingPointC: 27, boilingPointC: 677, electronConfiguration: "[Rn] 7s1", category: "alkali-metal" },
  { atomicNumber: 88, symbol: "Ra", name: "Radium", persianName: "رادیم", groupId: 2, periodId: 7, atomicMass: 226, meltingPointC: 700, boilingPointC: 1737, electronConfiguration: "[Rn] 7s2", category: "alkaline-earth" },

  // اکتینیدها (قرار گرفته در ردیف ۱۰)
  { atomicNumber: 89, symbol: "Ac", name: "Actinium", persianName: "اکتینیوم", groupId: 4, periodId: 10, atomicMass: 227, meltingPointC: 1050, boilingPointC: 3197, electronConfiguration: "[Rn] 6d1 7s2", category: "actinide" },
  { atomicNumber: 90, symbol: "Th", name: "Thorium", persianName: "توریم", groupId: 5, periodId: 10, atomicMass: 232.04, meltingPointC: 1750, boilingPointC: 4788, electronConfiguration: "[Rn] 6d2 7s2", category: "actinide" },
  { atomicNumber: 91, symbol: "Pa", name: "Protactinium", persianName: "پروتاکتینیوم", groupId: 6, periodId: 10, atomicMass: 231.04, meltingPointC: 1568, boilingPointC: 4027, electronConfiguration: "[Rn] 5f2 6d1 7s2", category: "actinide" },
  { atomicNumber: 92, symbol: "U", name: "Uranium", persianName: "اورانیوم", groupId: 7, periodId: 10, atomicMass: 238.03, meltingPointC: 1132.2, boilingPointC: 4131, electronConfiguration: "[Rn] 5f3 6d1 7s2", category: "actinide" },
  { atomicNumber: 93, symbol: "Np", name: "Neptunium", persianName: "نپتونیوم", groupId: 8, periodId: 10, atomicMass: 237, meltingPointC: 639, boilingPointC: 3902, electronConfiguration: "[Rn] 5f4 6d1 7s2", category: "actinide" },
  { atomicNumber: 94, symbol: "Pu", name: "Plutonium", persianName: "پلوتونیوم", groupId: 9, periodId: 10, atomicMass: 244, meltingPointC: 639.4, boilingPointC: 3228, electronConfiguration: "[Rn] 5f6 7s2", category: "actinide" },
  { atomicNumber: 95, symbol: "Am", name: "Americium", persianName: "امریسیم", groupId: 10, periodId: 10, atomicMass: 243, meltingPointC: 1176, boilingPointC: 2011, electronConfiguration: "[Rn] 5f7 7s2", category: "actinide" },
  { atomicNumber: 96, symbol: "Cm", name: "Curium", persianName: "کوریوم", groupId: 11, periodId: 10, atomicMass: 247, meltingPointC: 1345, boilingPointC: 3110, electronConfiguration: "[Rn] 5f7 6d1 7s2", category: "actinide" },
  { atomicNumber: 97, symbol: "Bk", name: "Berkelium", persianName: "برکلیم", groupId: 12, periodId: 10, atomicMass: 247, meltingPointC: 986, boilingPointC: 2627, electronConfiguration: "[Rn] 5f9 7s2", category: "actinide" },
  { atomicNumber: 98, symbol: "Cf", name: "Californium", persianName: "کالیفرنیم", groupId: 13, periodId: 10, atomicMass: 251, meltingPointC: 900, boilingPointC: 1470, electronConfiguration: "[Rn] 5f10 7s2", category: "actinide" },
  { atomicNumber: 99, symbol: "Es", name: "Einsteinium", persianName: "اینشتینیم", groupId: 14, periodId: 10, atomicMass: 252, meltingPointC: 860, boilingPointC: 996, electronConfiguration: "[Rn] 5f11 7s2", category: "actinide" },
  { atomicNumber: 100, symbol: "Fm", name: "Fermium", persianName: "فرمیم", groupId: 15, periodId: 10, atomicMass: 257, meltingPointC: 1527, electronConfiguration: "[Rn] 5f12 7s2", category: "actinide" },
  { atomicNumber: 101, symbol: "Md", name: "Mendelevium", persianName: "مندلیفیم", groupId: 16, periodId: 10, atomicMass: 258, meltingPointC: 827, electronConfiguration: "[Rn] 5f13 7s2", category: "actinide" },
  { atomicNumber: 102, symbol: "No", name: "Nobelium", persianName: "نوبلیم", groupId: 17, periodId: 10, atomicMass: 259, meltingPointC: 827, electronConfiguration: "[Rn] 5f14 7s2", category: "actinide" },

  // فلزات واسطه سنگین دوره ۷
  { atomicNumber: 104, symbol: "Rf", name: "Rutherfordium", persianName: "رادرفوردیم", groupId: 4, periodId: 7, atomicMass: 267, meltingPointC: 2100, electronConfiguration: "[Rn] 5f14 6d2 7s2", category: "transition-metal" },
  { atomicNumber: 105, symbol: "Db", name: "Dubnium", persianName: "دوبنیم", groupId: 5, periodId: 7, atomicMass: 268, meltingPointC: 2000, electronConfiguration: "[Rn] 5f14 6d3 7s2", category: "transition-metal" },
  { atomicNumber: 106, symbol: "Sg", name: "Seaborgium", persianName: "سیبورگیوم", groupId: 6, periodId: 7, atomicMass: 269, meltingPointC: 1800, electronConfiguration: "[Rn] 5f14 6d4 7s2", category: "transition-metal" },
  { atomicNumber: 107, symbol: "Bh", name: "Bohrium", persianName: "بوهریم", groupId: 7, periodId: 7, atomicMass: 270, electronConfiguration: "[Rn] 5f14 6d5 7s2", category: "transition-metal" },
  { atomicNumber: 108, symbol: "Hs", name: "Hassium", persianName: "هاسیم", groupId: 8, periodId: 7, atomicMass: 269, electronConfiguration: "[Rn] 5f14 6d6 7s2", category: "transition-metal" },
  { atomicNumber: 109, symbol: "Mt", name: "Meitnerium", persianName: "میتنریم", groupId: 9, periodId: 7, atomicMass: 278, electronConfiguration: "[Rn] 5f14 6d7 7s2", category: "transition-metal" },
  { atomicNumber: 110, symbol: "Ds", name: "Darmstadtium", persianName: "دارمشتاتیوم", groupId: 10, periodId: 7, atomicMass: 281, electronConfiguration: "[Rn] 5f14 6d8 7s2", category: "transition-metal" },
  { atomicNumber: 111, symbol: "Rg", name: "Roentgenium", persianName: "رونتگنیم", groupId: 11, periodId: 7, atomicMass: 282, electronConfiguration: "[Rn] 5f14 6d9 7s2", category: "transition-metal" },
  { atomicNumber: 112, symbol: "Cn", name: "Copernicium", persianName: "کوپرنیکیم", groupId: 12, periodId: 7, atomicMass: 285, meltingPointC: 10, boilingPointC: 67, electronConfiguration: "[Rn] 5f14 6d10 7s2", category: "transition-metal" },
  { atomicNumber: 113, symbol: "Nh", name: "Nihonium", persianName: "نیهونیم", groupId: 13, periodId: 7, atomicMass: 286, meltingPointC: 430, boilingPointC: 1100, electronConfiguration: "[Rn] 5f14 6d10 7s2 7p1", category: "post-transition-metal" },
  { atomicNumber: 114, symbol: "Fl", name: "Flerovium", persianName: "فلروویم", groupId: 14, periodId: 7, atomicMass: 289, meltingPointC: -73, boilingPointC: 150, electronConfiguration: "[Rn] 5f14 6d10 7s2 7p2", category: "post-transition-metal" },
  { atomicNumber: 115, symbol: "Mc", name: "Moscovium", persianName: "ماسکویم", groupId: 15, periodId: 7, atomicMass: 290, meltingPointC: 400, boilingPointC: 1100, electronConfiguration: "[Rn] 5f14 6d10 7s2 7p3", category: "post-transition-metal" },
  { atomicNumber: 116, symbol: "Lv", name: "Livermorium", persianName: "لیورموریوم", groupId: 16, periodId: 7, atomicMass: 293, meltingPointC: 437, boilingPointC: 812, electronConfiguration: "[Rn] 5f14 6d10 7s2 7p4", category: "post-transition-metal" },
  { atomicNumber: 117, symbol: "Ts", name: "Tennessine", persianName: "تنسین", groupId: 17, periodId: 7, atomicMass: 294, meltingPointC: 400, boilingPointC: 550, electronConfiguration: "[Rn] 5f14 6d10 7s2 7p5", category: "halogen" },
  { atomicNumber: 118, symbol: "Og", name: "Oganesson", persianName: "اوگانسون", groupId: 18, periodId: 7, atomicMass: 294, meltingPointC: 80, boilingPointC: 80, electronConfiguration: "[Rn] 5f14 6d10 7s2 7p6", category: "noble-gas" }
];
