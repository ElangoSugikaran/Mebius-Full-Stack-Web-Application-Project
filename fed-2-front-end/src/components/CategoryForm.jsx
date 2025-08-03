// // File: src/components/CategoryForm.jsx
// import { useForm } from "react-hook-form";
// import z from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useCreateCategoryMutation, useUpdateCategoryMutation } from "@/lib/api";
// import ImageInput from "@/components/ImageInput";
// import { ArrowLeft, Save, FolderOpen, Edit, Tag } from "lucide-react";
// import { Link } from "react-router";
// import { useEffect } from "react";
// import { toast } from 'react-toastify';

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Switch } from "@/components/ui/switch";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";

// // ========================================
// // VALIDATION SCHEMA
// // ========================================

// const categoryFormSchema = z.object({
//   name: z.string()
//     .min(2, "Category name must be at least 2 characters")
//     .max(50, "Category name cannot exceed 50 characters")
//     .regex(/^[a-zA-Z0-9\s-&]+$/, "Category name can only contain letters, numbers, spaces, hyphens, and &"),
//   image: z.string().optional(),
//   isActive: z.boolean().default(true),
// });

// // ========================================
// // CATEGORY FORM COMPONENT
// // ========================================

// const CategoryForm = ({ 
//   mode = "create", 
//   initialData = null, 
//   categoryId = null 
// }) => {
  
//   // ✅ MUTATIONS
//   const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
//   const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  
//   const isLoading = isCreating || isUpdating;
//   const isEditMode = mode === "edit";

//   // ✅ FORM SETUP
//   const getDefaultValues = () => {
//     if (isEditMode && initialData) {
//       return {
//         name: initialData.name || "",
//         image: initialData.image || "",
//         isActive: initialData.isActive !== undefined ? initialData.isActive : true,
//       };
//     }
    
//     return {
//       name: "",
//       image: "",
//       isActive: true,
//     };
//   };

//   const form = useForm({
//     resolver: zodResolver(categoryFormSchema),
//     defaultValues: getDefaultValues()
//   });

//   // Reset form when initialData changes (for edit mode)
//   useEffect(() => {
//     if (isEditMode && initialData) {
//       form.reset(getDefaultValues());
//     }
//   }, [initialData, isEditMode]);

//   // ✅ ENHANCED SUBMIT HANDLER WITH TOASTIFY
//   const onSubmit = async (values) => {
//     try {
//       const categoryData = {
//         name: values.name.trim(),
//         image: values.image || "",
//         isActive: values.isActive,
//       };
      
//       if (isEditMode) {
//         // ✅ UPDATE CATEGORY
//         await updateCategory({ 
//           id: categoryId, 
//           ...categoryData 
//         }).unwrap();
        
//         // ✅ SUCCESS TOAST FOR UPDATE
//         toast.success(`✅ Category Updated Successfully!\n"${values.name}" has been updated with the latest changes.`, {
//           position: "top-right",
//           autoClose: 5000,
//           hideProgressBar: false,
//           closeOnClick: true,
//           pauseOnHover: true,
//           draggable: true,
//         });
        
//       } else {
//         // ✅ CREATE CATEGORY
//         await createCategory(categoryData).unwrap();
        
//         // ✅ SUCCESS TOAST FOR CREATE
//         toast.success(`🎉 Category Created Successfully!\n"${values.name}" has been added to your store and is ready for products.`, {
//           position: "top-right",
//           autoClose: 5000,
//           hideProgressBar: false,
//           closeOnClick: true,
//           pauseOnHover: true,
//           draggable: true,
//         });
        
//         // Reset form only for create mode
//         form.reset();
//       }
      
//     } catch (error) {
//       console.error(`Failed to ${isEditMode ? 'update' : 'create'} category:`, error);
      
//       // ✅ ERROR TOAST
//       let errorMessage = 'An unexpected error occurred. Please try again.';
      
//       // Handle specific error types
//       if (error?.data?.message) {
//         errorMessage = error.data.message;
//       } else if (error?.message) {
//         errorMessage = error.message;
//       } else if (error?.status === 409 || error?.data?.code === 11000) {
//         errorMessage = 'A category with this name already exists. Please choose a different name.';
//       }
      
//       toast.error(`❌ Failed to ${isEditMode ? 'Update' : 'Create'} Category\n${errorMessage}`, {
//         position: "top-right",
//         autoClose: 7000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//       });
      
//       // Set form error for additional context
//       form.setError("root", { 
//         type: "submit",
//         message: errorMessage
//       });
//     }
//   };

//   // ✅ SUGGESTED CATEGORY NAMES
//   const suggestedCategories = [
//     "T-Shirts", "Shirts", "Pants", "Jeans", "Shorts", "Dresses", 
//     "Skirts", "Jackets", "Sweaters", "Shoes", "Accessories", "Socks"
//   ];

