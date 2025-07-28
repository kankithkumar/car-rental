// pages/api/cars/index.js
import clientPromise from '../../../utils/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  console.log('API /api/cars received request. Method:', req.method); // API log 1

  if (req.method === 'GET') {
    try {
      console.log('API /api/cars: Handling GET request.'); // API log 2
      console.log('API /api/cars: Request Headers:', req.headers); // API log 3 - Log all headers

      // Read the auth_token cookie
      const cookieHeader = req.headers.cookie;
      console.log('API /api/cars: Received Cookie Header:', cookieHeader); // API log 4

      const cookies = cookieHeader ? cookieHeader.split('; ').reduce((prev, current) => {
          const [name, ...parts] = current.split('=');
          prev[name] = parts.join('=');
          return prev;
      }, {}) : {};

      const authToken = cookies.auth_token;
      console.log('API /api/cars: Extracted authToken:', authToken); // API log 5


      // Basic authentication check: Check if auth_token cookie is present
      if (!authToken) {
          console.log('API /api/cars: Unauthorized - Authentication token missing'); // API log 6
          return res.status(401).json({ message: 'Unauthorized: Authentication token missing' });
      }

      // Optional: Verify if the user ID in the cookie exists in the database (more robust check)
      try {
          const client = await clientPromise;
          const db = client.db('car_rental_db');
          console.log('API /api/cars: Connected to database for user verification.'); // API log 7
          const user = await db.collection('users').findOne({ _id: new ObjectId(authToken) }); // Assuming cookie value is user ID
          console.log('API /api/cars: User found from token:', user); // API log 8


          if (!user) {
              console.log('API /api/cars: Unauthorized - Invalid authentication token (user not found)'); // API log 9
              return res.status(401).json({ message: 'Unauthorized: Invalid authentication token' });
          }
           console.log('API /api/cars: User verification successful.'); // API log 10
      } catch (dbError) {
          console.error("API /api/cars: Error verifying user from auth token:", dbError); // API log 11
          return res.status(500).json({ message: 'Something went wrong during authentication verification' });
      }


      // If authentication passes, proceed to fetch cars
      console.log('API /api/cars: Authentication successful. Fetching cars...'); // API log 12
      const client = await clientPromise;
      const db = client.db('car_rental_db');

      const cars = await db.collection('cars').find({}).toArray();
      console.log('API /api/cars: Cars fetched successfully. Count:', cars.length); // API log 13


      res.status(200).json({ cars });

    } catch (error) {
      console.error("API /api/cars: Fetch cars API error:", error); // API log 14
      res.status(500).json({ message: 'Something went wrong while fetching cars.' });
    }
  } else {
    console.log('API /api/cars: Method Not Allowed:', req.method); // API log 15
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}