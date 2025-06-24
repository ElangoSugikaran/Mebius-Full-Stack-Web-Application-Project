// This file defines product-related API routes and delegates logic to the application layer.

// Import the Express framework for routing
import express from 'express';

import { createReview } from '../application/review.js';

// Create a new router for review-related routes
const reviewRouter = express.Router();

// Define the main route for reviews
reviewRouter
  .route('/')
  .post(createReview); // POST /api/reviews - Adds a new review

// Export the router to be used in the main app
export default reviewRouter;