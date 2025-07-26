// pages/api/admin/bookings.js
import clientPromise from '../../../utils/mongodb';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const client = await clientPromise;
      const db = client.db('car_rental_db'); // Replace with your database name

      // Find all bookings
      const bookings = await db.collection('bookings')
        .find({})
        .toArray();

      // In a real application, you might want to join with user and car collections
      // to display more details in the admin panel. For now, we'll return raw booking data.

      res.status(200).json({ bookings });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
