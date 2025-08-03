// ✅ CategoryDetailPage.jsx with React Toastify
import { useParams, Link, useNavigate } from "react-router";
import { toast } from 'react-toastify'; // 🎉 Import toast for notifications
import { useGetCategoryByIdQuery, useDeleteCategoryMutation } from "@/lib/api";
import { ArrowLeft, FolderOpen, Edit, Trash2, AlertTriangle, Loader2, ImageOff, Tag, Package, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const CategoryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: category, isLoading, error, refetch } = useGetCategoryByIdQuery(id);
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  // 🚀 UPDATED: Enhanced delete handler with toast notifications
  const handleDeleteCategory = async (categoryId, categoryName) => {
    try {
      // Attempt to delete the category
      await deleteCategory(categoryId).unwrap();
      
      // ✅ SUCCESS: Show success toast
      toast.success(`🎉 Category Deleted Successfully!\n"${categoryName}" has been permanently removed from your store.`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Navigate back to categories list after showing the toast
      setTimeout(() => {
        navigate('/admin/categories');
      }, 1500); // Wait 1.5 seconds to let user see the success message
      
    } catch (error) {
      console.error('Failed to delete category:', error);
      
      // ❌ ERROR: Show error toast with detailed message
      let errorMessage = 'Failed to delete category. Please try again.';
      
      // Handle specific error types
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.status === 404) {
        errorMessage = 'Category not found. It may have already been deleted.';
      } else if (error?.status >= 500) {
        errorMessage = 'Server error occurred. Please try again later.';
      } else if (error?.status === 409) {
        errorMessage = 'Cannot delete category. It may still contain products.';
      }
      
      toast.error(`❌ Delete Failed\n${errorMessage}`, {
        position: "top-right",
        autoClose: 6000, // Keep error messages longer
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  // ✅ Enhanced loading state
  if (isLoading) {
    return (
      <div className="px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/admin/categories" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FolderOpen className="mr-3 h-8 w-8 text-blue-600" />
                Category Details
              </h1>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600">Loading category details...</span>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Enhanced error state
  if (error) {
    return (
      <div className="px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/admin/categories" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FolderOpen className="mr-3 h-8 w-8 text-blue-600" />
                Category Details
              </h1>
            </div>
          </div>
        </div>
        
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Category</h2>
            <p className="text-red-600 mb-4">
              {error?.data?.message || error?.message || 'Failed to load category details'}
            </p>
            <div className="space-x-3">
              <Button onClick={() => refetch()} variant="outline">
                Try Again
              </Button>
              <Link to="/admin/categories">
                <Button>Back to Categories</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Enhanced not found state
  if (!category) {
    return (
      <div className="px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/admin/categories" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FolderOpen className="mr-3 h-8 w-8 text-blue-600" />
                Category Details
              </h1>
            </div>
          </div>
        </div>
        
        <div className="text-center py-12">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Category Not Found</h2>
            <p className="text-gray-600 mb-4">
              The category you're looking for doesn't exist or may have been deleted.
            </p>
            <Link to="/admin/categories">
              <Button>Back to Categories</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/admin/categories" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FolderOpen className="mr-3 h-8 w-8 text-blue-600" />
                Category Details
              </h1>
              <p className="text-gray-600 mt-1">
                View and manage category information
              </p>
            </div>
          </div>
          
          {/* ✅ Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* Edit Button */}
            <Link to={`/admin/categories/edit/${category._id}`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Category
              </Button>
            </Link>

            {/* 🚨 UPDATED: Delete with Confirmation Dialog + Toast */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                    Delete Category
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{category?.name}"? This action cannot be undone and will permanently remove the category from your store. Make sure no products are assigned to this category.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteCategory(category._id, category.name)}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Category'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ✅ Enhanced Category Image with error handling */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Category Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
              {category.image ? (
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`flex flex-col items-center justify-center text-gray-400 ${category.image ? 'hidden' : ''}`}>
                <ImageOff className="h-12 w-12 mb-2" />
                <span className="text-sm">No image available</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* ✅ Enhanced Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tag className="mr-2 h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Category Name</label>
                  <p className="text-lg font-semibold">{category.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <Badge variant={category.isActive ? "default" : "secondary"}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created Date</label>
                  <p className="text-lg">
                    {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-lg">
                    {category.updatedAt ? new Date(category.updatedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              
              {category.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-700 mt-1 leading-relaxed">
                    {category.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ✅ Enhanced Category Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Category Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Products</label>
                  <p className="text-xl font-bold text-blue-600">
                    {category.productCount || 0}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Active Products</label>
                  <p className="text-xl font-bold text-green-600">
                    {category.activeProductCount || 0}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Sales</label>
                  <p className="text-xl font-bold text-purple-600">
                    {category.totalSales || 0}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Revenue</label>
                  <p className="text-xl font-bold text-orange-600">
                    ${category.totalRevenue?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ✅ Enhanced Category Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Category Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Visibility</label>
                  <div className="mt-1">
                    <Badge variant={category.isActive ? "default" : "outline"} className="flex items-center w-fit">
                      {category.isActive ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          Visible to customers
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                          Hidden from customers
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Featured Category</label>
                  <div className="mt-1">
                    <Badge variant={category.isFeatured ? "default" : "outline"}>
                      {category.isFeatured ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Display Order</label>
                  <p className="text-lg">{category.displayOrder || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">SEO Slug</label>
                  <p className="text-lg font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {category.slug || category.name?.toLowerCase().replace(/\s+/g, '-') || 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ✅ Enhanced Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to={`/admin/products?category=${category._id}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="mr-2 h-4 w-4" />
                    View Products in Category
                  </Button>
                </Link>
                <Link to={`/admin/products/create?category=${category._id}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="mr-2 h-4 w-4" />
                    Add Product to Category
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailPage;