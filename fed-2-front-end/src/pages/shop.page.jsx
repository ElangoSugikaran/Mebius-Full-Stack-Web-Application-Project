// pages/Shop.jsx - Updated with RTK Query filtering and sorting
import { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useGetFilteredProductsQuery, useGetAllCategoriesQuery } from '../lib/api'; // CHANGED: Use filtered query
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
  const { category } = useParams();

  const { 
    data: categories = [], 
    isLoading: categoriesLoading 
  } = useGetAllCategoriesQuery();

  // State for filters and sorting
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

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // CHANGED: Use filtered products query with dynamic parameters
  const { 
    data: paginationData, 
    isLoading: productsLoading, 
    error: productsError 
  } = useGetFilteredProductsQuery({
    ...filters,
    sortBy,
    sortOrder: getSortOrder(sortBy),
    page: currentPage,
    limit: itemsPerPage
  });

  // Extract products and pagination info
  const products = paginationData?.products || [];
  const totalProducts = paginationData?.total || 0;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  // ADD DEBUG LOGS HERE:
  console.log('RTK Query Response:', paginationData);
  console.log('Products:', products);

  // Helper function to determine sort order
  function getSortOrder(sortType) {
    switch (sortType) {
      case 'price-high': return 'desc';
      case 'newest': return 'desc';
      case 'rating': return 'desc';
      default: return 'asc';
    }
  }

  // Calculate availableBrands from filtered products
  const availableBrands = useMemo(() => {
    if (!products.length) return [];
    const brands = [...new Set(products.map(product => product.brand).filter(Boolean))];
    return brands.sort();
  }, [products]);

  // Find current category info
  const currentCategory = useMemo(() => {
    if (!category || !categories.length) return null;
    
    return categories.find(cat => 
      cat.name.toLowerCase().replace(/[^a-z0-9]/g, '') === category.toLowerCase() ||
      cat.slug === category ||
      cat._id === category
    );
  }, [category, categories]);

  // Auto-select category when URL changes
  useEffect(() => {
    if (currentCategory) {
      setFilters(prev => ({
        ...prev,
        categories: [currentCategory._id]
      }));
    } else if (category === undefined) {
      setFilters(prev => ({
        ...prev,
        categories: []
      }));
    }
    // ADD THIS LINE:
    setCurrentPage(1); // Reset to first page when category changes
  }, [currentCategory, category]);

  // REMOVED: Frontend filtering and sorting logic - now handled by backend

  // Handle filter changes from FilterSidebar
  const handleFiltersChange = (newFilters) => {
  setFilters(newFilters);
  setCurrentPage(1); // ADD THIS LINE - Reset to first page
  };

  // CHANGED: Handle sort changes to trigger backend sorting  
  const handleSortChange = (newSortBy) => {
  setSortBy(newSortBy);
  setCurrentPage(1); // ADD THIS LINE - Reset to first page
  };

  // Count active filters for display
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

  // Get page title based on category
  const getPageTitle = () => {
    if (currentCategory) {
      return currentCategory.name;
    }
    if (category && !currentCategory) {
      return category.charAt(0).toUpperCase() + category.slice(1).replace(/[-_]/g, ' ');
    }
    return 'All Products';
  };

  // Show loading while data is being fetched
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

  // Show error if API call fails
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
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:w-80 flex-shrink-0">
          <FilterSidebar
            categories={categories}
            brands={availableBrands}
            onFiltersChange={handleFiltersChange}
            isOpen={true}
            onClose={() => {}}
            currentFilters={filters}
          />
        </div>

        {/* Mobile Sidebar */}
        {isSidebarOpen && (
          <div className="lg:hidden">
            <FilterSidebar
              categories={categories}
              brands={availableBrands}
              onFiltersChange={handleFiltersChange}
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              currentFilters={filters}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1">
          
          {/* Page Header */}
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
          
          {/* Filter & Controls */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
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
                          onClick={() => {
                          setFilters({
                            categories: currentCategory ? [currentCategory._id] : [],
                            brands: [],
                            priceRange: [0, 1000],
                            sizes: [],
                            colors: [],
                            gender: [],
                            inStock: false,
                            onSale: false,
                          });
                          setCurrentPage(1); // ADD THIS LINE
                        }}
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
                  
                  {/* Sort Dropdown - CHANGED: Use handleSortChange */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 hidden sm:block">Sort by:</span>
                    <Select value={sortBy} onValueChange={handleSortChange}>
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

                  {/* View Mode Toggle */}
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
                
                {/* Results Count - CHANGED: Use products directly */}
                <div className="text-sm">
                  <span className="font-medium text-gray-900">
                    {products.length}
                  </span>
                  <span className="text-gray-600 ml-1">
                    of {totalProducts} {totalProducts === 1 ? 'product' : 'products'}
                  </span>
                  {totalPages > 1 && (
                    <span className="text-gray-500 ml-2">
                      (Page {currentPage} of {totalPages})
                    </span>
                  )}
                </div>

                {/* Active Filter Tags */}
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

          {/* Products Grid */}
          <div className="p-4 lg:p-6">
            {products.length === 0 ? (
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
                        onClick={() => {
                          setFilters({
                            categories: currentCategory ? [currentCategory._id] : [],
                            brands: [],
                            priceRange: [0, 1000],
                            sizes: [],
                            colors: [],
                            gender: [],
                            inStock: false,
                            onSale: false,
                          });
                          setCurrentPage(1); // ADD THIS LINE
                        }}
                        className="mx-auto"
                      >
                        Clear Other Filters
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className={`
                  ${viewMode === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                    : 'space-y-4'
                  }
                `}>
                  {products.map((product) => (
                    <ProductCard 
                      key={product._id} 
                      product={product} 
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {/* PAGINATION CONTROLS */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center mt-8 space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;