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
        const booking = await db.collection('bookings').findOne({ _id: new ObjectId(bookingId) });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // In a real scenario, you would integrate with a payment gateway here.
        // This is a simplified simulation.

        // For simulation, we'll assume the payment is successful

        // Update booking status to 'approved'
        const updateBookingResult = await db.collection('bookings').updateOne(
          { _id: new ObjectId(bookingId) }, // Use new ObjectId()
          { $set: { book_status: 'approved' } }
        );

        // Create a payment record (simplified)
        const newPayment = {
             booking_id: new ObjectId(bookingId), // Use new ObjectId()
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
        console.error('Simulated payment API error:', error);
        res.status(500).json({ message: 'Something went wrong' });
      }
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  }
