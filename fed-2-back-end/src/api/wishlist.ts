// Update your wishlist routes - put /count route BEFORE authenticated routes
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
// Public routes first (no auth needed)
wishlistRouter.get('/count', asyncHandler(getWishlistItemCount));

// Then authenticated routes
wishlistRouter.use(isAuthenticated); // Apply auth to all routes below
wishlistRouter.get('/', asyncHandler(getWishlist));
wishlistRouter.post('/add', asyncHandler(addToWishlist));
wishlistRouter.delete('/remove/:productId', asyncHandler(removeFromWishlist));
wishlistRouter.delete('/clear', asyncHandler(clearWishlist));
export default wishlistRouter;