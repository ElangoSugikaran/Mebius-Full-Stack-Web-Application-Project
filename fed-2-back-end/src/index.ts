import "dotenv/config"

// Import the Express framework to simplify server and routing logic
import express from 'express';

import productRouter from './api/product'; // Import product routes
import categoryRouter from './api/category'; // Import category routes
import reviewRouter from './api/review'; // Import review routes
import orderRouter from "./api/order"; // Import order routes
import connectDB from './infrastructure/db/index';// Import the database connection function
import globalErrorHandlingMiddleware from "./api/middleware/global-error-handling-middleware";
// Import global error handling middleware to manage errors across the application
import cors from 'cors'; // Import CORS middleware to handle cross-origin requests

// Create an instance of an Express application (the main server object)
const app = express();

// Use middleware to automatically parse incoming JSON request bodies
app.use(express.json());
app.use(cors({origin: "http://localhost:5173"})); // Enable CORS to allow cross-origin requests

// Define the port number where the server will listen for requests
const PORT = process.env.PORT || 8000;

// Use the product router for handling requests to the /api/products endpoint
app.use('/api/products', productRouter);
// Use the category router for handling requests to the /api/categories endpoint
app.use('/api/categories', categoryRouter);
// Use the review router for handling requests to the /api/reviews endpoint
app.use('/api/reviews', reviewRouter);
// Use the order router for handling requests to the /api/orders endpoint
app.use('/api/orders', orderRouter);

app.use(globalErrorHandlingMiddleware); // Use global error handling middleware to catch and respond to errors

connectDB();


// Start the server and listen on the specified port
app.listen(PORT, () => {
  // Log a message to the console when the server is running
  console.log(`Server is running on port http://localhost:${PORT}`)
})