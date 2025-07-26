// pages/api/auth/login.js
import clientPromise from '../../../utils/mongodb';
import bcrypt from 'bcryptjs';
// No frontend imports like useState, useEffect, or CSS modules here

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
      const client = await clientPromise;
      const db = client.db('car_rental_db'); // Replace with your database name

      // Find the user by email
      const user = await db.collection('users').findOne({ email });

      // Check if user exists
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Compare provided password with hashed password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Passwords match, login successful
      // In a real application, you would generate and return a JWT token here
      // For simplicity, we'll return a success message and some user info (excluding password)
      const userWithoutPassword = {
          _id: user._id,
          email: user.email,
          name: user.name,
          is_admin: user.is_admin,
      };

      res.status(200).json({ message: 'Login successful', user: userWithoutPassword });

    } catch (error) {
      console.error("Login API error:", error); // More specific console log
      res.status(500).json({ message: 'Something went wrong' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
