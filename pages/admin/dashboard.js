// pages/admin/dashboard.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../../styles/AdminDashboard.module.css';
import Navigation from '../../components/Navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const loggedInUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null;

    if (!loggedInUser || !loggedInUser.is_admin) {
      router.push('/');
      return;
    }

    setUser(loggedInUser);
    fetchDashboardStats();
  }, [router]);

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch('/api/admin/dashboard-stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60));
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Navigation />
        <main className={styles.main}>
          <p>Loading dashboard...</p>
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

      <Navigation />

      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>Overview of your car rental performance</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.exportBtn}>Export Report</button>
            <Link href="/admin/cars" className={styles.newCampaignBtn}>Add New Car</Link>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statTitle}>Total Revenue</span>
              <span className={styles.statIcon}>💰</span>
            </div>
            <div className={styles.statValue}>{formatCurrency(stats?.totalRevenue || 0)}</div>
            <div className={styles.statChange}>📈 +12.5% from last month</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statTitle}>Active Bookings</span>
              <span className={styles.statIcon}>🚗</span>
            </div>
            <div className={styles.statValue}>{stats?.activeBookings || 0}</div>
            <div className={styles.statChange}>📈 +3 from last month</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statTitle}>Booking Rate</span>
              <span className={styles.statIcon}>📊</span>
            </div>
            <div className={styles.statValue}>{stats?.completionRate || 0}%</div>
            <div className={styles.statChange}>📈 +5.2% from last month</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statTitle}>Total Cars</span>
              <span className={styles.statIcon}>🏎️</span>
            </div>
            <div className={styles.statValue}>{stats?.totalCars || 0}</div>
            <div className={styles.statChange}>📉 -2 from last month</div>
          </div>
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.performanceCard}>
            <h3 className={styles.cardTitle}>Car Performance</h3>
            <div className={styles.performanceList}>
              {stats?.topCars?.map((car, index) => (
                <div key={car._id} className={styles.performanceItem}>
                  <div className={styles.performanceIcon}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </div>
                  <div className={styles.performanceDetails}>
                    <div className={styles.performanceName}>{car.brand} {car.model}</div>
                    <div className={styles.performanceSubtext}>{car.bookingCount} bookings</div>
                  </div>
                  <div className={styles.performanceMetric}>
                    <div className={styles.performanceRate}>{Math.round((car.bookingCount / (stats?.activeBookings || 1)) * 100)}%</div>
                    <div className={styles.performanceLabel}>utilization rate</div>
                  </div>
                </div>
              )) || [
                <div key="email" className={styles.performanceItem}>
                  <div className={styles.performanceIcon}>🚗</div>
                  <div className={styles.performanceDetails}>
                    <div className={styles.performanceName}>Toyota Camry</div>
                    <div className={styles.performanceSubtext}>12 bookings</div>
                  </div>
                  <div className={styles.performanceMetric}>
                    <div className={styles.performanceRate}>18.7%</div>
                    <div className={styles.performanceLabel}>utilization rate</div>
                  </div>
                </div>
              ]}
            </div>
          </div>

          <div className={styles.activityCard}>
            <div className={styles.activityHeader}>
              <h3 className={styles.cardTitle}>Recent Activity</h3>
              <Link href="/admin/bookings" className={styles.viewAllLink}>View All →</Link>
            </div>
            <div className={styles.activityList}>
              {stats?.recentPayments?.slice(0, 4).map((payment, index) => (
                <div key={payment._id} className={styles.activityItem}>
                  <div className={styles.activityDetails}>
                    <div className={styles.activityTitle}>Payment received</div>
                    <div className={styles.activitySubtext}>Booking #{payment.booking_id.toString().slice(-6)}</div>
                  </div>
                  <div className={styles.activityMeta}>
                    <div className={styles.activityAmount}>{formatCurrency(payment.amount)}</div>
                    <div className={styles.activityTime}>{getTimeAgo(payment.payment_date)}</div>
                  </div>
                </div>
              )) || [
                <div key="1" className={styles.activityItem}>
                  <div className={styles.activityDetails}>
                    <div className={styles.activityTitle}>New booking created</div>
                    <div className={styles.activitySubtext}>Toyota Camry</div>
                  </div>
                  <div className={styles.activityMeta}>
                    <div className={styles.activityAmount}>$250</div>
                    <div className={styles.activityTime}>2m ago</div>
                  </div>
                </div>
              ]}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
