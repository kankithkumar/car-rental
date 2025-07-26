// pages/api/admin/users/[userId].js
import clientPromise from '../../../../utils/mongodb';
import { ObjectId } from 'mongodb';
// Add authentication middleware here to ensure only admins can access this route.

export default async function handler(req, res) {
    // Basic admin check (replace with proper authentication middleware)
    const loggedInUser = req.headers.authorization ? JSON.parse(Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString()).user : null;
    if (!loggedInUser || !loggedInUser.is_admin) {
        return res.status(403).json({ message: 'Forbidden: Only admins can access this resource' });
    }

  const { userId } = req.query; // Get the user ID from the URL query parameters

  if (req.method === 'DELETE') {
    // Basic validation
    if (!userId) {
      return res.status(400).json({ message: 'User ID is missing' });
    }

    try {
      const client = await clientPromise;
      const db = client.db('car_rental_db'); // Replace with your database name

       // Optional: Check if the user exists before attempting deletion
       const existingUser = await db.collection('users').findOne({ _id: ObjectId(userId) });
       if (!existingUser) {
           return res.status(404).json({ message: 'User not found' });
       }

       // Prevent admin from deleting themselves (optional but recommended)
        if (loggedInUser._id === userId) {
            return res.status(400).json({ message: 'Cannot delete your own admin account.' });
        }


      // Delete the user
      const result = await db.collection('users').deleteOne({ _id: ObjectId(userId) });

      if (result.deletedCount === 1) {
        res.status(200).json({ message: 'User deleted successfully' });
      } else {
        res.status(404).json({ message: 'User not found or could not be deleted' });
      }

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
