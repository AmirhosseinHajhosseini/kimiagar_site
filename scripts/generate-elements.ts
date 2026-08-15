// scripts/generate-elements.ts
const fs = require('fs');
const path = require('path');
const data = require('periodic-table');

const persianNames: Record<number, string> = {
  1: "هیدروژن", 2: "هلیم", 3: "لیتیم", 4: "بریلیم", 5: "بور", 6: "کربن",
  7: "نیتروژن", 8: "اکسیژن", 9: "فلوئور", 10: "نئون", 11: "سدیم",
  12: "منیزیم", 13: "آلومینیوم", 14: "سیلیسیم", 15: "فسفر", 16: "گوگرد",
  17: "کلر", 18: "آرگون", 19: "پتاسیم", 20: "کلسیم", 21: "اسکاندیم",
  22: "تیتان", 23: "وانادیم", 24: "کروم", 25: "منگنز", 26: "آهن",
  27: "کبالت", 28: "نیکل", 29: "مس", 30: "روی", 31: "گالیوم",
  32: "ژرمانیوم", 33: "آرسنیک", 34: "سلنیوم", 35: "برم", 36: "کریپتون",
  37: "روبیدیم", 38: "استرانسیم", 39: "ایتریم", 40: "زرکونیوم",
  41: "نیوبیوم", 42: "مولیبدن", 43: "تکنسیم", 44: "روتنیوم",
  45: "رودیم", 46: "پالادیم", 47: "نقره", 48: "کادمیم", 49: "ایندیوم",
  50: "قلع", 51: "آنتیموان", 52: "تلوریوم", 53: "ید", 54: "زنون",
  55: "سزیم", 56: "باریم", 57: "لانتان", 58: "سریم", 59: "پرا سئودیمیم",
  60: "نئودیمیم", 61: "پرومتیم", 62: "ساماریم", 63: "یوروپیم",
  64: "گادولینیوم", 65: "تربیم", 66: "دیسپروزیم", 67: "هولمیم",
  68: "اربیوم", 69: "تولیم", 70: "ایتربیم", 71: "لوتسیم",
  72: "هافنیم", 73: "تانتال", 74: "تنگستن", 75: "رنیم", 76: "ااسمیم",
  77: "ایریدیم", 78: "پلاتین", 79: "طلا", 80: "جیوه", 81: "تالیوم",
  82: "سرب", 83: "بیسموت", 84: "پولونیم", 85: "استاتین", 86: "رادون",
  87: "فرانسیم", 88: "رادیم", 89: "اکتینیوم", 90: "توریم",
  91: "پروتاکتینیوم", 92: "اورانیم", 93: "نپتونیوم", 94: "پلوتونیوم",
  95: "امریسیم", 96: "کوریوم", 97: "برکلیم", 98: "کالیفرنیم",
  99: "اینشتینیم", 100: "فرمیم", 101: "مندلیفیم", 102: "نوبلیم",
  103: "لارنسیم", 104: "رادرفوردیم", 105: "دوبنیم", 106: "سیبورگیوم",
  107: "بوهریم", 108: "هاسیم", 109: "ایتنریم", 110: "دارمشتاتیوم",
  111: "رونتگنیم", 112: "کوپرنیکیم", 113: "نیهونیوم", 114: "فلروویم",
  115: "ماسکویم", 116: "لیورموریوم", 117: "تنسیس", 118: "اگانسون"
};

const elements = Object.values(data).map((el: any) => ({
  atomicNumber: el.number,
  symbol: el.symbol,
  name: el.name,
  persianName: persianNames[el.number] || el.name,
  groupId: el.group || el.xpos,
  periodId: el.period || el.ypos,
  blockId: el.block,
  atomicMass: parseFloat(el.atomic_mass) || 0,
  meltingPointC: el.melt ? parseFloat(el.melt) - 273.15 : undefined,
  boilingPointC: el.boil ? parseFloat(el.boil) - 273.15 : undefined,
  electronConfiguration: el.electron_configuration,
  category: (el.category || "unknown").replace(/\s+/g, "-").toLowerCase(),
}));

const fileContent = `export interface ElementData {
  atomicNumber: number;
  symbol: string;
  name: string;
  persianName: string;
  groupId: number;
  periodId: number;
  blockId: string;
  atomicMass: number;
  meltingPointC?: number;
  boilingPointC?: number;
  electronConfiguration: string;
  category: string;
}

export const elementsList: ElementData[] = ${JSON.stringify(elements, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '../data/elements.ts'), fileContent);
console.log("✅ 118 elements generated successfully!");
