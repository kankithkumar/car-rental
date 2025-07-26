// pages/cars/index.js
import Head from 'next/head';
import styles from '../../styles/Cars.module.css'; // We'll create this CSS module next
import CarCard from '../../components/CarCard'; // Import the CarCard component

export default function Cars({ cars }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>All Cars - Car Rental App</title>
        <meta name="description" content="Browse all available cars for rent" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>All Available Cars</h1>

        <div className={styles.carList}>
          {cars.length > 0 ? (
            cars.map((car) => (
              <CarCard key={car._id} car={car} /> // Use the CarCard component
            ))
          ) : (
            <p>No cars available at the moment.</p>
          )}
        </div>
      </main>

      {/* Optional Footer (you might want a Layout component for consistent footers) */}
    </div>
  );
}

// Fetch all car data on each request
export async function getServerSideProps() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cars`);
     if (!res.ok) {
        throw new Error(`Failed to fetch cars: ${res.status}`);
    }
    const data = await res.json();
    return {
      props: {
        cars: data.cars,
      },
    };
  } catch (error) {
    console.error("Error fetching cars in getServerSideProps:", error);
    return {
      props: {
        cars: [],
      },
    };
  }
}
