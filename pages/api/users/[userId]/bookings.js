// pages/api/users/[userId]/bookings.js
import clientPromise from '../../../../utils/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { userId } = req.query;

  if (req.method === 'GET') {
    if (!userId) {
      return res.status(400).json({ message: 'Missing user ID' });
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    try {
      const client = await clientPromise;
      const db = client.db('car_rental_db');
      
      const bookings = await db.collection('bookings')
        .find({ user_id: new ObjectId(userId) })
        .sort({ book_date: -1 }) // Sort by booking date, newest first
        .toArray();
      
      res.status(200).json({ bookings: bookings || [] });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
