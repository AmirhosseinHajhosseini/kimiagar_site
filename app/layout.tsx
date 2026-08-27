import type { Metadata } from "next";
import "./globals.css";

import "@fontsource/vazirmatn/400.css";
import "@fontsource/vazirmatn/500.css";
import "@fontsource/vazirmatn/700.css";
import "@fontsource/vazirmatn/800.css";
import "@fontsource/vazirmatn/900.css";

import Topbar from "../components/layout/Topbar";
import Footer from "../components/layout/Footer";

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
      <body>
        <Topbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
