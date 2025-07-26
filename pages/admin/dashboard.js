// pages/admin/dashboard.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../../styles/AdminDashboard.module.css'; // We'll create this CSS module next
import Navigation from '../../components/Navigation'; // Import Navigation component
import Link from 'next/link'; // Import Link for navigation within the dashboard

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in and is an admin
    const loggedInUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null;

    if (!loggedInUser || !loggedInUser.is_admin) {
      // If not logged in or not an admin, redirect to home page
      router.push('/');
      return;
    }

    setUser(loggedInUser);
    setLoading(false);
  }, [router]); // Depend on router to re-run effect if route changes

  if (loading) {
    return (
      <div className={styles.container}>
        <Navigation />
        <main className={styles.main}>
          <p>Loading admin dashboard...</p>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Admin Dashboard - Car Rental App</title>
        <meta name="description" content="Admin panel for managing the car rental application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navigation /> {/* Include the Navigation component */}

      <main className={styles.main}>
        <h1 className={styles.title}>Admin Dashboard</h1>

        <div className={styles.dashboardGrid}>
          <div className={styles.dashboardCard}>
            <h2>Manage Cars</h2>
            <p>Add, edit, or delete car listings.</p>
            <Link href="/admin/cars">
               Go to Cars Management
            </Link>
          </div>

          <div className={styles.dashboardCard}>
            <h2>Manage Users</h2>
            <p>View and manage user accounts.</p>
            <Link href="/admin/users">
               Go to Users Management
            </Link>
          </div>

          <div className={styles.dashboardCard}>
            <h2>Manage Bookings</h2>
            <p>View and update booking statuses.</p>
            <Link href="/admin/bookings">
              Go to Bookings Management
            </Link>
          </div>

          {/* Add more admin sections as needed (e.g., Feedback, Payments) */}
        </div>
      </main>

      {/* Optional Footer */}
    </div>
  );
}
