import Review from '../infrastructure/db/entities/review.js';
import Product from '../infrastructure/db/entities/product.js';

const createReview = async (req, res) => {
  const data = req.body;
  // Create a new review in the database
  const newReview = await Review.create({
    review: data.review,
    rating: data.rating,
  });

  // Add the review's ObjectId to the product's reviews array
  await Product.findByIdAndUpdate(
    data.productId,
    { $push: { reviews: newReview._id } }
  );

  res.status(201).json(newReview);
};

export { createReview };
// Export the createReview function to be used in the API routes
// This function handles the creation of a new review and associates it with a product
