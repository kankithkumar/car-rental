// pages/admin/bookings.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../../styles/AdminBookings.module.css'; // We'll create this CSS module next
import Navigation from '../../components/Navigation'; // Import Navigation component

export default function AdminBookings() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

    // Fetch all bookings
    const fetchBookings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/bookings`);
        if (!res.ok) {
           if (res.status === 404) {
                setBookings([]); // No bookings found
                setLoading(false);
                return;
           }
          throw new Error(`Failed to fetch bookings: ${res.status}`);
        }
        const data = await res.json();
         // You might want to fetch user and car details for each booking here
         // using Promise.all or similar to enhance the displayed info.
        setBookings(data.bookings);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching bookings in AdminBookings:", error);
        setError('Failed to load bookings. Please try again.');
        setLoading(false);
      }
    };

    fetchBookings();
  }, [router]); // Depend on router to re-run effect if route changes

  const handleUpdateStatus = async (bookingId, newStatus) => {
       try {
           const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/bookings/${bookingId}`, {
               method: 'PUT',
               headers: {
                   'Content-Type': 'application/json',
                   // Add authentication header here in a real app
               },
               body: JSON.stringify({ status: newStatus }),
           });

           const data = await res.json();

           if (res.ok) {
               // Update the booking status in the local state
               setBookings(bookings.map(booking =>
                   booking._id === bookingId ? { ...booking, book_status: newStatus } : booking
               ));
               console.log(data.message); // Log success message
               // Optionally refetch bookings to ensure data consistency
               // fetchBookings();
           } else {
               setError(data.message || 'Failed to update booking status.');
           }
       } catch (error) {
           console.error("Error updating booking status:", error);
           setError('An unexpected error occurred while updating status.');
       }
   };


  if (loading) {
    return (
      <div className={styles.container}>
        <Navigation />
        <main className={styles.main}>
          <p>Loading bookings...</p>
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
        <title>Manage Bookings - Admin - Car Rental App</title>
        <meta name="description" content="Admin panel for managing car rental bookings" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navigation /> {/* Include the Navigation component */}

      <main className={styles.main}>
        <h1 className={styles.title}>Manage Bookings</h1>

        <div className={styles.bookingList}>
          {bookings.length > 0 ? (
            <table className={styles.bookingTable}>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>User ID</th> {/* You might want to display user email/name */}
                  <th>Car ID</th> {/* You might want to display car make/model */}
                  <th>Pickup Date</th>
                   <th>Return Date</th>
                   <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking._id}</td>
                    <td>{booking.user_id}</td>
                    <td>{booking.car_id}</td>
                    <td>{new Date(booking.book_date).toLocaleDateString()}</td>
                     <td>{new Date(booking.return_date).toLocaleDateString()}</td>
                     <td>${booking.price}</td>
                    <td>
                         <span className={`${styles.bookingStatus} ${styles[booking.book_status]}`}>{booking.book_status}</span>
                    </td>
                    <td>
                      {booking.book_status === 'waiting' && (
                         <button onClick={() => handleUpdateStatus(booking._id, 'approve')} className={`${styles.actionButton} ${styles.approveButton}`}>
                           Approve
                         </button>
                      )}
                       {booking.book_status === 'approve' && (
                         <button onClick={() => handleUpdateStatus(booking._id, 'returned')} className={`${styles.actionButton} ${styles.returnButton}`}>
                           Mark as Returned
                         </button>
                       )}
                       {/* Optionally add a delete button for bookings */}
                       {/* <button onClick={() => alert(`Delete booking with ID: ${booking._id}`)} className={`${styles.actionButton} ${styles.deleteButton}`}>
                           Delete
                       </button> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No bookings found in the system.</p>
          )}
        </div>
      </main>

      {/* Optional Footer */}
    </div>
  );
}
