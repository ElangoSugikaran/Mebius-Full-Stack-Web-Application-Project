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
    
    // Create the review with proper userId handling
    const reviewData: any = {
      comment, 
      rating: Number(rating), 
      title, 
      userName, 
      productId,
      verified: false
    };
    
    // Only add userId if it's a valid value
    if (userId && userId !== 'anonymous' && userId !== null && userId !== 'null') {
      reviewData.userId = userId;
    }
    
    const newReview = await Review.create(reviewData);
    
    // 🔥 NEW: Update the product with the new review
    await updateProductReviewStats(productId);
    
    res.status(201).json({
      success: true,
      data: newReview,
      message: 'Review created successfully'
    });
  } catch (error) {
    console.error('Error creating review:', error);
    next(error);
  }
};

// 🔥 NEW: Helper function to update product review statistics
const updateProductReviewStats = async (productId: string) => {
  try {
    // Get all reviews for this product
    const reviews = await Review.find({ productId });
    
    // Calculate average rating
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;
    
    // Update the product with review IDs and average rating
    await Product.findByIdAndUpdate(productId, {
      reviews: reviews.map(review => review._id),
      averageRating: Math.round(averageRating * 10) / 10 // Round to 1 decimal place
    });
    
    console.log(`✅ Updated product ${productId} review stats: ${reviews.length} reviews, ${averageRating.toFixed(1)} avg rating`);
    
  } catch (error) {
    console.error('❌ Error updating product review stats:', error);
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
    
    // 🔥 NEW: Update product stats after deletion
    await updateProductReviewStats(deletedReview.productId.toString());
    
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export { createReview, getReviews, getAllReviews, deleteReview, updateProductReviewStats };
