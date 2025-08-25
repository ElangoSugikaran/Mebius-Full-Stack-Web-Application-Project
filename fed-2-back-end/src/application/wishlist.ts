// 🔧 FIXED: Wishlist controller following Cart pattern
import Wishlist from '../infrastructure/db/entities/Wishlist';
import Product from '../infrastructure/db/entities/Product';
import ValidationError from "../domain/errors/validation-error";
import NotFoundError from "../domain/errors/not-found-error";
import UnauthorizedError from "../domain/errors/unauthorized-error";
import { Request, Response, NextFunction } from "express";
import { addToWishlistDTO } from '../domain/dto/wishlist';
import { getAuth } from "@clerk/express";

// ✅ Helper function like Cart
const getUserId = (req: Request): string => {
  const { userId } = getAuth(req);
  if (!userId) {
    throw new UnauthorizedError('User not authenticated');
  }
  return userId;
};

// Get user's wishlist
const getWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('💖 Getting wishlist for user...');
    const userId = getUserId(req);
    
    let wishlist = await Wishlist.findOne({ userId }).populate('items.productId');
    
    if (!wishlist) {
      console.log('🆕 Creating new wishlist for user:', userId);
      wishlist = await Wishlist.create({ userId, items: [] });
    }
    
    console.log('✅ Wishlist retrieved successfully:', { itemCount: wishlist.items.length });
    
    res.json({
      success: true,
      data: wishlist
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
    
    // ✅ Validate request body
    const result = addToWishlistDTO.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError('Invalid wishlist item data: ' + result.error.message);
    }
    
    const { productId } = result.data;
    
    // ✅ Find product like Cart does
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
    
    // ✅ Check if already exists
    const existingItem = wishlist.items.find(item => 
      item.productId.toString() === productId
    );
    
    if (existingItem) {
      throw new ValidationError('Item already in wishlist');
    }
    
    // ✅ Add new item
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
    
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      throw new NotFoundError('Wishlist not found');
    }
    
    // 🔧 FIX: Find and remove the specific item
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

// 🔧 FIXED: Get wishlist item count - corrected version
const getWishlistItemCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Getting wishlist item count...');
    
    let userId;
    try {
      const { userId: authUserId } = getAuth(req);
      userId = authUserId;
    } catch (error) {
      console.log('User not authenticated, returning wishlist count 0');
      return res.json({ 
        success: true,
        itemCount: 0 
      });
    }

    if (!userId) {
      return res.json({ 
        success: true,
        itemCount: 0 
      });
    }

    const wishlist = await Wishlist.findOne({ userId });
    const itemCount = wishlist ? wishlist.items.length : 0;
    
    console.log('Wishlist item count:', itemCount);
    
    res.json({ 
      success: true,
      itemCount 
    });
  } catch (error) {
    console.error('Error getting wishlist count:', error);
    // Return 0 instead of throwing error to prevent 500 status
    res.json({ 
      success: false,
      itemCount: 0,
      error: 'Failed to get wishlist count'
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