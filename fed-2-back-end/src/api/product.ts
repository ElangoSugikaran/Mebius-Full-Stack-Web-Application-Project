// This file defines product-related API routes and delegates logic to the application layer.

// Import the Express framework for routing
import express from 'express';

import { 
  getAllProducts,
  getProductById,
  createProduct,
  updateProductById,
  deleteProductById,
  uploadProductImage,
  uploadProductImageGeneric,
  getProductsForSearchQuery,
  getFilterOptions,        // NEW
  getFilteredProducts,     // NEW
  getFeaturedProducts
} from '../application/product';
import { isAuthenticated } from './middleware/authentication-middleware';
import { isAdmin } from './middleware/authorization-middleware'; // Import the admin authorization middleware
// Create a new router for product-related routes
const productRouter = express.Router();

// Define the main route for products
productRouter
  .route('/')
  // GET /api/products - Returns all products as JSON
  .get( getAllProducts)
  // POST /api/products - Adds a new product
  .post( isAuthenticated, isAdmin, createProduct );

  // Search endpoint - MUST come before /:id route
  productRouter.get("/search", getProductsForSearchQuery);

  // NEW: Get available filter options
  productRouter.get("/filter-options", getFilterOptions);

  // NEW: Get filtered products
  productRouter.get("/filtered", getFilteredProducts);

  // NEW: Get featured products - MUST come before /:id route
  productRouter.get("/featured", getFeaturedProducts);  

productRouter
  // Define a route for individual product operations
  .route('/:id')

  // GET /api/products/:id - Returns a specific product by ID
  .get(getProductById)
  // PUT /api/products/:id - Updates a specific product by ID
  .put(updateProductById)
  // DELETE /api/products/:id - Deletes a specific product by ID
  .delete(deleteProductById);


// Image upload routes
productRouter.route("/upload-image").post(uploadProductImageGeneric);  // For CREATE mode
productRouter.route("/:id/image").post(uploadProductImage);           // For EDIT mode

// Export the router to be used in the main app
export default productRouter;