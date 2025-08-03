import express from 'express';
import { createReview, getReviews, getAllReviews, deleteReview } from '../application/review';

const reviewRouter = express.Router();

// Get reviews for a specific product
reviewRouter.get('/products/:id/reviews', getReviews);

// Create a new review
reviewRouter.post('/', createReview);

// Admin routes (optional)
reviewRouter.get('/', getAllReviews); // Get all reviews
reviewRouter.delete('/:id', deleteReview); // Delete a review

export default reviewRouter;