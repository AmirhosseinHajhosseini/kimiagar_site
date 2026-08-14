import Link from "next/link";
import Footer from "../../components/layout/Footer";
import Topbar from "../../components/layout/Topbar";
import Features from "../../components/home/Features"; // همان کامپوننت همیشگی
import styles from "./alchemist.module.css";

export default function AlchemistPage() {
  return (
    <>
      <Topbar />
      <main className={styles.wrapper}>
        <div className={styles.container}>
          <header className={styles.pageHeader}>
            <div className={styles.headerContent}>
              <h1 className={styles.title}>نرم‌افزارهای کیمیاگر</h1>
              <p className={styles.description}>
                مجموعه‌ای از ابزارهای کاربردی برای محاسبات، آموزش و بررسی مفاهیم شیمی.
              </p>
            </div>
            <Link href="/" className={styles.backHomeBtn}>
              بازگشت به خانه
            </Link>
          </header>

          {/* نکته طلایی اینجاست: ارسال prop برای حذف مقالات */}
          <Features onlyTools={true} /> 
          
        </div>
      </main>
      <Footer />
    </>
  );
}
