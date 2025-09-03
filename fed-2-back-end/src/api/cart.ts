// Update your cart routes - put /count route BEFORE other routes
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

// IMPORTANT: /count route must come FIRST before other routes
cartRouter.get('/count', getCartItemCount); // No auth needed for count

// Other routes with authentication
cartRouter.get('/', isAuthenticated, getCart);
cartRouter.post('/add', isAuthenticated, addToCart);
cartRouter.put('/update/:productId', isAuthenticated, updateCartItem);
cartRouter.delete('/remove/:productId', isAuthenticated, removeCartItem);
cartRouter.delete('/clear', isAuthenticated, clearCart);

export default cartRouter;