
// ✅ EditProductPage.jsx
import ProductForm from "@/components/ProductForm";
import { useGetAllCategoriesQuery, useGetProductByIdQuery } from "@/lib/api";
import { ArrowLeft, Edit, Loader2, Package } from "lucide-react";
import { Link, useParams } from "react-router";

const EditProductPage = () => {
  const { id } = useParams(); // Get product ID from URL
  
  const { data: categories } = useGetAllCategoriesQuery();
  const { 
    data: product, 
    isLoading: isLoadingProduct, 
    error: productError 
  } = useGetProductByIdQuery(id);

  // Loading state
  if (isLoadingProduct) {
    return (
      <div className="px-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading product...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (productError || !product) {
    return (
      <div className="px-8">
        <div className="mb-8">
          <Link to="/admin/products" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <Package className="h-12 w-12 mx-auto mb-2" />
            <h2 className="text-xl font-semibold">Product Not Found</h2>
            <p className="text-gray-600 mt-2">
              The product you're looking for doesn't exist or has been deleted.
            </p>
          </div>
          <Link to="/admin/products">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Back to Products
            </button>
          </Link>
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
                <Edit className="mr-3 h-8 w-8 text-orange-600" />
                Edit Product
              </h1>
              <p className="text-gray-600 mt-1">
                Update "{product.name}" details
              </p>
            </div>
          </div>
        </div>
      </div>
     
      {/* ✅ USE REUSABLE FORM IN EDIT MODE */}
      <ProductForm 
        categories={categories}
        mode="edit"
        initialData={product}
        productId={id}
      />
    </div>
  );
};

export default EditProductPage;