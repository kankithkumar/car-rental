// pages/api/admin/dashboard-stats.js
import clientPromise from '../../../utils/mongodb';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const client = await clientPromise;
      const db = client.db('car_rental_db');

      // Get total revenue from payments
      const totalRevenue = await db.collection('payment').aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]).toArray();

      // Get active bookings count
      const activeBookings = await db.collection('bookings').countDocuments({
        book_status: { $in: ['pending', 'approved'] }
      });

      // Get total cars count
      const totalCars = await db.collection('cars').countDocuments();

      // Get booking completion rate
      const totalBookingsCount = await db.collection('bookings').countDocuments();
      const completedBookings = await db.collection('bookings').countDocuments({
        book_status: 'approved'
      });
      const completionRate = totalBookingsCount > 0 ? 
        Math.round((completedBookings / totalBookingsCount) * 100) : 0;

      // Get recent activities (last 10 bookings and payments)
      const recentBookings = await db.collection('bookings')
        .find({})
        .sort({ book_date: -1 })
        .limit(5)
        .toArray();

      const recentPayments = await db.collection('payment')
        .find({})
        .sort({ payment_date: -1 })
        .limit(5)
        .toArray();

      // Get car utilization stats
      const carStats = await db.collection('cars').aggregate([
        {
          $lookup: {
            from: 'bookings',
            localField: '_id',
            foreignField: 'car_id',
            as: 'bookings'
          }
        },
        {
          $project: {
            brand: 1,
            model: 1,
            bookingCount: { $size: '$bookings' }
          }
        },
        { $sort: { bookingCount: -1 } },
        { $limit: 3 }
      ]).toArray();

      res.status(200).json({
        totalRevenue: totalRevenue[0]?.total || 0,
        activeBookings,
        totalCars,
        completionRate,
        recentBookings,
        recentPayments,
        topCars: carStats
      });

    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}