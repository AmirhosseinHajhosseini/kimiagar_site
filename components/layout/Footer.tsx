import styles from "../../styles/footer.module.css";

export default function Footer() {
  return (
    <footer id="about" className={styles.footer}>
      <div className={`container ${styles.footerContainer}`}>
        
        {/* ستون برندینگ و بیوگرافی کوتاه علمی */}
        <div className={styles.footerBrand}>
          <div className={styles.logo}>
            <span className={styles.logoOrb} />
            <span className={styles.logoText}>راز زکریا</span>
          </div>
          <p className={styles.brandDesc}>
            توسعه‌یافته جهت دسترسی پژوهشگران، دانشجویان و علاقه‌مندان به ابزارهای محاسباتی نوین شیمی، شبیه‌سازی‌های سه‌بعدی و مقالات ترجمه‌شده علمی با استانداردهای نشر بین‌المللی.
          </p>
        </div>

        {/* ستون دسترسی سریع */}
        <div className={styles.footerLinks}>
          <h4 className={styles.linksTitle}>ناوبری سریع</h4>
          <ul className={styles.linksList}>
            <li><a href="#home">صفحه اصلی</a></li>
            <li><a href="#kimiyagar">کیمیاگر (ابزارها)</a></li>
            <li><a href="#articles">آخرین مقالات</a></li>
          </ul>
        </div>

        {/* ستون مرجع علمی و تماس */}
        <div className={styles.footerContact}>
          <h4 className={styles.linksTitle}>ارتباط و مراجع</h4>
          <p className={styles.contactText}>
            توسعه و مدیریت محتوا: <strong>امیرحسین حاج‌حسینی</strong> <br />
            دانشجوی شیمی کاربردی و فعال در حوزه شیمی محاسباتی.
          </p>
          <a href="https://github.com/AmirhosseinHajhosseini" target="_blank" rel="noopener noreferrer" className={styles.githubLink}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            گیت‌هاب پروژه
          </a>
        </div>

      </div>

      <div className={styles.footerBottom}>
        <div className={`container ${styles.bottomContainer}`}>
          <p>© {new Date().getFullYear()} راز زکریا. تمامی حقوق علمی و محتوایی محفوظ است.</p>
          <p className={styles.authorBadge}>توسعه‌یافته با Next.js & TypeScript</p>
        </div>
      </div>
    </footer>
  );
}
