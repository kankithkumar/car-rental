// pages/admin/cars.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../../styles/AdminCars.module.css';
import Navigation from '../../components/Navigation';
import Link from 'next/link';

export default function AdminCars() {
  const [user, setUser] = useState(null);
  const [cars, setCars] = useState([]);
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

    // Fetch all cars
    const fetchCars = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cars`);
        if (!res.ok) {
           if (res.status === 404) {
                setCars([]); // No cars found
           } else {
               throw new Error(`Failed to fetch cars: ${res.status}`);
           }
        } else {
            const data = await res.json();
            setCars(data.cars);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching cars in AdminCars:", error);
        setError('Failed to load cars. Please try again.');
        setLoading(false);
      }
    };

    fetchCars();
  }, [router]);


  const handleDeleteCar = async (carId) => {
      if (window.confirm('Are you sure you want to delete this car?')) {
          try {
              const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/cars/${carId}`, {
                  method: 'DELETE',
                  headers: {
                      // Add authentication header here in a real app
                  },
              });

              const data = await res.json();

              if (res.ok) {
                  // Remove the deleted car from the local state
                  setCars(cars.filter(car => car._id !== carId));
                  console.log(data.message); // Log success message
                  // Optionally show a success message to the user
              } else {
                   setError(data.message || 'Failed to delete car.');
              }
          } catch (error) {
              console.error("Error deleting car:", error);
              setError('An unexpected error occurred while deleting the car.');
          }
      }
  };


  if (loading) {
    return (
      <div className={styles.container}>
        <Navigation />
        <main className={styles.main}>
          <p>Loading cars...</p>
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
        <title>Manage Cars - Admin - Car Rental App</title>
        <meta name="description" content="Admin panel for managing car listings" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navigation /> {/* Include the Navigation component */}

      <main className={styles.main}>
        <h1 className={styles.title}>Manage Cars</h1>

        <div className={styles.actions}>
            <Link href="/admin/cars/add" className={styles.addButton}>
                Add New Car
            </Link>
        </div>


        <div className={styles.carList}>
          {cars.length > 0 ? (
            <table className={styles.carTable}>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Make</th>
                  <th>Model</th>
                  <th>Year</th>
                   <th>Price/Day</th>
                   <th>Availability</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => (
                  <tr key={car._id}>
                    <td>
                        {car.image_url ? (
                            <img src={car.image_url} alt={`${car.make} ${car.model}`} className={styles.carImage} />
                        ) : (
                            <div className={styles.noImage}>No Image</div>
                        )}
                    </td>
                    <td>{car.make}</td>
                    <td>{car.model}</td>
                    <td>{car.year}</td>
                     <td>${car.price_per_day}</td>
                     <td>{car.availability_status ? 'Available' : 'Booked'}</td>
                    <td>
                       <Link href={`/admin/cars/edit/${car._id}`} className={styles.actionButton}>
                           Edit
                       </Link>
                        {/* Make the Delete button functional */}
                       <button onClick={() => handleDeleteCar(car._id)} className={`${styles.actionButton} ${styles.deleteButton}`}>
                           Delete
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No cars found in the system.</p>
          )}
        </div>
      </main>

      {/* Optional Footer */}
    </div>
  );
}
