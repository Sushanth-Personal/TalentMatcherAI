import styles from './AboutPage.module.css';

function AboutPage() {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>About BreadButter</h2>
      <div className={styles.content}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Who We Are</h3>
          <p className={styles.sectionText}>
            BreadButter is a platform designed to connect creative professionals with projects that match their skills and expertise. Launched in 2025, we aim to simplify the process of finding the perfect talent for your creative needs.
          </p>
        </section>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Our Matchmaking Engine</h3>
          <p className={styles.sectionText}>
            Our advanced matchmaking engine uses AI-enhanced algorithms to recommend top creators based on your project details, including location, budget, and style preferences. This ensures you get the best fit every time.
          </p>
        </section>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Technologies Used</h3>
          <p className={styles.sectionText}>
            We leverage modern technologies such as MongoDB for data storage, Node.js for the backend, React for the frontend, and plan to integrate Pinecone for future AI enhancements.
          </p>
        </section>
      </div>
    </div>
  );
}

export default AboutPage;