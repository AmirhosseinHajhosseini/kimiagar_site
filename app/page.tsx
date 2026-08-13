import Topbar from "../components/layout/Topbar";
import Footer from "../components/layout/Footer";
import Features from "../components/home/Features";
import heroStyles from "../styles/hero.module.css";
import homeStyles from "../styles/home.module.css";

export default function Home() {
  return (
    <>
      <Topbar />

      <main className={homeStyles.page}>
        <section className={heroStyles.heroSection}>
          <div className={heroStyles.heroGrid}>
            <div className={heroStyles.heroContent}>
              <span className={heroStyles.badge}>
                <span className={heroStyles.badgePulse} />
                پلتفرم هوشمند راز زکریا
              </span>

              <h1 className={heroStyles.title}>
                شیمی را <span className={heroStyles.gradientText}>سه‌بعدی و هوشمند</span> کشف کنید
              </h1>

              <p className={heroStyles.description}>
                مرجع تخصصی ترجمه مقالات شیمی، ابزارهای محاسباتی و بصری‌سازی علمی برای دانشجویان و پژوهشگران.
              </p>

              <div className={heroStyles.ctaGroup}>
                <a href="/alchemist" className={heroStyles.primaryBtn}>
                  ورود به کیمیاگر
                </a>
                <a href="#features" className={heroStyles.secondaryBtn}>
                  مشاهده ابزارها
                </a>
              </div>
            </div>

            <div className={heroStyles.heroVisual}>
              <div className={heroStyles.scene}>
                <div className={heroStyles.atom}>
                  <div className={heroStyles.nucleus} />
                  <div className={`${heroStyles.orbit} ${heroStyles.orbitOne}`}>
                    <div className={heroStyles.electron} />
                  </div>
                  <div className={`${heroStyles.orbit} ${heroStyles.orbitTwo}`}>
                    <div className={heroStyles.electron} />
                  </div>
                  <div className={`${heroStyles.orbit} ${heroStyles.orbitThree}`}>
                    <div className={heroStyles.electron} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features">
          <Features />
        </section>
      </main>

      <Footer />
    </>
  );
}
