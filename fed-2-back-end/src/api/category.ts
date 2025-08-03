import express from 'express';

// This file defines category-related API routes and delegates logic to the application layer.

import { getAllCategories,
  getCategoryById,
  createCategory,
  updateCategoryById,
  deleteCategoryById,
  uploadCategoryImageGeneric, 
  putCategoryImage,
} from '../application/category';
// Import the categories data from the data module

// Create a new router for category-related routes
const categoryRouter = express.Router();

// Define the main route for categories
categoryRouter
  .route('/')
  // GET /api/categories - Returns all categories as JSON
  .get(getAllCategories)
  // POST /api/categories - Adds a new category
  .post(createCategory);

categoryRouter
  // Define a route for individual category operations
  .route('/:id')

  // GET /api/categories/:id - Returns a specific category by ID
  .get(getCategoryById)
  // PUT /api/categories/:id - Updates a specific category by ID
  .put(updateCategoryById)
  // DELETE /api/categories/:id - Deletes a specific category by ID
  .delete(deleteCategoryById);


// Image upload routes
categoryRouter.route("/upload-image").post(uploadCategoryImageGeneric);  // For CREATE mode
categoryRouter.route("/:id/image").post(putCategoryImage);           // For EDIT mode


// Export the category router
export default categoryRouter;
