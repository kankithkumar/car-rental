// pages/api/admin/users.js
import clientPromise from '../../../utils/mongodb';
// In a real app, you would add authentication middleware here
// to ensure only admins can access this route.

export default async function handler(req, res) {
  // Basic check (replace with proper authentication middleware)
  // You would typically verify a JWT and check the user's role
  const loggedInUser = req.headers.authorization ? JSON.parse(Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString()).user : null;
    if (!loggedInUser || !loggedInUser.is_admin) {
        return res.status(403).json({ message: 'Forbidden: Only admins can access this resource' });
    }


  if (req.method === 'GET') {
    try {
      const client = await clientPromise;
      const db = client.db('car_rental_db'); // Replace with your database name

      // Find all users (excluding sensitive info like password)
      const users = await db.collection('users')
        .find({}, { projection: { password: 0 } }) // Exclude password field
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
