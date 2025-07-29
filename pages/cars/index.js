// pages/cars/index.js
import Head from 'next/head';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../../styles/Cars.module.css';
import CarCard from '../../components/CarCard';
import Navigation from '../../components/Navigation'; // Import the Navigation component

export default function Cars({ cars }) {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    const loggedInUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null;
    if (loggedInUser && !loggedInUser.is_admin) {
      setUser(loggedInUser);
      fetchUserBookings(loggedInUser._id);
    }
  }, []);

  const fetchUserBookings = async (userId) => {
    try {
      const res = await fetch(`/api/users/${userId}/bookings`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>All Cars - Car Rental App</title>
        <meta name="description" content="Browse all available cars for rent" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navigation /> {/* Include the Navigation component */}

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>All Available Cars</h1>
          {user && (
            <div className={styles.dashboardSection}>
              <button 
                onClick={() => setShowDashboard(!showDashboard)}
                className={styles.dashboardToggle}
              >
                My Bookings ({bookings.length})
              </button>
            </div>
          )}
        </div>

        {user && showDashboard && (
          <div className={styles.quickDashboard}>
            <h3>Recent Bookings</h3>
            {bookings.length > 0 ? (
              <div className={styles.bookingsList}>
                {bookings.slice(0, 3).map((booking) => (
                  <div key={booking._id} className={styles.bookingItem}>
                    <span>Booking #{booking._id.slice(-6)}</span>
                    <span className={`${styles.status} ${styles[booking.book_status]}`}>
                      {booking.book_status}
                    </span>
                    <span>${booking.price}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>No bookings yet</p>
            )}
          </div>
        )}

        <div className={styles.carList}>
          {cars.length > 0 ? (
            cars.map((car) => (
              <CarCard key={car._id} car={car} />
            ))
          ) : (
            <p>No cars available at the moment.</p>
          )}
        </div>
      </main>

      {/* Optional Footer (you might want a Layout component for consistent footers) */}
    </div>
  );
}

export async function getServerSideProps({ req }) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cars`, {
      headers: {
        Cookie: req.headers.cookie, // Include cookies from the incoming request
      },
    });
     if (!res.ok) {
        throw new Error(`Failed to fetch cars: ${res.status}`);
    }
    const data = await res.json();
    return {
      props: {
        cars: data.cars,
      },
    };
  } catch (error) {
    console.error("Error fetching cars in getServerSideProps:", error);
    return {
      props: {
        cars: [],
      },
    };
  }
}
