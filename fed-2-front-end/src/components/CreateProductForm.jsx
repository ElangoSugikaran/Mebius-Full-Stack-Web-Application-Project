import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateProductMutation } from "@/lib/api";
import ImageInput from "@/components/ImageInput";

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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const createProductFormSchema = z.object({
    categoryId: z.string().min(1),
    name: z.string().min(1),
    price: z.number().nonnegative(),
    image: z.string().min(1),
    stock: z.number()
});

const CreateProductForm = ({ categories }) => {

   const form = useForm({
        resolver: zodResolver(createProductFormSchema),  // Add missing comma
        defaultValues: {
            categoryId: "",
            name: "",
            price: 0,
            image: "",
            stock: 0
        }
    });

    const [createProduct, { isLoading }] = useCreateProductMutation();

    // const onSubmit = async (values) => {
    //     try {
    //         await createProduct(values).unwrap();
    //         form.reset();
    //     } catch (error) {
    //         console.error("Failed to create product:", error);
    //     }
    // }

    const onSubmit = async (values) => {
    try {
        await createProduct(values).unwrap();
        form.reset();
        // You can add a toast notification here
    } catch (error) {
        console.error("Failed to create product:", error);
        // Set form error
        form.setError("root", { 
            type: "submit",
            message: error.message || "Failed to create product"
        });
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
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {categories?.map((category) => (
                                    <SelectItem key={category._id} value={category._id}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                        <FormLabel>Image</FormLabel>
                        <FormControl>
                            <ImageInput onChange={field.onChange} value={field.value} />
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

export default CreateProductForm;