// pages/dashboard/index.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../../styles/Dashboard.module.css'; // We'll create this CSS module next
import Navigation from '../../components/Navigation'; // Import Navigation component

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in (using the simulated method)
    const loggedInUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null;

    if (!loggedInUser || loggedInUser.is_admin) {
      // If not logged in or is an admin, redirect to home or admin dashboard
      router.push(loggedInUser && loggedInUser.is_admin ? '/admin/dashboard' : '/');
      return;
    }

    setUser(loggedInUser);

    // Fetch user's bookings
    const fetchBookings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${loggedInUser._id}/bookings`);
        if (!res.ok) {
           if (res.status === 404) {
                setBookings([]); // No bookings found for this user
                setLoading(false);
                return;
           }
          throw new Error(`Failed to fetch bookings: ${res.status}`);
        }
        const data = await res.json();
        setBookings(data.bookings);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user bookings:", error);
        setError('Failed to load bookings. Please try again.');
        setLoading(false);
      }
    };

    fetchBookings();
  }, [router]); // Depend on router to re-run effect if route changes

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

   if (error) {
       return (
           <div className={styles.container}>
               <Navigation />
               <main className={styles.main}>
                   <p className={styles.error}>{error}</p>
               </main>
           </div>
       );
   }


  return (
    <div className={styles.container}>
      <Head>
        <title>My Dashboard - Car Rental App</title>
        <meta name="description" content="View your car rental bookings" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navigation /> {/* Include the Navigation component */}

      <main className={styles.main}>
        <h1 className={styles.title}>Welcome, {user?.name || 'User'}</h1> {/* Display user's name */}

        <div className={styles.bookingsSection}>
          <h2>My Bookings</h2>
          {bookings.length > 0 ? (
            <ul className={styles.bookingList}>
              {bookings.map((booking) => (
                <li key={booking._id} className={styles.bookingItem}>
                  <div className={styles.bookingDetails}>
                    <p><strong>Booking ID:</strong> {booking._id}</p>
                    <p><strong>Car ID:</strong> {booking.car_id}</p> {/* You might want to fetch car details here */}
                    <p><strong>Pickup Place:</strong> {booking.book_place}</p>
                    <p><strong>Pickup Date:</strong> {new Date(booking.book_date).toLocaleDateString()}</p>
                    <p><strong>Duration:</strong> {booking.duration} days</p>
                    <p><strong>Destination:</strong> {booking.destination}</p>
                     <p><strong>Return Date:</strong> {new Date(booking.return_date).toLocaleDateString()}</p>
                    <p><strong>Total Price:</strong> ${booking.price}</p>
                    <p><strong>Status:</strong> <span className={`${styles.bookingStatus} ${styles[booking.book_status]}`}>{booking.book_status}</span></p> {/* Style status */}
                  </div>
                  {/* Add action buttons if needed (e.g., Cancel Booking) */}
                </li>
              ))}
            </ul>
          ) : (
            <p>You have no bookings yet.</p>
          )}
        </div>
      </main>

      {/* Optional Footer */}
    </div>
  );
}
