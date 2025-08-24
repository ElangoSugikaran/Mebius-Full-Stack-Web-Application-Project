// 🔧 FIXED: Updated api.js with consolidated endpoints and no duplicate properties
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_BASE_URL;
console.log('🔍 API Base URL:', BASE_URL);

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
      console.log('✅ Featured products fetched:', response);
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
        console.log('✅ Filter options fetched:', response);
        return response.data || response;
      },
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
        console.log('🔍 Filtering products with:', queryString);
        
        return `/products/filtered?${queryString}`;
      },
      providesTags: ['Product'],
      transformResponse: (response) => {
        console.log('✅ Filtered products fetched:', response);
        return response.data || response;
      },
      // Keep cache for 5 minutes to avoid frequent DB calls
      keepUnusedDataFor: 300,
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
   getUserOrders: build.query({
  query: () => '/orders',  // ✅ Correct: GET /api/orders
  providesTags: ['Order'],
  transformResponse: (response) => {
    console.log('📦 getUserOrders API response:', response);
    
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
    
    console.log(`✅ Processed ${orders.length} user orders with user info`);
    
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

  // 🔧 Customer order by ID - FIXED
  getCustomerOrderById: build.query({
    query: (id) => {
      console.log('📦 Fetching customer order:', id);
      return `/orders/${id}`;  // ✅ Correct: GET /api/orders/:id
    },
    providesTags: (result, error, id) => [{ type: 'Order', id }],
    transformResponse: (response) => {
      console.log('📦 getCustomerOrderById API response:', response);
      
      if (response.success && response.order) {
        console.log('✅ Customer order fetched with user info:', {
          orderId: response.order._id,
          hasUserInfo: !!response.order.userInfo,
          userFullName: response.order.userInfo?.fullName
        });
        return response.order; // Return the order with user info
      }
      
      return response.data || response;
    },
    transformErrorResponse: (response, meta, arg) => {
      console.error('❌ getCustomerOrderById error:', response);
      return response;
    }
  }),

  // 🔧 ADMIN ORDER ENDPOINTS - FIXED
  getAllOrders: build.query({
    query: () => {
      console.log('🔍 Admin fetching all orders...');
      return '/orders/admin/all';  // ✅ Correct: GET /api/orders/admin/all
    },
    providesTags: ['Order'],
    transformResponse: (response) => {
      console.log('📊 getAllOrders API response:', response);
      
      let orders = [];
      if (Array.isArray(response)) {
        orders = response;
      } else if (response.orders && Array.isArray(response.orders)) {
        orders = response.orders;
      } else if (response.data && Array.isArray(response.data)) {
        orders = response.data;
      }
      
      console.log(`✅ Admin fetched ${orders.length} orders with user info`);
      
      // Validate user info in orders
      const ordersWithUserInfo = orders.filter(order => !!order.userInfo).length;
      const ordersWithoutUserInfo = orders.length - ordersWithUserInfo;
      
      console.log(`📊 User info stats: ${ordersWithUserInfo} with info, ${ordersWithoutUserInfo} without`);
      
      return {
        orders: orders,
        count: orders.length,
        success: true,
        meta: response.meta || {}
      };
    },
    transformErrorResponse: (response, meta, arg) => {
      console.error('❌ getAllOrders fetch error:', response);
      return response;
    }
  }),

  // 🔧 Admin order by ID - FIXED
  getOrderById: build.query({
    query: (id) => {
      console.log('🔍 Admin fetching order details:', id);
      return `/orders/admin/${id}`;  // ✅ Correct: GET /api/orders/admin/:id
    },
    providesTags: (result, error, id) => [{ type: 'Order', id }],
    transformResponse: (response) => {
      console.log('📦 getOrderById API response:', response);
      
      if (response.success && response.order) {
        console.log('✅ Admin order fetched with user info:', {
          orderId: response.order._id,
          hasUserInfo: !!response.order.userInfo,
          userFullName: response.order.userInfo?.fullName,
          userEmail: response.order.userInfo?.email,
          isClerkError: response.order.userInfo?.isClerkError
        });
        return response.order; // Return the order with user info
      }
      
      return response.data || response;
    },
    transformErrorResponse: (response, meta, arg) => {
      console.error('❌ getOrderById error:', {
        status: response?.status,
        data: response?.data,
        orderId: arg
      });
      return response;
    }
  }),
      
    // 🔧 CONSOLIDATED ORDER STATUS UPDATE - FIXED: Single definition
    updateOrderStatus: build.mutation({
      query: ({ orderId, status, orderStatus, id, isPaymentComplete = false, paymentStatus }) => {
        // Handle multiple possible parameter names with validation
        const targetOrderId = orderId || id;
        
        // Enhanced validation
        if (!targetOrderId || targetOrderId === 'undefined' || targetOrderId === 'null' || targetOrderId === '') {
          console.error('❌ updateOrderStatus: Invalid order ID:', { orderId, id, targetOrderId });
          throw new Error('Valid order ID is required');
        }

        // Handle payment status updates separately
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

        // Handle order status updates
        const targetStatus = orderStatus || status;
        
        if (!targetStatus || targetStatus === 'undefined' || targetStatus === 'null' || targetStatus === '') {
          console.error('❌ updateOrderStatus: Invalid status:', { status, orderStatus, targetStatus });
          throw new Error('Valid order status is required');
        }

        // Use different endpoints for admin vs payment completion
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
            // Add payment completion flag
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
    
    // 🔧 CANCEL ORDER (Customer)
    cancelOrder: build.mutation({
      query: (orderId) => ({
        url: `/orders/${orderId}/cancel`,
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
        url: '/orders',
        method: 'POST',
        body: orderData,
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
          console.log('✅ Cart fetched successfully:', result.data);
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

    // 🔧 WISHLIST ENDPOINTS
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
          body: { productId },
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

    // 🔧 SETTINGS ENDPOINTS

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
  useGetFilterOptionsQuery,
  useGetFilteredProductsQuery,
  useGetFeaturedProductsQuery,
  
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
  
  // Customer order hooks
  useGetUserOrdersQuery,
  useGetCustomerOrderByIdQuery,  
  useCancelOrderMutation,
  useCreateOrderMutation,
  
  // Admin order hooks  
  useGetAllOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation, // FIXED: Only one definition now

  // Cart hooks
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useGetCartItemCountQuery,

  // Wishlist hooks
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useClearWishlistMutation,
  useGetWishlistItemCountQuery,


} = Api;