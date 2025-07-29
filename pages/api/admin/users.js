// pages/api/admin/users.js
import clientPromise from '../../../utils/mongodb';
// In a real app, you would add authentication middleware here
// to ensure only admins can access this route.

export default async function handler(req, res) {
  // Note: In production, implement proper JWT authentication
  // For now, we'll skip the auth check since it's handled client-side


  if (req.method === 'GET') {
    try {
      const client = await clientPromise;
      const db = client.db('car_rental_db'); // Replace with your database name

      // Find only normal users (non-admin) excluding sensitive info like password
      const users = await db.collection('users')
        .find({ is_admin: { $ne: true } }, { projection: { password: 0 } }) // Exclude admins and password field
        .toArray();

      res.status(200).json({ users });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
