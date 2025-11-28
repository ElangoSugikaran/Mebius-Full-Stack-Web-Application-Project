// 🔧 FIXED: Updated api.js with consolidated endpoints and no duplicate properties
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_BASE_URL;
// console.log('🔍 API Base URL:', BASE_URL);

export const Api = createApi({
  reducerPath: "Api",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api`,
    prepareHeaders: async (headers) => {
      return new Promise((resolve) => {
        async function checkToken() {
          const clerk = window.Clerk;
          if (clerk) {
            const token = await clerk.session?.getToken();
            if (token) {
              headers.set("Authorization", `Bearer ${token}`);
            }
            resolve(headers);
          } else {
            // If Clerk is not ready, try again
            setTimeout(checkToken, 500);
          }
        }
        checkToken();
      });
    },
  }),
  tagTypes: ['Product', 'Review', 'Order', 'Cart', 'Wishlist', 'Customer', 'Settings'],
  endpoints: (build) => ({
    // 🔧 PRODUCT ENDPOINTS
    getAllProducts: build.query({
      query: () => `/products`,
      providesTags: ['Product'],
    }),
    getProductsBySearch: build.query({
      query: (query) => `/products/search?search=${query}`,
    }),
    getProductById: build.query({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    // 🔧 NEW: Get featured products only (isFeatured: true)
    getFeaturedProducts: build.query({
      query: () => `/products/featured`,
      providesTags: ['Product'],
      transformResponse: (response) => {
        // console.log('✅ Featured products fetched:', response);
        // Handle both array and object responses
        if (Array.isArray(response)) {
          return response;
        }
        return response.data || response;
      },
      // Keep cache for 10 minutes since featured products don't change frequently
      keepUnusedDataFor: 600,
    }),
    createProduct: build.mutation({
      query: (product) => ({
        url: "/products",
        method: "POST",
        body: product,
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: build.mutation({
      query: ({ id, ...product }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body: product,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }],
    }),
    deleteProduct: build.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Product'],
    }),

    // 🔧 NEW: Get available filter options from database
    getFilterOptions: build.query({
      query: () => '/products/filter-options',
      providesTags: ['Product'],
      transformResponse: (response) => {
        // console.log('✅ Filter options fetched:', response);
        return response.data || response;
      },
      keepUnusedDataFor: 600,
    }),

    // 🔧 NEW: Get filtered products with query parameters
    getFilteredProducts: build.query({
      query: (filters) => {
        // Build query string from filters object
        const params = new URLSearchParams();

        // Add array filters
        if (filters.categories?.length > 0) {
          params.append('categories', filters.categories.join(','));
        }
        if (filters.brands?.length > 0) {
          params.append('brands', filters.brands.join(','));
        }
        if (filters.sizes?.length > 0) {
          params.append('sizes', filters.sizes.join(','));
        }
        if (filters.colors?.length > 0) {
          params.append('colors', filters.colors.join(','));
        }
        if (filters.gender?.length > 0) {
          params.append('gender', filters.gender.join(','));
        }

        // Add price range
        if (filters.priceRange) {
          params.append('minPrice', filters.priceRange[0].toString());
          params.append('maxPrice', filters.priceRange[1].toString());
        }

        // Add boolean filters
        if (filters.inStock) {
          params.append('inStock', 'true');
        }
        if (filters.onSale) {
          params.append('onSale', 'true');
        }

        // Add sorting
        if (filters.sortBy) {
          params.append('sortBy', filters.sortBy);
          params.append('sortOrder', filters.sortOrder || 'asc');
        }

        const queryString = params.toString();
        // console.log('🔍 Filtering products with:', queryString);

        return `/products/filtered?${queryString}`;
      },
      providesTags: ['Product'],
      transformResponse: (response) => {
        // console.log('✅ Filtered products fetched:', response);
        return response.data || response;
      },
      // Keep cache for 5 minutes to avoid frequent DB calls
      keepUnusedDataFor: 300,
    }),

    // 🔧 CATEGORY ENDPOINTS
    getAllCategories: build.query({
      query: () => `/categories`,
      keepUnusedDataFor: 600,
    }),
    getCategoryById: build.query({
      query: (id) => `/categories/${id}`,
    }),
    createCategory: build.mutation({
      query: (category) => ({
        url: "/categories",
        method: "POST",
        body: category,
      }),
    }),
    updateCategory: build.mutation({
      query: ({ id, ...category }) => ({
        url: `/categories/${id}`,
        method: "PUT",
        body: category,
      }),
    }),
    deleteCategory: build.mutation({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
    }),

    // 🔧 REVIEW ENDPOINTS
    getProductReviews: build.query({
      query: (id) => `/reviews/products/${id}/reviews`,
      providesTags: (result, error, id) => [{ type: 'Review', id }],
    }),
    createReview: build.mutation({
      query: (reviewData) => ({
        url: "/reviews",
        method: "POST",
        body: reviewData,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Review', id: productId },
        { type: 'Product', id: productId }
      ],
    }),
    deleteReview: build.mutation({
      query: (reviewId) => ({
        url: `/reviews/${reviewId}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Review'],
    }),

    // 🔧 PAYMENT ENDPOINTS
    getCheckoutSessionStatus: build.query({
      query: (sessionId) => `/payments/session-status?session_id=${sessionId}`,
    }),

    // 🔧 CUSTOMER ORDER ENDPOINTS
    getUserOrders: build.query({
      query: () => '/orders',  // ✅ Correct: GET /api/orders
      providesTags: ['Order'],
      transformResponse: (response) => {
        // console.log('📦 getUserOrders API response:', response);

        // Handle different response structures
        let orders = [];
        if (Array.isArray(response)) {
          orders = response;
        } else if (response.orders && Array.isArray(response.orders)) {
          orders = response.orders;
        } else if (response.data && Array.isArray(response.data)) {
          orders = response.data;
        } else if (response.success && response.orders) {
          orders = response.orders;
        }

        // console.log(`✅ Processed ${orders.length} user orders with user info`);

        // Return consistent structure
        return {
          orders: orders,
          count: orders.length,
          success: true,
          isEmpty: orders.length === 0
        };
      },
      transformErrorResponse: (response, meta, arg) => {
        console.error('❌ getUserOrders fetch error:', {
          status: response?.status,
          data: response?.data,
          message: response?.data?.message || 'Failed to fetch orders'
        });

        return {
          ...response,
          message: response?.data?.message || 'Failed to fetch your orders. Please try again.'
        };
      }
    }),

    //  ADMIN: Get all orders
    getAllOrders: build.query({
      query: () => '/admin/orders',
      providesTags: ['Order'],
    }),

    //  ADMIN: Get order by ID
    getOrderById: build.query({
      query: (id) => `/admin/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),

    // 🔧 Customer order by ID
    getCustomerOrderById: build.query({
      query: (id) => `/orders/${id}`,
    }),

    createOrder: build.mutation({
      query: (order) => ({
        url: "/orders",
        method: "POST",
        body: order,
      }),
      invalidatesTags: ['Order', 'Cart'],
    }),

    //  Update order status (used after payment completion)
    // updateOrderStatus: build.mutation({
    //   query: ({ orderId, status, orderStatus, id, isPaymentComplete, ...rest }) => {
    //     const targetId = orderId || id;
    //     return {
    //       url: `/orders/${targetId}`,
    //       method: "PUT",
    //       body: { 
    //         status: status || orderStatus,
    //         orderStatus: orderStatus || status,
    //         isPaymentComplete,
    //         ...rest
    //       },
    //     };
    //   },
    //   invalidatesTags: ['Order'],
    // }),
    // Add separate mutation for payment completion
    updateOrderStatusAfterPayment: build.mutation({
      query: ({ orderId }) => ({
        url: `/orders/${orderId}/payment-complete`,
        method: "PUT",
        body: { 
          orderStatus: 'CONFIRMED',
          paymentStatus: 'PAID'
        },
      }),
      invalidatesTags: ['Order'],
    }),

    //  Cancel order (customer can cancel their order)
    cancelOrder: build.mutation({
      query: (orderId) => ({
        url: `/orders/${orderId}/cancel`,
        method: 'PUT',
      }),
      invalidatesTags: ['Order'],
    }),

    // 🔧 CART ENDPOINTS
    getCart: build.query({
      query: () => '/cart',
      providesTags: ['Cart'],
      transformResponse: (response) => {
        return response.data || response;
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          // console.log('✅ Cart fetched successfully:', result.data);
        } catch (error) {
          console.error('❌ Failed to fetch cart:', error);
        }
      },
    }),

    addToCart: build.mutation({
      query: (item) => {
        const body = {
          productId: item.productId || item._id,
          quantity: item.quantity || 1,
          size: item.size || undefined,
          color: item.color || undefined,
        };

        // console.log('🔄 Adding to cart:', body);

        return {
          url: '/cart/add',
          method: 'POST',
          body,
        };
      },
      invalidatesTags: ['Cart'],
      transformResponse: (response) => {
        return response.data || response;
      },
      async onQueryStarted(item, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          // console.log('✅ Added to cart successfully:', result.data);
        } catch (error) {
          console.error('❌ Failed to add to cart:', error);
          throw error;
        }
      },
    }),

    updateCartItem: build.mutation({
      query: ({ productId, quantity, size, color }) => {
        const body = {
          quantity,
          size: size || undefined,
          color: color || undefined,
        };

        // console.log('🔄 Updating cart item:', { productId, body });

        return {
          url: `/cart/update/${productId}`,
          method: 'PUT',
          body,
        };
      },
      invalidatesTags: ['Cart'],
      transformResponse: (response) => {
        return response.data || response;
      },
      async onQueryStarted(params, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          // console.log('✅ Cart item updated successfully:', result.data);
        } catch (error) {
          console.error('❌ Failed to update cart item:', error);
          throw error;
        }
      },
    }),

    removeFromCart: build.mutation({
      query: ({ productId, size, color }) => {
        // console.log('🔄 Removing from cart:', { productId, size, color });

        // Build query parameters
        const params = new URLSearchParams();
        if (size) params.append('size', size);
        if (color) params.append('color', color);

        const queryString = params.toString();
        const url = `/cart/remove/${productId}${queryString ? `?${queryString}` : ''}`;

        return {
          url,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['Cart'],
      transformResponse: (response) => {
        return response.data || response;
      },
      async onQueryStarted(params, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          // console.log('✅ Removed from cart successfully:', result.data);
        } catch (error) {
          console.error('❌ Failed to remove from cart:', error);
          throw error;
        }
      },
    }),

    clearCart: build.mutation({
      query: () => ({
        url: '/cart/clear',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
      transformResponse: (response) => {
        return response.data || response;
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          // console.log('✅ Cart cleared successfully:', result.data);
        } catch (error) {
          console.error('❌ Failed to clear cart:', error);
          throw error;
        }
      },
    }),

    getCartItemCount: build.query({
      query: () => '/cart/count',
      providesTags: ['Cart'],
      transformResponse: (response) => {
        return response.itemCount || response.data?.itemCount || 0;
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          // console.log('✅ Cart count fetched:', result.data);
        } catch (error) {
          console.error('❌ Failed to fetch cart count:', error);
        }
      },
    }),

    // 🔧 WISHLIST ENDPOINTS
    getWishlist: build.query({
      query: () => '/wishlist',
      providesTags: ['Wishlist'],
      transformResponse: (response) => {
        return response.data || response;
      },
      transformErrorResponse: (response, meta, arg) => {
        // Handle 401 Unauthorized gracefully for wishlist
        if (response?.status === 401) {
          // console.log('👤 User not authenticated, returning empty wishlist');
          return {
            status: 401,
            data: {
              success: true,
              items: [],
              totalItems: 0,
              message: 'Guest user - no wishlist'
            }
          };
        }
        console.error('❌ Failed to fetch wishlist:', response);
        return response;
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          // console.log('✅ Wishlist fetched successfully:', result.data);
        } catch (error) {
          // Only log actual errors, not auth issues
          if (error?.error?.status !== 401) {
            console.error('❌ Failed to fetch wishlist:', error);
          }
        }
      },
    }),

    getWishlistItemCount: build.query({
      query: () => '/wishlist/count',
      providesTags: ['Wishlist'],
      transformResponse: (response) => {
        return response.itemCount || response.data?.itemCount || 0;
      },
    }),

    addToWishlist: build.mutation({
      query: (productId) => {
        // console.log('🔄 Adding to wishlist:', productId);
        return {
          url: '/wishlist/add',
          method: 'POST',
          body: { productId },
        };
      },
      invalidatesTags: ['Wishlist'],
      transformResponse: (response) => {
        return response.data || response;
      },
      transformErrorResponse: (response, meta, arg) => {
        if (response?.status === 401) {
          return {
            ...response,
            message: 'Please sign in to add items to your wishlist'
          };
        }
        return response;
      },
      async onQueryStarted(productId, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          // console.log('✅ Added to wishlist successfully:', result.data);
        } catch (error) {
          if (error?.error?.status === 401) {
            // console.log('👤 Authentication required for wishlist');
          } else {
            console.error('❌ Failed to add to wishlist:', error);
          }
          throw error;
        }
      },
    }),

    removeFromWishlist: build.mutation({
      query: (productId) => {
        // console.log('🔄 Removing from wishlist:', productId);
        return {
          url: `/wishlist/remove/${productId}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['Wishlist'],
      transformResponse: (response) => {
        return response.data || response;
      },
      transformErrorResponse: (response, meta, arg) => {
        if (response?.status === 401) {
          return {
            ...response,
            message: 'Please sign in to manage your wishlist'
          };
        }
        return response;
      },
      async onQueryStarted(productId, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          // console.log('✅ Removed from wishlist successfully:', result.data);
        } catch (error) {
          if (error?.error?.status !== 401) {
            console.error('❌ Failed to remove from wishlist:', error);
          }
          throw error;
        }
      },
    }),

    clearWishlist: build.mutation({
      query: () => ({
        url: '/wishlist/clear',
        method: 'DELETE',
      }),
      invalidatesTags: ['Wishlist'],
      transformResponse: (response) => response.data || response,
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetProductsBySearchQuery,
  useGetProductByIdQuery,
  useGetFeaturedProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetFilterOptionsQuery,
  useGetFilteredProductsQuery,
  useGetAllCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetProductReviewsQuery,
  useCreateReviewMutation,
  useDeleteReviewMutation,
  useGetCheckoutSessionStatusQuery,
  useGetUserOrdersQuery,
  useGetAllOrdersQuery,
  useGetOrderByIdQuery,
  useGetCustomerOrderByIdQuery,
  useCreateOrderMutation,
  useCancelOrderMutation,
  // useUpdateOrderStatusMutation,
  useUpdateOrderStatusAfterPaymentMutation,
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useGetCartItemCountQuery,
  useGetWishlistQuery,
  useGetWishlistItemCountQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useClearWishlistMutation,
} = Api;
