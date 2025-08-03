// Updated api.js with review mutations
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const Api = createApi({
  reducerPath: "Api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000/api",
    prepareHeaders: async (headers) => {
      return new Promise((resolve) => {
        async function checkToken() {
          const clerk = window.Clerk;
          if (clerk) {
            const token = await clerk.session?.getToken();
            headers.set("Authorization", `Bearer ${token}`);
            resolve(headers);
          } else {
            setTimeout(checkToken, 500);
          }
        }
        checkToken();
      });
    },
  }),
  tagTypes: ['Product', 'Review'], // Add tags for cache invalidation
  endpoints: (build) => ({
    getAllProducts: build.query({
      query: () => `/products`,
      providesTags: ['Product'],
    }),
    getAllCategories: build.query({
      query: () => `/categories`,
    }),
    getCategoryById: build.query({
      query: (id) => `/categories/${id}`,
    }),
    getProductReviews: build.query({ 
      query: (id) => `/reviews/products/${id}/reviews`,
      providesTags: (result, error, id) => [{ type: 'Review', id }],
    }),
    // NEW: Create review mutation
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
    // NEW: Delete review mutation (for admin)
    deleteReview: build.mutation({
      query: (reviewId) => ({
        url: `/reviews/${reviewId}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Review'],
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
    createOrder: build.mutation({
      query: (order) => ({
        url: "/orders",
        method: "POST",
        body: order,
      }),
    }),
  }),
});

// Export hooks for usage in functional components
export const { 
  useGetAllProductsQuery, 
  useCreateOrderMutation, 
  useCreateProductMutation,
  useUpdateProductMutation,
  useGetAllCategoriesQuery,
  useGetProductByIdQuery,
  useDeleteProductMutation,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
  useGetCategoryByIdQuery,
  useGetProductReviewsQuery,
  // NEW: Export review hooks
  useCreateReviewMutation,
  useDeleteReviewMutation,
} = Api;