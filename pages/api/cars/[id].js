import clientPromise from '../../../../utils/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('car_rental_db');
    const { carId } = req.query;

    if (!ObjectId.isValid(carId)) {
      return res.status(400).json({ message: 'Invalid car ID' });
    }

    const car = await db.collection('cars').findOne({ _id: new ObjectId(carId) });

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    car._id = car._id.toString();

    res.status(200).json({ car });
  } catch (error) {
    console.error('API error fetching car:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
