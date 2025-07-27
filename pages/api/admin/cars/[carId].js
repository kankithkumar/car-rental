// pages/api/admin/cars/[carId].js
import clientPromise from '../../../../utils/mongodb';
import { ObjectId } from 'mongodb';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs/promises';

// Configure formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

// Add authentication middleware here to ensure only admins can access this route.

export default async function handler(req, res) {
    // Basic admin check (replace with proper authentication middleware)
    const loggedInUser = req.headers.authorization ? JSON.parse(Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString()).user : null;
    if (!loggedInUser || !loggedInUser.is_admin) {
        return res.status(403).json({ message: 'Forbidden: Only admins can access this resource' });
    }

    const { carId } = req.query;

    if (req.method === 'GET') { // Add GET request handler
        try {
            const client = await clientPromise;
            const db = client.db('car_rental_db');

            console.log("Fetching car with ID:", carId); // Log the carId

            const car = await db.collection('cars').findOne({ _id: new ObjectId(carId) }); // Use new ObjectId()

            console.log("Fetched car:", car); // Log the fetched car

            if (!car) {
                console.log("Car not found for ID:", carId); // Log if car is not found
                return res.status(404).json({ message: 'Car not found' });
            }

            res.status(200).json({ car }); // Return the car data

        } catch (error) {
            console.error("Fetch car API error:", error); // Log the error in the catch block
            res.status(500).json({ message: 'Something went wrong while fetching car data.' });
        }
    } else if (req.method === 'DELETE') {
        try {
            const client = await clientPromise;
            const db = client.db('car_rental_db');

            const existingCar = await db.collection('cars').findOne({ _id: new ObjectId(carId) }); // Use new ObjectId()
            if (!existingCar) {
                return res.status(404).json({ message: 'Car not found' });
            }

            // Optional: Delete the associated image file when deleting the car
            if (existingCar.image_url) {
                const imagePath = path.join(process.cwd(), 'public', existingCar.image_url);
                try {
                    await fs.unlink(imagePath);
                } catch (unlinkError) {
                    console.error(`Error deleting old image file: ${imagePath}`, unlinkError);
                    // Continue with car deletion even if image deletion fails
                }
            }

            const result = await db.collection('cars').deleteOne({ _id: new ObjectId(carId) }); // Use new ObjectId()

            if (result.deletedCount === 1) {
                res.status(200).json({ message: 'Car deleted successfully' });
            } else {
                res.status(404).json({ message: 'Car not found or could not be deleted' });
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Something went wrong' });
        }
    } else if (req.method === 'PUT') {
        const form = formidable({});

        try {
            const [fields, files] = await form.parse(req);

            const { make, model, year, color, registration_number, price_per_day, availability_status } = fields;
            const imageFile = files.image ? files.image[0] : null;
            const image_url_from_form = fields.image_url ? fields.image_url[0] : null; // Get existing image URL if sent


            // Basic validation
            if (!make || !model || !year || !color || !registration_number || !price_per_day || availability_status === undefined) {
                // Clean up new uploaded file if validation fails
                if (imageFile && imageFile.filepath) {
                    await fs.unlink(imageFile.filepath);
                }
                return res.status(400).json({ message: 'Missing required car details for update' });
            }

            const client = await clientPromise;
            const db = client.db('car_rental_db');

            // Get the current car data to check for existing image and other details
            const currentCar = await db.collection('cars').findOne({ _id: new ObjectId(carId) }); // Use new ObjectId()
            if (!currentCar) {
                // Clean up new uploaded file if car not found
                if (imageFile && imageFile.filepath) {
                    await fs.unlink(imageFile.filepath);
                }
                return res.status(404).json({ message: 'Car not found' });
            }


            // Optional: Check if another car with the same registration number exists (excluding the current car being edited)
            const existingCarWithSameReg = await db.collection('cars').findOne({
                registration_number: registration_number[0],
                _id: { $ne: new ObjectId(carId) } // Use new ObjectId()
            });

            if (existingCarWithSameReg) {
                // Clean up new uploaded file if registration number exists
                if (imageFile && imageFile.filepath) {
                    await fs.unlink(imageFile.filepath);
                }
                return res.status(400).json({ message: 'Another car with this registration number already exists.' });
            }


            let updatedImageUrl = currentCar.image_url || null; // Start with the current image URL

            if (imageFile) {
                // A new image is uploaded

                // Delete the old image if it exists
                if (currentCar.image_url) {
                    const oldImagePath = path.join(process.cwd(), 'public', currentCar.image_url);
                    try {
                        await fs.unlink(oldImagePath);
                    } catch (unlinkError) {
                        console.error(`Error deleting old image file: ${oldImagePath}`, unlinkError);
                        // Continue with the update even if old image deletion fails
                    }
                }

                // Save the new image
                const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'cars');
                await fs.mkdir(uploadDir, { recursive: true });
                const filename = `${Date.now()}-${imageFile.originalFilename}`;
                const filePath = path.join(uploadDir, filename);
                await fs.rename(imageFile.filepath, filePath);
                updatedImageUrl = `/uploads/cars/${filename}`;

            } else if (image_url_from_form === null || image_url_from_form === '') {
                // No new image uploaded, and the image URL field was cleared
                // Delete the old image if it exists
                if (currentCar.image_url) {
                    const oldImagePath = path.join(process.cwd(), 'public', currentCar.image_url);
                    try {
                        await fs.unlink(oldImagePath);
                    } catch (unlinkError) {
                        console.error(`Error deleting old image file: ${oldImagePath}`, unlinkError);
                        // Continue with the update even if old image deletion fails
                    }
                }
                updatedImageUrl = null; // Set image URL to null in the database

            } else {
                // No new image uploaded, and the image URL field was not cleared
                // Keep the existing image URL
                updatedImageUrl = image_url_from_form;
            }


            // Update the car document
            const updateResult = await db.collection('cars').updateOne(
                { _id: new ObjectId(carId) }, // Use new ObjectId()
                {
                    $set: {
                        make: make[0],
                        model: model[0],
                        year: parseInt(year[0]),
                        color: color[0],
                        registration_number: registration_number[0],
                        price_per_day: parseFloat(price_per_day[0]),
                        image_url: updatedImageUrl, // Store the potentially updated image URL
                        availability_status: availability_status ? availability_status[0] === 'true' : true,
                    }
                }
            );

            if (updateResult.modifiedCount === 1) {
                res.status(200).json({ message: 'Car updated successfully' });
            } else if (updateResult.matchedCount === 1) {
                res.status(200).json({ message: 'No changes made to the car' });
            }
            else {
                res.status(404).json({ message: 'Car not found or could not be updated' });
            }

        } catch (error) {
            console.error("Edit car API error:", error);
            res.status(500).json({ message: 'Something went wrong with the update operation.' });
        }

    }
    else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
