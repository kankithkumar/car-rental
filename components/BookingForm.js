// components/BookingForm.js
import { useState } from 'react';
import { useRouter } from 'next/router'; // Add this line
import styles from '../styles/BookingForm.module.css';

const BookingForm = ({ carId }) => {
  const router = useRouter(); // Add this line
  const [bookPlace, setBookPlace] = useState('');
  const [bookDate, setBookDate] = useState('');
  const [duration, setDuration] = useState('');
  const [destination, setDestination] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Add this line

  // In a real application, you would get the logged-in user's ID
  // from your authentication context or state management
  const userId = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user'))?._id : null; // Example: Get user ID from local storage


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true); // Use the new state variable

     if (!userId) {
        setError('Please login to book a car.');
        setIsSubmitting(false); // Reset submitting state on error
        return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          carId,
          bookPlace,
          bookDate,
          duration: parseInt(duration), // Convert duration to number
          destination,
          returnDate,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Booking request submitted successfully. Waiting for admin approval.');
        // Clear form fields
        setBookPlace('');
        setBookDate('');
        setDuration('');
        setDestination('');
        setReturnDate('');
        if (data.bookingId && data.bookingPrice !== undefined) {
            router.push(`/payment?bookingId=${data.bookingId}&amount=${data.bookingPrice}`);
        } else {
            setError('Booking successful, but failed to get payment details for redirection.');
            setSuccess(''); // Clear success message if redirection fails
        }
      } else {
        setError(data.message || 'Booking failed. Please try again.');
      }
    } catch (error) {
      console.error("Booking error:", error);
      setError('An unexpected error occurred during booking. Please try again later.');
    } finally {
      setIsSubmitting(false); // Reset submitting state after fetch
    }
  };

  return (
    <div className={styles.bookingFormContainer}>
      <h2 className={styles.formTitle}>Book This Car</h2>
       {error && <p className={styles.error}>{error}</p>}
       {success && <p className={styles.success}>{success}</p>}
      <form onSubmit={handleSubmit} className={styles.bookingForm}>
        <div className={styles.formGroup}>
          <label htmlFor="bookPlace">Pickup Location:</label>
          <input
            type="text"
            id="bookPlace"
            value={bookPlace}
            onChange={(e) => setBookPlace(e.target.value)}
            required
            className={styles.inputField}
            disabled={isSubmitting} // Disable input while submitting
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="bookDate">Pickup Date:</label>
          <input
            type="date"
            id="bookDate"
            value={bookDate}
            onChange={(e) => setBookDate(e.target.value)}
            required
            className={styles.inputField}
            disabled={isSubmitting} // Disable input while submitting
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="duration">Duration (days):</label>
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
            min="1"
            className={styles.inputField}
            disabled={isSubmitting} // Disable input while submitting
          />
        </div>
         <div className={styles.formGroup}>
          <label htmlFor="destination">Destination:</label>
          <input
            type="text"
            id="destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
            className={styles.inputField}
            disabled={isSubmitting} // Disable input while submitting
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="returnDate">Return Date:</label>
          <input
            type="date"
            id="returnDate"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            required
            className={styles.inputField}
            disabled={isSubmitting} // Disable input while submitting
          />
        </div>
        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Booking Request'} {/* Change button text while submitting */}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;