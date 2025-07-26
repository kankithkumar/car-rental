// pages/feedback.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Feedback.module.css'; // We'll create this CSS module next
import Navigation from '../components/Navigation'; // Import Navigation component
import Link from 'next/link'; // Import Link if you need to link to other pages

export default function Feedback() {
  const [user, setUser] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [comment, setComment] = useState('');
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Check if user is logged in (using the simulated method)
    const loggedInUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null;
    setUser(loggedInUser);

    // Fetch existing feedback
    const fetchFeedback = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feedback`);
        if (!res.ok) {
           if (res.status === 404) {
                setFeedbackList([]); // No feedback found
           } else {
               throw new Error(`Failed to fetch feedback: ${res.status}`);
           }
        } else {
            const data = await res.json();
            setFeedbackList(data.feedback);
        }
        setLoadingFeedback(false);
      } catch (error) {
        console.error("Error fetching feedback:", error);
        setError('Failed to load feedback. Please try again.');
        setLoadingFeedback(false);
      }
    };

    fetchFeedback();
  }, []); // Run this effect only once on component mount


  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmittingFeedback(true);

    if (!user) {
      setError('Please login to submit feedback.');
      setSubmittingFeedback(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
           // Add authentication header here in a real app
        },
        body: JSON.stringify({ userId: user._id, comment }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Feedback submitted successfully!');
        setComment(''); // Clear the comment field
        // Optionally refetch feedback to show the new entry immediately
        // fetchFeedback();
      } else {
        setError(data.message || 'Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error("Feedback submission error:", error);
      setError('An unexpected error occurred while submitting feedback.');
    } finally {
       setSubmittingFeedback(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Feedback - Car Rental App</title>
        <meta name="description" content="Leave your feedback about the car rental service" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navigation /> {/* Include the Navigation component */}

      <main className={styles.main}>
        <h1 className={styles.title}>Feedback</h1>

        <div className={styles.feedbackContent}>
          {user ? (
            <div className={styles.feedbackFormContainer}>
              <h2>Submit Your Feedback</h2>
               {error && <p className={styles.error}>{error}</p>}
               {success && <p className={styles.success}>{success}</p>}
              <form onSubmit={handleSubmitFeedback} className={styles.feedbackForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="comment">Your Feedback:</label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    rows="4"
                    className={styles.inputField}
                  ></textarea>
                </div>
                <button type="submit" className={styles.submitButton} disabled={submittingFeedback}>
                   {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            </div>
          ) : (
            <p className={styles.loginMessage}>Please <Link href="/auth/login">login</Link> to submit feedback.</p>
          )}

          <div className={styles.feedbackListContainer}>
            <h2>Recent Feedback</h2>
            {loadingFeedback ? (
              <p>Loading feedback...</p>
            ) : feedbackList.length > 0 ? (
              <ul className={styles.feedbackList}>
                {feedbackList.map((feedback) => (
                  <li key={feedback._id} className={styles.feedbackItem}>
                     {/* You might want to fetch and display the user's name/email here */}
                     <p className={styles.feedbackComment}>{feedback.comment}</p>
                     <p className={styles.feedbackDate}>{new Date(feedback.created_at).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No feedback submitted yet.</p>
            )}
          </div>
        </div>
      </main>

      {/* Optional Footer */}
    </div>
  );
}
