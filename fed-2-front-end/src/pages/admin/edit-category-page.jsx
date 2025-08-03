// ✅ EditCategoryPage.jsx
import CategoryForm from "@/components/CategoryForm";
import { useGetCategoryByIdQuery } from "@/lib/api";
import { ArrowLeft, Edit, Loader2, FolderOpen } from "lucide-react";
import { Link, useParams } from "react-router";

const EditCategoryPage = () => {
  const { id } = useParams(); // Get category ID from URL
  
  const { 
    data: category, 
    isLoading: isLoadingCategory, 
    error: categoryError 
  } = useGetCategoryByIdQuery(id);

  // Loading state
  if (isLoadingCategory) {
    return (
      <div className="px-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading category...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (categoryError || !category) {
    return (
      <div className="px-8">
        <div className="mb-8">
          <Link to="/admin/categories" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <FolderOpen className="h-12 w-12 mx-auto mb-2" />
            <h2 className="text-xl font-semibold">Category Not Found</h2>
            <p className="text-gray-600 mt-2">
              The category you're looking for doesn't exist or has been deleted.
            </p>
          </div>
          <Link to="/admin/categories">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Back to Categories
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
            <Link to="/admin/categories" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Edit className="mr-3 h-8 w-8 text-orange-600" />
                Edit Category
              </h1>
              <p className="text-gray-600 mt-1">
                Update "{category.name}" details
              </p>
            </div>
          </div>
        </div>
      </div>
     
      {/* ✅ USE REUSABLE FORM IN EDIT MODE */}
      <CategoryForm 
        mode="edit"
        initialData={category}
        categoryId={id}
      />
    </div>
  );
};

export default EditCategoryPage;