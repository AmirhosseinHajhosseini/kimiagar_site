import PeriodicTable from "@/components/periodic-table/PeriodicTable";

export const metadata = {
  title: "راز زکریا | آزمایشگاه شیمی",
  description: "جدول تناوبی و تحلیل خواص عناصر",
};

export default function PeriodicTablePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-900">
      <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
        <PeriodicTable />
      </section>
    </div>
  );
}
