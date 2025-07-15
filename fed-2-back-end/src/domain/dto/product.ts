import {z} from "zod";

const createProductDTO = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  image: z.string().min(1),
  stock: z.number()
});

export { createProductDTO };
