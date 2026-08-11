import styles from "../../styles/hero.module.css";

export default function Hero() {
  return (
    <section className={`section ${styles.heroSection}`}>
      <div className={`container ${styles.heroGrid}`}>
        
        {/* محتوای متنی */}
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <span className={styles.badgePulse} />
            شیمی محاسباتی و هوش مصنوعی
          </div>
          
          <h1 className={styles.title}>
            دنیای شیمی را <br />
            <span className={styles.gradientText}>سه‌بعدی و هوشمند</span> کشف کنید
          </h1>
          
          <p className={styles.description}>
            درگاه تخصصی شبیه‌سازی و ابزارهای محاسباتی (کیمیاگر)، ترجمه مقالات تخصصی و مقالات عمومی با رابط کاربری مدرن برای پژوهشگران ایرانی.
          </p>

          <div className={styles.ctaGroup}>
            <a href="#kimiyagar" className="btn btn-primary">
              شروع با کیمیاگر
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </a>
            <a href="#articles" className="btn btn-outline">
              مقالات تخصصی
            </a>
          </div>

          <div className={styles.stats}>
            <div className={styles.statCard}>
              <span className={styles.statVal}>۲۴+</span>
              <span className={styles.statKey}>مقالات ترجمه شده</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statVal}>۵+</span>
              <span className={styles.statKey}>ابزارهای آنلاین</span>
            </div>
          </div>
        </div>

        {/* ویژوال سه‌بعدی (اتم) */}
        <div className={styles.heroVisual}>
          <div className={styles.scene}>
            <div className={styles.atom}>
              <div className={styles.nucleus} />
              <div className={`${styles.orbit} ${styles.orbitOne}`}>
                <div className={styles.electron} />
              </div>
              <div className={`${styles.orbit} ${styles.orbitTwo}`}>
                <div className={styles.electron} />
              </div>
              <div className={`${styles.orbit} ${styles.orbitThree}`}>
                <div className={styles.electron} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
