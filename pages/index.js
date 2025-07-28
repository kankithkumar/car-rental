import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Navigation from '../components/Navigation';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Car Rental</title>
        <meta name="description" content="Make landing page fast and easily" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navigation />

      <main className={styles.main}>
        <div className={styles.landingContent}>
          <p className={styles.presentService}>PRESENT YOUR SERVICE</p>
          <h1 className={styles.landingTitle}>
            Make landing page
            <br />
            fast and easily.
          </h1>

          <p className={styles.landingDescription}>
            Create custom landing pages with Shades that convert
            more visitors than any website—no coding required.
          </p>

          <div className={styles.emailSection}>
            <input type="email" placeholder="Enter Your Email" className={styles.emailInput} />
            <button className={styles.submitButton}>Submit</button>
          </div>

          <p className={styles.trustedBy}>
            Trusted by over 50,000+ customers
          </p>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.circle}>N</div>
      </footer>
    </div>
  );
}
