// pages/index.js
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import CarCard from '../components/CarCard'; // Import the CarCard component
import Navigation from '../components/Navigation'; // Import Navigation component

export default function Home({ cars }) {
  const featuredCars = cars ? cars.slice(0, 6) : []; // Display first 6 cars as featured

  return (
    <div className={styles.container}>
      <Head>
        <title>Car Rental App</title>
        <meta name="description" content="Find and rent the perfect car" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navigation /> {/* Add the Navigation component here */}

      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <h1 className={styles.title}>
            Find Your Perfect Ride
          </h1>
          <p className={styles.description}>
            Rent a car for your next adventure.
          </p>
          <div className={styles.ctaButton}>
            <Link href="/cars">
              Explore Cars
            </Link>
          </div>
        </section>

        {/* Featured Cars Section */}
        <section className={styles.carsSection}>
          <h2>Featured Cars</h2>
          <div className={styles.carList}>
            {featuredCars.length > 0 ? (
              featuredCars.map((car) => (
                <CarCard key={car._id} car={car} /> // Use the CarCard component
              ))
            ) : (
              <p>No featured cars available.</p>
            )}
          </div>
        </section>
      </main>

      {/* Optional Footer */}
      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
             Your Company
          </span>
        </a>
      </footer>
    </div>
  );
}

// Fetch car data on each request
export async function getServerSideProps() {
  try {
    // Ensure the API route URL is correct, using the environment variable
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cars`);
     if (!res.ok) {
         // Log the status for debugging
         console.error(`Failed to fetch cars in getServerSideProps: HTTP Status ${res.status}`);
        throw new Error(`Failed to fetch cars: ${res.status}`);
    }
    const data = await res.json();
    // Ensure the data structure matches what the component expects (e.g., data.cars)
    if (!data || !Array.isArray(data.cars)) {
         console.error("API response did not contain a 'cars' array:", data);
         return {
             props: {
                 cars: [], // Return empty array if data is not in expected format
             },
         };
    }
    return {
      props: {
        cars: data.cars,
      },
    };
  } catch (error) {
    console.error("Error fetching cars in getServerSideProps:", error);
    return {
      props: {
        cars: [], // Return empty array in case of error
      },
    };
  }
}
