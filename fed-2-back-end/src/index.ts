import "dotenv/config"

// Import the Express framework to simplify server and routing logic
import express from 'express';

import productRouter from './api/product'; // Import product routes
import categoryRouter from './api/category'; // Import category routes
import reviewRouter from './api/review'; // Import review routes
import orderRouter from "./api/order"; // Import order routes
import wishlistRouter from "./api/wishlist";
import cartRouter from "./api/cart";
import customerRouter from "./api/customer";
import settingsRouter from "./api/settings";
import connectDB from './infrastructure/db/index';// Import the database connection function
import globalErrorHandlingMiddleware from "./api/middleware/global-error-handling-middleware";
import { paymentsRouter } from "./api/payment";
import { handleWebhook } from "./application/payment";
import bodyParser from "body-parser";
// Import global error handling middleware to manage errors across the application
import cors from 'cors'; // Import CORS middleware to handle cross-origin requests
import { clerkMiddleware } from '@clerk/express';// Import Clerk middleware for authentication

// Create an instance of an Express application (the main server object)
const app = express();

// Use middleware to automatically parse incoming JSON request bodies
app.use(express.json());
// Use Clerk middleware for authentication
app.use(clerkMiddleware());
// app.use(cors({origin: process.env.FRONTEND_URL, credentials: true})); // Enable CORS to allow cross-origin requests

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));



// Webhook endpoint must be raw body
app.post(
  "/api/stripe/webhook",
  bodyParser.raw({ type: "application/json" }),
  handleWebhook
);

// Use the product router for handling requests to the /api/products endpoint
app.use('/api/products', productRouter);
// Use the category router for handling requests to the /api/categories endpoint
app.use('/api/categories', categoryRouter);
// Use the review router for handling requests to the /api/reviews endpoint
app.use('/api/reviews', reviewRouter);
// Use the order router for handling requests to the /api/orders endpoint
app.use('/api/orders', orderRouter);

app.use('/api/cart', cartRouter); // ✅ Changed from '/api/carts' to '/api/cart'

app.use("/api/wishlist", wishlistRouter);

app.use("/api/payments", paymentsRouter);

app.use("/api/customers", customerRouter);

app.use('/api/settings', settingsRouter); // Use the settings router for handling requests to the /api/settings endpoint

app.use(globalErrorHandlingMiddleware); // Use global error handling middleware to catch and respond to errors

connectDB();

// Define the port number where the server will listen for requests
const PORT = process.env.PORT || 8000;

// Start the server and listen on the specified port
app.listen(PORT, () => {
  // Log a message to the console when the server is running
  console.log(`Server is running on port ${PORT}`)
})