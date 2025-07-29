import clientPromise from '../../../../utils/mongodb';
import { ObjectId } from 'mongodb';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs/promises';

// Disable default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

// Utility to promisify formidable
function parseForm(req) {
  const form = formidable();
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve([fields, files]);
    });
  });
}

export default async function handler(req, res) {
  // Note: In production, implement proper JWT authentication
  // For now, we'll skip the auth check since it's handled client-side

  const { carId } = req.query;

  if (!ObjectId.isValid(carId)) {
    return res.status(400).json({ message: 'Invalid car ID' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('car_rental_db');

    if (req.method === 'GET') {
      const car = await db.collection('cars').findOne({ _id: new ObjectId(carId) });
      if (!car) return res.status(404).json({ message: 'Car not found' });
      return res.status(200).json({ car });
    }

    if (req.method === 'DELETE') {
      const car = await db.collection('cars').findOne({ _id: new ObjectId(carId) });
      if (!car) return res.status(404).json({ message: 'Car not found' });

      if (car.image_url) {
        const imagePath = path.join(process.cwd(), 'public', car.image_url);
        try {
          await fs.unlink(imagePath);
        } catch (err) {
          console.warn("Failed to delete image:", err.message);
        }
      }

      await db.collection('cars').deleteOne({ _id: new ObjectId(carId) });
      return res.status(200).json({ message: 'Car deleted successfully' });
    }

    if (req.method === 'PUT') {
      const [fields, files] = await parseForm(req);

      const {
        make,
        model,
        year,
        color,
        registration_number,
        price_per_day,
        availability_status,
        image_url: image_url_from_form
      } = fields;

      const imageFile = files.image ? files.image[0] : null;

      if (
        !make || !model || !year || !color || !registration_number || !price_per_day ||
        availability_status === undefined
      ) {
        if (imageFile && imageFile.filepath) await fs.unlink(imageFile.filepath);
        return res.status(400).json({ message: 'Missing required car details for update' });
      }

      const currentCar = await db.collection('cars').findOne({ _id: new ObjectId(carId) });
      if (!currentCar) {
        if (imageFile && imageFile.filepath) await fs.unlink(imageFile.filepath);
        return res.status(404).json({ message: 'Car not found' });
      }

      const existingCarWithSameReg = await db.collection('cars').findOne({
        registration_number: registration_number[0],
        _id: { $ne: new ObjectId(carId) }
      });
      if (existingCarWithSameReg) {
        if (imageFile && imageFile.filepath) await fs.unlink(imageFile.filepath);
        return res.status(400).json({ message: 'Another car with this registration number already exists.' });
      }

      let updatedImageUrl = currentCar.image_url || null;

      if (imageFile) {
        if (currentCar.image_url) {
          const oldImagePath = path.join(process.cwd(), 'public', currentCar.image_url);
          try {
            await fs.unlink(oldImagePath);
          } catch (err) {
            console.warn("Failed to delete old image:", err.message);
          }
        }

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'cars');
        await fs.mkdir(uploadDir, { recursive: true });
        const filename = `${Date.now()}-${imageFile.originalFilename}`;
        const filePath = path.join(uploadDir, filename);
        await fs.rename(imageFile.filepath, filePath);
        updatedImageUrl = `/uploads/cars/${filename}`;
      } else if (image_url_from_form === null || image_url_from_form === '') {
        if (currentCar.image_url) {
          const oldImagePath = path.join(process.cwd(), 'public', currentCar.image_url);
          try {
            await fs.unlink(oldImagePath);
          } catch (err) {
            console.warn("Failed to delete old image (cleared):", err.message);
          }
        }
        updatedImageUrl = null;
      }

      const updateResult = await db.collection('cars').updateOne(
        { _id: new ObjectId(carId) },
        {
          $set: {
            make: make[0],
            model: model[0],
            year: parseInt(year[0]),
            color: color[0],
            registration_number: registration_number[0],
            price_per_day: parseFloat(price_per_day[0]),
            availability_status: availability_status[0] === 'true',
            image_url: updatedImageUrl,
          },
        }
      );

      if (updateResult.modifiedCount === 1) {
        return res.status(200).json({ message: 'Car updated successfully' });
      } else {
        return res.status(200).json({ message: 'No changes made to the car' });
      }
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ message: 'Something went wrong on the server.' });
  }
}
