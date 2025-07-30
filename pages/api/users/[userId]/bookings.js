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
      
      const bookings = await db.collection('bookings').aggregate([
        {
          $match: { user_id: new ObjectId(userId) }
        },
        {
          $addFields: {
            car_id_obj: { $toObjectId: '$car_id' }
          }
        },
        {
          $lookup: {
            from: 'cars',
            localField: 'car_id_obj',
            foreignField: '_id',
            as: 'car'
          }
        },
        {
          $unwind: { path: '$car', preserveNullAndEmptyArrays: true }
        },
        {
          $project: {
            _id: 1,
            book_date: 1,
            return_date: 1,
            price: 1,
            book_status: 1,
            book_place: 1,
            destination: 1,
            duration: 1,
            car_name: {
              $cond: {
                if: { $and: ['$car.make', '$car.model'] },
                then: { $concat: ['$car.make', ' ', '$car.model'] },
                else: {
                  $cond: {
                    if: { $and: ['$car.brand', '$car.model'] },
                    then: { $concat: ['$car.brand', ' ', '$car.model'] },
                    else: '$car.make'
                  }
                }
              }
            }
          }
        },
        {
          $sort: { book_date: -1 }
        }
      ]).toArray();
      
      res.status(200).json({ bookings: bookings || [] });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
