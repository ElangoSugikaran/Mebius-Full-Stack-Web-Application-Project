// 🔧 FIXED: Updated api.js with correct cart endpoint paths
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_BASE_URL;
console.log('🔍 API Base URL:', BASE_URL); // Add this to debug

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
  tagTypes: ['Product', 'Review', 'Order', 'Cart', 'Wishlist', 'Customer'],
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

    // 🔧 CATEGORY ENDPOINTS
    getAllCategories: build.query({
      query: () => `/categories`,
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
    // ENHANCED: getUserOrders query with proper empty state handling
    getUserOrders: build.query({
      query: () => '/orders',
      providesTags: ['Order'],
      transformResponse: (response) => {
        console.log('Orders API response:', response);
        
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
        
        // Return consistent structure
        return {
          orders: orders,
          count: orders.length,
          success: true,
          isEmpty: orders.length === 0
        };
      },
      transformErrorResponse: (response, meta, arg) => {
        console.error('Orders fetch error:', {
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
    // 🔧 FIXED: Customer order by ID
    getCustomerOrderById: build.query({
      query: (id) => `/orders/${id}`,  // GET /api/orders/:id
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
    
    // 🔧 ADMIN ORDER ENDPOINTS  
    getAllOrders: build.query({
      query: () => '/orders/admin/all',  // GET /api/orders/admin/all
      providesTags: ['Order'],
    }),
    
    // 🔧 FIXED: Admin order by ID (different from customer)
    getOrderById: build.query({
      query: (id) => `/orders/admin/${id}`,  // GET /api/orders/admin/:id
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
    
    // 🔧 ORDER STATUS UPDATES
    updateOrderStatus: build.mutation({
      query: ({ orderId, status }) => ({
        url: `/orders/admin/${orderId}/status`,  // PUT /api/orders/admin/:id/status
        method: 'PUT',
        body: { orderStatus: status }  // Use 'orderStatus' field
      }),
      invalidatesTags: (result, error, { orderId }) => [
        'Order', 
        { type: 'Order', id: orderId }
      ],
    }),
    
    // 🔧 CANCEL ORDER (Customer)
    cancelOrder: build.mutation({
      query: (orderId) => ({
        url: `/orders/${orderId}/cancel`,  // PUT /api/orders/:id/cancel
        method: 'PUT',
      }),
      invalidatesTags: (result, error, orderId) => [
        'Order', 
        { type: 'Order', id: orderId }
      ],
    }),
    
    // 🔧 CREATE ORDER
    createOrder: build.mutation({
      query: (orderData) => ({
        url: '/orders',  // POST /api/orders
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Order'],
    }),

    // Replace the existing updateOrderStatus mutation with this:
    updateOrderStatus: build.mutation({
      query: ({ orderId, status, orderStatus, id, isPaymentComplete = false, paymentStatus }) => {
        // 🔧 Handle multiple possible parameter names with validation
        const targetOrderId = orderId || id;
        
        // 🔧 Enhanced validation
        if (!targetOrderId || targetOrderId === 'undefined' || targetOrderId === 'null' || targetOrderId === '') {
          console.error('❌ updateOrderStatus: Invalid order ID:', { orderId, id, targetOrderId });
          throw new Error('Valid order ID is required');
        }

        // 🔧 NEW: Handle payment status updates separately
        if (paymentStatus) {
          console.log('💳 Payment status update:', {
            targetOrderId,
            paymentStatus,
            endpoint: `/orders/admin/${targetOrderId}/payment`
          });

          return {
            url: `/orders/admin/${targetOrderId}/payment`,
            method: 'PUT',
            body: { 
              paymentStatus: paymentStatus
            },
            headers: {
              'Content-Type': 'application/json'
            }
          };
        }

        // 🔧 Handle order status updates
        const targetStatus = orderStatus || status;
        
        if (!targetStatus || targetStatus === 'undefined' || targetStatus === 'null' || targetStatus === '') {
          console.error('❌ updateOrderStatus: Invalid status:', { status, orderStatus, targetStatus });
          throw new Error('Valid order status is required');
        }

        // 🔧 FIXED: Use different endpoints for admin vs payment completion
        const endpoint = isPaymentComplete 
          ? `/orders/${targetOrderId}/payment-complete`  // Customer endpoint for payment completion
          : `/orders/admin/${targetOrderId}/status`;     // Admin endpoint for status changes

        console.log('🔄 API updateOrderStatus request:', {
          received: { orderId, status, orderStatus, id, isPaymentComplete, paymentStatus },
          using: { targetOrderId, targetStatus, endpoint },
          url: endpoint
        });

        return {
          url: endpoint,
          method: 'PUT',
          body: { 
            orderStatus: targetStatus,
            status: targetStatus, // Send both for backend compatibility
            // 🔧 NEW: Add payment completion flag
            ...(isPaymentComplete && { paymentStatus: 'PAID' })
          },
          headers: {
            'Content-Type': 'application/json'
          }
        };
      },
      invalidatesTags: (result, error, { orderId, id }) => {
        const targetOrderId = orderId || id;
        console.log('🔄 Invalidating tags for order:', targetOrderId);
        return [
          'Order', 
          { type: 'Order', id: targetOrderId }
        ];
      },
      transformResponse: (response, meta, arg) => {
        console.log('✅ Order status update success:', {
          response,
          originalArg: arg,
          meta: {
            request: meta?.request?.url,
            status: meta?.response?.status
          }
        });
        return response;
      },
      transformErrorResponse: (response, meta, arg) => {
        const errorInfo = {
          status: response?.status,
          data: response?.data,
          message: response?.data?.message || response?.message,
          originalArg: arg,
          requestUrl: meta?.request?.url,
          requestMethod: meta?.request?.method
        };
        
        console.error('❌ Order status update error:', errorInfo);
        
        return {
          ...response,
          debugInfo: errorInfo
        };
      },
      extraOptions: {
        maxRetries: 2,
        backoff: (attempt) => Math.pow(2, attempt) * 1000
      }
    }),

    addToCart: build.mutation({
      query: (item) => {
        const body = {
          productId: item.productId || item._id,
          quantity: item.quantity || 1,
          size: item.size || undefined,
          color: item.color || undefined,
        };
        
        console.log('🔄 Adding to cart:', body);
        
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
          console.log('✅ Added to cart successfully:', result.data);
        } catch (error) {
          console.error('❌ Failed to add to cart:', error);
          // Re-throw to let component handle it
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
        
        console.log('🔄 Updating cart item:', { productId, body });
        
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
          console.log('✅ Cart item updated successfully:', result.data);
        } catch (error) {
          console.error('❌ Failed to update cart item:', error);
          throw error;
        }
      },
    }),

    removeFromCart: build.mutation({
      query: ({ productId, size, color }) => {
        console.log('🔄 Removing from cart:', { productId, size, color });
        
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
          console.log('✅ Removed from cart successfully:', result.data);
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
          console.log('✅ Cart cleared successfully:', result.data);
        } catch (error) {
          console.error('❌ Failed to clear cart:', error);
          throw error;
        }
      },
    }),

    // 🔧 MISSING: Add this getCart query endpoint
    getCart: build.query({
      query: () => '/cart',
      providesTags: ['Cart'],
      transformResponse: (response) => {
        return response.data || response;
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          console.log('✅ Cart fetched successfully:', result.data);
        } catch (error) {
          console.error('❌ Failed to fetch cart:', error);
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
          console.log('✅ Cart count fetched:', result.data);
        } catch (error) {
          console.error('❌ Failed to fetch cart count:', error);
        }
      },
    }),

    // 🔧 WISHLIST ENDPOINTS (Add these to your existing Api.createApi)
    getWishlist: build.query({
      query: () => '/wishlist',
      providesTags: ['Wishlist'],
      transformResponse: (response) => {
        return response.data || response;
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          console.log('✅ Wishlist fetched successfully:', result.data);
        } catch (error) {
          console.error('❌ Failed to fetch wishlist:', error);
        }
      },
    }),

    addToWishlist: build.mutation({
      query: (productId) => {
        console.log('🔄 Adding to wishlist:', productId);
        return {
          url: '/wishlist/add',
          method: 'POST',
          body: { productId }, // Backend expects { productId: "..." }
        };
      },
      invalidatesTags: ['Wishlist'],
      transformResponse: (response) => {
        return response.data || response;
      },
      async onQueryStarted(productId, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          console.log('✅ Added to wishlist successfully:', result.data);
        } catch (error) {
          console.error('❌ Failed to add to wishlist:', error);
          throw error;
        }
      },
    }),

    removeFromWishlist: build.mutation({
      query: (productId) => {
        console.log('🔄 Removing from wishlist:', productId);
        return {
          url: `/wishlist/remove/${productId}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['Wishlist'],
      transformResponse: (response) => {
        return response.data || response;
      },
      async onQueryStarted(productId, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          console.log('✅ Removed from wishlist successfully:', result.data);
        } catch (error) {
          console.error('❌ Failed to remove from wishlist:', error);
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
      transformResponse: (response) => {
        return response.data || response;
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          console.log('✅ Wishlist cleared successfully:', result.data);
        } catch (error) {
          console.error('❌ Failed to clear wishlist:', error);
          throw error;
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

    // customer
    syncCurrentUser: build.mutation({
      query: () => ({
        url: '/customers/sync',
        method: 'POST',
      }),
    }),
    getAllCustomers: build.query({
      query: () => '/customers/admin/all',
      providesTags: ['Customer'],
    }),
    getCustomerById: build.query({
      query: (customerId) => `/customers/admin/${customerId}`,
      providesTags: (result, error, customerId) => [{ type: 'Customer', id: customerId }],
      transformResponse: (response) => {
        console.log('✅ Customer fetched:', response);
        return response.data || response;
      },
    }),
    // In your api.js file, you could add a new endpoint:
    getCustomerByClerkId: build.query({
      query: (clerkId) => `/customers/admin/clerk/${clerkId}`,
      providesTags: (result, error, clerkId) => [{ type: 'Customer', id: clerkId }],
      transformResponse: (response) => {
        console.log('✅ Customer fetched by Clerk ID:', response);
        return response.data || response.customer || response;
      },
    }),

    getSettings: build.query({
      query: () => '/settings',
      providesTags: ['Settings'],
      transformResponse: (response) => {
        console.log('✅ Settings fetched:', response);
        return response.data || response;
      },
    }),

    updateStoreSettings: build.mutation({
      query: (storeData) => {
        console.log('🔄 Updating store settings:', storeData);
        return {
          url: '/settings/store',
          method: 'PUT',
          body: { store: storeData }, // Wrap in 'store' object as expected by DTO
        };
      },
      invalidatesTags: ['Settings'],
      transformResponse: (response) => {
        console.log('✅ Store settings updated:', response);
        return response.data || response;
      },
      async onQueryStarted(storeData, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          console.log('✅ Store settings saved successfully');
        } catch (error) {
          console.error('❌ Failed to save store settings:', error);
          throw error;
        }
      },
    }),

    updatePaymentSettings: build.mutation({
      query: (paymentData) => {
        console.log('🔄 Updating payment settings:', paymentData);
        return {
          url: '/settings/payment',
          method: 'PUT',
          body: { payment: paymentData }, // Wrap in 'payment' object as expected by DTO
        };
      },
      invalidatesTags: ['Settings'],
      transformResponse: (response) => {
        console.log('✅ Payment settings updated:', response);
        return response.data || response;
      },
      async onQueryStarted(paymentData, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          console.log('✅ Payment settings saved successfully');
        } catch (error) {
          console.error('❌ Failed to save payment settings:', error);
          throw error;
        }
      },
    }),

  }),
});

// Export hooks with proper naming
export const { 
  // Product hooks
  useGetAllProductsQuery, 
  useGetProductsBySearchQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  
  // Category hooks
  useGetAllCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  
  // Review hooks
  useGetProductReviewsQuery,
  useCreateReviewMutation,
  useDeleteReviewMutation,
  
  // Payment hooks
  useGetCheckoutSessionStatusQuery,
  
  // Customer hooks
  useGetUserOrdersQuery,
  useGetCustomerOrderByIdQuery,  
  useCancelOrderMutation,
  useCreateOrderMutation,
  
  // Admin hooks  
  useGetAllOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,

 // Cart hooks - Updated
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useGetCartItemCountQuery,

  // Also add these to your export hooks section:
  // Wishlist hooks
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useClearWishlistMutation,
  useGetWishlistItemCountQuery,

  //customer hook
  useGetCustomerByClerkIdQuery,
  useSyncCurrentUserMutation,
  useGetAllCustomersQuery,
  useGetCustomerByIdQuery,

  //admin settings hooks
  useGetSettingsQuery,
  useUpdateStoreSettingsMutation,
  useUpdatePaymentSettingsMutation,

} = Api;