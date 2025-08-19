import { z } from "zod";

// Add to cart DTO - includes productId
export const addToCartDTO = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1").max(100, "Quantity cannot exceed 100"),
  size: z.string().optional(),
  color: z.string().optional()
});

// 🔧 FIXED: Update cart item DTO - NO productId (comes from URL params)
export const updateCartItemDTO = z.object({
  quantity: z.number().min(0, "Quantity cannot be negative").max(100, "Quantity cannot exceed 100"),
  size: z.string().optional(),
  color: z.string().optional()
});

export type AddToCartDTO = z.infer<typeof addToCartDTO>;
export type UpdateCartItemDTO = z.infer<typeof updateCartItemDTO>;