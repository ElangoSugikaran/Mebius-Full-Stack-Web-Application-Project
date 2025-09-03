import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDispatch } from "react-redux";
import { useAddToCartMutation } from "@/lib/api";
import { addToCart } from "@/lib/features/cartSlice";
import { Heart, ShoppingCart, Eye, Star, X } from "lucide-react";
import { Link } from "react-router";
import { toast } from 'react-toastify';
import { useAddToWishlistMutation, useRemoveFromWishlistMutation, useGetWishlistQuery } from "@/lib/api";

function ProductCard({ product }) {
  const dispatch = useDispatch();
  const [imageLoading, setImageLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addToCartMutation] = useAddToCartMutation();

  // 🔧 NEW: Add modal state for size/color selection
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  // Existing wishlist hooks
  const { data: wishlist = [], isLoading: wishlistLoading } = useGetWishlistQuery();
  const [addToWishlist, { isLoading: isAddingToWishlist }] = useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: isRemovingFromWishlist }] = useRemoveFromWishlistMutation();

  // 🔧 FIXED: New handleAddToCart that checks for variants
  const handleAddToCart = async () => {
    if (!product || isAddingToCart) return;
    
    // 🔧 CHECK: If product has sizes or colors, show selection modal first
    const hasVariants = (product.sizes && product.sizes.length > 0) || 
                       (product.colors && product.colors.length > 0);
    
    if (hasVariants && (!selectedSize && product.sizes?.length > 0) || 
        (!selectedColor && product.colors?.length > 0)) {
      // Set default selections
      if (product.sizes?.length > 0 && !selectedSize) {
        setSelectedSize(product.sizes[0]);
      }
      if (product.colors?.length > 0 && !selectedColor) {
        setSelectedColor(product.colors[0]);
      }
      setShowVariantModal(true);
      return;
    }

    // Proceed with adding to cart
    await addProductToCart();
  };

  // 🔧 NEW: Separate function for actual cart addition
  const addProductToCart = async () => {
    setIsAddingToCart(true);
    
    try {
      // Always update Redux state first for immediate UI feedback
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
        size: selectedSize || null,
        color: selectedColor || null,
      }));

      console.log('🔄 Adding to cart:', {
        productName: product.name,
        size: selectedSize,
        color: selectedColor
      });

      // Try to sync with server
      try {
        const result = await addToCartMutation({
          productId: product._id,
          quantity: 1,
          size: selectedSize || null,
          color: selectedColor || null,
        }).unwrap();
        
        console.log('✅ Product synced with server cart:', result);
        const variantText = [selectedSize, selectedColor].filter(Boolean).join(', ');
        toast.success(`${product.name}${variantText ? ` (${variantText})` : ''} added to cart! 🛒`, {
          position: "top-right",
          autoClose: 3000,
        });
          
      } catch (serverError) {
        console.warn('⚠️ Server sync failed, using local cart only:', serverError);
        
        if (serverError.status === 404) {
          toast.error('Server unavailable, added to local cart only', {
            position: "top-right",
            autoClose: 4000,
          });
        } else if (serverError.status === 400) {
          toast.error(serverError.data?.message || 'Invalid request', {
            position: "top-right",
            autoClose: 4000,
          });
        } else if (serverError.status === 401) {
          toast.error('Please log in to sync cart', {
            position: "top-right",
            autoClose: 4000,
          });
        } else {
          toast.error('Added to local cart only', {
            position: "top-right",
            autoClose: 4000,
          });
        }
      }

    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      toast.error('Failed to add to cart. Please try again.', {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setIsAddingToCart(false);
      setShowVariantModal(false);
    }
  };

  const isInWishlist = () => {
  if (!wishlist || !Array.isArray(wishlist.items)) return false;
  
  return wishlist.items.some(item => {
    const itemProductId = item.productId?._id || item.productId;
    return itemProductId === product._id;
  });
};

// Wishlist toggle handler
const handleWishlistToggle = async () => {
  try {
    const isCurrentlyInWishlist = isInWishlist();
    
    if (isCurrentlyInWishlist) {
      await removeFromWishlist(product._id).unwrap();
      toast.success('Removed from wishlist', {
        position: "top-right",
        autoClose: 2000,
      });
    } else {
      await addToWishlist(product._id).unwrap();
      toast.success('Added to wishlist', {
        position: "top-right",
        autoClose: 2000,
      });
    }
  } catch (error) {
    console.error('Wishlist toggle error:', error);
    toast.error('Failed to update wishlist', {
      position: "top-right",
      autoClose: 3000,
    });
  }
};


// Price calculation helper
const calculateFinalPrice = (price, discount) => {
  return (price * (1 - discount / 100)).toFixed(2);
};


  // 🔧 NEW: Modal for size/color selection
  const VariantSelectionModal = () => {
    if (!showVariantModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Select Options</h3>
            <button
              onClick={() => setShowVariantModal(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-32 object-cover rounded-lg mb-3"
            />
            <h4 className="font-medium">{product.name}</h4>
            <p className="text-lg font-bold text-gray-900">
              ${product.discount > 0 
                ? calculateFinalPrice(product.price, product.discount)
                : product.price.toFixed(2)}
            </p>
          </div>

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Size *</label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                      selectedSize === size
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Color *</label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`flex items-center gap-2 px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                      selectedColor === color
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: color.toLowerCase() }}
                    />
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowVariantModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={addProductToCart}
              disabled={isAddingToCart || 
                       (product.sizes?.length > 0 && !selectedSize) ||
                       (product.colors?.length > 0 && !selectedColor)}
              className="flex-1"
            >
              {isAddingToCart ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
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
                    ? 'bg-red-50 hover:bg-red-100 border-red-200' 
                    : 'bg-white/90 hover:bg-white'
                }`}
              >
              <Heart className={`h-4 w-4 transition-colors duration-200 ${
                  isInWishlist() 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-gray-600 hover:text-red-500'
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
      
      {/* 🔧 NEW: Add the modal */}
      <VariantSelectionModal />
    </>
  );
}

export default ProductCard;