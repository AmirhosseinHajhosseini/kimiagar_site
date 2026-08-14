import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

import Topbar from "../components/layout/Topbar";
import Footer from "../components/layout/Footer";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "راز زکریا | شیمی سه بعدی و هوشمند",
  description: "پایگاه علمی، آموزشی و محاسباتی راز زکریا",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      {/* استفاده از className به جای variable برای اعمال مستقیم فونت */}
      <body className={vazirmatn.className}>
        <Topbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
