// pages/auth/login.js
import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../../styles/Auth.module.css';
import Navigation from '../../components/Navigation';
import Link from 'next/link'; // <-- Make sure this line is here



export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

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
        // Login successful
        // Simulate storing user info (replace with JWT/context in production)
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect based on admin status
        if (data.user.is_admin) {
          router.push('/admin/dashboard'); // Redirect admin
        } else {
          router.push('/cars'); // Redirect regular user to cars page
        }
      } else {
        // Login failed
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

      <Navigation /> {/* Include the Navigation component */}

      <main className={styles.main}>
        <div className={styles.authCard}>
          <h1 className={styles.title}>Login</h1>
          {error && <p className={styles.error}>{error}</p>}
          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.inputField}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.inputField}
              />
            </div>
            <button type="submit" className={styles.submitButton}>Login</button>
          </form>
          <p className={styles.switchAuth}>
            Don't have an account? <Link href="/auth/register">Register here</Link> {/* Link component should be defined now */}
          </p>
        </div>
      </main>
    </div>
  );
}
