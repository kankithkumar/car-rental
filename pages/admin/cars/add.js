// pages/admin/cars/add.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../../../styles/AdminCarForm.module.css';
import Navigation from '../../../components/Navigation';
import Link from 'next/link';


export default function AddCar() {
  const [user, setUser] = useState(null);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [registration_number, setRegistrationNumber] = useState('');
  const [price_per_day, setPricePerDay] = useState('');
  const [imageFile, setImageFile] = useState(null); // State to hold the selected file
  const [imagePreview, setImagePreview] = useState(null); // State to hold image preview URL
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
  }, [router]);


  // Handle file selection and generate preview
  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setImageFile(file);
          // Generate image preview
          const reader = new FileReader();
          reader.onloadend = () => {
              setImagePreview(reader.result);
          };
          reader.readAsDataURL(file);
      } else {
          setImageFile(null);
          setImagePreview(null);
      }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

     // Basic form validation
    if (!make || !model || !year || !color || !registration_number || !price_per_day) {
         setError('Please fill in all required fields.');
         setSubmitting(false);
         return;
    }


    const formData = new FormData();
    formData.append('make', make);
    formData.append('model', model);
    formData.append('year', year);
    formData.append('color', color);
    formData.append('registration_number', registration_number);
    formData.append('price_per_day', price_per_day);
    if (imageFile) {
        formData.append('image', imageFile); // Append the image file
    }
    formData.append('availability_status', true);


    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/cars`, {
        method: 'POST',
        // Content-Type header is not needed with FormData,
        // the browser sets it automatically with the correct boundary.
        // headers: {
        //   'Content-Type': 'application/json',
        // },
        body: formData, // Send FormData instead of JSON
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Car added successfully!');
        // Clear form fields and image state after successful submission
        setMake('');
        setModel('');
        setYear('');
        setColor('');
        setRegistrationNumber('');
        setPricePerDay('');
        setImageFile(null);
        setImagePreview(null);
      } else {
        setError(data.message || 'Failed to add car. Please try again.');
      }
    } catch (error) {
      console.error("Add car error:", error);
      setError('An unexpected error occurred while adding the car.');
    } finally {
       setSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className={styles.container}>
        <Navigation />
        <main className={styles.main}>
          <p>Loading...</p>
        </main>
      </div>
    );
  }


  return (
    <div className={styles.container}>
      <Head>
        <title>Add New Car - Admin - Car Rental App</title>
        <meta name="description" content="Admin panel for adding new car listings" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navigation /> {/* Include the Navigation component */}

      <main className={styles.main}>
        <h1 className={styles.title}>Add New Car</h1>

         <div className={styles.backLink}>
            <Link href="/admin/cars">
               &larr; Back to Manage Cars
            </Link>
         </div>


        <div className={styles.formContainer}>
          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}
          <form onSubmit={handleSubmit} className={styles.carForm}>
            <div className={styles.formGroup}>
              <label htmlFor="make">Make:</label>
              <input type="text" id="make" value={make} onChange={(e) => setMake(e.target.value)} required className={styles.inputField} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="model">Model:</label>
              <input type="text" id="model" value={model} onChange={(e) => setModel(e.target.value)} required className={styles.inputField} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="year">Year:</label>
              <input type="number" id="year" value={year} onChange={(e) => setYear(e.target.value)} required className={styles.inputField} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="color">Color:</label>
              <input type="text" id="color" value={color} onChange={(e) => setColor(e.target.value)} required className={styles.inputField} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="registration_number">Registration Number:</label>
              <input type="text" id="registration_number" value={registration_number} onChange={(e) => setRegistrationNumber(e.target.value)} required className={styles.inputField} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="price_per_day">Price Per Day ($):</label>
              <input type="number" id="price_per_day" value={price_per_day} onChange={(e) => setPricePerDay(e.target.value)} required step="0.01" className={styles.inputField} />
            </div>
             {/* Image Upload Field */}
            <div className={styles.formGroup}>
              <label htmlFor="carImage">Car Image:</label>
              <input type="file" id="carImage" accept="image/*" onChange={handleFileChange} className={styles.fileInput} />
                {imagePreview && (
                    <div className={styles.imagePreview}>
                        <img src={imagePreview} alt="Image Preview" />
                    </div>
                )}
            </div>
            <button type="submit" className={styles.submitButton} disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Car'}
            </button>
          </form>
        </div>
      </main>

      {/* Optional Footer */}
    </div>
  );
}
