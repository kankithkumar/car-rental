// pages/payment.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../styles/Payment.module.css'; // Reuse the payment styles
import Navigation from '../components/Navigation'; // Import Navigation component


export default function Payment() {
  const router = useRouter();
  const { bookingId, amount } = router.query; // Get bookingId and amount from query parameters

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

   useEffect(() => {
        // Basic check if bookingId and amount are available
        if (!bookingId || !amount) {
            setError('Payment details are missing.');
        }
    }, [bookingId, amount]);


  const handleSimulatePayment = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    if (!bookingId || !amount) {
         setError('Cannot process payment: Missing booking or amount details.');
         setLoading(false);
         return;
     }

    // Simulate a payment success
    // In a real application, you would interact with a payment gateway here.

    try {
        // Call a backend API route to simulate payment success and update booking status
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/simulate-payment`, { // We'll create this API endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
           // Add authentication header here in a real app
        },
        body: JSON.stringify({
          bookingId,
          amount: parseFloat(amount), // Send the amount
          // Add other simulated payment details if needed
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Payment simulated and processed successfully!');
        // Optionally redirect to a success page or user dashboard after a delay
         setTimeout(() => {
             router.push('/dashboard'); // Redirect to user dashboard
         }, 2000); // Redirect after 2 seconds

      } else {
        setError(data.message || 'Payment simulation failed.');
      }
    } catch (error) {
      console.error("Simulated payment error:", error);
      setError('An unexpected error occurred during simulated payment.');
    } finally {
       setLoading(false);
    }
  };

  if (error && !bookingId) { // Display error if payment details are missing on load
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
        <title>Payment - Car Rental App</title>
        <meta name="description" content="Complete your car rental payment" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navigation /> {/* Include the Navigation component */}

      <main className={styles.main}>
        <div className={styles.paymentFormContainer}>
          <h1 className={styles.title}>Complete Your Payment</h1>
          {amount && <p className={styles.amount}>Amount Due: ${parseFloat(amount).toFixed(2)}</p>} {/* Display amount */}
          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}

          {/* Simple button to simulate payment */}
          <button onClick={handleSimulatePayment} className={styles.submitButton} disabled={loading || !bookingId || !amount}>
            {loading ? 'Processing Payment...' : 'Simulate Payment'}
          </button>

        </div>
      </main>

      {/* Optional Footer */}
    </div>
  );
}
