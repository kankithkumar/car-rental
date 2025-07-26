// pages/api/admin/bookings/[bookingId].js
import clientPromise from '../../../../utils/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { bookingId } = req.query; // Get the booking ID from the URL query parameters

  if (req.method === 'PUT') { // Using PUT for updating the booking status
    const { status } = req.body; // Get the new status from the request body

    // Basic validation for the status
    if (!status || !['approve', 'returned'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided. Status must be "approve" or "returned".' });
    }

    try {
      const client = await clientPromise;
      const db = client.db('car_rental_db'); // Replace with your database name

      // Find the booking by its ID
      const booking = await db.collection('bookings').findOne({ _id: ObjectId(bookingId) });

      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Update the booking status
      const updateResult = await db.collection('bookings').updateOne(
        { _id: ObjectId(bookingId) },
        { $set: { book_status: status } }
      );

      // If the status is changed to 'returned', update car availability
      if (status === 'returned') {
        await db.collection('cars').updateOne(
          { _id: booking.car_id }, // Use the car_id from the booking document
          { $set: { availability_status: true } } // Set availability back to true
        );
      }

      if (updateResult.modifiedCount === 1) {
        res.status(200).json({ message: `Booking status updated to ${status}` });
      } else {
         // This case might happen if the status was already what was sent, but no error occurred
         res.status(200).json({ message: `Booking status was already ${status} or no changes were made` });
      }


    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
