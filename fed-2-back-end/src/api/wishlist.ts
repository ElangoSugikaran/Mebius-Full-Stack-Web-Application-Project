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

// PUBLIC ROUTES (no authentication required)
wishlistRouter.get('/count', asyncHandler(getWishlistItemCount));

// PROTECTED ROUTES (authentication required)
wishlistRouter.get('/', isAuthenticated, asyncHandler(getWishlist));
wishlistRouter.post('/add', isAuthenticated, asyncHandler(addToWishlist));
wishlistRouter.delete('/remove/:productId', isAuthenticated, asyncHandler(removeFromWishlist));
wishlistRouter.delete('/clear', isAuthenticated, asyncHandler(clearWishlist));

export default wishlistRouter;