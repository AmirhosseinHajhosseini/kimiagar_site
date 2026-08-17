import { elements } from "./elements";

export const ATOMIC_DATA = Object.fromEntries(
  (elements as any[]).map((el) => {
    const block = el.groupBlock ?? el.category ?? "";
    const isMetal =
      block === "metal" ||
      block === "transition metal" ||
      block === "alkali metal" ||
      block === "alkaline earth metal";
    const isMetalloid = block === "metalloid";

    return [
      el.symbol,
      {
        atomicMass: el.atomicMass,
        electronegativity: el.electronegativity,
        // تشخیص نوع عنصر برای محاسبات پیوند
        category: isMetal ? "metal" : isMetalloid ? "metalloid" : "nonmetal",
        nameFa: el.persianName,
      },
    ];
  })
);
