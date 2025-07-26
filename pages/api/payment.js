// pages/api/payment.js
import clientPromise from '../../utils/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { bookingId, paymentMethod, cardNumber, expiryDate, cvv } = req.body;

    // Basic validation (add more robust validation as needed)
    if (!bookingId || !paymentMethod || !cardNumber || !expiryDate || !cvv) {
      return res.status(400).json({ message: 'Missing required payment details' });
    }

    // In a real application, you would process the payment with a payment gateway here
    // and get a transaction ID and potentially other details.

    try {
      const client = await clientPromise;
      const db = client.db('car_rental_db'); // Replace with your database name

      // Find the booking to get the price
      const booking = await db.collection('bookings').findOne({ _id: ObjectId(bookingId) });

      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Create the new payment document
      const newPayment = {
        booking_id: ObjectId(bookingId),
        payment_method: paymentMethod,
        last_four: cardNumber.slice(-4), // Store only the last four digits
        payment_date: new Date(), // Add a timestamp
        transaction_id: 'simulated_transaction_' + Date.now(), // Replace with actual transaction ID from gateway
        amount: booking.price, // Use the price from the booking
      };

      const result = await db.collection('payment').insertOne(newPayment);

      // You might want to update the booking status to indicate payment received
      // For now, we'll just create the payment record.

      res.status(201).json({ message: 'Payment processed successfully', paymentId: result.insertedId });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
