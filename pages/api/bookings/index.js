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
      const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });      
      const car = await db.collection('cars').findOne({ _id: new ObjectId(carId) });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!car) {
        return res.status(404).json({ message: 'Car not found' });
      }

      // Check for date conflicts with existing bookings
      const bookingStart = new Date(bookDate);
      const bookingEnd = new Date(returnDate);
      
      const conflictingBooking = await db.collection('bookings').findOne({
        car_id: new ObjectId(carId),
        book_status: { $in: ['waiting', 'approved'] },
        $or: [
          { book_date: { $lte: bookingEnd }, return_date: { $gte: bookingStart } }
        ]
      });
      
      if (conflictingBooking) {
        return res.status(400).json({ message: 'Car is not available for the selected dates' });
      }


      // Calculate the total price based on car's price per day and duration
      const totalPrice = car.price_per_day * duration;

      // Create the new booking document
      const newBooking = {
        user_id: new ObjectId(userId),
        car_id: new ObjectId(carId),
        book_place: bookPlace,
        book_date: new Date(bookDate), // Store as Date object
        duration: duration,
        destination: destination,
        return_date: new Date(returnDate), // Store as Date object
        price: totalPrice, // Store the calculated price
        book_status: 'waiting', // Set initial status to waiting for admin approval
      };

      const result = await db.collection('bookings').insertOne(newBooking);




      res.status(201).json({ message: 'Booking created successfully', bookingId: result.insertedId, bookingPrice: totalPrice });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}