// ✅ CreateCategoryPage.jsx
import CategoryForm from "@/components/CategoryForm";
import { ArrowLeft, FolderPlus } from "lucide-react";
import { Link } from "react-router";

const CreateCategoryPage = () => {
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
                <FolderPlus className="mr-3 h-8 w-8 text-green-600" />
                Create New Category
              </h1>
              <p className="text-gray-600 mt-1">
                Add a new category to organize your products
              </p>
            </div>
          </div>
        </div>
      </div>
     
      {/* ✅ USE REUSABLE FORM IN CREATE MODE */}
      <CategoryForm mode="create" />
    </div>
  );
};

export default CreateCategoryPage;