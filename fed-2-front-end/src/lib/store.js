import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./features/cartSlice";
import wishlistReducer from "./features/wishlistSlice";
import { Api } from "./api";
import { setupListeners } from '@reduxjs/toolkit/query'

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer,
    [Api.reducerPath]: Api.reducer,
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(Api.middleware),
})

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch)