import { z } from "zod";

const createProductDTO = z.object({
  categoryId: z.string().min(1, "Category is required"),
  name: z.string().min(2, "Product name must be at least 2 characters"),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description cannot exceed 1000 characters"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  image: z.string().min(1, "Product image is required"),
  stock: z.number().min(0, "Stock cannot be negative"),
  sizes: z.array(z.string()).min(1, "At least one size is required"),
  colors: z.array(z.string()).min(1, "At least one color is required"),
  material: z.string().optional(),
  brand: z.string().optional(),
  gender: z.enum(["men", "women", "unisex", "kids"]),
  discount: z.number().min(0, "Discount cannot be negative").max(100, "Discount cannot exceed 100%").default(0),
  isFeatured: z.boolean().default(false)
});

const updateProductDTO = createProductDTO.partial().extend({
  id: z.string().min(1, "Product ID is required"),
});

export { createProductDTO, updateProductDTO };
