import { Link } from "react-router";
import { useGetAllProductsQuery, useGetFeaturedProductsQuery, useAddToCartMutation, useGetWishlistQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation } from "../lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ShoppingBag, Heart, Star, TrendingUp } from "lucide-react";
import { toast } from 'react-toastify';
import { useState } from 'react';

// 🔥 TRENDING SECTION COMPONENT - Now shows only featured products
function TrendingSection() {
  // 🔧 UPDATED: Use featured products query for trending section
  const { data: featuredProducts = [], isLoading: isFeaturedLoading } = useGetFeaturedProductsQuery();
  const { data: wishlist, error: wishlistError, isLoading: isWishlistLoading } = useGetWishlistQuery();
  
  // 🛒 RTK Query Mutations
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();
  const [addToWishlist, { isLoading: isAddingToWishlist }] = useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: isRemovingFromWishlist }] = useRemoveFromWishlistMutation();
  
  // 🎯 Local loading states for individual products
  const [loadingStates, setLoadingStates] = useState({
    cart: {},
    wishlist: {}
  });
  
  // 📊 Get trending products - Now limited to 8 featured products
  const trendingProducts = featuredProducts.slice(0, 8);

  // 🐛 Debug featured products data
  console.log('🔍 Featured products debug:', {
    featuredProducts,
    count: featuredProducts.length,
    isFeaturedLoading
  });

  // 🐛 Debug wishlist data structure
  console.log('🔍 Wishlist debug:', {
    wishlist,
    wishlistError,
    isWishlistLoading,
    wishlistType: typeof wishlist,
    wishlistKeys: wishlist ? Object.keys(wishlist) : 'null'
  });

  // 💝 Check if product is in wishlist - Fixed for proper data structure
  const isInWishlist = (productId) => {
    // Handle case when wishlist query is loading or failed
    if (!wishlist || typeof wishlist !== 'object') {
      return false;
    }
    
    // Handle different possible wishlist data structures from backend
    const wishlistItems = wishlist.items || wishlist || [];
    
    if (!Array.isArray(wishlistItems)) {
      return false;
    }
    
    return wishlistItems.some(item => {
      const itemProductId = item.productId?._id || item.productId || item.product?._id || item._id;
      return itemProductId === productId;
    });
  };

  // 🛒 Handle Add to Cart
  const handleAddToCart = async (product) => {
    try {
      // Set loading state for this specific product
      setLoadingStates(prev => ({
        ...prev,
        cart: { ...prev.cart, [product._id]: true }
      }));

      await addToCart({
        productId: product._id,
        quantity: 1,
        // Add default size/color if product has options
        size: product.sizes?.length > 0 ? product.sizes[0] : undefined,
        color: product.colors?.length > 0 ? product.colors[0] : undefined,
      }).unwrap();

      toast.success(`${product.name} added to cart! 🛒`, {
        position: "top-right",
        autoClose: 3000,
      });

    } catch (error) {
      console.error('❌ Failed to add to cart:', error);
      toast.error(error?.data?.message || 'Failed to add to cart. Please try again.', {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      // Clear loading state
      setLoadingStates(prev => ({
        ...prev,
        cart: { ...prev.cart, [product._id]: false }
      }));
    }
  };

  // 💝 Handle Wishlist Toggle
  const handleWishlistToggle = async (product) => {
    try {
      const productId = product._id;
      const isCurrentlyInWishlist = isInWishlist(productId);

      // Set loading state for this specific product
      setLoadingStates(prev => ({
        ...prev,
        wishlist: { ...prev.wishlist, [productId]: true }
      }));

      if (isCurrentlyInWishlist) {
        // Remove from wishlist
        await removeFromWishlist(productId).unwrap();
        toast.success(`${product.name} removed from wishlist! 💔`, {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        // Add to wishlist
        await addToWishlist(productId).unwrap();
        toast.success(`${product.name} added to wishlist! ❤️`, {
          position: "top-right",
          autoClose: 3000,
        });
      }

    } catch (error) {
      console.error('❌ Wishlist operation failed:', error);
      toast.error(error?.data?.message || 'Wishlist operation failed. Please try again.', {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      // Clear loading state
      setLoadingStates(prev => ({
        ...prev,
        wishlist: { ...prev.wishlist, [product._id]: false }
      }));
    }
  };

  // 📱 Loading state
  if (isFeaturedLoading) {
    return (
      <section className="px-4 lg:px-16 py-16">
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-6 h-6 text-red-500" />
              <span className="text-red-500 font-medium">Featured Products</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Trending Now
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-gray-200 rounded-2xl animate-pulse h-96"></div>
          ))}
        </div>
      </section>
    );
  }

  // 📭 Empty state
  if (trendingProducts.length === 0) {
    return (
      <section className="px-4 lg:px-16 py-16">
        <div className="text-center py-16">
          <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Featured Products Yet</h3>
          <p className="text-gray-500">Check back soon for our trending items!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 lg:px-16 py-16">
      <div className="flex items-center justify-between mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-6 h-6 text-red-500" />
            <span className="text-red-500 font-medium">Featured Collection</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Trending Now
          </h2>
          <p className="text-gray-600 mt-2">
            Our hand-picked featured items just for you
          </p>
        </div>
        
        <Link to="/shop">
          <Button variant="outline">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {trendingProducts.map((product) => {
          const productId = product._id;
          const isProductInWishlist = isInWishlist(productId);
          const isCartLoading = loadingStates.cart[productId];
          const isWishlistLoading = loadingStates.wishlist[productId];
          
          return (
            <div key={productId} className="group bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100">
              {/* 🖼️ Product Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* 🏷️ Discount Badge */}
                {product.discount > 0 && (
                  <Badge className="absolute top-3 left-3 bg-red-500 text-white">
                    -{product.discount}%
                  </Badge>
                )}

                {/* ⭐ Featured Badge */}
                <Badge className="absolute top-3 right-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                  Featured
                </Badge>
                
                {/* 💝 Wishlist Button - Fixed */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className={`w-10 h-10 rounded-full p-0 ${
                      isProductInWishlist 
                        ? 'bg-red-50 hover:bg-red-100 border-red-200' 
                        : 'bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => handleWishlistToggle(product)}
                    disabled={isWishlistLoading || isAddingToWishlist || isRemovingFromWishlist}
                  >
                    <Heart 
                      className={`h-4 w-4 transition-colors duration-200 ${
                        isProductInWishlist 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-gray-600 hover:text-red-500'
                      }`} 
                    />
                  </Button>
                </div>
              </div>
              
              {/* 📝 Product Info */}
              <div className="p-4">
                {/* 🏢 Brand & Rating */}
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
                
                {/* 📛 Product Name */}
                <Link to={`/shop/product-details/${productId}`}>
                  <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                </Link>
                
                {/* 💰 Price */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {product.discount > 0 ? (
                      <>
                        <span className="text-lg font-bold text-gray-900">
                          ${(product.price * (1 - product.discount / 100)).toFixed(2)}
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
                </div>
                
                {/* 🛒 Add to Cart Button - Fixed */}
                <Button
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={product.stock === 0 || isCartLoading || isAddingToCart}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  {isCartLoading ? (
                    'Adding...'
                  ) : product.stock === 0 ? (
                    'Out of Stock'
                  ) : (
                    'Add to Cart'
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default TrendingSection;