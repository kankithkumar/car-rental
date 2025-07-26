// pages/cars/[carId].js
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styles from '../../styles/CarDetails.module.css'; // We'll create this CSS module next
import Navigation from '../../components/Navigation'; // Import Navigation component
import BookingForm from '../../components/BookingForm'; // We'll create this component next

export default function CarDetails({ car }) {
  const router = useRouter();
  // If car data wasn't available at build time (e.g., using fallback: true in getStaticPaths)
  // if (router.isFallback) {
  //   return <div>Loading car details...</div>;
  // }

  if (!car) {
      // Handle the case where car data is not found
      return (
          <div className={styles.container}>
               <Head>
                <title>Car Not Found - Car Rental App</title>
                <meta name="description" content="Car details not available" />
                <link rel="icon" href="/favicon.ico" />
              </Head>
              <Navigation />
              <main className={styles.main}>
                  <p>Car not found.</p>
              </main>
          </div>
      );
  }


  return (
    <div className={styles.container}>
      <Head>
        <title>{car.make} {car.model} Details - Car Rental App</title>
        <meta name="description" content={`Details of ${car.make} ${car.model}`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navigation /> {/* Include the Navigation component */}

      <main className={styles.main}>
        <div className={styles.carDetailsContainer}>
          <div className={styles.carImageGallery}>
            {/* Display car images here */}
            {car.image_url ? (
                <img src={car.image_url} alt={`${car.make} ${car.model}`} className={styles.mainImage} />
            ) : (
                <div className={styles.placeholderImage}>No Image Available</div>
            )}
            {/* Add more images if available */}
          </div>

          <div className={styles.carInfoAndBooking}>
            <div className={styles.carInfo}>
              <h1 className={styles.title}>{car.make} {car.model}</h1>
              <p><strong>Year:</strong> {car.year}</p>
              <p><strong>Color:</strong> {car.color}</p>
              <p><strong>Registration Number:</strong> {car.registration_number}</p>
              <p><strong>Availability:</strong> {car.availability_status ? 'Available' : 'Booked'}</p>
              <p className={styles.price}><strong>Price per day:</strong> ${car.price_per_day}</p>

              {/* Add more car details as needed */}
            </div>

            {/* Booking Form */}
            {car.availability_status ? (
                 <BookingForm carId={car._id} /> // Pass carId to the BookingForm component
            ) : (
                 <p className={styles.bookedMessage}>This car is currently booked.</p>
            )}

          </div>
        </div>
      </main>

      {/* Optional Footer */}
    </div>
  );
}

// Fetch car data for a specific ID
export async function getServerSideProps(context) {
  const { carId } = context.params; // Get carId from the dynamic route parameter

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cars/${carId}`);
    if (!res.ok) {
        // If the response status is 404, return notFound: true
         if(res.status === 404) {
            return { notFound: true };
         }
        throw new Error(`Failed to fetch car details: ${res.status}`);
    }
    const data = await res.json();

    return {
      props: {
        car: data.car,
      },
    };
  } catch (error) {
    console.error("Error fetching car details in getServerSideProps:", error);
    return {
      props: {
        car: null, // Return null or an empty object in case of error
      },
    };
  }
}

// If you were using getStaticProps, you would also need getStaticPaths
// export async function getStaticPaths() {
//     // Fetch possible car IDs to pre-render
//     // const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cars`);
//     // const data = await res.json();
//     // const paths = data.cars.map(car => ({
//     //     params: { carId: car._id.toString() }
//     // }));
//     return {
//         paths: [], // Or the fetched paths
//         fallback: 'blocking' // or true
//     };
// }
