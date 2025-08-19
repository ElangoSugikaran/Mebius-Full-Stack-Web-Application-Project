// 🔧 FIXED: Wishlist routes following Cart pattern
import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  getWishlistItemCount
} from '../application/wishlist';
import { isAuthenticated } from './middleware/authentication-middleware';

const wishlistRouter = express.Router();

console.log('🚀 Wishlist routes initialized');

// ✅ Following same pattern as cart routes
wishlistRouter.get('/', isAuthenticated, getWishlist);
wishlistRouter.get('/count', isAuthenticated, getWishlistItemCount);
wishlistRouter.post('/add', isAuthenticated, addToWishlist);
wishlistRouter.delete('/remove/:productId', isAuthenticated, removeFromWishlist);
wishlistRouter.delete('/clear', isAuthenticated, clearWishlist);

export default wishlistRouter;