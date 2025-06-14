// This file defines product-related API routes and delegates logic to the application layer.

// Import the Express framework for routing
import express from 'express';

import { 
  getAllProducts,
  getProductById,
  createProduct,
  updateProductById,
  deleteProductById,
} from '../application/product.js';

// Create a new router for product-related routes
const productRouter = express.Router();

// Define the main route for products
productRouter
  .route('/')
  // GET /api/products - Returns all products as JSON
  .get(getAllProducts)  
  // POST /api/products - Adds a new product
  .post(createProduct);

productRouter
  // Define a route for individual product operations
  .route('/:id')

  // GET /api/products/:id - Returns a specific product by ID
  .get(getProductById)
  // PUT /api/products/:id - Updates a specific product by ID
  .put(updateProductById)
  // DELETE /api/products/:id - Deletes a specific product by ID
  .delete(deleteProductById);

// Export the router to be used in the main app
export default productRouter;