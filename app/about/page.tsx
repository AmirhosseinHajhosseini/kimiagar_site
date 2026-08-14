import styles from "../../styles/about.module.css";
import SocialLinks from "../../components/SocialLinks";

export default function AboutPage() {
  return (
    <main className={styles.aboutContainer}>
      <div className={styles.heroGrid}>
        <div className={styles.glassCard}>
          <h1 style={{ color: "var(--cyan)", marginBottom: "20px" }}>تیم «راز زکریا»</h1>
          <p style={{ lineHeight: "2", color: "var(--text-secondary)" }}>
            ما گروهی از مشتاقان علم شیمی هستیم که باور داریم دانش باید در دسترس باشد. هدف ما ساده‌سازی مفاهیم پیچیده، ترجمه متون مرجع و تولید ابزارهای محاسباتی است.
          </p>
          
          <div style={{ marginTop: "30px" }}>
            <h4 style={{ color: "var(--cyan)" }}>تماس با ما</h4>
            <p style={{ color: "var(--text-primary)" }}>0920-092-1735</p>
            <a href="mailto:a.hajhosseini@znu.ac.ir" style={{ color: "var(--text-secondary)" }}>a.hajhosseini@znu.ac.ir</a>
            
            <SocialLinks /> {/* کامپوننت کلاینت اینجا فراخوانی می‌شود */}
          </div>
        </div>

        {/* گرافیک بنزن Wireframe */}
        <div className={styles.benzeneContainer}>
          <svg className={styles.benzeneSvg} viewBox="0 0 100 100">
            <polygon points="50,10 93.3,35 93.3,65 50,90 6.7,65 6.7,35" />
            <circle cx="50" cy="50" r="20" />
          </svg>
        </div>
      </div>
    </main>
  );
}
