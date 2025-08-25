// File: src/pages/admin/CategoriesPage.jsx

import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'react-toastify'; // 🎉 Import toast for notifications
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Eye,
  MoreHorizontal,
  FolderOpen,
  AlertTriangle,
  Tag
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useGetAllCategoriesQuery, useGetAllProductsQuery, useDeleteCategoryMutation } from '@/lib/api'; 

const CategoriesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: categories = [], isLoading, error, refetch } = useGetAllCategoriesQuery();
  const { data: products = [] } = useGetAllProductsQuery(); // To count products per category
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  // Helper function to count products in each category
  const getProductCount = (categoryId) => {
    return products.filter(product => product.categoryId === categoryId).length;
  };

  // 🚀 UPDATED: Handle delete category with toast notifications
  const handleDeleteCategory = async (categoryId, categoryName) => {
    try {
      // Get product count for better messaging
      const productCount = getProductCount(categoryId);
      
      // Attempt to delete the category
      await deleteCategory(categoryId).unwrap();
      
      // ✅ SUCCESS: Show success toast with different messages based on product count
      if (productCount > 0) {
        toast.success(`Category "${categoryName}" and its ${productCount} product(s) deleted successfully!`, {
          position: "top-right",
          autoClose: 4000, // Keep longer for important info
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.success(`Category "${categoryName}" deleted successfully!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
      
      // Refresh the category list
      refetch();
      console.log('Category deleted successfully');
      
    } catch (error) {
      console.error('Failed to delete category:', error);
      
      // ❌ ERROR: Show error toast
      toast.error(`Failed to delete category "${categoryName}". Please try again.`, {
        position: "top-right",
        autoClose: 5000, // Keep error messages longer
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  if (isLoading) return <div>Loading categories...</div>;
  if (error) return <div>Error loading categories.</div>;

  // 🔍 FILTER CATEGORIES
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🔧 Category status determination
  const getCategoryStatus = (category) => {
    const productCount = getProductCount(category._id);
    
    if (category.isActive === false) {
      return 'inactive';
    } else if (productCount === 0) {
      return 'empty';
    } else if (productCount > 0) {
      return 'active';
    } else {
      return 'draft';
    }
  };

  // 🎨 STATUS BADGE STYLING
  const getStatusBadge = (status) => {
    const variants = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      empty: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      draft: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    
    const labels = {
      active: 'Active',
      inactive: 'Inactive',
      empty: 'No Products',
      draft: 'Draft'
    };

    return (
      <Badge 
        variant="outline" 
        className={`${variants[status]} font-medium`}
      >
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-6">
      
      {/* 📋 HEADER SECTION */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FolderOpen className="mr-3 h-8 w-8" />
              Category Management
            </h1>
            <p className="text-gray-600 mt-2">
              Organize your products into categories for better navigation
            </p>
          </div>
          
          {/* 🆕 CREATE CATEGORY BUTTON */}
          <Link to="/admin/categories/create">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Create Category
            </Button>
          </Link>
        </div>
      </div>

      {/* 📊 STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Tag className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FolderOpen className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {categories.filter(cat => cat.isActive !== false).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Empty Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {categories.filter(cat => getProductCount(cat._id) === 0).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Tag className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Products/Category</p>
              <p className="text-2xl font-bold text-gray-900">
                {categories.length > 0 ? Math.round(products.length / categories.length) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🔍 SEARCH & FILTERS */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search categories by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* 📊 CATEGORIES TABLE */}
      <div className="bg-white rounded-lg shadow-sm border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16"></TableHead>
              <TableHead>Category Name</TableHead>
              <TableHead>Products Count</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.map((category) => (
              <TableRow key={category._id}>
                
                {/* 🖼️ CATEGORY ICON/IMAGE */}
                <TableCell>
                  <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center">
                    {category.image ? (
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="h-full w-full object-cover rounded-md"
                      />
                    ) : (
                      <FolderOpen className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                </TableCell>
                
                {/* 📂 CATEGORY NAME */}
                <TableCell>
                  <div>
                    <p className="font-medium text-gray-900">{category.name}</p>
                    <p className="text-sm text-gray-500">ID: #{category._id}</p>
                  </div>
                </TableCell>
                
                {/* 📦 PRODUCTS COUNT */}
                <TableCell>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900">{getProductCount(category._id)}</span>
                    <span className="text-sm text-gray-500 ml-1">products</span>
                  </div>
                </TableCell>
                
                {/* 📊 STATUS */}
                <TableCell>
                  {getStatusBadge(getCategoryStatus(category))}
                </TableCell>
                
                {/* 📅 CREATED DATE */}
                <TableCell>
                  <span className="text-sm text-gray-500">
                    {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </TableCell>
                
                {/* 📅 UPDATED DATE */}
                <TableCell>
                  <span className="text-sm text-gray-500">
                    {category.updatedAt ? new Date(category.updatedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </TableCell>
                
                {/* ⚙️ ACTIONS */}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/admin/categories/${category._id}`} className="flex items-center">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/admin/categories/edit/${category._id}`} className="flex items-center">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Category
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/admin/products?category=${category._id}`} className="flex items-center">
                          <FolderOpen className="mr-2 h-4 w-4" />
                          View Products ({getProductCount(category._id)})
                        </Link>
                      </DropdownMenuItem>
                      
                      {/* 🚨 UPDATED: Delete with confirmation dialog + toast notifications */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Category
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center">
                              <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                              Delete Category
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{category.name}"? 
                              {getProductCount(category._id) > 0 && (
                                <span className="text-red-600 font-medium">
                                  {" "}This category contains {getProductCount(category._id)} products that will be affected.
                                </span>
                              )} 
                              This action cannot be undone.
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
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* 📄 EMPTY STATE */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first category'}
            </p>
            <Link to="/admin/categories/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Category
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* 📊 PAGINATION (Optional - for later) */}
      {filteredCategories.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {filteredCategories.length} of {categories.length} categories
          </p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ========================================
// DEBUGGING TIPS
// ========================================

// 🔍 Add this to debug your category data structure:
// console.log('Categories data:', categories);
// console.log('First category:', categories[0]);
// console.log('Products per category:', categories.map(cat => ({
//   name: cat.name,
//   productCount: getProductCount(cat._id)
// })));

export default CategoriesPage;