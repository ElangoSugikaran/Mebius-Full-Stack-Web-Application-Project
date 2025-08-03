// pages/Shop.jsx - Main shop page with fixed sidebar conditions
import { useState, useEffect, useMemo } from "react";
import { useGetAllProductsQuery, useGetAllCategoriesQuery } from '../lib/api';
import ProductCard from '@/components/ShopProductCard';
import FilterSidebar from '@/components/FilterSidebar';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Filter, 
  Grid3X3, 
  List, 
  Search, 
  Loader2,
  AlertTriangle
} from "lucide-react";

const Shop = () => {
  // 📝 LEARNING: Fetch data from your backend API
  const { 
    data: products = [], 
    isLoading: productsLoading, 
    error: productsError 
  } = useGetAllProductsQuery();
  
  const { 
    data: categories = [], 
    isLoading: categoriesLoading 
  } = useGetAllCategoriesQuery();

  // 📝 LEARNING: State for filters, search, sorting, etc.
  const [filters, setFilters] = useState({
    categories: [],
    brands: [],
    priceRange: [0, 1000],
    sizes: [],
    colors: [],
    gender: [],
    inStock: false,
    onSale: false,
  });
  
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 📝 LEARNING: Get unique brands from products
  const availableBrands = useMemo(() => {
    if (!products.length) return [];
    const brands = [...new Set(products.map(product => product.brand).filter(Boolean))];
    return brands.sort();
  }, [products]);

  // 📝 LEARNING: Filter products based on current filters
  const filteredProducts = useMemo(() => {
    if (!products.length) return [];

    return products.filter(product => {
      // Search filter
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(product.categoryId)) {
        return false;
      }

      // Brand filter
      if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) {
        return false;
      }

      // Price filter
      const productPrice = product.discount > 0 
        ? product.price * (1 - product.discount / 100)
        : product.price;
      
      if (productPrice < filters.priceRange[0] || productPrice > filters.priceRange[1]) {
        return false;
      }

      // Stock filter
      if (filters.inStock && product.stock === 0) {
        return false;
      }

      // Sale filter
      if (filters.onSale && (!product.discount || product.discount === 0)) {
        return false;
      }

      return true;
    });
  }, [products, filters, searchQuery]);

  // 📝 LEARNING: Sort the filtered products
  const sortedProducts = useMemo(() => {
    const productsCopy = [...filteredProducts];

    switch (sortBy) {
      case 'price-low':
        return productsCopy.sort((a, b) => {
          const priceA = a.discount > 0 ? a.price * (1 - a.discount / 100) : a.price;
          const priceB = b.discount > 0 ? b.price * (1 - b.discount / 100) : b.price;
          return priceA - priceB;
        });
      case 'price-high':
        return productsCopy.sort((a, b) => {
          const priceA = a.discount > 0 ? a.price * (1 - a.discount / 100) : a.price;
          const priceB = b.discount > 0 ? b.price * (1 - b.discount / 100) : b.price;
          return priceB - priceA;
        });
      case 'newest':
        return productsCopy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'rating':
        return productsCopy.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
      case 'name':
      default:
        return productsCopy.sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [filteredProducts, sortBy]);

  // 📝 LEARNING: Handle filter changes from FilterSidebar component
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  // 📝 LEARNING: Count active filters for display
  const getActiveFiltersCount = () => {
    let count = 0;
    count += filters.categories.length;
    count += filters.brands.length;
    count += filters.sizes.length;
    count += filters.colors.length;
    count += filters.gender.length;
    if (filters.inStock) count++;
    if (filters.onSale) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) count++;
    return count;
  };

  // 📝 LEARNING: Show loading while data is being fetched
  if (productsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600">Loading products...</span>
          </div>
        </div>
      </div>
    );
  }

  // 📝 LEARNING: Show error if API call fails
  if (productsError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Products</h2>
            <p className="text-gray-600 mb-4">
              {productsError?.data?.message || 'Failed to load products'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        
        {/* 🗂️ DESKTOP SIDEBAR - Only visible on large screens and above */}
        <div className="hidden lg:block lg:w-80 flex-shrink-0">
          <FilterSidebar
            categories={categories}
            brands={availableBrands}
            onFiltersChange={handleFiltersChange}
            isOpen={true}
            onClose={() => {}}
          />
        </div>

        {/* 📱 MOBILE SIDEBAR - Only rendered when isSidebarOpen is true */}
        {isSidebarOpen && (
          <div className="lg:hidden">
            <FilterSidebar
              categories={categories}
              brands={availableBrands}
              onFiltersChange={handleFiltersChange}
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>
        )}

        {/* 📄 MAIN CONTENT */}
        <div className="flex-1">
          
          {/* 🔍 SEARCH & CONTROLS */}
          <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-30">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              
              <div className="flex items-center gap-3">
                {/* Mobile Filter Button - Only visible on screens smaller than lg */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {getActiveFiltersCount() > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {getActiveFiltersCount()}
                    </Badge>
                  )}
                </Button>

                {/* Search Input */}
                <div className="relative flex-1 md:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="price-low">Price (Low to High)</SelectItem>
                    <SelectItem value="price-high">Price (High to Low)</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode Toggle - Only visible on medium screens and above */}
                <div className="hidden md:flex border border-gray-300 rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Results Info */}
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
              <span>
                Showing {sortedProducts.length} of {products.length} products
                {searchQuery && ` for "${searchQuery}"`}
              </span>
            </div>
          </div>

          {/* 🛍️ PRODUCTS GRID */}
          <div className="p-4 lg:p-6">
            {sortedProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search or filters to find what you're looking for.
                  </p>
                  <div className="space-x-3">
                    {searchQuery && (
                      <Button variant="outline" onClick={() => setSearchQuery('')}>
                        Clear Search
                      </Button>
                    )}
                    {getActiveFiltersCount() > 0 && (
                      <Button 
                        variant="outline"
                        onClick={() => setFilters({
                          categories: [],
                          brands: [],
                          priceRange: [0, 1000],
                          sizes: [],
                          colors: [],
                          gender: [],
                          inStock: false,
                          onSale: false,
                        })}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className={`
                ${viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                  : 'space-y-4'
                }
              `}>
                {sortedProducts.map((product) => (
                  <ProductCard 
                    key={product._id} 
                    product={product} 
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;