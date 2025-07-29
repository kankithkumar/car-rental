import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../../styles/CarDetails.module.css';
import AppNavigation from '../../components/AppNavigation';
import BookingForm from '../../components/BookingForm';
import clientPromise from '../../utils/mongodb'; // MongoDB connection utility
import { ObjectId } from 'mongodb';

export default function CarDetails({ car }) {
  const router = useRouter();

  if (!car) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Car Not Found - Car Rental App</title>
          <meta name="description" content="Car details not available" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <AppNavigation />
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

      <AppNavigation />

      <main className={styles.main}>
        <div className={styles.carDetailsContainer}>
          <div className={styles.carImageGallery}>
            {car.image_url ? (
              <img src={car.image_url} alt={`${car.make} ${car.model}`} className={styles.mainImage} />
            ) : (
              <div className={styles.placeholderImage}>No Image Available</div>
            )}
          </div>

          <div className={styles.carInfoAndBooking}>
            <div className={styles.carInfo}>
              <h1 className={styles.title}>{car.make} {car.model}</h1>
              <p><strong>Year:</strong> {car.year}</p>
              <p><strong>Color:</strong> {car.color}</p>
              <p><strong>Registration Number:</strong> {car.registration_number}</p>
              <p><strong>Availability:</strong> {car.availability_status ? 'Available' : 'Booked'}</p>
              <p className={styles.price}><strong>Price per day:</strong> ${car.price_per_day}</p>
            </div>

            <BookingForm carId={car._id} />
          </div>
        </div>
      </main>
    </div>
  );
}
export async function getServerSideProps(context) {
  const { carId } = context.params;

  try {
    const client = await clientPromise;
    const db = client.db('car_rental_db');

    const car = await db.collection('cars').findOne({ _id: new ObjectId(carId) });

    if (!car) {
      return { notFound: true };
    }

    // Convert ObjectId to string for React props
    car._id = car._id.toString();

    return {
      props: {
        car,
      },
    };
  } catch (error) {
    console.error('Error fetching car from DB in getServerSideProps:', error);
    return {
      props: {
        car: null,
      },
    };
  }
}
