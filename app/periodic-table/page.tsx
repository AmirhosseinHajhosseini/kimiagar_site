import type { Metadata } from "next";
import PeriodicTable from "@/components/periodic-table/PeriodicTable";

export const metadata: Metadata = {
  title: "جدول تناوبی عناصر",
  description: "جدول تناوبی تعاملی عناصر شیمیایی",
};

export default function PeriodicTablePage() {
  return <PeriodicTable />;
}
