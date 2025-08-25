import Review from '../infrastructure/db/entities/Review';
import Product from '../infrastructure/db/entities/Product';
import ValidationError from "../domain/errors/validation-error";
import NotFoundError from "../domain/errors/not-found-error";

import { Request, Response, NextFunction } from "express";

// Get reviews for a specific product
const getReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.id;
    
    // Find reviews directly by productId
    const reviews = await Review.find({ productId: productId })
      .sort({ createdAt: -1 }); // Sort by newest first
    
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};

// Create a new review
const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { comment, rating, title, userName, productId, userId } = req.body;
    
    // Validation
    if (!comment || !rating || !title || !userName || !productId) {
      throw new ValidationError('Comment, rating, title, userName, and productId are required');
    }

    if (rating < 1 || rating > 5) {
      throw new ValidationError('Rating must be between 1 and 5');
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Create the review - handle userId properly
    const newReview = await Review.create({ 
      comment, 
      rating, 
      title, 
      userName, 
      productId,
      userId: userId && userId !== 'anonymous' ? userId : null, // Handle anonymous users
      verified: false
    });

    res.status(201).json(newReview);
  } catch (error) {
    next(error);
  }
};

// Get all reviews (admin function)
const getAllReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviews = await Review.find()
      .populate('productId', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};

// Delete a review (admin function)
const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviewId = req.params.id;
    
    const deletedReview = await Review.findByIdAndDelete(reviewId);
    if (!deletedReview) {
      throw new NotFoundError('Review not found');
    }
    
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export { createReview, getReviews, getAllReviews, deleteReview };
