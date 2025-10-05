// db.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri: string = process.env.MONGO_URI!; // the ! tells TypeScript it is definitely defined

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // stop the app if we can't connect
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.connection.close();
    console.log('Connection closed');
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
  }
}
