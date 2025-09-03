// 🔧 FIXED: Wishlist controller with better error handling
import Wishlist from '../infrastructure/db/entities/Wishlist';
import Product from '../infrastructure/db/entities/Product';
import ValidationError from "../domain/errors/validation-error";
import NotFoundError from "../domain/errors/not-found-error";
import UnauthorizedError from "../domain/errors/unauthorized-error";
import { Request, Response, NextFunction } from "express";
import { addToWishlistDTO } from '../domain/dto/wishlist';
import { getAuth } from "@clerk/express";

// Helper function like Cart
const getUserId = (req: Request): string | null => {
  try {
    const { userId } = getAuth(req);
    return userId || null;
  } catch (error) {
    return null;
  }
};

// 🔧 FIXED: Get user's wishlist - handle unauthenticated users gracefully
const getWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('💖 Getting wishlist for user...');
    const userId = getUserId(req);
    
    // 🔧 NEW: Return empty wishlist for unauthenticated users instead of error
    if (!userId) {
      console.log('👤 User not authenticated, returning empty wishlist');
      return res.json({
        success: true,
        items: [],           
        totalItems: 0,
        message: 'Guest user - no wishlist',
        isGuest: true
      });
    }
    
    let wishlist = await Wishlist.findOne({ userId }).populate('items.productId');
    
    if (!wishlist) {
      console.log('🆕 Creating new wishlist for user:', userId);
      wishlist = await Wishlist.create({ userId, items: [] });
    }
    
    console.log('✅ Wishlist retrieved successfully:', { itemCount: wishlist.items.length });
    
    res.json({
      success: true,
      items: wishlist.items,           
      totalItems: wishlist.items.length, 
      data: wishlist,
      isGuest: false
    });
  } catch (error) {
    console.error('❌ Error getting wishlist:', error);
    next(error);
  }
};

// Add item to wishlist
const addToWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('💝 Adding item to wishlist:', req.body);
    const userId = getUserId(req);
    
    // Authentication required for adding to wishlist
    if (!userId) {
      throw new UnauthorizedError('Please sign in to add items to your wishlist');
    }
    
    // Validate request body
    const result = addToWishlistDTO.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError('Invalid wishlist item data: ' + result.error.message);
    }
    
    const { productId } = result.data;
    
    // Find product like Cart does
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    
    if (!product.isActive) {
      throw new ValidationError('Product is not available');
    }
    
    // Get or create wishlist
    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [] });
    }
    
    // Check if already exists
    const existingItem = wishlist.items.find(item => 
      item.productId.toString() === productId
    );
    
    if (existingItem) {
      throw new ValidationError('Item already in wishlist');
    }
    
    // Add new item
    wishlist.items.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      finalPrice: product.finalPrice || product.price,
      image: product.image,
      inStock: product.stock > 0,
      addedAt: new Date()
    });
    
    const savedWishlist = await wishlist.save();
    console.log('✅ Added to wishlist successfully');
    
    res.status(201).json({
      success: true,
      message: 'Item added to wishlist successfully',
      data: savedWishlist
    });
  } catch (error) {
    console.error('❌ Error adding to wishlist:', error);
    next(error);
  }
};

// Remove from wishlist
const removeFromWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('🗑️ Removing from wishlist:', req.params.productId);
    const userId = getUserId(req);
    const { productId } = req.params;
    
    if (!userId) {
      throw new UnauthorizedError('Please sign in to manage your wishlist');
    }
    
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      throw new NotFoundError('Wishlist not found');
    }
    
    // Find and remove the specific item
    const itemToRemove = wishlist.items.find(item => 
      item.productId.toString() === productId
    );
    
    if (!itemToRemove) {
      throw new NotFoundError('Item not found in wishlist');
    }
    
    wishlist.items.pull(itemToRemove._id);
    
    const updatedWishlist = await wishlist.save();
    await updatedWishlist.populate('items.productId');
    
    console.log('✅ Item removed from wishlist successfully');
    
    res.json({
      success: true,
      message: 'Item removed from wishlist successfully',
      data: updatedWishlist
    });
  } catch (error) {
    console.error('❌ Error removing from wishlist:', error);
    next(error);
  }
};

// Clear wishlist
const clearWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('🧹 Clearing wishlist...');
    const userId = getUserId(req);
    
    if (!userId) {
      throw new UnauthorizedError('Please sign in to manage your wishlist');
    }
    
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      throw new NotFoundError('Wishlist not found');
    }

    wishlist.items.splice(0, wishlist.items.length);
    const clearedWishlist = await wishlist.save();
    console.log('✅ Wishlist cleared successfully');
    
    res.json({ 
      success: true,
      message: 'Wishlist cleared successfully', 
      data: clearedWishlist 
    });
  } catch (error) {
    console.error('❌ Error clearing wishlist:', error);
    next(error);
  }
};

// 🔧 UNCHANGED: Get wishlist item count - already handles unauthenticated users gracefully
const getWishlistItemCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('💖 Getting wishlist item count...');
    
    const userId = getUserId(req); // This returns null for unauthenticated users
    
    // For unauthenticated users, return 0 count instead of error
    if (!userId) {
      console.log('📊 User not authenticated, returning wishlist count 0');
      return res.json({ 
        success: true,
        itemCount: 0,
        message: 'Guest user - no wishlist'
      });
    }

    // For authenticated users, get actual count
    const wishlist = await Wishlist.findOne({ userId });
    const itemCount = wishlist ? wishlist.items.length : 0;
    
    console.log('📊 Wishlist item count for authenticated user:', itemCount);
    
    res.json({ 
      success: true,
      itemCount,
      message: `Wishlist has ${itemCount} items`
    });
    
  } catch (error) {
    console.error('❌ Error getting wishlist count:', error);
    // Even on error, return graceful response for count endpoint
    res.status(200).json({ 
      success: false,
      itemCount: 0,
      error: 'Failed to get wishlist count',
      message: 'Defaulting to 0 items'
    });
  }
};

export {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  getWishlistItemCount
};