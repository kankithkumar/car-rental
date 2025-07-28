// pages/api/auth/login.js
import clientPromise from '../../../utils/mongodb';
import bcrypt from 'bcryptjs';
// No frontend imports like useState, useEffect, or CSS modules here

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    console.log('Login attempt for email:', email); // Log the email being used

    // Basic validation
    if (!email || !password) {
        console.log('Validation failed: Email and password are required'); // Log validation failure
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
      const client = await clientPromise;
      const db = client.db('car_rental_db');

      console.log('Connected to database'); // Log successful database connection

      // Find the user by email
      const user = await db.collection('users').findOne({ email });

      console.log('User found:', user); // Log the user object found (or null)

      // Check if user exists
      if (!user) {
        console.log('Authentication failed: User not found'); // Log user not found
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Compare provided password with hashed password
      const isMatch = await bcrypt.compare(password, user.password);

      console.log('Password match:', isMatch); // Log the result of password comparison

      if (!isMatch) {
        console.log('Authentication failed: Password mismatch'); // Log password mismatch
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Passwords match, login successful
      console.log('Login successful for user:', user._id); // Log successful login

      res.setHeader('Set-Cookie', `auth_token=${user._id.toString()}; HttpOnly; Path=/; Secure; SameSite=Strict`); // Use a proper token in a real app

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