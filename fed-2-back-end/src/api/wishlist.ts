import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  getWishlistItemCount
} from '../application/wishlist';
import { isAuthenticated } from './middleware/authentication-middleware';
import { Request, Response, NextFunction } from 'express';

const wishlistRouter = express.Router();

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// 🔧 FIXED: PUBLIC ROUTES (no authentication middleware)
// These handle unauthenticated users gracefully in the controller
wishlistRouter.get('/count', asyncHandler(getWishlistItemCount));
wishlistRouter.get('/', asyncHandler(getWishlist)); // ✅ Made public, handles auth in controller

// 🔧 PROTECTED ROUTES (authentication required)  
// These require authentication because they modify data
wishlistRouter.post('/add', isAuthenticated, asyncHandler(addToWishlist));
wishlistRouter.delete('/remove/:productId', isAuthenticated, asyncHandler(removeFromWishlist));
wishlistRouter.delete('/clear', isAuthenticated, asyncHandler(clearWishlist));

export default wishlistRouter;