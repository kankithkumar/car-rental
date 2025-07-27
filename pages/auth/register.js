// pages/auth/register.js
import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../../styles/Auth.module.css';
import Navigation from '../../components/Navigation';
import Link from 'next/link';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone_number, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, phone_number, address }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Registration successful! You can now log in.');
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError('An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <div className={styles.container}>
       <Head>
        <title>Register - Car Rental App</title>
        <meta name="description" content="Create a new account" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navigation />

      <main className={styles.main}>
         <div className={styles.authCard}>
            <div className={styles.tabs}>
                <Link href="/auth/login"><button className={styles.tabButton}>Log In</button></Link>
                <button className={`${styles.tabButton} ${styles.active}`}>Register</button>
            </div>

            <h1 className={styles.title}>Register</h1>
            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.success}>{success}</p>}
            <form onSubmit={handleSubmit} className={styles.authForm}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Name:</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                   className={styles.inputField}
                />
              </div>
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
              <div className={styles.formGroup}>
                <label htmlFor="phone_number">Phone Number:</label>
                <input
                  type="text"
                  id="phone_number"
                  value={phone_number}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                   className={styles.inputField}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="address">Address:</label>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                   className={styles.inputField}
                />
              </div>
              <button type="submit" className={styles.submitButton}>Register</button>
            </form>
         </div>
      </main>
    </div>
  );
}
