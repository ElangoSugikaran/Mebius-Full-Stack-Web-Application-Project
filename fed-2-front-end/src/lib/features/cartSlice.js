import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  cartItems: [],
}

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      // Logic to add an item to the cart
      //  console.log(action.payload);
      const newItem = action.payload;
      // Check if the item already exists in the cart
      const existingItem = state.cartItems.find(item => item.product._id === newItem._id);
    //   if (existingItem) {
    //     // If the item exists, update its quantity
    //     existingItem.quantity += newItem.quantity;
    //   } else {
    //     // If the item doesn't exist, add it to the cart
    //     state.cartItems.push(newItem);
    //   }
    if (!existingItem) {
        // If the item doesn't exist, add it to the cart
        state.cartItems.push({ product: action.payload, quantity: 1 });
        return;
      }
        // If the item exists, increment its quantity
        existingItem.quantity += 1;
    },
    clearCart: (state) => {
        state.cartItems = [];
    }
  },
})

// Action creators are generated for each case reducer function
export const { addToCart, clearCart } = cartSlice.actions

export default cartSlice.reducer
