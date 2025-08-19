// File: src/pages/admin/ProductsPage.jsx

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
  Package,
  AlertTriangle,
  DollarSign,    // 💰 New import for revenue/price
  TrendingUp,    // 📈 New import for trends
  Archive        // 📦 New import for low stock
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
import { useGetAllProductsQuery, useGetAllCategoriesQuery, useDeleteProductMutation } from '@/lib/api'; 

const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

    const { data: products = [], isLoading, error, refetch } = useGetAllProductsQuery();
    const { data: categories } = useGetAllCategoriesQuery();
    const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

   // Helper function to get category name
    const getCategoryName = (categoryId) => {
      const category = categories?.find(cat => cat._id === categoryId);
      return category?.name || 'N/A';
    };

    // 🚀 UPDATED: Handle delete product with toast notifications
    const handleDeleteProduct = async (productId, productName) => {
      try {
        // Attempt to delete the product
        await deleteProduct(productId).unwrap();
        
        // ✅ SUCCESS: Show success toast
        toast.success(`Product "${productName}" deleted successfully!`, {
          position: "top-right",
          autoClose: 3000, // Auto close after 3 seconds
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Refresh the product list
        refetch();
        console.log('Product deleted successfully');
        
      } catch (error) {
        console.error('Failed to delete product:', error);
        
        // ❌ ERROR: Show error toast
        toast.error(`Failed to delete product "${productName}". Please try again.`, {
          position: "top-right",
          autoClose: 5000, // Keep error messages longer
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading products.</div>;

    // 🔍 FILTER PRODUCTS
    const filteredProducts = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCategoryName(product.categoryId).toLowerCase().includes(searchTerm.toLowerCase())
    );

  // 🔧 SOLUTION 1: Add status determination function
const getProductStatus = (product) => {
  // Check if product has explicit status field
  if (product.status) {
    return product.status;
  }
  
  // Determine status based on stock and other conditions
  if (product.stock === 0) {
    return 'out_of_stock';
  } else if (product.stock < 10) {
    return 'low_stock'; // Optional: add this status
  } else if (product.isFeatured || product.isActive !== false) {
    return 'active';
  } else {
    return 'draft';
  }
};

// 🎨 UPDATED STATUS BADGE STYLING
const getStatusBadge = (status) => {
  const variants = {
    active: 'bg-green-100 text-green-800 border-green-200',
    out_of_stock: 'bg-red-100 text-red-800 border-red-200',
    low_stock: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    draft: 'bg-gray-100 text-gray-800 border-gray-200'
  };
  
  const labels = {
    active: 'Active',
    out_of_stock: 'Out of Stock',
    low_stock: 'Low Stock',
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
              <Package className="mr-3 h-8 w-8" />
              Product Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your store products, inventory, and pricing
            </p>
          </div>
          
          {/* 🆕 CREATE PRODUCT BUTTON */}
          <Link to="/admin/products/create">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Create Product
            </Button>
          </Link>
        </div>
      </div>

      {/* 📊 STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Products */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
          </div>
        </div>

        {/* Active Products */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.filter(product => getProductStatus(product) === 'active').length}
              </p>
            </div>
          </div>
        </div>

        {/* Low/Out of Stock */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low/Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.filter(product => 
                  getProductStatus(product) === 'out_of_stock' || 
                  getProductStatus(product) === 'low_stock'
                ).length}
              </p>
            </div>
          </div>
        </div>

        {/* Total Inventory Value */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inventory Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${products.reduce((total, product) => {
                  return total + (parseFloat(product.price) * product.stock);
                }, 0).toLocaleString()}
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
              placeholder="Search products by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            Filter
          </Button>
        </div>
      </div>

      {/* 📊 PRODUCTS TABLE */}
      <div className="bg-white rounded-lg shadow-sm border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16"></TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product._id}>
                
                {/* 🖼️ PRODUCT IMAGE */}
                <TableCell>
                  <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </TableCell>
                
                {/* 📦 PRODUCT NAME */}
                <TableCell>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">ID: #{product._id}</p>
                  </div>
                </TableCell>
                
                {/* 🏷️ CATEGORY */}
                <TableCell>
                  <Badge variant="outline">  {getCategoryName(product.categoryId)}</Badge>
                </TableCell>
                
                {/* 💰 PRICE */}
                <TableCell>
                  <span className="font-medium">${product.price}</span>
                </TableCell>
                
                {/* 📦 STOCK */}
                <TableCell>
                  <span className={`font-medium ${
                    product.stock === 0 ? 'text-red-600' : 
                    product.stock < 10 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {product.stock}
                  </span>
                </TableCell>
                
                {/* 📊 STATUS */}
                <TableCell>
                  {getStatusBadge(getProductStatus(product))}
                </TableCell>
                
                {/* 📅 CREATED DATE */}
                <TableCell>
                  <span className="text-sm text-gray-500">{product.createdAt}</span>
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
                        <Link to={`/admin/products/${product._id}`} className="flex items-center">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/admin/products/edit/${product._id}`} className="flex items-center">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Product
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
                            Delete Product
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center">
                              <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                              Delete Product
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{product.name}"? This action cannot be undone and will permanently remove the product from your store.
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
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* 📄 EMPTY STATE */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first product'}
            </p>
            <Link to="/admin/products/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Product
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* 📊 PAGINATION (Optional - for later) */}
      {filteredProducts.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {filteredProducts.length} of {products.length} products
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

export default ProductsPage;