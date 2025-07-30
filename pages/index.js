import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';
import Navigation from '../components/Navigation';

export default function Home() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const loggedInUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null;
    setUser(loggedInUser);
  }, []);

  const handleBookNow = () => {
    if (user) {
      router.push('/cars');
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Car Rental - Affordable Car Rentals at Your Fingertips</title>
        <meta name="description" content="Choose from a wide range of cars. Easy booking. No hidden charges." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navigation />

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.headline}>
              Affordable Car Rentals at Your Fingertips
            </h1>
            <p className={styles.subheadline}>
              Choose from a wide range of cars. Easy booking. No hidden charges.
            </p>
            <button onClick={handleBookNow} className={styles.ctaButton}>
              Book Now
            </button>
          </div>
        </section>

        <section className={styles.features}>
          <h2 className={styles.featuresTitle}>Why Choose Us</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>🚗</span>
              <h3>Wide Range of Cars</h3>
              <p>SUVs, Sedans, Luxury cars and more</p>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>💰</span>
              <h3>Affordable Pricing</h3>
              <p>No hidden fees, transparent pricing</p>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>📞</span>
              <h3>24/7 Customer Support</h3>
              <p>We're here to help anytime you need</p>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>📱</span>
              <h3>Easy Online Booking</h3>
              <p>Book and cancel online with ease</p>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLinks}>
            <a href="#">FAQs</a>
            <a href="#">Terms & Conditions</a>
            <a href="#">Privacy Policy</a>
          </div>
          <div className={styles.socialMedia}>
            <span>📘</span>
            <span>🐦</span>
            <span>📷</span>
          </div>
          <div className={styles.copyright}>
            <p>&copy; 2024 Car Rental. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
