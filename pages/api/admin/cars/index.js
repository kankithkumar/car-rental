// pages/api/admin/cars/index.js
import clientPromise from '../../../../utils/mongodb';
import { ObjectId } from 'mongodb';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs/promises'; // Use fs/promises for async file operations


// Configure formidable
export const config = {
  api: {
    bodyParser: false, // Disable default bodyParser to handle file uploads
  },
};

// Add authentication middleware here to ensure only admins can access this route.

export default async function handler(req, res) {
    // Note: In production, implement proper JWT authentication
    // For now, we'll skip the auth check since it's handled client-side


  if (req.method === 'POST') {
    const form = formidable({});

    try {
       const [fields, files] = await form.parse(req);

       const { make, model, year, color, registration_number, price_per_day, availability_status } = fields;
       const imageFile = files.image ? files.image[0] : null; // Access the uploaded file


        // Basic validation
        if (!make || !model || !year || !color || !registration_number || !price_per_day) {
             // Clean up uploaded file if validation fails
             if (imageFile && imageFile.filepath) {
                 await fs.unlink(imageFile.filepath);
             }
            return res.status(400).json({ message: 'Missing required car details' });
        }


        let image_url = null;
        if (imageFile) {
            // Define the directory to save images (within public folder)
            const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'cars');
            await fs.mkdir(uploadDir, { recursive: true }); // Create directory if it doesn't exist

            // Generate a unique filename
            const filename = `${Date.now()}-${imageFile.originalFilename}`;
            const filePath = path.join(uploadDir, filename);

            // Move the uploaded file to the public directory
            await fs.rename(imageFile.filepath, filePath);

            // Set the image URL to be stored in the database
            image_url = `/uploads/cars/${filename}`;
        }

        const client = await clientPromise;
        const db = client.db('car_rental_db'); // Replace with your database name

         // Optional: Check if registration number already exists
         const existingCar = await db.collection('cars').findOne({ registration_number: registration_number[0] }); // Access value from array
         if (existingCar) {
              // Clean up uploaded file if registration number exists
              if (image_url) {
                  await fs.unlink(path.join(process.cwd(), 'public', image_url));
              }
             return res.status(400).json({ message: 'Car with this registration number already exists.' });
         }


        // Create the new car document
        const newCar = {
          make: make[0], // Access value from array
          model: model[0],
          year: parseInt(year[0]),
          color: color[0],
          registration_number: registration_number[0],
          price_per_day: parseFloat(price_per_day[0]),
          image_url, // Store the generated image URL
          availability_status: availability_status ? availability_status[0] === 'true' : true, // Default to true
        };

        const result = await db.collection('cars').insertOne(newCar);

        res.status(201).json({ message: 'Car added successfully', carId: result.insertedId });

    } catch (error) {
      console.error("Add car API error:", error);
      res.status(500).json({ message: 'Something went wrong with the upload or database operation.' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
