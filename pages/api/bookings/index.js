// pages/api/bookings/index.js
import clientPromise from '../../../utils/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, carId, bookPlace, bookDate, duration, destination, returnDate } = req.body;

    // Basic validation (you'll want more robust validation in a real app)
    if (!userId || !carId || !bookPlace || !bookDate || !duration || !destination || !returnDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      const client = await clientPromise;
      const db = client.db('car_rental_db'); // Replace with your database name

      // Verify if the user and car exist
      const user = await db.collection('users').findOne({ _id: ObjectId(userId) });
      const car = await db.collection('cars').findOne({ _id: ObjectId(carId) });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!car) {
        return res.status(404).json({ message: 'Car not found' });
      }

      // Check if the car is available (optional, depending on your frontend logic)
      if (!car.availability_status) {
         return res.status(400).json({ message: 'Car is not available' });
      }


      // Calculate the total price based on car's price per day and duration
      const totalPrice = car.price_per_day * duration;

      // Create the new booking document
      const newBooking = {
        user_id: ObjectId(userId),
        car_id: ObjectId(carId),
        book_place: bookPlace,
        book_date: new Date(bookDate), // Store as Date object
        duration: duration,
        destination: destination,
        return_date: new Date(returnDate), // Store as Date object
        price: totalPrice, // Store the calculated price
        book_status: 'waiting', // Set initial status to waiting for admin approval
      };

      const result = await db.collection('bookings').insertOne(newBooking);

      // Update car availability status to false
      await db.collection('cars').updateOne(
        { _id: ObjectId(carId) },
        { $set: { availability_status: false } }
      );


      res.status(201).json({ message: 'Booking created successfully', bookingId: result.insertedId });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
