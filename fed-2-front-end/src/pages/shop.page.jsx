// pages/Shop.jsx - Updated with category parameter handling
import { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router"; // ✅ ADD THIS
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
  Loader2,
  AlertTriangle
} from "lucide-react";

const Shop = () => {
  // ✅ GET CATEGORY FROM URL PARAMETER
  const { category } = useParams();

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

  // ✅ FIXED: Calculate availableBrands from products
  const availableBrands = useMemo(() => {
    if (!products.length) return [];
    
    // Extract unique brands from products
    const brands = [...new Set(products.map(product => product.brand).filter(Boolean))];
    return brands.sort(); // Sort alphabetically
  }, [products]);

  // ✅ FIND CURRENT CATEGORY INFO
  const currentCategory = useMemo(() => {
    if (!category || !categories.length) return null;
    
    // Find category by matching the URL parameter with category name or slug
    return categories.find(cat => 
      cat.name.toLowerCase().replace(/[^a-z0-9]/g, '') === category.toLowerCase() ||
      cat.slug === category ||
      cat._id === category
    );
  }, [category, categories]);

  // 📝 CLEANED STATE - Remove searchQuery, keep only filtering
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ✅ AUTO-SELECT CATEGORY WHEN URL CHANGES
  useEffect(() => {
    if (currentCategory) {
      setFilters(prev => ({
        ...prev,
        categories: [currentCategory._id] // Automatically filter by current category
      }));
    } else if (category === undefined) {
      // Reset category filter when on main shop page
      setFilters(prev => ({
        ...prev,
        categories: []
      }));
    }
  }, [currentCategory, category]);

  // 📝 CLEANED FILTERING LOGIC - Only filters, no search
  const filteredProducts = useMemo(() => {
    if (!products.length) return [];

    return products.filter(product => {
      // ✅ CATEGORY FILTER - Enhanced for better matching
      if (filters.categories.length > 0) {
        const matchesCategory = filters.categories.some(catId => {
          // Direct ID match
          if (product.categoryId === catId) return true;
          
          // If product has category object instead of just ID
          if (product.category && product.category._id === catId) return true;
          
          // If product.category is a string that matches category name
          if (typeof product.category === 'string') {
            const matchingCat = categories.find(cat => cat._id === catId);
            return matchingCat && product.category.toLowerCase() === matchingCat.name.toLowerCase();
          }
          
          return false;
        });
        
        if (!matchesCategory) return false;
      }

      // Brand filter
      if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) {
        return false;
      }

      // Price filter - Use finalPrice if available, otherwise calculate
      const productPrice = product.finalPrice || 
        (product.discount > 0 
          ? product.price * (1 - product.discount / 100)
          : product.price);
      
      if (productPrice < filters.priceRange[0] || productPrice > filters.priceRange[1]) {
        return false;
      }

      // Size filter
      if (filters.sizes.length > 0) {
        const hasMatchingSize = product.sizes?.some(size => 
          filters.sizes.includes(size)
        );
        if (!hasMatchingSize) return false;
      }

      // Color filter
      if (filters.colors.length > 0) {
        const hasMatchingColor = product.colors?.some(color => 
          filters.colors.includes(color)
        );
        if (!hasMatchingColor) return false;
      }

      // Gender filter
      if (filters.gender.length > 0 && !filters.gender.includes(product.gender)) {
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
  }, [products, filters, categories]);

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

  // ✅ GET PAGE TITLE BASED ON CATEGORY
  const getPageTitle = () => {
    if (currentCategory) {
      return currentCategory.name;
    }
    if (category && !currentCategory) {
      // Capitalize and format URL parameter if category not found in database
      return category.charAt(0).toUpperCase() + category.slice(1).replace(/[-_]/g, ' ');
    }
    return 'All Products';
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
            currentFilters={filters} // ✅ Pass current filters to sidebar
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
              currentFilters={filters} // ✅ Pass current filters to sidebar
            />
          </div>
        )}

        {/* 📄 MAIN CONTENT */}
        <div className="flex-1">
          
          {/* ✅ PAGE HEADER - Show current category */}
          <div className="bg-white border-b border-gray-200 px-4 py-6">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {getPageTitle()}
              </h1>
              {currentCategory?.description && (
                <p className="text-gray-600">
                  {currentCategory.description}
                </p>
              )}
              {category && !currentCategory && (
                <p className="text-gray-600">
                  Browse our collection of {category.replace(/[-_]/g, ' ')} products
                </p>
              )}
            </div>
          </div>
          
          {/* 🔍 FILTER & CONTROLS (No Search - handled in Navigation) */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
            {/* Main Controls Row */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                
                {/* Left Section - Filter Button & Active Filters Info */}
                <div className="flex items-center gap-4">
                  
                  {/* Mobile Filter Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSidebarOpen(true)}
                    className="lg:hidden"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {getActiveFiltersCount() > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                        {getActiveFiltersCount()}
                      </Badge>
                    )}
                  </Button>

                  {/* Desktop Active Filters Indicator */}
                  <div className="hidden lg:flex items-center gap-3">
                    {getActiveFiltersCount() > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          {getActiveFiltersCount()} filter{getActiveFiltersCount() > 1 ? 's' : ''} applied
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFilters({
                            categories: currentCategory ? [currentCategory._id] : [], // ✅ Keep category filter if on category page
                            brands: [],
                            priceRange: [0, 1000],
                            sizes: [],
                            colors: [],
                            gender: [],
                            inStock: false,
                            onSale: false,
                          })}
                          className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 h-auto font-medium"
                        >
                          Clear other filters
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">
                        {currentCategory ? currentCategory.name : 'All products'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Section - Sort & View Controls */}
                <div className="flex items-center gap-3">
                  
                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 hidden sm:block">Sort by:</span>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40 sm:w-44">
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
                  </div>

                  {/* View Mode Toggle - Desktop only */}
                  <div className="hidden md:flex border border-gray-300 rounded-md overflow-hidden">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="rounded-none border-r"
                      title="Grid view"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="rounded-none"
                      title="List view"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Info Bar */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between">
                
                {/* Results Count */}
                <div className="text-sm">
                  <span className="font-medium text-gray-900">
                    {sortedProducts.length}
                  </span>
                  <span className="text-gray-600 ml-1">
                    {sortedProducts.length === 1 ? 'product' : 'products'}
                    {sortedProducts.length !== products.length && (
                      <span className="text-gray-500"> of {products.length} total</span>
                    )}
                  </span>
                </div>

                {/* Active Filter Tags - Desktop Only */}
                {getActiveFiltersCount() > 0 && (
                  <div className="hidden lg:flex items-center gap-2">
                    <div className="flex items-center gap-1 flex-wrap">
                      {filters.categories.length > 0 && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          Categories ({filters.categories.length})
                        </Badge>
                      )}
                      {filters.brands.length > 0 && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          Brands ({filters.brands.length})
                        </Badge>
                      )}
                      {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) && (
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                          Price Range
                        </Badge>
                      )}
                      {filters.sizes.length > 0 && (
                        <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                          Sizes ({filters.sizes.length})
                        </Badge>
                      )}
                      {filters.colors.length > 0 && (
                        <Badge variant="outline" className="text-xs bg-pink-50 text-pink-700 border-pink-200">
                          Colors ({filters.colors.length})
                        </Badge>
                      )}
                      {filters.gender.length > 0 && (
                        <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                          Gender ({filters.gender.length})
                        </Badge>
                      )}
                      {filters.inStock && (
                        <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                          In Stock
                        </Badge>
                      )}
                      {filters.onSale && (
                        <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                          On Sale
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          

          {/* 🛍️ PRODUCTS GRID */}
          <div className="p-4 lg:p-6">
            {sortedProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Filter className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    No products match your filters
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your filters to see more products, or browse all available items.
                  </p>
                  <div className="space-y-3">
                    {getActiveFiltersCount() > 0 && (
                      <Button 
                        variant="default"
                        onClick={() => setFilters({
                          categories: currentCategory ? [currentCategory._id] : [], // ✅ Keep category filter
                          brands: [],
                          priceRange: [0, 1000],
                          sizes: [],
                          colors: [],
                          gender: [],
                          inStock: false,
                          onSale: false,
                        })}
                        className="mx-auto"
                      >
                        Clear Other Filters
                      </Button>
                    )}
                    <div className="text-sm text-gray-500">
                      Showing 0 of {products.length} products
                    </div>
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