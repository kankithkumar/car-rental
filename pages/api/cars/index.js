// pages/api/cars/index.js
import clientPromise from '../../../utils/mongodb';
import { ObjectId } from 'mongodb'; // Import ObjectId to validate user ID from cookie

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Read the auth_token cookie
      const cookieHeader = req.headers.cookie;
      const cookies = cookieHeader ? cookieHeader.split('; ').reduce((prev, current) => {
          const [name, ...parts] = current.split('=');
          prev[name] = parts.join('=');
          return prev;
      }, {}) : {};

      const authToken = cookies.auth_token;

      // Basic authentication check: Check if auth_token cookie is present
      if (!authToken) {
          return res.status(401).json({ message: 'Unauthorized: Authentication token missing' });
      }

      // Optional: Verify if the user ID in the cookie exists in the database (more robust check)
      try {
          const client = await clientPromise;
          const db = client.db('car_rental_db');
          const user = await db.collection('users').findOne({ _id: new ObjectId(authToken) }); // Assuming cookie value is user ID

          if (!user) {
              return res.status(401).json({ message: 'Unauthorized: Invalid authentication token' });
          }
      } catch (dbError) {
          console.error("Error verifying user from auth token:", dbError);
          return res.status(500).json({ message: 'Something went wrong during authentication verification' });
      }


      // If authentication passes, proceed to fetch cars
      const client = await clientPromise;
      const db = client.db('car_rental_db'); // Replace with your database name

      console.log(db.collection('cars')); // Added logging

      // Find all cars
      const cars = await db.collection('cars').find({}).toArray();

      console.log(cars); // Added logging

      res.status(200).json({ cars });

    } catch (error) {
      console.error("Fetch cars API error:", error); // More specific error logging
      res.status(500).json({ message: 'Something went wrong while fetching cars.' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
