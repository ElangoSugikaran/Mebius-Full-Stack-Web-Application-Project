import { useGetProductsBySearchQuery } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { Input } from "./ui/input";
import { Link } from "react-router";
import { X, Search } from "lucide-react";

function ProductSearchForm({ onClose }) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);

  const { data: products, isLoading } = useGetProductsBySearchQuery(search, {
    skip: !search || search.length < 2, // Only search if 2+ characters
  });

  // Focus input when component mounts
  useEffect(() => {
    if (searchRef.current) {
      searchRef.current.focus();
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setIsOpen(value.length >= 2);
  };

  const handleProductClick = () => {
    setSearch("");
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleClear = () => {
    setSearch("");
    setIsOpen(false);
    if (searchRef.current) {
      searchRef.current.focus();
    }
  };

  return (
    <div className="relative max-w-md mx-auto" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search products..."
          className="w-full pl-10 pr-10"
          value={search}
          onChange={handleInputChange}
          onFocus={() => search.length >= 2 && setIsOpen(true)}
        />
        {search && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      <div
        className={cn(
          "absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto",
          {
            "hidden": !isOpen || search.length < 2,
            "block": isOpen && search.length >= 2
          }
        )}
      >
        {isLoading && (
          <div className="px-4 py-3 text-center text-gray-500">
            <div className="animate-spin inline-block w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
            <span className="ml-2">Searching...</span>
          </div>
        )}

        {!isLoading && products && products.length > 0 && (
          <div className="py-2">
            {products.slice(0, 6).map((product) => (
              <Link
                to={`/shop/product-details/${product._id}`}
                key={product._id}
                className="flex items-center px-4 py-2 hover:bg-gray-50 transition-colors"
                onClick={handleProductClick}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-10 h-10 object-cover rounded mr-3"
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg'; // Fallback image
                  }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    ${product.finalPrice || product.price}
                  </p>
                </div>
              </Link>
            ))}
            {products.length > 6 && (
              <div className="px-4 py-2 text-xs text-gray-500 border-t">
                +{products.length - 6} more results
              </div>
            )}
          </div>
        )}

        {!isLoading && (!products || products.length === 0) && search.length >= 2 && (
          <div className="px-4 py-3 text-center text-gray-500">
            <p>No products found for "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductSearchForm;