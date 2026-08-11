import styles from "../../styles/features.module.css";

export default function Features() {
  const tools = [
    {
      title: "رسم‌کننده مکانیسم ساختار شیمیایی",
      desc: "ابزار ترسیم مولکولی دوبعدی با قابلیت تبدیل به فرمول‌های استاندارد وکتور برای مقالات.",
      icon: "🧪",
      badge: "ابزار آنلاین"
    },
    {
      title: "محاسبه‌گر خواص فیزیکوشیمیایی",
      desc: "محاسبه جرم مولی دقیق، قطبیت، پیوندهای هیدروژنی و ویژگی‌های ترمودینامیکی مواد.",
      icon: "📊",
      badge: "موتور محاسباتی"
    },
    {
      title: "مرجع روندهای تناوبی سه بعدی",
      desc: "نمودارها و مدل‌های سه‌بعدی تعاملی برای بررسی شعاع اتمی، انرژی یونش و الکترونگاتیوی.",
      icon: "📐",
      badge: "بصری‌سازی سه بعدی"
    }
  ];

  const articles = [
    {
      title: "مکانیسم‌های نوین در سنتز کاتالیزورهای ناهمگن",
      excerpt: "بررسی روندهای سال ۲۰۲۶ در بهینه‌سازی کاتالیزورهای نانوساختار برای فرآیندهای صنعتی انرژی‌زا.",
      translator: "ترجمه: امیرحسین حاج‌حسینی",
      date: "مرداد ۱۴۰۵",
      tag: "شیمی آلی/کاتالیست"
    },
    {
      title: "شبیه‌سازی دینامیک مولکولی در شیمی فیزیک ۲",
      excerpt: "چگونه محاسبات کامپیوتری کوانتومی، پیش‌بینی رفتارهای ترمودینامیکی گازهای حقیقی را متحول کرده است.",
      translator: "ترجمه: امیرحسین حاج‌حسینی",
      date: "تیر ۱۴۰۵",
      tag: "شیمی فیزیک"
    }
  ];

  return (
    <>
      {/* بخش کیمیاگر (ابزارها) */}
      <section id="kimiyagar" className={`section ${styles.sectionPadding}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.subTitle}>نرم‌افزار آنلاین</span>
            <h2 className={styles.mainTitle}>کیمیاگر: ابزارهای محاسباتی شیمی</h2>
            <p className={styles.sectionDesc}>
              مجموعه‌ای از ابزارهای تحت وب برای ساده‌سازی محاسبات پیچیده شیمی فیزیک، تجزیه و ترسیم مکانیسم‌ها.
            </p>
          </div>

          <div className={styles.toolsGrid}>
            {tools.map((tool, idx) => (
              <div key={idx} className={styles.toolCard}>
                <div className={styles.toolIconBg}>{tool.icon}</div>
                <span className={styles.toolBadge}>{tool.badge}</span>
                <h3 className={styles.toolTitle}>{tool.title}</h3>
                <p className={styles.toolDesc}>{tool.desc}</p>
                <a href="#" className={styles.toolLink}>
                  شروع ابزار
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* بخش مقالات علمی ترجمه شده */}
      <section id="articles" className={`section ${styles.sectionPadding} ${styles.bgAlt}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.subTitle}>ترجمه و نشر تخصصی</span>
            <h2 className={styles.mainTitle}>آخرین مقالات و دستاوردهای شیمی</h2>
            <p className={styles.sectionDesc}>
              ترجمه دقیق مقالات مرجع شیمی عمومی مورتیمر و مقالات نوین شیمی فیزیک و تجزیه همراه با نمودارهای علمی باکیفیت.
            </p>
          </div>

          <div className={styles.articlesGrid}>
            {articles.map((art, idx) => (
              <article key={idx} className={styles.articleCard}>
                <span className={styles.articleTag}>{art.tag}</span>
                <h3 className={styles.articleTitle}>{art.title}</h3>
                <p className={styles.articleExcerpt}>{art.excerpt}</p>
                <div className={styles.articleMeta}>
                  <span className={styles.articleAuthor}>{art.translator}</span>
                  <span className={styles.articleDate}>{art.date}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
