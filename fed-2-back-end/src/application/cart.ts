// This module defines the cart-related operations following the same structure as products.js
// Following Clean Architecture and Domain-Driven Design patterns

import Cart from '../infrastructure/db/entities/Cart';
import Product from '../infrastructure/db/entities/Product';
import ValidationError from "../domain/errors/validation-error";
import NotFoundError from "../domain/errors/not-found-error";
import UnauthorizedError from "../domain/errors/unauthorized-error";
import { Request, Response, NextFunction } from "express";
import { addToCartDTO, updateCartItemDTO } from '../domain/dto/cart';
import { getAuth } from "@clerk/express";


// 🔧 FIXED: Replace the existing getUserId function with this
const getUserId = (req: Request): string => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      throw new UnauthorizedError('User not authenticated');
    }
    return userId;
  } catch (error) {
    console.error('❌ Authentication error:', error);
    throw new UnauthorizedError('User not authenticated');
  }
};

// Get user's cart
// 🔧 FIXED: Replace the entire getCart function
const getCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('📦 Getting cart for user...');
    const userId = getUserId(req); // This will throw error if not authenticated
    
    let cart = await Cart.findOne({ userId }).populate('items.productId');
    
    // Create empty cart if it doesn't exist
    if (!cart) {
      console.log('🆕 Creating new cart for user:', userId);
      cart = await Cart.create({ userId, items: [] });
      await cart.populate('items.productId'); // Populate the new cart too
    }
    
    console.log('✅ Cart retrieved successfully:', { 
      itemCount: cart.items.length, 
      totalAmount: cart.totalAmount 
    });
    
    res.json({
      success: true,
      data: {
        items: cart.items,
        totalAmount: cart.totalAmount,
        totalItems: cart.totalItems
      }
    });
  } catch (error) {
    console.error('❌ Error getting cart:', error);
    next(error);
  }
};

// Add item to cart
const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('🛒 Adding item to cart:', req.body);
    const userId = getUserId(req);
    
    // Validate request body against DTO schema
    const result = addToCartDTO.safeParse(req.body);
    if (!result.success) {
      console.log('❌ Validation failed:', result.error);
      throw new ValidationError('Invalid cart item data: ' + result.error.message);
    }
    
    const { productId, quantity, size, color } = result.data;
    
    // Find the product to get current details
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    
    // Check if product is active
    if (!product.isActive) {
      throw new ValidationError('Product is not available');
    }
    
    // Check stock availability
    if (product.stock < quantity) {
      throw new ValidationError(`Insufficient stock available. Only ${product.stock} items left.`);
    }
    
    // Get or create user's cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }
    
    // Check if item already exists in cart (same product, size, color)
    const existingItemIndex = cart.items.findIndex(item => 
      item.productId.toString() === productId && 
      item.size === size && 
      item.color === color
    );
    
    if (existingItemIndex > -1) {
      // Update existing item quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      // Check stock for new total quantity
      if (newQuantity > product.stock) {
        throw new ValidationError(`Not enough stock available. Only ${product.stock} items in stock.`);
      }
      
      cart.items[existingItemIndex].quantity = newQuantity;
      console.log('📈 Updated existing item quantity:', newQuantity);
    } else {
      // Add new item to cart
      cart.items.push({
        productId: product._id as any,
        name: product.name,
        price: product.price,
        finalPrice: product.finalPrice || product.price,
        image: product.image,
        quantity,
        size,
        color,
        stock: product.stock
      });
      console.log('🆕 Added new item to cart');
    }
    
    const savedCart = await cart.save();
    console.log('✅ Cart saved successfully:', { 
      itemCount: savedCart.items.length, 
      totalAmount: savedCart.totalAmount 
    });
    
    res.status(201).json({
      success: true,
      message: 'Item added to cart successfully',
      data: savedCart
    });
  } catch (error) {
    console.error('❌ Error adding to cart:', error);
    next(error);
  }
};

// 🔧 FIXED: Remove item from cart with proper query parameter handling
const removeCartItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('🗑️ Removing item from cart:', { 
      productId: req.params.productId, 
      query: req.query 
    });
    
    const userId = getUserId(req);
    const { productId } = req.params;
    
    // 🔧 CRITICAL FIX: Handle query parameters as strings and convert properly
    let size: string | undefined = req.query.size as string | undefined;
    let color: string | undefined = req.query.color as string | undefined;
    
    // Convert string 'undefined' to actual undefined
    size = (size === 'undefined' || size === '') ? undefined : size;
    color = (color === 'undefined' || color === '') ? undefined : color;
    
    console.log('📊 Parsed removal params:', { productId, size, color });
    
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new NotFoundError('Cart not found');
    }
    
    console.log('📦 Current cart items before removal:', cart.items.length);
    
    // 🔧 CRITICAL FIX: Better filtering logic
    const initialLength = cart.items.length;
    
      const itemsToRemove = cart.items.filter(item => {
      const productMatch = item.productId.toString() === productId;
      const sizeMatch = (size === undefined && item.size === undefined) || (size !== undefined && item.size === size);
      const colorMatch = (color === undefined && item.color === undefined) || (color !== undefined && item.color === color);
      return productMatch && sizeMatch && colorMatch;
    });

    if (itemsToRemove.length === 0) {
      console.log('❌ No matching item found to remove');
      throw new NotFoundError('Item not found in cart with specified variant');
    }

    // Remove items using Mongoose DocumentArray methods
    itemsToRemove.forEach(itemToRemove => {
      cart.items.pull(itemToRemove._id);
    });

