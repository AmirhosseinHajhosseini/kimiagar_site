import Link from "next/link";
import styles from "../../styles/articles.module.css";

const articles = [
  {
    title: "مکانیسم‌های نوین در سنتز کاتالیزورهای ناهمگن",
    excerpt: "بررسی روندهای سال ۲۰۲۶ در بهینه‌سازی کاتالیزورهای نانوساختار برای فرآیندهای صنعتی انرژی‌زا.",
    translator: "امیرحسین حاج‌حسینی",
    date: "مرداد ۱۴۰۵",
    tag: "شیمی آلی/کاتالیست"
  },
  {
    title: "شبیه‌سازی دینامیک مولکولی در شیمی فیزیک ۲",
    excerpt: "چگونه محاسبات کامپیوتری کوانتومی، پیش‌بینی رفتارهای ترمودینامیکی گازهای حقیقی را متحول کرده است.",
    translator: "امیرحسین حاج‌حسینی",
    date: "تیر ۱۴۰۵",
    tag: "شیمی فیزیک"
  },
  {
    title: "کروماتوگرافی یونی در آنالیز آزمایشگاهی",
    excerpt: "مرور تکنیک‌های نوین جداسازی و اندازه‌گیری یون‌ها در نمونه‌های زیست‌محیطی با دقت بالا و حد تشخیص فوق‌العاده دقیق.",
    translator: "امیرحسین حاج‌حسینی",
    date: "خرداد ۱۴۰۵",
    tag: "شیمی تجزیه"
  }
];

export default function ArticlesPage() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>مقالات ترجمه‌شده شیمی</h1>
            <p className={styles.description}>
              ترجمه دقیق مقالات مرجع شیمی عمومی مورتیمر و مقالات نوین شیمی فیزیک و تجزیه.
            </p>
          </div>
          <Link href="/" className={styles.backHomeBtn}>
            ← بازگشت به خانه
          </Link>
        </header>

        <div className={styles.grid}>
          {articles.map((art, idx) => (
            <article key={idx} className={styles.card}>
              <span className={styles.tag}>{art.tag}</span>
              <h3>{art.title}</h3>
              <p>{art.excerpt}</p>
              <div className={styles.meta}>
                <span className={styles.author}>✍️ {art.translator}</span>
                <span className={styles.date}>{art.date}</span>
              </div>
              <a href="#" className={styles.readBtn}>مطالعه مقاله</a>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
