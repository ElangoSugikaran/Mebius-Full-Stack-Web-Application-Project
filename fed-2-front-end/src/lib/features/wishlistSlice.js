// Simplified wishlistSlice.js - Only for optimistic updates
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  totalItems: 0,
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    // 🔧 FIX: Only keep optimistic update actions
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    
    // 🔧 REMOVE: All the local CRUD operations since we use API now
    // These are only for optimistic UI updates before API responds
    optimisticAdd: (state, action) => {
      const item = action.payload;
      const exists = state.items.some(i => {
        const existingId = i.productId?._id || i.productId;
        const newId = item.productId?._id || item.productId;
        return existingId === newId;
      });
      
      if (!exists) {
        state.items.push({
          ...item,
          addedAt: new Date().toISOString()
        });
        state.totalItems = state.items.length;
      }
    },
    optimisticRemove: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(item => {
        const itemId = item.productId?._id || item.productId;
        return itemId !== productId;
      });
      state.totalItems = state.items.length;
    },
    
    // 🔧 NEW: Sync with server data when API calls complete
    syncWithServer: (state, action) => {
      const serverData = action.payload;
      state.items = serverData.items || [];
      state.totalItems = serverData.totalItems || 0;
      state.loading = false;
      state.error = null;
    }
  },
});

export const {
  setLoading,
  setError,
  clearError,
  optimisticAdd,
  optimisticRemove,
  syncWithServer,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;

// 🔧 UPDATED: Selectors work with server data structure
export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistItemCount = (state) => state.wishlist.totalItems;
export const selectWishlistLoading = (state) => state.wishlist.loading;
export const selectWishlistError = (state) => state.wishlist.error;
export const selectIsInWishlist = (state, productId) => {
  return state.wishlist.items.some(item => {
    const itemId = item.productId?._id || item.productId;
    return itemId === productId;
  });
};