// utils/mongodb.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

let client;
let clientPromise;

console.log("MongoDB module loaded. Checking for MONGODB_URI."); // Log at the start

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not defined."); // Log missing URI
  throw new Error('Please add your Mongo URI to .env.local');
}

console.log("MONGODB_URI found."); // Log if URI is found

if (process.env.NODE_ENV === 'development') {
  console.log("Running in development mode."); // Log development mode
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR.
  if (!global._mongoClientPromise) {
    console.log("Creating new MongoClient and connecting (development)."); // Log before connecting
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect().catch(err => {
        console.error("MongoDB connection error (development):", err); // Catch and log connection errors
        throw err; // Re-throw the error to halt the process
    });
  }
  clientPromise = global._mongoClientPromise;
  console.log("Using existing clientPromise (development)."); // Log using existing promise
} else {
  console.log("Running in production mode."); // Log production mode
  // In production mode, it's best to not use a global variable.
  console.log("Creating new MongoClient and connecting (production)."); // Log before connecting
  client = new MongoClient(uri, options);
  clientPromise = client.connect().catch(err => {
      console.error("MongoDB connection error (production):", err); // Catch and log connection errors
      throw err; // Re-throw the error to halt the process
  });
}

console.log("MongoDB module initialization complete."); // Log at the end

export default clientPromise;
