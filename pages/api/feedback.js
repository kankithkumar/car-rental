// pages/api/feedback.js
import clientPromise from '../../utils/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, comment } = req.body;

    // Basic validation
    if (!userId || !comment) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      const client = await clientPromise;
      const db = client.db('car_rental_db'); // Replace with your database name

      // Verify if the user exists
      const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Create the new feedback document
      const newFeedback = {
        user_id: new ObjectId(userId),
        comment: comment,
        created_at: new Date(), // Add a timestamp
      };

      const result = await db.collection('feedback').insertOne(newFeedback);

      res.status(201).json({ message: 'Feedback submitted successfully', feedbackId: result.insertedId });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  } else if (req.method === 'GET') {
    try {
      const client = await clientPromise;
      const db = client.db('car_rental_db'); // Replace with your database name

      // Fetch all feedback (you might want to limit or paginate this for large datasets)
      const feedback = await db.collection('feedback')
        .find({})
        .sort({ created_at: -1 }) // Sort by newest first
        .toArray();

      // You might want to join with the users collection to display user names
      // For now, we'll return raw feedback data

      res.status(200).json({ feedback });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  }
  else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
