// lib/features/wishlistSlice.js - Redux slice for wishlist management
import { createSlice } from "@reduxjs/toolkit";

// 📝 LEARNING: This is our wishlist state management
// Think of Redux like a global storage box that all components can access

const initialState = {
  items: [], // Array to store all wishlist products
  totalItems: 0, // Count of items in wishlist
};

const wishlistSlice = createSlice({
  name: "wishlist", // Name of this slice
  initialState,
  reducers: {
    // 📝 LEARNING: Reducers are functions that modify our state
    
    // Add product to wishlist
    addToWishlist: (state, action) => {
      const product = action.payload;
      
      // Check if product already exists in wishlist
      const existingItem = state.items.find(item => item._id === product._id);
      
      if (!existingItem) {
        // Add new product to wishlist
        state.items.push({
          _id: product._id,
          name: product.name,
          price: product.price,
          discount: product.discount || 0,
          image: product.image,
          brand: product.brand,
          colors: product.colors,
          sizes: product.sizes,
          stock: product.stock,
          averageRating: product.averageRating,
          addedAt: new Date().toISOString(), // Track when added
        });
        
        // Update total count
        state.totalItems = state.items.length;
      }
    },

    // Remove product from wishlist
    removeFromWishlist: (state, action) => {
      const productId = action.payload;
      
      // Filter out the product with matching ID
      state.items = state.items.filter(item => item._id !== productId);
      
      // Update total count
      state.totalItems = state.items.length;
    },

    // Clear entire wishlist
    clearWishlist: (state) => {
      state.items = [];
      state.totalItems = 0;
    },

    // Move item from wishlist to cart (optional feature)
    moveToCart: (state, action) => {
      const productId = action.payload;
      
      // Remove from wishlist when moved to cart
      state.items = state.items.filter(item => item._id !== productId);
      state.totalItems = state.items.length;
    },
  },
});

// 📝 LEARNING: Export actions so components can use them
export const { 
  addToWishlist, 
  removeFromWishlist, 
  clearWishlist, 
  moveToCart 
} = wishlistSlice.actions;

// 📝 LEARNING: Selectors help us get specific data from state
export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistTotal = (state) => state.wishlist.totalItems;
export const selectIsInWishlist = (state, productId) => 
  state.wishlist.items.some(item => item._id === productId);

// Export the reducer to add to store
export default wishlistSlice.reducer;