// components/ProductCard.jsx - Reusable product card component
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSelector, useDispatch } from "react-redux";
import { addToCart } from "@/lib/features/cartSlice";
import { 
  addToWishlist, 
  removeFromWishlist, 
  selectIsInWishlist 
} from "@/lib/features/wishlistSlice";

import { Heart, ShoppingCart, Eye, Star } from "lucide-react";
import { Link } from "react-router";

function ProductCard({ product }) {
  const dispatch = useDispatch();
  // const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // WITH THIS LINE:
  const isWishlisted = useSelector(state => selectIsInWishlist(state, product._id)); // ✅ ADD THIS

  // 📝 LEARNING: Calculate price after discount
  const calculateFinalPrice = (price, discount) => {
    if (!discount || discount === 0) return price;
    return (price * (1 - discount / 100)).toFixed(2);
  };

  // 📝 LEARNING: Add product to cart with Redux
  const handleAddToCart = () => {
  dispatch(
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,        // 🔧 FIX: Keep original price as number
      discount: product.discount || 0,  // 🔧 FIX: Send discount separately
      originalPrice: product.price,
      image: product.image,
      brand: product.brand,
      sizes: product.sizes,
      colors: product.colors,
      stock: product.stock,        // 🔧 FIX: Include stock for validation
    })
  );
};

  // 📝 LEARNING: Toggle wishlist state
 const handleWishlistToggle = () => {
  if (isWishlisted) {
    dispatch(removeFromWishlist(product._id));  // Remove if already in wishlist
  } else {
    dispatch(addToWishlist(product));           // Add if not in wishlist
  }
};

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
      
      {/* 🖼️ PRODUCT IMAGE */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => setImageLoading(false)}
          onError={(e) => {
            e.target.src = '/placeholder-product.jpg';
            setImageLoading(false);
          }}
        />
        
        {/* Loading Animation */}
        {imageLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
          </div>
        )}

        {/* Discount Badge */}
        {product.discount > 0 && (
          <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600 text-white">
            -{product.discount}%
          </Badge>
        )}

        {/* Out of Stock Badge */}
        {product.stock === 0 && (
          <Badge className="absolute top-3 right-3 bg-gray-500 text-white">
            Out of Stock
          </Badge>
        )}

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            
            {/* Wishlist Button */}
            {/* // 4️⃣ UPDATE YOUR WISHLIST BUTTON STYLING (find this part in your code and update it): */}
            <Link to={`/shop/wishlist`}>
              <Button
                size="sm"
                variant="secondary"
                className={`w-10 h-10 rounded-full p-0 transition-all duration-200 ${
                  isWishlisted 
                    ? 'bg-red-50 hover:bg-red-100 border-red-200' 
                    : 'bg-white/90 hover:bg-white'
                }`}
                onClick={handleWishlistToggle}
              >
                <Heart 
                  className={`h-4 w-4 transition-colors duration-200 ${
                    isWishlisted 
                      ? 'fill-red-500 text-red-500' 
                      : 'text-gray-600 hover:text-red-400'
                  }`} 
                />
              </Button>
            </Link>

            {/* Quick View Button - Links to Product Detail Page */}
             <Link to={`/shop/product-details/${product._id}`}>
              <Button
                size="sm"
                variant="secondary"
                className="w-10 h-10 rounded-full p-0 bg-white/90 hover:bg-white"
              >
                <Eye className="h-4 w-4 text-gray-600" />
              </Button>
            </Link>
          </div>

          {/* Quick Add to Cart */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full bg-white/90 hover:bg-white text-gray-900 hover:text-gray-900"
              size="sm"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {product.stock === 0 ? 'Out of Stock' : 'Quick Add'}
            </Button>
          </div>
        </div>
      </div>

      {/* 📄 PRODUCT INFO */}
      <div className="p-4">
        {/* Brand & Rating */}
        <div className="flex items-center justify-between mb-2">
          {product.brand && (
            <Badge variant="outline" className="text-xs">
              {product.brand}
            </Badge>
          )}
          {product.averageRating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-600">
                {product.averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Product Name - Links to Product Detail */}
        <Link to={`/product-details/${product._id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Available Colors */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex gap-1 mb-3">
            {product.colors.slice(0, 4).map((color, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded-full border-2 border-gray-200"
                style={{ backgroundColor: color.toLowerCase() }}
                title={color}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-xs text-gray-500 ml-1">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Price Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {product.discount > 0 ? (
              <>
                <span className="text-lg font-bold text-gray-900">
                  ${calculateFinalPrice(product.price, product.discount)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  ${product.price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="px-3"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>

        {/* Available Sizes */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Available sizes:</p>
            <div className="flex gap-1">
              {product.sizes.slice(0, 5).map((size, index) => (
                <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                  {size}
                </Badge>
              ))}
              {product.sizes.length > 5 && (
                <span className="text-xs text-gray-500">
                  +{product.sizes.length - 5}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;