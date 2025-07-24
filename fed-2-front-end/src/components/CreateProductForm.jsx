import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateProductMutation } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";


const createProductFormSchema = z.object({
    categoryId: z.string().min(1),
    name: z.string().min(1),
    price: z.number().nonnegative(),
    image: z.string().min(1),
    stock: z.number()
});

const CreateProductForm = () => {

    const form = useForm({
        resolver: zodResolver(createProductFormSchema)
        // defaultValues: {
        //     categoryId: "",
        //     name: "",
        //     price: 0,
        //     image: "",
        //     stock: 0
        // }
    });

    const [createProduct, { isLoading }] = useCreateProductMutation();

    const onSubmit = async (values) => {
        try {
            await createProduct(values).unwrap();
            form.reset();
        } catch (error) {
            console.error("Failed to create product:", error);
        }
    }
    
  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-4 w-1/4">
            <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Category ID</FormLabel>
                        <FormControl>
                            <Input placeholder="Category ID" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input placeholder="Name" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                            <Input 
                                type="number" 
                                placeholder="Price" 
                                {...field} 
                                onChange={(e) => {
                                    field.onChange(parseFloat(e.target.value) || 0);
                                }}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                            <Input placeholder="Image URL" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Stock</FormLabel>
                        <FormControl>
                            <Input 
                                type="number" 
                                placeholder="Stock" 
                                {...field} 
                                onChange={(e) => {
                                    field.onChange(parseInt(e.target.value) || 0);
                                }}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
           <div>
             <Button type="submit">Create Product</Button>
           </div>
        </form>
    </Form>
  );
}

export default CreateProductForm