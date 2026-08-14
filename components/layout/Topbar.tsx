"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../../styles/topbar.module.css";

export default function Topbar() {
  const [isLightMode, setIsLightMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setIsLightMode(true);
      document.body.classList.add("light-mode");
    }
  }, []);

  const toggleTheme = () => {
    if (isLightMode) {
      document.body.classList.remove("light-mode");
      localStorage.setItem("theme", "dark");
      setIsLightMode(false);
    } else {
      document.body.classList.add("light-mode");
      localStorage.setItem("theme", "light");
      setIsLightMode(true);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer + " container"}>
        <Link href="/" className={styles.logo} onClick={() => setIsMenuOpen(false)}>
          <span className={styles.logoOrb} />
          <span className={styles.logoText}>راز زکریا</span>
        </Link>

        <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ""}`}>
          <Link href="/" className={`${styles.navLink} ${pathname === "/" ? styles.active : ""}`} onClick={() => setIsMenuOpen(false)}>خانه</Link>
          <Link href="/alchemist" className={`${styles.navLink} ${pathname === "/alchemist" ? styles.active : ""}`} onClick={() => setIsMenuOpen(false)}>کیمیاگر</Link>
          <Link href="/articles" className={`${styles.navLink} ${pathname === "/articles" ? styles.active : ""}`} onClick={() => setIsMenuOpen(false)}>مقالات</Link>
          <Link href="/about" className={`${styles.navLink} ${pathname === "/about" ? styles.active : ""}`} onClick={() => setIsMenuOpen(false)}>درباره ما</Link>
        </nav>

        <div className={styles.actions}>
          <button onClick={toggleTheme} className={styles.themeToggle} type="button">
            {isLightMode ? "🌙" : "☀️"}
          </button>
          <button className={`${styles.burger} ${isMenuOpen ? styles.burgerActive : ""}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  );
}
