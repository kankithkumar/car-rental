// pages/api/admin/bookings.js
import clientPromise from '../../../utils/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const client = await clientPromise;
      const db = client.db('car_rental_db');

      const bookings = await db.collection('bookings').aggregate([
        {
          $addFields: {
            user_id_obj: { $toObjectId: '$user_id' },
            car_id_obj: { $toObjectId: '$car_id' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id_obj',
            foreignField: '_id',
            as: 'user'
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
          $unwind: { path: '$user', preserveNullAndEmptyArrays: true }
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
            user_name: '$user.name',
            user_email: '$user.email',
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
            },
            car_year: '$car.year'
          }
        }
      ]).toArray();

      res.status(200).json({ bookings });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
