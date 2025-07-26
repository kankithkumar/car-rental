// pages/admin/cars/edit/[carId].js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../../../../styles/AdminCarForm.module.css';
import Navigation from '../../../../components/Navigation';
import Link from 'next/link';

export default function EditCar() {
  const router = useRouter();
  const { carId } = router.query;

  const [user, setUser] = useState(null);
  const [car, setCar] = useState(null);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [registration_number, setRegistrationNumber] = useState('');
  const [price_per_day, setPricePerDay] = useState('');
  const [imageFile, setImageFile] = useState(null); // State to hold the new selected file
  const [imagePreview, setImagePreview] = useState(null); // State to hold preview of new image
  const [existingImageUrl, setExistingImageUrl] = useState(''); // State to hold the existing image URL
  const [availability_status, setAvailabilityStatus] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');


  useEffect(() => {
    // Check if user is logged in and is an admin
    const loggedInUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null;

    if (!loggedInUser || !loggedInUser.is_admin) {
      router.push('/');
      return;
    }

    setUser(loggedInUser);

    // Fetch car data for the specified carId
    const fetchCarData = async () => {
      if (!carId) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cars/${carId}`);
        if (!res.ok) {
           if (res.status === 404) {
                setError('Car not found.');
           } else {
               throw new Error(`Failed to fetch car data: ${res.status}`);
           }
            setLoading(false);
            return;
        }
        const data = await res.json();
        setCar(data.car);
        setMake(data.car.make || '');
        setModel(data.car.model || '');
        setYear(data.car.year || '');
        setColor(data.car.color || '');
        setRegistrationNumber(data.car.registration_number || '');
        setPricePerDay(data.car.price_per_day || '');
        setExistingImageUrl(data.car.image_url || ''); // Set existing image URL
        setAvailabilityStatus(data.car.availability_status !== undefined ? data.car.availability_status : true);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching car data for edit:", error);
        setError('Failed to load car data. Please try again.');
        setLoading(false);
      }
    };

    fetchCarData();
  }, [carId, router]);


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

     if (!carId) {
         setError('Car ID is missing.');
         setSubmitting(false);
         return;
     }

      // Basic form validation
    if (!make || !model || !year || !color || !registration_number || !price_per_day || availability_status === undefined) {
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
     formData.append('availability_status', availability_status);
     if (imageFile) {
         formData.append('image', imageFile); // Append the new image file if selected
     } else if (existingImageUrl) {
         // If no new image is selected but there was an existing one, send its URL
         formData.append('image_url', existingImageUrl);
     }


    try {
        // Send the request to the same dynamic API route, but with PUT method
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/cars/${carId}`, {
        method: 'PUT',
        // Content-Type header is not needed with FormData
        // headers: {
        //   'Content-Type': 'application/json',
        // },
        body: formData, // Send FormData
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Car updated successfully!');
        // Optionally refetch car data to show updated info
         fetchCarData(); // Refetch car data after successful update

      } else {
        setError(data.message || 'Failed to update car. Please try again.');
      }
    } catch (error) {
      console.error("Edit car error:", error);
      setError('An unexpected error occurred while updating the car.');
    } finally {
       setSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className={styles.container}>
        <Navigation />
        <main className={styles.main}>
          <p>Loading car data...</p>
        </main>
      </div>
    );
  }

  if (error) {
      return (
          <div className={styles.container}>
               <Head>
                <title>Error - Car Rental App</title>
                <meta name="description" content="Error loading car data" />
                <link rel="icon" href="/favicon.ico" />
              </Head>
             <Navigation />
             <main className={styles.main}>
                 <p className={styles.error}>{error}</p>
                 <div className={styles.backLink}>
                    <Link href="/admin/cars">
                       &larr; Back to Manage Cars
                    </Link>
                 </div>
             </main>
          </div>
      );
  }

  if (!car) {
       return null; // Should be caught by error state, but good practice
  }


  return (
    <div className={styles.container}>
      <Head>
        <title>Edit Car - Admin - Car Rental App</title>
        <meta name="description" content={`Edit details of ${car.make} ${car.model}`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navigation /> {/* Include the Navigation component */}

      <main className={styles.main}>
        <h1 className={styles.title}>Edit Car</h1>

         <div className={styles.backLink}>
            <Link href="/admin/cars">
               &larr; Back to Manage Cars
            </Link>
         </div>


        <div className={styles.formContainer}>
          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}
          <form onSubmit={handleSubmit} className={styles.carForm}>
            {/* ... (other form groups for make, model, etc.) ... */}
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

            {/* Image Editing Field */}
            <div className={styles.formGroup}>
              <label htmlFor="carImage">Car Image:</label>
              {existingImageUrl && !imagePreview && (
                  <div className={styles.existingImagePreview}>
                      <p>Current Image:</p>
                      <img src={existingImageUrl} alt="Existing Car Image" />
                  </div>
              )}
               <input type="file" id="carImage" accept="image/*" onChange={handleFileChange} className={styles.fileInput} />
                {imagePreview && (
                    <div className={styles.imagePreview}>
                         <p>New Image Preview:</p>
                        <img src={imagePreview} alt="Image Preview" />
                    </div>
                )}
            </div>

             <div className={styles.formGroup}>
                <label htmlFor="availability_status">Availability:</label>
                <select
                    id="availability_status"
                    value={availability_status}
                    onChange={(e) => setAvailabilityStatus(e.target.value === 'true')}
                    className={styles.inputField}
                >
                    <option value="true">Available</option>
                    <option value="false">Booked</option>
                </select>
             </div>

            <button type="submit" className={styles.submitButton} disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Car'}
            </button>
          </form>
        </div>
      </main>

      {/* Optional Footer */}
    </div>
  );
}
