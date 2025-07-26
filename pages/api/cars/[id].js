// pages/api/cars/[id].js
import clientPromise from '../../../utils/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { id } = req.query; // Get the car ID from the URL query parameters

  if (req.method === 'GET') {
    try {
      const client = await clientPromise;
      const db = client.db('car_rental_db'); // Replace with your database name

      // Find the car by its ID
      const car = await db.collection('cars').findOne({ _id: ObjectId(id) });

      if (!car) {
        return res.status(404).json({ message: 'Car not found' });
      }

      res.status(200).json({ car });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
