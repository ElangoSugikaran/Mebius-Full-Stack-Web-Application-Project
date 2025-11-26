import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const MONGO_URL = process.env.MONGODB_URL;
    if (!MONGO_URL) {
      throw new Error("MongoDB connection string is not defined");
    }
    await mongoose.connect(MONGO_URL, {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    if (error instanceof Error) {
      console.error("MongoDB connection error:", error.message);
      process.exit(1);
    }
  }
};

export default connectDB;
// This code connects to a MongoDB database using Mongoose.
// It exports a function `connectDB` that attempts to connect to the database