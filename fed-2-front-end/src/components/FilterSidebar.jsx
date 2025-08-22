// Updated FilterSidebar.jsx - Now uses dynamic data from database
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { X, Filter, RotateCcw, Loader2 } from "lucide-react";

// 🔧 NEW: Import RTK Query hook for filter options
import { useGetFilterOptionsQuery } from "../lib/api";

function FilterSidebar({ 
  categories = [], 
  onFiltersChange, 
  isOpen, 
  onClose 
}) {
  // 🔧 NEW: Fetch dynamic filter options from database
  const { 
    data: filterOptionsData, 
    isLoading: isLoadingOptions, 
    error: optionsError 
  } = useGetFilterOptionsQuery();

  // 📝 LEARNING: Local state to manage all filter options
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

  // 🔧 NEW: Update price range when data loads
  useEffect(() => {
    if (filterOptionsData?.priceRange) {
      setFilters(prev => ({
        ...prev,
        priceRange: [
          filterOptionsData.priceRange.min, 
          filterOptionsData.priceRange.max
        ]
      }));
    }
  }, [filterOptionsData]);

  // 🔧 NEW: Get dynamic options from API or fallback to defaults
  const availableSizes = filterOptionsData?.sizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const availableColors = filterOptionsData?.colors || ['Black', 'White', 'Red', 'Blue', 'Green', 'Gray', 'Brown'];
  const availableGenders = filterOptionsData?.genders || ['Men', 'Women', 'Unisex'];
  const availableBrands = filterOptionsData?.brands || [];
  const priceRange = filterOptionsData?.priceRange || { min: 0, max: 1000 };

  // 📝 LEARNING: Handle array-based filters (categories, brands, sizes, etc.)
  const handleCheckboxChange = (filterType, value, checked) => {
    const updatedFilters = { ...filters };
    
    if (checked) {
      // Add to array if checked
      updatedFilters[filterType] = [...updatedFilters[filterType], value];
    } else {
      // Remove from array if unchecked
      updatedFilters[filterType] = updatedFilters[filterType].filter(item => item !== value);
    }
    
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters); // Send to parent (Shop page)
  };

  // 📝 LEARNING: Handle boolean filters (inStock, onSale)
  const handleBooleanChange = (filterType, checked) => {
    const updatedFilters = {
      ...filters,
      [filterType]: checked
    };
    
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  // 📝 LEARNING: Handle price range slider
  const handlePriceChange = (newPriceRange) => {
    const updatedFilters = {
      ...filters,
      priceRange: newPriceRange
    };
    
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  // 📝 LEARNING: Reset all filters to default
  const clearAllFilters = () => {
    const clearedFilters = {
      categories: [],
      brands: [],
      priceRange: [priceRange.min, priceRange.max],
      sizes: [],
      colors: [],
      gender: [],
      inStock: false,
      onSale: false,
    };
    
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  // 📝 LEARNING: Count how many filters are active
  const getActiveFiltersCount = () => {
    let count = 0;
    count += filters.categories.length;
    count += filters.brands.length;
    count += filters.sizes.length;
    count += filters.colors.length;
    count += filters.gender.length;
    if (filters.inStock) count++;
    if (filters.onSale) count++;
    if (filters.priceRange[0] > priceRange.min || filters.priceRange[1] < priceRange.max) count++;
    return count;
  };

  // 🔧 NEW: Show loading state while fetching filter options
  if (isLoadingOptions) {
    return (
      <div className="fixed top-0 left-0 h-full w-80 bg-white border-r border-gray-200 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading filters...</span>
        </div>
      </div>
    );
  }

  // 🔧 NEW: Show error state if filter options fail to load
  if (optionsError) {
    return (
      <div className="fixed top-0 left-0 h-full w-80 bg-white border-r border-gray-200 flex items-center justify-center">
        <div className="text-center text-red-500 p-4">
          <p>Failed to load filter options</p>
          <p className="text-sm text-gray-500 mt-2">Using default values</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 📱 MOBILE OVERLAY */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}

      {/* 🗂️ FILTER SIDEBAR */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 lg:relative lg:transform-none lg:z-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        overflow-y-auto border-r border-gray-200
      `}>
        
        {/* HEADER */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Filters</h2>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Clear All Button */}
            {getActiveFiltersCount() > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
            
            {/* Close Button (Mobile Only) */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* FILTER CONTENT */}
        <div className="p-4 space-y-6">
          
          {/* 💰 PRICE RANGE - Now uses dynamic range */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Price Range</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Slider
                value={filters.priceRange}
                onValueChange={handlePriceChange}
                max={priceRange.max}
                min={priceRange.min}
                step={10}
                className="w-full"
              />
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>${filters.priceRange[0]}</span>
                <span>${filters.priceRange[1]}</span>
              </div>
            </CardContent>
          </Card>

          {/* 📂 CATEGORIES - Uses props from parent */}
          {categories.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categories.map((category) => (
                  <div key={category._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category._id}`}
                      checked={filters.categories.includes(category._id)}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange('categories', category._id, checked)
                      }
                    />
                    <Label 
                      htmlFor={`category-${category._id}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {category.name}
                    </Label>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 🏷️ BRANDS - Now dynamic from database */}
          {availableBrands.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Brands</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {availableBrands.map((brand, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${index}`}
                      checked={filters.brands.includes(brand)}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange('brands', brand, checked)
                      }
                    />
                    <Label 
                      htmlFor={`brand-${index}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {brand}
                    </Label>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 👥 GENDER - Now uses dynamic data */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Gender</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {availableGenders.map((gender) => (
                <div key={gender} className="flex items-center space-x-2">
                  <Checkbox
                    id={`gender-${gender}`}
                    checked={filters.gender.includes(gender)}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('gender', gender, checked)
                    }
                  />
                  <Label 
                    htmlFor={`gender-${gender}`}
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {gender}
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 📏 SIZES - Now uses dynamic data */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Sizes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {availableSizes.map((size) => (
                  <Label
                    key={size}
                    className={`
                      flex items-center justify-center h-10 border-2 rounded-md cursor-pointer transition-colors
                      ${filters.sizes.includes(size) 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={filters.sizes.includes(size)}
                      onChange={(e) => 
                        handleCheckboxChange('sizes', size, e.target.checked)
                      }
                    />
                    <span className="text-sm font-medium">{size}</span>
                  </Label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 🎨 COLORS - Now uses dynamic data */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {availableColors.map((color) => (
                  <Label
                    key={color}
                    className={`
                      flex flex-col items-center gap-1 cursor-pointer p-2 rounded-md transition-colors
                      ${filters.colors.includes(color) 
                        ? 'bg-gray-100' 
                        : 'hover:bg-gray-50'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={filters.colors.includes(color)}
                      onChange={(e) => 
                        handleCheckboxChange('colors', color, e.target.checked)
                      }
                    />
                    <div 
                      className={`
                        w-6 h-6 rounded-full border-2 
                        ${filters.colors.includes(color) 
                          ? 'border-gray-900' 
                          : 'border-gray-300'
                        }
                      `}
                      style={{ backgroundColor: color.toLowerCase() }}
                    />
                    <span className="text-xs">{color}</span>
                  </Label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ✅ AVAILABILITY FILTERS - Unchanged, no dynamic data needed */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="in-stock"
                  checked={filters.inStock}
                  onCheckedChange={(checked) => 
                    handleBooleanChange('inStock', checked)
                  }
                />
                <Label htmlFor="in-stock" className="text-sm font-normal cursor-pointer">
                  In Stock Only
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="on-sale"
                  checked={filters.onSale}
                  onCheckedChange={(checked) => 
                    handleBooleanChange('onSale', checked)
                  }
                />
                <Label htmlFor="on-sale" className="text-sm font-normal cursor-pointer">
                  On Sale
                </Label>
              </div>
            </CardContent>
          </Card>
          
        </div>
      </div>
    </>
  );
}

export default FilterSidebar;