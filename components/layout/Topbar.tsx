"use client";

import { useEffect, useState } from "react";
import styles from "../../styles/topbar.module.css";

export default function Topbar() {
  const [isLightMode, setIsLightMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      <div className={`container ${styles.headerContainer}`}>
        <a href="#home" className={styles.logo}>
          <span className={styles.logoOrb} />
          <span className={styles.logoText}>راز زکریا</span>
        </a>

        <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ""}`}>
          <a href="#home" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
            خانه
          </a>
          <a href="#kimiyagar" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
            کیمیاگر
          </a>
          <a href="#articles" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
            مقالات
          </a>
          <a href="#about" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
            درباره ما
          </a>
        </nav>

        <div className={styles.actions}>
          <button
            onClick={toggleTheme}
            className={styles.themeToggle}
            aria-label="تغییر حالت نمایش"
            type="button"
          >
            {isLightMode ? (
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </button>

          <button
            className={`${styles.burger} ${isMenuOpen ? styles.burgerActive : ""}`}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="باز و بسته کردن منو"
            type="button"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
