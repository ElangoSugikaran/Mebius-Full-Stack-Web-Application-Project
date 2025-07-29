// ✅ CreateProductPage.jsx
import ProductForm from "@/components/ProductForm";
import { useGetAllCategoriesQuery } from "@/lib/api";
import { ArrowLeft, Package } from "lucide-react";
import { Link } from "react-router";

const CreateProductPage = () => {
  const { data: categories } = useGetAllCategoriesQuery();

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
                Create New Product
              </h1>
              <p className="text-gray-600 mt-1">
                Add a new clothing item to your store inventory
              </p>
            </div>
          </div>
        </div>
      </div>
     
      {/* ✅ USE REUSABLE FORM IN CREATE MODE */}
      <ProductForm 
        categories={categories}
        mode="create"
      />
    </div>
  );
};

export default CreateProductPage;
