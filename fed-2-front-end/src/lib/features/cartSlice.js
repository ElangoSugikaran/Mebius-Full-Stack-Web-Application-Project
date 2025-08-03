import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: [],
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
     // ✅ Your existing action - works fine
    // addToCart: (state, action) => {
    //   const newItem = action.payload;
    //   const foundItem = state.cartItems.find(
    //     (el) => el.product._id === newItem._id
    //   );
    //   if (!foundItem) {
    //     state.cartItems.push({ product: newItem, quantity: 1 });
    //     return;
    //   }
    //   foundItem.quantity += 1;
    // },
    addToCart: (state, action) => {
      const newItem = action.payload;
      
      // 🔧 FIX: Look for existing item by ID
      const existingItemIndex = state.cartItems.findIndex(
        (item) => item.product._id === newItem._id
      );
      
      if (existingItemIndex >= 0) {
        // Item exists, increase quantity
        state.cartItems[existingItemIndex].quantity += 1;
      } else {
        // New item, add to cart with proper structure
        state.cartItems.push({ 
          product: {
            _id: newItem._id,
            name: newItem.name,
            price: parseFloat(newItem.price) || 0,     // 🔧 Ensure number
            discount: parseFloat(newItem.discount) || 0, // 🔧 Ensure number
            image: newItem.image,
            brand: newItem.brand,
            stock: parseInt(newItem.stock) || 0,      // 🔧 Ensure number
          }, 
          quantity: 1 
        });
      }
    },

    // 🆕 NEW: Update quantity of existing item
    updateCartItemQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      
      // Find the item in cart
      const foundItem = state.cartItems.find(
        (item) => item.product._id === productId
      );
      
      // If item exists, update its quantity
      if (foundItem) {
        foundItem.quantity = quantity;
      }
    },

    // 🆕 NEW: Remove item completely from cart
    removeFromCart: (state, action) => {
      const productId = action.payload;
      
      // Filter out the item with matching productId
      state.cartItems = state.cartItems.filter(
        (item) => item.product._id !== productId
      );
    },

    // ✅ Your existing action - works fine
    clearCart: (state) => {
      state.cartItems = [];
    },
  },
});

// Action creators are generated for each case reducer function
export const { addToCart, clearCart, updateCartItemQuantity, removeFromCart } = cartSlice.actions;

export default cartSlice.reducer;