//   const handleSuggestionClick = (suggestion) => {
//     form.setValue("name", suggestion);
//   };

//   return (
//     <div className="container mx-auto px-6 max-w-3xl">
//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
//           {/* ✅ BASIC INFORMATION CARD */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center">
//                 <Tag className="mr-2 h-5 w-5" />
//                 Category Information
//               </CardTitle>
//               <CardDescription>
//                 Essential details for your product category
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
              
//               {/* CATEGORY NAME */}
//               <FormField
//                 control={form.control}
//                 name="name"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Category Name *</FormLabel>
//                     <FormControl>
//                       <Input 
//                         placeholder="e.g., T-Shirts, Shoes, Jeans" 
//                         {...field} 
//                       />
//                     </FormControl>
//                     <FormDescription>
//                       Choose a clear, descriptive name that customers will easily understand
//                     </FormDescription>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* ✅ SUGGESTED NAMES (only show in create mode) */}
//               {!isEditMode && (
//                 <div className="mt-4">
//                   <p className="text-sm font-medium text-gray-700 mb-2">
//                     Popular Categories:
//                   </p>
//                   <div className="flex flex-wrap gap-2">
//                     {suggestedCategories.map((suggestion) => (
//                       <Button
//                         key={suggestion}
//                         type="button"
//                         variant="outline"
//                         size="sm"
//                         onClick={() => handleSuggestionClick(suggestion)}
//                         className="text-xs"
//                       >
//                         {suggestion}
//                       </Button>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* CATEGORY IMAGE */}
//               <FormField
//                 control={form.control}
//                 name="image"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Category Image <span className="text-gray-400">(optional)</span></FormLabel>
//                     <FormControl>
//                       <ImageInput
//                         onChange={(url) => form.setValue("image", url)}
//                         value={form.watch("image")}
//                         entityType="category"
//                         entityId={categoryId} // From route params or state
//                       />
//                     </FormControl>
//                     <FormDescription>
//                       Upload an image to represent this category. Recommended: 1200x400px for banners
//                     </FormDescription>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* ACTIVE STATUS TOGGLE */}
//               <FormField
//                 control={form.control}
//                 name="isActive"
//                 render={({ field }) => (
//                   <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
//                     <div className="space-y-0.5">
//                       <FormLabel className="text-base">Active Category</FormLabel>
//                       <FormDescription>
//                         Active categories are visible to customers and can contain products
//                       </FormDescription>
//                     </div>
//                     <FormControl>
//                       <Switch
//                         checked={field.value}
//                         onCheckedChange={field.onChange}
//                       />
//                     </FormControl>
//                   </FormItem>
//                 )}
//               />

//             </CardContent>
//           </Card>

//           {/* ✅ PREVIEW CARD */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Preview</CardTitle>
//               <CardDescription>
//                 How this category will appear to customers
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="border-2 border-dashed border-gray-200 rounded-lg p-6">
//                 <div className="flex items-center space-x-4">
//                   <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center">
//                     {form.watch("image") ? (
//                       <img 
//                         src={form.watch("image")} 
//                         alt="Category preview"
//                         className="h-full w-full object-cover rounded-lg"
//                       />
//                     ) : (
//                       <FolderOpen className="h-8 w-8 text-gray-400" />
//                     )}
//                   </div>
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-900">
//                       {form.watch("name") || "Category Name"}
//                     </h3>
//                     <p className="text-sm text-gray-500">
//                       Status: {form.watch("isActive") ? "Active" : "Inactive"}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
          
//           {/* ✅ SUBMIT BUTTONS */}
//           <div className="flex items-center justify-end space-x-4 pt-6">
//             <Link to="/admin/categories">
//               <Button type="button" variant="outline">
//                 Cancel
//               </Button>
//             </Link>
//             <Button type="submit" disabled={isLoading}>
//               {isLoading ? (
//                 <>
//                   <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
//                   {isEditMode ? 'Updating...' : 'Creating...'}
//                 </>
//               ) : (
//                 <>
//                   {isEditMode ? (
//                     <><Edit className="mr-2 h-4 w-4" />Update Category</>
//                   ) : (
//                     <><Save className="mr-2 h-4 w-4" />Create Category</>
//                   )}
//                 </>
//               )}
//             </Button>
//           </div>
//         </form>
//       </Form>
//     </div>
//   );
// };

// export default CategoryForm;
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateCategoryMutation, useUpdateCategoryMutation } from "@/lib/api";
import ImageInput from "@/components/ImageInput";
import { Save, FolderOpen, Edit, Tag } from "lucide-react";
import { Link } from "react-router";
import { useEffect } from "react";
import { toast } from 'react-toastify';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";


