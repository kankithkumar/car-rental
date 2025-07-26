// components/CarCard.js
import Link from 'next/link';
import styles from '../styles/CarCard.module.css'; // We'll create this CSS module next

const CarCard = ({ car }) => {
  return (
    <div className={styles.carCard}>
      {/* Car Image (add an actual image here) */}
      <div className={styles.carImage}>
        {/* Replace with actual image component or tag */}
        {car.image_url ? (
             <img src={car.image_url} alt={`${car.make} ${car.model}`} />
        ) : (
             <div className={styles.placeholderImage}>No Image Available</div>
        )}
      </div>

      {/* Car Details */}
      <div className={styles.carDetails}>
        <h3>{car.make} {car.model}</h3>
        <p>Year: {car.year}</p>
        <p>Color: {car.color}</p>
        <p>Price per day: ${car.price_per_day}</p>
      </div>

      {/* View Details Button */}
      <div className={styles.viewDetailsButton}>
        <Link href={`/cars/${car._id}`}>
           View Details
        </Link>
      </div>
    </div>
  );
};

export default CarCard;
