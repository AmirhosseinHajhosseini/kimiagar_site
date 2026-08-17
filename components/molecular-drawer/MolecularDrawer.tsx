"use client";

import styles from "./molecular-drawer.module.css";

export default function MolecularDrawer() {
  return (
    <main className={styles.container} dir="rtl">
      <header className={styles.header}>
        <h1 className={styles.title}>رسم‌کننده ساختار و مکانیسم شیمیایی</h1>
        <p className={styles.subtitle}>
          ابزار ترسیم ساختارهای مولکولی دوبعدی و آماده‌سازی خروجی استاندارد برای مقاله
        </p>
      </header>

      <section className={styles.layout}>
        <aside className={styles.toolbar}>
          <h2 className={styles.panelTitle}>ابزارها</h2>

          <div className={styles.toolGroup}>
            <button className={styles.toolButton}>اتم</button>
            <button className={styles.toolButton}>پیوند یگانه</button>
            <button className={styles.toolButton}>پیوند دوگانه</button>
            <button className={styles.toolButton}>پیوند سه‌گانه</button>
            <button className={styles.toolButton}>حلقه</button>
            <button className={styles.toolButton}>فلش واکنش</button>
            <button className={styles.toolButton}>حذف</button>
          </div>
        </aside>

        <section className={styles.canvasSection}>
          <div className={styles.canvasHeader}>
            <h2 className={styles.panelTitle}>بوم رسم</h2>
            <div className={styles.canvasActions}>
              <button className={styles.actionButton}>Undo</button>
              <button className={styles.actionButton}>Redo</button>
              <button className={styles.actionButton}>Clear</button>
            </div>
          </div>

          <div className={styles.canvasArea}>
            <span className={styles.canvasPlaceholder}>
              اینجا ناحیه رسم مولکولی قرار می‌گیرد
            </span>
          </div>
        </section>

        <aside className={styles.outputPanel}>
          <h2 className={styles.panelTitle}>خروجی</h2>

          <div className={styles.outputBox}>
            <p>SMILES: هنوز تولید نشده</p>
            <p>Molfile: هنوز تولید نشده</p>
            <p>SVG: هنوز تولید نشده</p>
          </div>

          <div className={styles.outputActions}>
            <button className={styles.actionButton}>خروجی SVG</button>
            <button className={styles.actionButton}>خروجی PNG</button>
            <button className={styles.actionButton}>ذخیره پروژه</button>
          </div>
        </aside>
      </section>
    </main>
  );
}
