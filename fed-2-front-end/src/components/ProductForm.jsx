// ✅ ENHANCED ProductForm.jsx with React Toastify
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateProductMutation, useUpdateProductMutation } from "@/lib/api";
import ImageInput from "@/components/ImageInput";
import { ArrowLeft, Save, Package, Edit } from "lucide-react";
import { Link } from "react-router";
import { useEffect } from "react";
import { toast } from 'react-toastify';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

// ========================================
// CONFIGURATION DATA (keeping your existing config)
// ========================================

const materialOptionsByCategory = {
  "T-Shirts": ["cotton", "polyester", "cotton blend", "bamboo", "modal"],
  "Shirts": ["cotton", "linen", "polyester", "silk", "rayon", "cotton blend"],
  "Pants": ["denim", "cotton", "polyester", "wool", "khaki", "corduroy"],
  "Trousers": ["cotton", "wool", "polyester", "linen", "twill"],
  "Jeans": ["denim", "cotton blend", "stretch denim", "raw denim"],
  "Shorts": ["cotton", "polyester", "denim", "linen", "canvas"],
  "Socks": ["cotton", "wool", "nylon", "polyester", "bamboo", "merino wool"],
  "Shoes": ["leather", "canvas", "synthetic", "rubber", "mesh", "suede"],
  "Jackets": ["leather", "denim", "polyester", "wool", "cotton", "nylon"],
  "Sweaters": ["wool", "cotton", "cashmere", "acrylic", "alpaca"],
  "Dresses": ["cotton", "polyester", "silk", "chiffon", "satin", "lace"],
  "Skirts": ["cotton", "polyester", "denim", "silk", "wool", "leather"],
};

const sizeOptions = [
  { value: "XS", label: "Extra Small (XS)" },
  { value: "S", label: "Small (S)" },
  { value: "M", label: "Medium (M)" },
  { value: "L", label: "Large (L)" },
  { value: "XL", label: "Extra Large (XL)" },
  { value: "XXL", label: "2X Large (XXL)" },
  { value: "XXXL", label: "3X Large (XXXL)" },
];

const colorOptions = [
  { value: "black", label: "Black" },
  { value: "white", label: "White" },
  { value: "red", label: "Red" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "gray", label: "Gray" },
  { value: "navy", label: "Navy" },
  { value: "brown", label: "Brown" },
  { value: "pink", label: "Pink" },
  { value: "purple", label: "Purple" },
  { value: "yellow", label: "Yellow" },
  { value: "orange", label: "Orange" },
];

const genderOptions = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "unisex", label: "Unisex" },
  { value: "kids", label: "Kids" },
];

const productFormSchema = z.object({
    categoryId: z.string().min(1, "Category is required"),
    name: z.string().min(2, "Product name must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description cannot exceed 1000 characters"),
    price: z.number().min(0.01, "Price must be greater than 0"),
    image: z.string().min(1, "Product image is required"),
    stock: z.number().min(0, "Stock cannot be negative"),
    sizes: z.array(z.string()).min(1, "At least one size is required"),
    colors: z.array(z.string()).min(1, "At least one color is required"),
    material: z.string().optional(),
    brand: z.string().optional(),
    gender: z.enum(["men", "women", "unisex", "kids"], {
        required_error: "Please select a gender category"
    }),
    discount: z.number().min(0, "Discount cannot be negative").max(100, "Discount cannot exceed 100%").default(0),
    isFeatured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
});

