// pages/Wishlist.jsx - Corrected version
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  selectWishlistItems, 
  selectWishlistTotal, 
  removeFromWishlist, 
  clearWishlist,
  moveToCart 
} from "@/lib/features/wishlistSlice";
import { addToCart } from "@/lib/features/cartSlice";
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  Star, 
  Eye,
  ShoppingBag,
  X
} from "lucide-react";
import { Link } from "react-router";

function WishlistPage() {
  const dispatch = useDispatch();
  const wishlistItems = useSelector(selectWishlistItems);
  const totalItems = useSelector(selectWishlistTotal);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // 🔧 FIX: Helper function for safe image access
  const getProductImage = (product) => {
    return product.images?.[0] || product.image || '/placeholder-product.jpg';
  };

  // 📝 LEARNING: Calculate discounted price
  const calculateFinalPrice = (price, discount) => {
    if (!discount || discount === 0) return price;
    return (price * (1 - discount / 100)).toFixed(2);
  };

  // 📝 LEARNING: Remove single item from wishlist
  const handleRemoveItem = (productId) => {
    dispatch(removeFromWishlist(productId));
  };

  // 🔧 FIX: Updated handleAddToCart to match your cart structure
  const handleAddToCart = (product) => {
    dispatch(addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,        // Keep as number
      discount: product.discount || 0,
      originalPrice: product.price,
      image: getProductImage(product), // Use helper function
      brand: product.brand,
      sizes: product.sizes,
      colors: product.colors,
      stock: product.stock,
      quantity: 1, // Add default quantity
    }));
  };

  // 📝 LEARNING: Move item from wishlist to cart
  const handleMoveToCart = (product) => {
    // Add to cart
    handleAddToCart(product);
    // Remove from wishlist
    dispatch(moveToCart(product._id));
  };

  // 📝 LEARNING: Clear entire wishlist
  const handleClearWishlist = () => {
    dispatch(clearWishlist());
    setShowClearConfirm(false);
  };

  // 📝 LEARNING: Add all items to cart
  const handleAddAllToCart = () => {
    wishlistItems.forEach(product => {
      if (product.stock > 0) { // Only add if in stock
        handleAddToCart(product);
      }
    });
  };

  // 📝 LEARNING: Empty wishlist state
  if (totalItems === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
            <p className="text-gray-600">Save items you love for later</p>
          </div>

          {/* Empty State */}
          <Card className="text-center py-16">
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <Heart className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Your wishlist is empty
                </h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  Start browsing and add items you love to your wishlist. 
                  They'll appear here for easy access later!
                </p>
                <Link to="/shop">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* 📋 HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
            <p className="text-gray-600">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} saved for later
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button
              variant="outline"
              onClick={handleAddAllToCart}
              disabled={wishlistItems.every(item => item.stock === 0)}
              className="flex-1 md:flex-initial"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add All to Cart
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowClearConfirm(true)}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          </div>
        </div>

        {/* 📝 LEARNING: Clear confirmation dialog */}
        {showClearConfirm && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-900">Clear Wishlist</h3>
                    <p className="text-sm text-red-700">
                      Are you sure you want to remove all {totalItems} items from your wishlist?
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowClearConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleClearWishlist}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 🛍️ WISHLIST ITEMS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <Card key={product._id} className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="relative">
                {/* Product Image */}
                <div className="aspect-square overflow-hidden bg-gray-100 relative">
                  <img
                    src={getProductImage(product)} // 🔧 FIX: Use helper function
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = '/placeholder-product.jpg';
                    }}
                  />
                  
                  {/* Discount Badge */}
                  {product.discount > 0 && (
                    <Badge className="absolute top-3 left-3 bg-red-500 text-white">
                      -{product.discount}%
                    </Badge>
                  )}

                  {/* Out of Stock Overlay */}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge className="bg-gray-900 text-white px-3 py-1">
                        Out of Stock
                      </Badge>
                    </div>
                  )}

                  {/* Remove Button */}
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-3 right-3 w-8 h-8 rounded-full p-0 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    onClick={() => handleRemoveItem(product._id)}
                  >
                    <X className="h-4 w-4 text-gray-600" />
                  </Button>
                </div>

                <CardContent className="p-4">
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

                  {/* 🔧 FIX: Updated product link */}
                  <Link to={`/shop/product/${product._id}`}>
                    <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Colors */}
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

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-4">
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

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleMoveToCart(product)}
                      disabled={product.stock === 0}
                      className="w-full"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {product.stock === 0 ? 'Out of Stock' : 'Move to Cart'}
                    </Button>
                    
                    <div className="flex gap-2">
                      {/* 🔧 FIX: Updated product link */}
                      <Link to={`/shop/product-details/${product._id}`} className="flex-1">
                        <Button variant="outline" className="w-full" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </Link>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem(product._id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Heart className="h-4 w-4 fill-red-500" />
                      </Button>
                    </div>
                  </div>

                  {/* Added Date */}
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Added {new Date(product.addedAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        {/* 🔄 CONTINUE SHOPPING */}
        <div className="mt-12 text-center">
          <Link to="/shop">
            <Button variant="outline" size="lg">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default WishlistPage;