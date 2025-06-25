import "dotenv/config";

// Import the Express framework to simplify server and routing logic
import express from 'express';

import productRouter from './api/product.js'; // Import product routes
import categoryRouter from './api/category.js'; // Import category routes
import reviewRouter from './api/review.js'; // Import review routes
import connectDB from './infrastructure/db/index.js';
import globalErrorHandlingMiddleware from "./api/middleware/global-error-handling-middleware.js";

// Create an instance of an Express application (the main server object)
const app = express();

// Use middleware to automatically parse incoming JSON request bodies
app.use(express.json());

// Define the port number where the server will listen for requests
const Port = 8000;

// Use the product router for handling requests to the /api/products endpoint
app.use('/api/products', productRouter);
// Use the category router for handling requests to the /api/categories endpoint
app.use('/api/categories', categoryRouter);
// Use the review router for handling requests to the /api/reviews endpoint
app.use('/api/reviews', reviewRouter);

app.use(globalErrorHandlingMiddleware); // Use global error handling middleware to catch and respond to errors

connectDB();


// Start the server and listen on the specified port
app.listen(Port, () => {
  // Log a message to the console when the server is running
  console.log(`Server is running on port http://localhost:${Port}`)
})