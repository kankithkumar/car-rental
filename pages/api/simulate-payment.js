// pages/api/simulate-payment.js
import clientPromise from '../../utils/mongodb';
import { ObjectId } from 'mongodb';
// Add authentication middleware here to ensure the user making the payment is logged in
// and potentially authorized for this booking.

export default async function handler(req, res) {
    // In a real app, verify the user's authentication and authorization here

  if (req.method === 'POST') {
    const { bookingId, amount } = req.body;

    if (!bookingId || amount === undefined) {
      return res.status(400).json({ message: 'Missing booking ID or amount' });
    }

    try {
      const client = await clientPromise;
      const db = client.db('car_rental_db'); // Replace with your database name

      // Find the booking
      const booking = await db.collection('bookings').findOne({ _id: ObjectId(bookingId) });

      if (!booking) {
          return res.status(404).json({ message: 'Booking not found' });
      }

      // Basic check if the amount matches the booking price (optional for simulation)
      if (booking.price !== amount) {
           console.warn(`Simulated payment amount mismatch for booking ${bookingId}. Expected: ${booking.price}, Received: ${amount}`);
           // In a real scenario, this would likely be an error or require reconciliation.
      }


      // Simulate successful payment and update booking status to 'approve'
      const updateBookingResult = await db.collection('bookings').updateOne(
          { _id: ObjectId(bookingId) },
          { $set: { book_status: 'approve' } } // Update status to 'approve' after payment
      );

       // Create a payment record (simplified)
       const newPayment = {
            booking_id: ObjectId(bookingId),
            payment_method: 'Simulated', // Indicate simulated payment
            amount: amount,
            payment_date: new Date(),
            transaction_id: 'sim_' + Date.now(), // Simulated transaction ID
       };

       await db.collection('payment').insertOne(newPayment);


      if (updateBookingResult.modifiedCount === 1) {
        res.status(200).json({ message: 'Simulated payment successful and booking approved' });
      } else {
           // This might happen if the status was already 'approve', still count as success for simulation
           res.status(200).json({ message: 'Simulated payment processed, booking was already approved' });
      }

    } catch (error) {
      console.error("Simulated payment API error:", error);
      res.status(500).json({ message: 'An unexpected error occurred during simulated payment.' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
