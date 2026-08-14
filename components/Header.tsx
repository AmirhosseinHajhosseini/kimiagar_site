"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "خانه", href: "/" },
  { name: "مقالات", href: "/articles" },
  { name: "درباره ما", href: "/#about" },
];

export default function Header() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="fixed top-0 left-0 z-[100] w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 text-white transition-opacity hover:opacity-85"
          aria-label="بازگشت به صفحه اصلی راز زکریا"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/50 bg-cyan-400/10">
            <span className="h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.95)]" />
          </span>

          <span className="text-lg font-black">راز زکریا</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="ناوبری اصلی">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                isActive(item.href)
                  ? "bg-cyan-400/10 text-cyan-300"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.name}
            </Link>
          ))}

          <Link
            href="/alchemist"
            className={`mr-2 rounded-lg border px-4 py-2 text-sm font-black transition-all ${
              isActive("/alchemist")
                ? "border-amber-300 bg-amber-300 text-slate-950"
                : "border-amber-300/50 bg-amber-300/10 text-amber-200 hover:bg-amber-300 hover:text-slate-950"
            }`}
          >
            کیمیاگر
          </Link>
        </nav>

        <Link
          href="/alchemist"
          className="rounded-lg border border-amber-300/50 bg-amber-300/10 px-3 py-2 text-xs font-black text-amber-200 transition-colors hover:bg-amber-300 hover:text-slate-950 md:hidden"
        >
          کیمیاگر
        </Link>
      </div>
    </header>
  );
}