// ✅ ENHANCED COMPONENT WITH TOASTIFY
const ProductForm = ({ 
    categories, 
    mode = "create", 
    initialData = null, 
    productId = null 
}) => {
    
    // ✅ MUTATIONS
    const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
    const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
    
    const isLoading = isCreating || isUpdating;
    const isEditMode = mode === "edit";

    // ✅ FORM SETUP (keeping your existing logic)
    const getDefaultValues = () => {
        if (isEditMode && initialData) {
            return {
                categoryId: initialData.categoryId || "",
                name: initialData.name || "",
                description: initialData.description || "",
                price: initialData.price || 0,
                image: initialData.image || "",
                stock: initialData.stock || 0,
                sizes: initialData.sizes || [],
                colors: initialData.colors || [],
                material: initialData.material || "",
                brand: initialData.brand || "",
                gender: initialData.gender || "unisex",
                discount: initialData.discount || 0,
                isFeatured: initialData.isFeatured || false,
                tags: initialData.tags || [],
            };
        }
        
        return {
            categoryId: "",
            name: "",
            description: "",
            price: 0,
            image: "",
            stock: 0,
            sizes: [],
            colors: [],
            material: "",
            brand: "",
            gender: "unisex",
            discount: 0,
            isFeatured: false,
            tags: [],
        };
    };

    const form = useForm({
        resolver: zodResolver(productFormSchema),
        defaultValues: getDefaultValues()
    });

    useEffect(() => {
        if (isEditMode && initialData) {
            form.reset(getDefaultValues());
        }
    }, [initialData, isEditMode]);

    useEffect(() => {
        const currentCategoryId = form.watch("categoryId");
        if (currentCategoryId) {
            const newMaterialOptions = getMaterialOptions(currentCategoryId);
            const currentMaterial = form.getValues("material");
            
            if (currentMaterial && !newMaterialOptions.includes(currentMaterial)) {
                form.setValue("material", "");
            }
        }
    }, [form.watch("categoryId"), categories]);

    // ✅ ENHANCED SUBMIT HANDLER WITH TOASTIFY
    const onSubmit = async (values) => {
        try {
            const productData = {
                ...values,
                sizes: values.sizes,
                colors: values.colors, 
                tags: values.tags,
                gender: values.gender.toLowerCase(),
                material: values.material.toLowerCase(),
            };
            
            if (isEditMode) {
                // ✅ UPDATE PRODUCT
                await updateProduct({ 
                    id: productId, 
                    ...productData 
                }).unwrap();
                
                // ✅ SUCCESS TOAST FOR UPDATE
                toast.success(`✅ Product Updated Successfully!\n"${values.name}" has been updated with the latest changes.`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                
            } else {
                // ✅ CREATE PRODUCT
                await createProduct(productData).unwrap();
                
                // ✅ SUCCESS TOAST FOR CREATE
                toast.success(`🎉 Product Created Successfully!\n"${values.name}" has been added to your inventory and is now available for customers.`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                
                // Reset form only for create mode
                form.reset();
            }
            
        } catch (error) {
            console.error(`Failed to ${isEditMode ? 'update' : 'create'} product:`, error);
            
            // ✅ ERROR TOAST
            const errorMessage = error?.data?.message || error?.message || 'An unexpected error occurred. Please try again.';
            
            toast.error(`❌ Failed to ${isEditMode ? 'Update' : 'Create'} Product\n${errorMessage}`, {
                position: "top-right",
                autoClose: 7000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            
            // Set form error for additional context
            form.setError("root", { 
                type: "submit",
                message: errorMessage
            });
        }
    };

    // ✅ HELPER FUNCTIONS (keeping your existing ones)
    const handleSizeToggle = (size) => {
        const currentSizes = form.getValues("sizes");
        const newSizes = currentSizes.includes(size)
            ? currentSizes.filter(s => s !== size)
            : [...currentSizes, size];
        form.setValue("sizes", newSizes);
    };

    const handleColorToggle = (color) => {
        const currentColors = form.getValues("colors");
        const newColors = currentColors.includes(color)
            ? currentColors.filter(c => c !== color)
            : [...currentColors, color];
        form.setValue("colors", newColors);
    };

    const getMaterialOptions = (categoryId) => {
        if (!categoryId || !categories) return [];
        
        const selectedCategory = categories.find(cat => cat._id === categoryId);
        if (!selectedCategory) return [];
        
        const materials = materialOptionsByCategory[selectedCategory.name] || [];
        
        // Add "None" as first option for optional selection
        return ["none", ...materials];
    };

    return (
        <div className="container mx-auto px-6 max-w-4xl">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    
                    {/* BASIC INFORMATION CARD */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>
                                Essential product details that customers will see first
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                
                                {/* PRODUCT NAME */}
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Product Name *</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="e.g., Cotton Crew Neck T-Shirt" 
                                                    {...field} 
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Make it descriptive and search-friendly
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* CATEGORY */}
                                <FormField
                                    control={form.control}
                                    name="categoryId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
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
                                            <FormDescription>
                                                Choose the main category (T-Shirts, Pants, etc.)
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* GENDER FIELD */}
                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gender Category *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select gender category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {genderOptions.map((gender) => (
                                                        <SelectItem key={gender.value} value={gender.value}>
                                                            {gender.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                Target gender for this product
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* FEATURED TOGGLE */}
                                <FormField
                                    control={form.control}
                                    name="isFeatured"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Featured Product</FormLabel>
                                                <FormDescription>
                                                    Display this product on homepage and promotions
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* DESCRIPTION */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description *</FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                placeholder="Describe the product features, fit, and benefits..."
                                                className="min-h-[100px]"
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            10-1000 characters. Detailed description helps customers decide
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Product Image *</FormLabel>
                                    <FormControl>
                                        {/* <ImageInput onChange={field.onChange} value={field.value} /> */}
                                        <ImageInput
                                            onChange={(url) => form.setValue("image", url)}
                                            value={form.watch("image")}
                                            entityType="product"
                                            entityId={productId} // From route params or state
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Upload a high-quality image. Recommended: 800x800px or larger
                                    </FormDescription>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </CardContent>
                    </Card>

                    {/* PRICING & INVENTORY CARD */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing & Inventory</CardTitle>
                            <CardDescription>
                                Set your product pricing and manage stock levels
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                
                                {/* PRICE */}
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price (USD) *</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number" 
                                                    step="0.01"
                                                    placeholder="0.00" 
                                                    {...field} 
                                                    onChange={(e) => {
                                                        field.onChange(parseFloat(e.target.value));
                                                    }}
                                                />
                                            </FormControl>
                                            <FormDescription>Retail price in dollars</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* DISCOUNT FIELD */}
                                <FormField
                                    control={form.control}
                                    name="discount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Discount (%)</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number" 
                                                    min="0"
                                                    max="100"
                                                    placeholder="0" 
                                                    {...field} 
                                                    onChange={(e) => {
                                                        field.onChange(parseInt(e.target.value));
                                                    }}
                                                />
                                            </FormControl>
                                            <FormDescription>Discount percentage (0-100%)</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* STOCK */}
                                <FormField
                                    control={form.control}
                                    name="stock"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Stock Quantity *</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number" 
                                                    placeholder="0" 
                                                    {...field} 
                                                    onChange={(e) => {
                                                        field.onChange(parseInt(e.target.value));
                                                    }}
                                                />
                                            </FormControl>
                                            <FormDescription>Total items available</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* CLOTHING ATTRIBUTES CARD */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Clothing Attributes</CardTitle>
                            <CardDescription>
                                Specific details for clothing items like sizes, colors, and materials
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            
                            {/* SIZES SELECTION */}
                            <FormField
                                control={form.control}
                                name="sizes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Available Sizes *</FormLabel>
                                        <FormDescription className="mb-3">
                                            Select all sizes available for this product
                                        </FormDescription>
                                        <div className="flex flex-wrap gap-2">
                                            {sizeOptions.map((size) => (
                                                <Badge
                                                    key={size.value}
                                                    variant={field.value.includes(size.value) ? "default" : "outline"}
                                                    className="cursor-pointer hover:bg-blue-100"
                                                    onClick={() => handleSizeToggle(size.value)}
                                                >
                                                    {size.label}
                                                </Badge>
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* COLORS SELECTION */}
                            <FormField
                                control={form.control}
                                name="colors"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Available Colors *</FormLabel>
                                        <FormDescription className="mb-3">
                                            Select all colors available for this product
                                        </FormDescription>
                                        <div className="flex flex-wrap gap-2">
                                            {colorOptions.map((color) => (
                                                <Badge
                                                    key={color.value}
                                                    variant={field.value.includes(color.value) ? "default" : "outline"}
                                                    className="cursor-pointer hover:bg-blue-100"
                                                    onClick={() => handleColorToggle(color.value)}
                                                >
                                                    {color.label}
                                                </Badge>
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                
                                {/* MATERIAL SELECTION */}
                                <FormField
                                    control={form.control}
                                    name="material"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Material <span className="text-gray-400">(optional)</span></FormLabel>
                                            <Select 
                                                onValueChange={field.onChange} 
                                                value={field.value}
                                                disabled={!form.watch("categoryId")}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={
                                                            !form.watch("categoryId") 
                                                                ? "Select a category first" 
                                                                : "Select material"
                                                        } />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {getMaterialOptions(form.watch("categoryId")).map((material) => (
                                                        <SelectItem key={material} value={material}>
                                                            {material === "none" 
                                                                ? "None / Not Specified" 
                                                                : material.charAt(0).toUpperCase() + material.slice(1)
                                                            }
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                {!form.watch("categoryId") 
                                                    ? "Select a category to see available materials" 
                                                    : "Primary fabric material (optional)"
                                                }
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* BRAND */}
                                <FormField
                                    control={form.control}
                                    name="brand"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Brand</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Nike, Adidas" {...field} />
                                            </FormControl>
                                            <FormDescription>Brand name (optional)</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* ✅ SUBMIT BUTTONS */}
                    <div className="flex items-center justify-end space-x-4 pt-6">
                        <Link to="/admin/products">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    {isEditMode ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                <>
                                    {isEditMode ? (
                                        <><Edit className="mr-2 h-4 w-4" />Update Product</>
                                    ) : (
                                        <><Save className="mr-2 h-4 w-4" />Create Product</>
                                    )}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default ProductForm;