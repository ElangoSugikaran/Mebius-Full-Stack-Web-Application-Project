// components/ProductCard.jsx - Updated with comprehensive error handling
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDispatch } from "react-redux";
import { useAddToCartMutation } from "@/lib/api";
import { addToCart } from "@/lib/features/cartSlice";
import { Heart, ShoppingCart, Eye, Star } from "lucide-react";
import { Link } from "react-router";
import { useAddToWishlistMutation, useRemoveFromWishlistMutation, useGetWishlistQuery } from "@/lib/api";


function ProductCard({ product }) {
  const dispatch = useDispatch();
  const [imageLoading, setImageLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [message, setMessage] = useState('');

  const [addToCartMutation] = useAddToCartMutation();

  // 🔧 ADD THESE WISHLIST HOOKS
  const { data: wishlist = [], isLoading: wishlistLoading } = useGetWishlistQuery();
  const [addToWishlist, { isLoading: isAddingToWishlist }] = useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: isRemovingFromWishlist }] = useRemoveFromWishlistMutation();

  // Calculate price after discount
  const calculateFinalPrice = (price, discount) => {
    if (!discount || discount === 0) return price;
    return (price * (1 - discount / 100)).toFixed(2);
  };

  // 🔧 IMPROVED: Better add to cart with comprehensive error handling
  const handleAddToCart = async () => {
    if (!product || isAddingToCart) return;
    
    setIsAddingToCart(true);
    setMessage('');
    
    try {
      // 📝 STEP 1: Always update Redux state first for immediate UI feedback
      dispatch(addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        discount: product.discount || 0,
        image: product.image,
        brand: product.brand,
        sizes: product.sizes,
        colors: product.colors,
        stock: product.stock,
      }));

      console.log('🔄 Adding to cart:', product.name);

      // 📝 STEP 2: Try to sync with server
      try {
        const result = await addToCartMutation({
          productId: product._id,
          quantity: 1,
        }).unwrap();
        
        console.log('✅ Product synced with server cart:', result);
        setMessage('✅ Product added to cart!');
        
        // Clear success message after 2 seconds
        setTimeout(() => setMessage(''), 2000);
        
      } catch (serverError) {
        console.warn('⚠️ Server sync failed, using local cart only:', serverError);
        
        // Check if it's a specific error we can handle
        if (serverError.status === 404) {
          setMessage('⚠️ Server unavailable, added to local cart');
        } else if (serverError.status === 400) {
          setMessage('⚠️ ' + (serverError.data?.message || 'Invalid request'));
        } else if (serverError.status === 401) {
          setMessage('⚠️ Please log in to sync cart');
        } else {
          setMessage('⚠️ Added to local cart only');
        }
        
        // Clear warning message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      }

    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      setMessage('❌ Failed to add to cart');
      
      // Clear error message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // 🔧 ADD THIS HELPER FUNCTION
  const isInWishlist = () => {
    if (!wishlist || !Array.isArray(wishlist)) return false;
    return wishlist.some(item => {
      const itemId = item.productId?._id || item.productId || item._id;
      return itemId === product._id;
    });
  };

  // 🔧 ADD THIS WISHLIST HANDLER
  const handleWishlistToggle = async () => {
    if (!product?._id || isAddingToWishlist || isRemovingFromWishlist) return;

    try {
      if (isInWishlist()) {
        await removeFromWishlist(product._id).unwrap();
        console.log('✅ Removed from wishlist:', product.name);
        setMessage('💔 Removed from wishlist');
      } else {
        await addToWishlist(product._id).unwrap();
        console.log('✅ Added to wishlist:', product.name);
        setMessage('❤️ Added to wishlist!');
      }
      
      // Clear message after 2 seconds
      setTimeout(() => setMessage(''), 2000);
      
    } catch (error) {
      console.error('❌ Wishlist error:', error);
      if (error.status === 401) {
        setMessage('⚠️ Please log in to use wishlist');
      } else {
        setMessage('❌ Wishlist action failed');
      }
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
      
      {/* Status Messages - UPDATED */}
      {message && (
        <div className={`absolute top-2 left-2 right-2 z-10 text-xs px-2 py-1 rounded text-center font-medium ${
          message.includes('✅') || message.includes('❤️') ? 'bg-green-100 text-green-800' :
          message.includes('💔') ? 'bg-pink-100 text-pink-800' :
          message.includes('⚠️') ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}
      
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

        {/* Stock Status Badge */}
        {product.stock === 0 && (
          <Badge className="absolute top-3 right-3 bg-gray-500 text-white">
            Out of Stock
          </Badge>
        )}

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      
            {/* 🔧 UPDATED: Wishlist Button */}
            <Button
              size="sm"
              variant="secondary"
              onClick={handleWishlistToggle}
              disabled={isAddingToWishlist || isRemovingFromWishlist || wishlistLoading}
              className={`w-10 h-10 rounded-full p-0 ${
                isInWishlist() 
                  ? 'bg-pink-100 hover:bg-pink-200 border-pink-300' 
                  : 'bg-white/90 hover:bg-white'
              }`}
            >
              <Heart className={`h-4 w-4 ${
                isInWishlist() 
                  ? 'text-pink-600 fill-pink-600' 
                  : 'text-gray-600'
              }`} />
            </Button>

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
              disabled={product.stock === 0 || isAddingToCart}
              className="w-full bg-white/90 hover:bg-white text-gray-900 hover:text-gray-900"
              size="sm"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {isAddingToCart ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Quick Add'}
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
        <Link to={`/shop/product-details/${product._id}`}>
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
            disabled={product.stock === 0 || isAddingToCart}
            className="px-3"
          >
            {isAddingToCart ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
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

        {/* Stock Information */}
        {product.stock > 0 && product.stock < 10 && (
          <div className="mt-2 text-xs text-orange-600">
            Only {product.stock} left in stock
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;