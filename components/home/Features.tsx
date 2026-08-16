import styles from "../../styles/features.module.css";
import Link from "next/link";

interface FeaturesProps {
  onlyTools?: boolean;
  onlyArticles?: boolean;
  hideMoreTools?: boolean;
  hideMoreArticles?: boolean;
}

export default function Features({ 
  onlyTools = false, 
  onlyArticles = false, 
  hideMoreTools = false,
  hideMoreArticles = false 
}: FeaturesProps) {
  
  const tools = [
    {
      title: "رسم‌کننده مکانیسم ساختار شیمیایی",
      desc: "ابزار ترسیم مولکولی دوبعدی با قابلیت تبدیل به فرمول‌های استاندارد وکتور برای مقالات.",
      icon: "🧪",
      badge: "ابزار آنلاین",
      link: "/sketcher" // یا هر مسیری که برای رسم‌کننده در نظر داری
    },
    {
      title: "محاسبه‌گر خواص فیزیکوشیمیایی",
      desc: "محاسبه جرم مولی دقیق، قطبیت، پیوندهای هیدروژنی و ویژگی‌های ترمودینامیکی مواد.",
      icon: "📊",
      badge: "موتور محاسباتی",
      link: "/calculator" // لینک به صفحه جدیدی که ساختیم ✅
    },
    {
      title: "مرجع روندهای تناوبی سه بعدی",
      desc: "نمودارها و مدل‌های سه‌بعدی تعاملی برای بررسی شعاع اتمی، انرژی یونش و الکترونگاتیوی.",
      icon: "📐",
      badge: "بصری‌سازی سه بعدی",
      link: "/periodic-table" 
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
    },
    {
      title: "کروماتوگرافی یونی در آنالیز آزمایشگاهی",
      excerpt: "مرور تکنیک‌های نوین جداسازی و اندازه‌گیری یون‌ها در نمونه‌های زیست‌محیطی با دقت بالا و حد تشخیص بسیار دقیق.",
      translator: "ترجمه: امیرحسین حاج‌حسینی",
      date: "خرداد ۱۴۰۵",
      tag: "شیمی تجزیه"
    }
  ];

  return (
    <>
      {!onlyArticles && (
        <section id={onlyTools ? "alchemist-tools" : "kimiyagar"} className={`section ${styles.sectionPadding}`}>
          <div className="container">
            <div className={styles.toolsGrid}>
              {tools.map((tool, idx) => (
                <div key={idx} className={styles.toolCard}>
                  <div className={styles.toolIconBg}>{tool.icon}</div>
                  <span className={styles.toolBadge}>{tool.badge}</span>
                  <h3 className={styles.toolTitle}>{tool.title}</h3>
                  <p className={styles.toolDesc}>{tool.desc}</p>
                  
                  {/* اصلاح لینک: استفاده از Link برای هدایت به جدول تناوبی */}
                  <Link href={tool.link} className={styles.toolLink}>
                    شروع ابزار
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="19" y1="12" x2="5" y2="12"></line>
                      <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                  </Link>
                </div>
              ))}

              {!hideMoreTools && (
                <Link href="/alchemist" className={`${styles.toolCard} ${styles.moreToolsCard}`}>
                  <div className={styles.moreToolsIcon}>＋</div>
                  <h3 className={styles.toolTitle}>موارد بیشتر</h3>
                  <p className={styles.toolDesc}>
                    مشاهده و دسترسی به ویترین کامل تمامی ابزارهای محاسباتی و نرم‌افزارهای علمی راز زکریا.
                  </p>
                  <div className={styles.toolLink}>
                    ورود به کیمیاگر
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="19" y1="12" x2="5" y2="12"></line>
                      <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* بخش مقالات بدون تغییر باقی ماند */}
      {!onlyTools && (
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

              {!hideMoreArticles && (
                <Link href="/articles" className={`${styles.articleCard} ${styles.moreArticlesCard}`}>
                  <div className={styles.moreArticlesIcon}>📚</div>
                  <h3 className={styles.articleTitle}>مشاهده آرشیو کامل</h3>
                  <p className={styles.articleExcerpt}>
                    دسترسی به تمامی ترجمه‌های تخصصی، مقالات مورتیمر و شبیه‌سازی‌های کوانتومی.
                  </p>
                  <div className={styles.readBtn}>ورود به بخش مقالات ←</div>
                </Link>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
