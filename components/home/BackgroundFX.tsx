import styles from "@/styles/home.module.css";

const particles = Array.from({ length: 24 }, (_, index) => ({
  id: index,
  right: `${Math.random() * 100}%`,
  bottom: `${Math.random() * 100}%`,
  duration: `${10 + Math.random() * 14}s`,
  delay: `${Math.random() * 8}s`,
}));

export default function BackgroundFX() {
  return (
    <>
      <div className={styles.bgGrid} />
      <div className={styles.particles}>
        {particles.map((particle) => (
          <span
            key={particle.id}
            className={styles.particle}
            style={{
              right: particle.right,
              bottom: particle.bottom,
              animationDuration: particle.duration,
              animationDelay: particle.delay,
            }}
          />
        ))}
      </div>
      <div className={`${styles.glow} ${styles.glowOne}`} />
      <div className={`${styles.glow} ${styles.glowTwo}`} />
    </>
  );
}
