// 🔧 FIXED: Wishlist routes with better error handling
import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  getWishlistItemCount
} from '../application/wishlist';
import { isAuthenticated } from './middleware/authentication-middleware';
// 🔧 FIX: Add try-catch wrapper for async routes with proper TypeScript types
import { Request, Response, NextFunction } from 'express';

const wishlistRouter = express.Router();

console.log('🚀 Wishlist routes initialized');

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// ✅ Following same pattern as cart routes with error handling
wishlistRouter.get('/', isAuthenticated, asyncHandler(getWishlist));
wishlistRouter.get('/count', asyncHandler(getWishlistItemCount)); // No auth needed for count
wishlistRouter.post('/add', isAuthenticated, asyncHandler(addToWishlist));
wishlistRouter.delete('/remove/:productId', isAuthenticated, asyncHandler(removeFromWishlist));
wishlistRouter.delete('/clear', isAuthenticated, asyncHandler(clearWishlist));

export default wishlistRouter;