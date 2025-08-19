// lib/features/cartSlice.js - FIXED VERSION
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cartItems: [],
  totalQuantity: 0,
  totalAmount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      
      // Check if item already exists (same product, size, color)
      const existingItem = state.cartItems.find(
        item => 
          item.product._id === product._id &&
          item.size === product.size &&
          item.color === product.color
      );

      if (existingItem) {
        // Update quantity if item exists
        existingItem.quantity += 1;
      } else {
        // Add new item to cart
        state.cartItems.push({
          product: {
            _id: product._id,
            name: product.name,
            price: product.price,
            discount: product.discount || 0,
            image: product.image,
            brand: product.brand,
            stock: product.stock,
            sizes: product.sizes,
            colors: product.colors,
          },
          quantity: 1,
          size: product.size || null,
          color: product.color || null,
        });
      }

      cartSlice.caseReducers.calculateTotals(state);
    },

    // 🔧 FIXED: Better removeFromCart with size/color matching
    removeFromCart: (state, action) => {
      const { productId, size, color } = action.payload;
      
      state.cartItems = state.cartItems.filter(item => {
        // Match product ID
        const productMatch = item.product._id !== productId;
        
        // If no size/color specified, remove first match
        if (!size && !color) {
          return productMatch;
        }
        
        // Match size and color if specified
        const sizeMatch = item.size === size;
        const colorMatch = item.color === color;
        
        // Keep items that don't match ALL criteria
        return productMatch || !sizeMatch || !colorMatch;
      });
      
      cartSlice.caseReducers.calculateTotals(state);
    },

    // 🔧 FIXED: Better quantity update with size/color matching
    updateCartItemQuantity: (state, action) => {
      const { productId, quantity, size, color } = action.payload;
      
      const item = state.cartItems.find(item => {
        const productMatch = item.product._id === productId;
        const sizeMatch = (item.size || null) === (size || null);
        const colorMatch = (item.color || null) === (color || null);
        
        return productMatch && sizeMatch && colorMatch;
      });

      if (item) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          state.cartItems = state.cartItems.filter(cartItem => cartItem !== item);
        } else {
          // Update quantity
          item.quantity = quantity;
        }
      }

      cartSlice.caseReducers.calculateTotals(state);
    },

    clearCart: (state) => {
      state.cartItems = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
    },

    // 🔧 FIXED: Better server sync to handle both data formats
    syncCartFromServer: (state, action) => {
      const serverCart = action.payload;
      
      if (serverCart && serverCart.items && Array.isArray(serverCart.items)) {
        state.cartItems = serverCart.items.map(item => {
          // Handle both populated and non-populated product data
          const productData = item.productId || item.product || {};
          
          return {
            product: {
              _id: productData._id || item.productId,
              name: item.name || productData.name,
              price: item.price || productData.price,
              discount: productData.discount || 0,
              image: item.image || productData.image,
              brand: productData.brand,
              stock: item.stock || productData.stock,
            },
            quantity: item.quantity || 1,
            size: item.size || null,
            color: item.color || null,
          };
        });
      }

      cartSlice.caseReducers.calculateTotals(state);
    },

    calculateTotals: (state) => {
      let totalQuantity = 0;
      let totalAmount = 0;

      state.cartItems.forEach(item => {
        const quantity = item.quantity || 1;
        const price = parseFloat(item.product.price) || 0;
        const discount = parseFloat(item.product.discount) || 0;
        
        // Calculate final price after discount
        const finalPrice = discount > 0 
          ? price * (1 - discount / 100) 
          : price;

        totalQuantity += quantity;
        totalAmount += finalPrice * quantity;
      });

      state.totalQuantity = totalQuantity;
      state.totalAmount = parseFloat(totalAmount.toFixed(2));
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  syncCartFromServer,
  calculateTotals,
} = cartSlice.actions;

export default cartSlice.reducer;