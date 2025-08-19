// 🆕 NEW FILE: Wishlist DTOs following Cart pattern
import { z } from "zod";

export const addToWishlistDTO = z.object({
  productId: z.string().min(1, "Product ID is required")
});

export const removeFromWishlistDTO = z.object({
  productId: z.string().min(1, "Product ID is required")
});

export type AddToWishlistDTO = z.infer<typeof addToWishlistDTO>;
export type RemoveFromWishlistDTO = z.infer<typeof removeFromWishlistDTO>;