const categoryFormSchema = z.object({
  name: z.string()
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name cannot exceed 50 characters")
    .regex(/^[a-zA-Z0-9\s-&]+$/, "Category name can only contain letters, numbers, spaces, hyphens, and &"),
  
  // Allow both string (URL) and File object
  image: z.union([
    z.string().optional(),
    z.instanceof(File).optional()
  ]).optional(),
  
  isActive: z.boolean().default(true),
});

// CATEGORY FORM COMPONENT
const CategoryForm = ({ 
  mode = "create", 
  initialData = null, 
  categoryId = null 
}) => {
  // MUTATIONS
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  
  const isLoading = isCreating || isUpdating;
  const isEditMode = mode === "edit";

  // FORM SETUP
  const getDefaultValues = () => {
    if (isEditMode && initialData) {
      return {
        name: initialData.name || "",
        image: initialData.image || "",
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      };
    }
    
    return {
      name: "",
      image: "",
      isActive: true,
    };
  };

  const form = useForm({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: getDefaultValues()
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (isEditMode && initialData) {
      form.reset(getDefaultValues());
    }
  }, [initialData, isEditMode]);

// In your CategoryForm.jsx - Replace the onSubmit function with this:

const onSubmit = async (values) => {
  try {
    // No need to handle file upload here - ImageInput already did it!
    const categoryData = {
      name: values.name.trim(),
      isActive: values.isActive,
      image: values.image || "" // This is already a URL string from ImageInput
    };
    
    if (isEditMode) {
      await updateCategory({ id: categoryId, ...categoryData }).unwrap();
      toast.success(`✅ Category Updated Successfully!`);
    } else {
      await createCategory(categoryData).unwrap();
      toast.success(`🎉 Category Created Successfully!`);
      
      // Complete form reset for create mode
      form.reset({
        name: "",
        image: "",
        isActive: true,
      });
      
      // Clear file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    }

  } catch (error) {
    // Your existing error handling code stays the same...
    console.error(`Failed to ${isEditMode ? 'update' : 'create'} category:`, error);
    
    let errorMessage = 'An unexpected error occurred. Please try again.';
    
    if (error?.data?.message) {
      errorMessage = error.data.message;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (error?.status === 409 || error?.data?.code === 11000) {
      errorMessage = 'A category with this name already exists. Please choose a different name.';
    }
  
    toast.error(`❌ Failed to ${isEditMode ? 'Update' : 'Create'} Category\n${errorMessage}`, {
      position: "top-right",
      autoClose: 7000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    
    form.setError("root", { 
      type: "submit",
      message: errorMessage
    });
  }
};

// SUGGESTED CATEGORY NAMES
  const suggestedCategories = [
    "T-Shirts", "Shirts", "Pants", "Jeans", "Shorts", "Dresses", 
    "Skirts", "Jackets", "Sweaters", "Shoes", "Accessories", "Socks"
  ];

  const handleSuggestionClick = (suggestion) => {
    form.setValue("name", suggestion);
  };

  return (
    <div className="container mx-auto px-6 max-w-3xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* BASIC INFORMATION CARD */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tag className="mr-2 h-5 w-5" />
                Category Information
              </CardTitle>
              <CardDescription>
                Essential details for your product category
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* CATEGORY NAME */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., T-Shirts, Shoes, Jeans" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Choose a clear, descriptive name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* SUGGESTED NAMES */}
              {!isEditMode && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Popular Categories:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedCategories.map((suggestion) => (
                      <Button
                        key={suggestion}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

             {/* CATEGORY IMAGE */}
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Image <span className="text-gray-400">(optional)</span></FormLabel>
                    <FormControl>
                      <ImageInput
                        onChange={(value) => field.onChange(value)} // Use field.onChange instead
                        value={field.value} // Use field.value instead of form.watch
                        entityType="category"
                        entityId={isEditMode ? categoryId : null} // Only pass ID in edit mode
                      />
                    </FormControl>
                    <FormDescription>
                      Upload an image to represent this category
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* ACTIVE STATUS TOGGLE */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Category</FormLabel>
                      <FormDescription>
                        Active categories are visible to customers
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
            </CardContent>
          </Card>

          {/* PREVIEW CARD */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                How this category will appear to customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center">
                    {form.watch("image") ? (
                      <img 
                        src={form.watch("image")} 
                        alt="Category preview"
                        className="h-full w-full object-cover rounded-lg"
                      />
                    ) : (
                      <FolderOpen className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {form.watch("name") || "Category Name"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Status: {form.watch("isActive") ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* SUBMIT BUTTONS */}
          <div className="flex items-center justify-end space-x-4 pt-6">
            <Link to="/admin/categories">
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
                    <><Edit className="mr-2 h-4 w-4" />Update Category</>
                  ) : (
                    <><Save className="mr-2 h-4 w-4" />Create Category</>
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

export default CategoryForm;