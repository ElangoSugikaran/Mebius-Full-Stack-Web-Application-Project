// Cart routes following the same structure as your existing routes
// This module defines the routes for cart-related operations in an Express application

import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getCartItemCount
} from '../application/cart';

import { isAuthenticated } from '../api/middleware/authentication-middleware';

const cartRouter = express.Router();

console.log('🚀 Cart routes initialized');

// Route definitions following RESTful conventions
// All routes require authentication

// GET /api/cart - Get user's cart
cartRouter.get('/', isAuthenticated, getCart);

// GET /api/cart/count - Get cart item count (for cart badge)
cartRouter.get('/count', isAuthenticated, getCartItemCount);

// POST /api/cart/add - Add item to cart
cartRouter.post('/add', isAuthenticated, addToCart);

// PUT /api/cart/update/:productId - Update cart item quantity
cartRouter.put('/update/:productId', isAuthenticated, updateCartItem);

// DELETE /api/cart/remove/:productId - Remove item from cart
cartRouter.delete('/remove/:productId', isAuthenticated, removeCartItem);

// DELETE /api/cart/clear - Clear entire cart
cartRouter.delete('/clear', isAuthenticated, clearCart);

export default cartRouter;

// Cart routes following the same structure as your existing routes
// This module defines the routes for cart-related operations in an Express application

// import express from 'express';
// import {
//   getCart,
//   addToCart,
//   updateCartItem,
//   removeCartItem,
//   clearCart,
//   getCartItemCount
// } from '../application/cart';

// import { isAuthenticated } from '../api/middleware/authentication-middleware';

// const cartRouter = express.Router();

// console.log('🚀 Cart routes initialized');

// // Route definitions following RESTful conventions
// // All routes require authentication

// // GET /api/cart - Get user's cart
// cartRouter.get('/', isAuthenticated, getCart);

// // GET /api/cart/count - Get cart item count (for cart badge)
// cartRouter.get('/count', isAuthenticated, getCartItemCount);

// // POST /api/cart/add - Add item to cart
// cartRouter.post('/add', isAuthenticated, addToCart);

// // PUT /api/cart/update/:productId - Update cart item quantity
// cartRouter.put('/update/:productId', isAuthenticated, updateCartItem);

// // DELETE /api/cart/remove/:productId - Remove item from cart
// cartRouter.delete('/remove/:productId', isAuthenticated, removeCartItem);

// // DELETE /api/cart/clear - Clear entire cart
// cartRouter.delete('/clear', isAuthenticated, clearCart);

// export default cartRouter;