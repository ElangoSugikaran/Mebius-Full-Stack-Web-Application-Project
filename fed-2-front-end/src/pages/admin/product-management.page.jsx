// File: src/pages/admin/ProductsPage.jsx

import { useState } from 'react';
import { Link } from 'react-router';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Eye,
  MoreHorizontal,
  Package
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useGetAllProductsQuery } from '@/lib/api'; 

const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

//   // 📦 MOCK PRODUCTS DATA (Replace with your actual data)
//   const products = [
//     {
//       id: 1,
//       name: 'Wireless Headphones',
//       category: 'Electronics',
//       price: 99.99,
//       stock: 45,
//       status: 'active',
//       image: '/api/placeholder/60/60',
//       createdAt: '2024-01-15'
//     },
//     {
//       id: 2,
//       name: 'Cotton T-Shirt',
//       category: 'Clothing',
//       price: 24.99,
//       stock: 0,
//       status: 'out_of_stock',
//       image: '/api/placeholder/60/60',
//       createdAt: '2024-01-12'
//     },
//     {
//       id: 3,
//       name: 'Laptop Stand',
//       category: 'Accessories',
//       price: 49.99,
//       stock: 12,
//       status: 'active',
//       image: '/api/placeholder/60/60',
//       createdAt: '2024-01-10'
//     }
//   ];

    const { data: products = [], isLoading, error } = useGetAllProductsQuery();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading products.</div>;

  // 🔍 FILTER PRODUCTS
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🎨 STATUS BADGE STYLING
  const getStatusBadge = (status) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      out_of_stock: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800'
    };
    
    const labels = {
      active: 'Active',
      out_of_stock: 'Out of Stock',
      draft: 'Draft'
    };

    return (
      <Badge className={variants[status]}>
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
              <TableRow key={product.id}>
                
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
                    <p className="text-sm text-gray-500">ID: #{product.id}</p>
                  </div>
                </TableCell>
                
                {/* 🏷️ CATEGORY */}
                <TableCell>
                  <Badge variant="outline">{product.category}</Badge>
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
                  {getStatusBadge(product.status)}
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
                      <DropdownMenuItem>
                       <Link to={`/admin/products/${product._id}`} className="flex items-center">
                         <Eye className="mr-2 h-4 w-4" />
                         View Details
                       </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link to={`/admin/products/edit/${product._id}`} className="flex items-center">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Product
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                       <Link to={`/admin/products/delete/${product._id}`} className="flex items-center">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Product
                       </Link>
                      </DropdownMenuItem>
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