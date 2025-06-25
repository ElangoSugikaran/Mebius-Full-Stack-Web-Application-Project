import Review from '../infrastructure/db/entities/review.js';
import Product from '../infrastructure/db/entities/product.js';
import ValidationError from "../domain/errors/validation-error.js";
import NotFoundError from "../domain/errors/not-found-error.js";

// Create a new review and associate it with a product
const createReview = async (req, res, next) => {
  try {
    const { review, rating, productId } = req.body;
    if (!review || !rating || !productId) {
      throw new ValidationError('Review, rating, and productId are required');
    }
    // Create a new review in the database
    const newReview = await Review.create({ review, rating });
    // Add the review's ObjectId to the product's reviews array
    const product = await Product.findByIdAndUpdate(
      productId,
      { $push: { reviews: newReview._id } },
      { new: true }
    );
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    res.status(201).json(newReview);
  } catch (error) {
    next(error);
  }
};

export { createReview };
// This function handles the creation of a new review and associates it with a product
