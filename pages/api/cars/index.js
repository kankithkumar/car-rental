// pages/api/cars/index.js
import clientPromise from '../../../utils/mongodb';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const client = await clientPromise;
      const db = client.db('car_rental_db'); // Replace with your database name

      // Find all cars
      const cars = await db.collection('cars').find({}).toArray();

      res.status(200).json({ cars });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
