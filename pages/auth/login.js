// pages/auth/login.js
import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../../styles/Auth.module.css';
import Navigation from '../../components/Navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.is_admin) {
          router.push('/admin/dashboard');
        } else {
          router.push('/cars');
        }
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error("Login error:", error);
      setError('An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Login - Car Rental App</title>
        <meta name="description" content="Login to your account" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navigation />

      <main className={styles.main}>
        <div className={styles.authCard}>
            <div className={styles.tabs}>
                <button className={`${styles.tabButton} ${styles.active}`}>Log In</button>
                <Link href="/auth/register"><button className={styles.tabButton}>Register</button></Link>
            </div>

            {error && <p className={styles.error}>{error}</p>}
          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className={styles.formGroup}>
              <label htmlFor="email">User Name</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.inputField}
                placeholder=""
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="password">Enter Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.inputField}
                placeholder=""
              />
            </div>
            <div className={styles.checkboxGroup}>
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember Password</label>
            </div>
            <button type="submit" className={styles.submitButton}>Log In</button>
          </form>
        </div>
      </main>
    </div>
  );
}