console.log(`📊 Removed ${itemsToRemove.length} item(s)`);
    
    if (cart.items.length === initialLength) {
      console.log('❌ No matching item found to remove');
      throw new NotFoundError('Item not found in cart with specified variant');
    }
    
    console.log(`📊 Removed ${initialLength - cart.items.length} item(s)`);
    
    // Save and populate
    const updatedCart = await cart.save();
    await updatedCart.populate('items.productId');
    
    console.log('✅ Item removed from cart successfully');
    
    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: updatedCart
    });
  } catch (error) {
    console.error('❌ Error removing cart item:', error);
    next(error);
  }
};

// 🔧 FIXED: Update cart item with better parameter handling
const updateCartItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('🔄 Updating cart item:', { 
      productId: req.params.productId, 
      body: req.body 
    });
    
    const userId = getUserId(req);
    const { productId } = req.params;
    
    // Validate only the body data (quantity, size, color)
    const result = updateCartItemDTO.safeParse(req.body);
    if (!result.success) {
      console.log('❌ Validation failed:', result.error.message);
      throw new ValidationError('Invalid update data: ' + result.error.message);
    }
    
    const { quantity, size, color } = result.data;
    
    console.log('📊 Parsed data:', { productId, quantity, size, color });
    
    // Get user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new NotFoundError('Cart not found');
    }
    
    // 🔧 CRITICAL FIX: Better item finding logic
    const itemIndex = cart.items.findIndex(item => {
      const productMatch = item.productId.toString() === productId;
      
      // Handle undefined values properly
      const sizeMatch = (size === undefined && item.size === undefined) || 
                       (size !== undefined && item.size === size);
      const colorMatch = (color === undefined && item.color === undefined) || 
                        (color !== undefined && item.color === color);
      
      console.log('🔍 Checking item:', {
        productId: item.productId.toString(),
        itemSize: item.size,
        itemColor: item.color,
        targetSize: size,
        targetColor: color,
        matches: { productMatch, sizeMatch, colorMatch }
      });
      
      return productMatch && sizeMatch && colorMatch;
    });
    
    if (itemIndex === -1) {
      console.log('❌ Item not found in cart');
      throw new NotFoundError('Item not found in cart with specified variant');
    }
    
    console.log('✅ Found item at index:', itemIndex);
    
    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.items.splice(itemIndex, 1);
      console.log('🗑️ Removed item from cart');
    } else {
      // Verify stock availability
      const product = await Product.findById(productId);
      if (!product) {
        throw new NotFoundError('Product not found');
      }
      
      if (quantity > product.stock) {
        throw new ValidationError(`Insufficient stock available. Only ${product.stock} items left.`);
      }
      
      // Update item quantity and current product details
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].price = product.price;
      cart.items[itemIndex].finalPrice = product.finalPrice || product.price;
      cart.items[itemIndex].stock = product.stock;
      console.log('📊 Updated item quantity to:', quantity);
    }
    
    // Save and populate the cart properly
    const updatedCart = await cart.save();
    await updatedCart.populate('items.productId');
    
    console.log('✅ Cart updated and saved successfully');
    
    res.json({
      success: true,
      message: 'Cart item updated successfully',
      data: updatedCart
    });
  } catch (error) {
    console.error('❌ Error updating cart item:', error);
    next(error);
  }
};

// Clear entire cart
const clearCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('🧹 Clearing cart...');
    const userId = getUserId(req);
    
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new NotFoundError('Cart not found');
    }
    
   cart.items.splice(0, cart.items.length); 
    const clearedCart = await cart.save();
    console.log('✅ Cart cleared successfully');
    
    res.json({ 
      success: true,
      message: 'Cart cleared successfully', 
      data: clearedCart 
    });
  } catch (error) {
    console.error('❌ Error clearing cart:', error);
    next(error);
  }
};

// Get cart item count (useful for cart badge)
const getCartItemCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    
    // Return 0 for non-authenticated users instead of throwing error
    if (!userId) {
      return res.json({ 
        success: true,
        itemCount: 0 
      });
    }
    
    const cart = await Cart.findOne({ userId });
    const itemCount = cart ? cart.totalItems : 0;
    
    console.log('📊 Cart item count for user', userId, ':', itemCount);
    
    res.json({ 
      success: true,
      itemCount 
    });
  } catch (error) {
    console.error('❌ Error getting cart count:', error);
    
    // Return 0 instead of throwing error to prevent 500 status
    res.json({ 
      success: false,
      itemCount: 0,
      error: 'Failed to get cart count'
    });
  }
};

export {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getCartItemCount
};