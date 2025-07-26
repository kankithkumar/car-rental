// pages/api/users/[userId]/bookings.js
import clientPromise from '../../../../utils/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { userId } = req.query; // Get the user ID from the URL query parameters

  if (req.method === 'GET') {
    // Basic validation
    if (!userId) {
      return res.status(400).json({ message: 'Missing user ID' });
    }

    try {
      const client = await clientPromise;
      const db = client.db('car_rental_db'); // Replace with your database name

      // Find all bookings for the specified user ID
      const bookings = await db.collection('bookings')
        .find({ user_id: ObjectId(userId) })
        .toArray();

      res.status(200).json({ bookings });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
