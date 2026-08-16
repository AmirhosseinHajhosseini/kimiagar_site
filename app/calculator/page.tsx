import type { Metadata } from "next";
import Calculator from "../../components/calculator/Calculator";

export const metadata: Metadata = {
  title: "ماشین‌حساب خواص فیزیکوشیمیایی",
  description:
    "محاسبه جرم مولی، ترکیب عنصری، جرم مونوایزوتوپی و تبدیل واحد برای فرمول‌های شیمیایی",
};

export default function CalculatorPage() {
  return <Calculator />;
}
