// ✅ Fixed ProductDetailPage.jsx with React Toastify
import { useParams, Link, useNavigate } from "react-router";
import { toast } from 'react-toastify'; // 🎉 Import toast for notifications
import { useGetProductByIdQuery, useGetAllCategoriesQuery, useDeleteProductMutation} from "@/lib/api";
import { ArrowLeft, Package, Edit, Trash2, Star, AlertTriangle, Loader2, ImageOff } from "lucide-react";
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

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading, error, refetch } = useGetProductByIdQuery(id);
  const { data: categories } = useGetAllCategoriesQuery();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  // 🚀 UPDATED: Enhanced delete handler with toast notifications
  const handleDeleteProduct = async (productId, productName) => {
    try {
      // Attempt to delete the product
      await deleteProduct(productId).unwrap();
      
      // ✅ SUCCESS: Show success toast
      toast.success(`🎉 Product Deleted Successfully!\n"${productName}" has been permanently removed from your store.`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Navigate back to products list after showing the toast
      setTimeout(() => {
        navigate('/admin/products');
      }, 1500); // Wait 1.5 seconds to let user see the success message
      
    } catch (error) {
      console.error('Failed to delete product:', error);
      
      // ❌ ERROR: Show error toast with detailed message
      let errorMessage = 'Failed to delete product. Please try again.';
      
      // Handle specific error types
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.status === 404) {
        errorMessage = 'Product not found. It may have already been deleted.';
      } else if (error?.status >= 500) {
        errorMessage = 'Server error occurred. Please try again later.';
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

  // ✅ Enhanced category name finder with error handling
  const getCategoryName = (categoryId) => {
    if (!categories || !categoryId) return 'N/A';
    const category = categories.find(cat => cat._id === categoryId);
    return category?.name || 'Unknown Category';
  };

  // ✅ Calculate final price properly
  const calculateFinalPrice = (price, discount) => {
    if (!price || !discount || discount === 0) return price;
    return (price * (1 - discount / 100)).toFixed(2);
  };

  // ✅ Enhanced loading state
  if (isLoading) {
    return (
      <div className="px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/admin/products" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Package className="mr-3 h-8 w-8 text-blue-600" />
                Product Details
              </h1>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600">Loading product details...</span>
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
            <Link to="/admin/products" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Package className="mr-3 h-8 w-8 text-blue-600" />
                Product Details
              </h1>
            </div>
          </div>
        </div>
        
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Product</h2>
            <p className="text-red-600 mb-4">
              {error?.data?.message || error?.message || 'Failed to load product details'}
            </p>
            <div className="space-x-3">
              <Button onClick={() => refetch()} variant="outline">
                Try Again
              </Button>
              <Link to="/admin/products">
                <Button>Back to Products</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Enhanced not found state
  if (!product) {
    return (
      <div className="px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/admin/products" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Package className="mr-3 h-8 w-8 text-blue-600" />
                Product Details
              </h1>
            </div>
          </div>
        </div>
        
        <div className="text-center py-12">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-4">
              The product you're looking for doesn't exist or may have been deleted.
            </p>
            <Link to="/admin/products">
              <Button>Back to Products</Button>
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
            <Link to="/admin/products" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Package className="mr-3 h-8 w-8 text-blue-600" />
                Product Details
              </h1>
              <p className="text-gray-600 mt-1">
                View and manage product information
              </p>
            </div>
          </div>
          
          {/* ✅ Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* Edit Button */}
            <Link to={`/admin/products/edit/${product._id}`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Product
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
                    Delete Product
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{product?.name}"? This action cannot be undone and will permanently remove the product from your store.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteProduct(product._id, product.name)}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Product'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ✅ Enhanced Product Image with error handling */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Product Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`flex flex-col items-center justify-center text-gray-400 ${product.image ? 'hidden' : ''}`}>
                <ImageOff className="h-12 w-12 mb-2" />
                <span className="text-sm">No image available</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* ✅ Enhanced Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Product Name</label>
                  <p className="text-lg font-semibold">{product.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <p className="text-lg">{getCategoryName(product.category?._id || product.categoryId)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Brand</label>
                  <p className="text-lg">{product.brand || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Gender</label>
                  <div className="mt-1">
                    <Badge variant="outline" className="capitalize">
                      {product.gender}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-gray-700 mt-1 leading-relaxed">
                  {product.description || 'No description available'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ✅ Enhanced Pricing & Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Original Price</label>
                  <p className="text-xl font-bold text-gray-900">${product.price?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Discount</label>
                  <p className="text-xl font-bold text-green-600">
                    {product.discount > 0 ? `${product.discount}%` : 'No discount'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Final Price</label>
                  <p className="text-xl font-bold text-blue-600">
                    ${calculateFinalPrice(product.price, product.discount)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Stock</label>
                  <p className={`text-xl font-bold ${
                    product.stock === 0 ? 'text-red-600' : 
                    product.stock < 10 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {product.stock} {product.stock === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ✅ Enhanced Product Attributes */}
          <Card>
            <CardHeader>
              <CardTitle>Product Attributes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Available Sizes</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {product.sizes && product.sizes.length > 0 ? (
                    product.sizes.map((size) => (
                      <Badge key={size} variant="secondary">
                        {size}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">No sizes specified</span>
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Available Colors</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {product.colors && product.colors.length > 0 ? (
                    product.colors.map((color) => (
                      <Badge key={color} variant="outline" className="capitalize">
                        {color}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">No colors specified</span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Material</label>
                  <p className="text-lg capitalize">{product.material || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ✅ Enhanced Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Sales Count</label>
                  <p className="text-xl font-bold">{product.salesCount || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Average Rating</label>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="text-xl font-bold ml-1">
                      {product.averageRating ? product.averageRating.toFixed(1) : '0.0'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Reviews</label>
                  <p className="text-xl font-bold">{product.reviews?.length || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Featured</label>
                  <div className="mt-1">
                    <Badge variant={product.isFeatured ? "default" : "outline"}>
                      {product.isFeatured ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;