import mongoose from 'mongoose';

/**
 * Connects to MongoDB Atlas using the URI from environment variables.
 * Exits the process if the connection fails.
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Atlas connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};
