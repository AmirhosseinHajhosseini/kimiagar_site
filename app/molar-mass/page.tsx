import Topbar from "../components/layout/Topbar";
import Footer from "../components/layout/Footer";
import Features from "../components/home/Features";
import heroStyles from "../style/hero.module.css";
import homeStyles from "../style/home.module.css";

export default function Home() {
  return (
    <>
      <Topbar />
      
      {/* پس‌زمینه متحرک که در home.module.css داشتی */}
      <div className={homeStyles.bgGrid}></div>
      <div className={homeStyles.glowOne}></div>
      <div className={homeStyles.glowTwo}></div>

      <main>
        {/* بخش هدر اصلی (Hero) با اتم سه‌بعدی */}
        <section className={heroStyles.heroSection}>
          <div className={heroStyles.heroGrid}>
            <div className={heroStyles.heroContent}>
              <span className={heroStyles.badge}>
                <span className={heroStyles.badgePulse}></span>
                پلتفرم هوشمند راز زکریا
              </span>
              
              <h1 className={heroStyles.title}>
                دنیای شیمی را <br />
                <span className={heroStyles.gradientText}>سه‌بعدی و هوشمند</span> کشف کنید
              </h1>
              
              <p className={heroStyles.description}>
                مرجع تخصصی ترجمه مقالات شیمی مورتیمر، بصری‌سازی سه‌بعدی روندهای تناوبی و ابزارهای محاسباتی پیشرفته برای دانشجویان و پژوهشگران.
              </p>
              
              <div className={heroStyles.ctaGroup}>
                <a href="/alchemist" className={heroStyles.primaryBtn}>
                  ورود به آزمایشگاه محاسباتی
                </a>
                <a href="#articles" className={heroStyles.secondaryBtn}>
                  مشاهده مقالات
                </a>
              </div>

              <div className={heroStyles.stats}>
                <div className={heroStyles.statCard}>
                  <span className={heroStyles.statVal}>100%</span>
                  <span className={heroStyles.statKey}>دقت محاسباتی</span>
                </div>
                <div className={heroStyles.statCard}>
                  <span className={heroStyles.statVal}>3D</span>
                  <span className={heroStyles.statKey}>مدل‌سازی اتمی</span>
                </div>
              </div>
            </div>

            {/* بخش ویژوال اتم سه‌بعدی */}
            <div className={heroStyles.heroVisual}>
              <div className={heroStyles.scene}>
                <div className={heroStyles.atom}>
                  <div className={heroStyles.nucleus}></div>
                  <div className={`${heroStyles.orbit} ${heroStyles.orbitOne}`}>
                    <div className={heroStyles.electron}></div>
                  </div>
                  <div className={`${heroStyles.orbit} ${heroStyles.orbitTwo}`}>
                    <div className={heroStyles.electron}></div>
                  </div>
                  <div className={`${heroStyles.orbit} ${heroStyles.orbitThree}`}>
                    <div className={heroStyles.electron}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* بخش ابزارها */}
        <Features />
      </main>

      <Footer />
    </>
  );
}
