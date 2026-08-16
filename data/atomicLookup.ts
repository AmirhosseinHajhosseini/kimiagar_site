import { elements } from "./elements";

export const ATOMIC_DATA = Object.fromEntries(
  elements.map((el) => [
    el.symbol,
    {
      atomicMass: el.atomicMass,
      electronegativity: el.electronegativity,
      // تشخیص نوع عنصر برای محاسبات پیوند
      category: el.groupBlock === "metal" || el.groupBlock === "transition metal" || el.groupBlock === "alkali metal" || el.groupBlock === "alkaline earth metal" 
                ? "metal" 
                : (el.groupBlock === "metalloid" ? "metalloid" : "nonmetal"),
      nameFa: el.persianName,
    },
  ])
);
