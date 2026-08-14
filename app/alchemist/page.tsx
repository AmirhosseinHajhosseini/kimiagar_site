import Link from "next/link";
import Topbar from "../../components/layout/Topbar";
import Footer from "../../components/layout/Footer";
import Features from "../../components/home/Features";
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
                مجموعه‌ای از ابزارهای کاربردی برای محاسبات، آموزش و بررسی مفاهیم
                شیمی.
              </p>
            </div>

            <Link href="/" className={styles.backHomeBtn}>
              بازگشت به خانه
            </Link>
          </header>

          {/* اصلاح شده: onlyTools برابر true قرار گرفت و wrapper غیرضروری حذف شد */}
          <Features onlyTools={true} hideMoreTools={true} />


        </div>
      </main>

      
    </>
  );
}
