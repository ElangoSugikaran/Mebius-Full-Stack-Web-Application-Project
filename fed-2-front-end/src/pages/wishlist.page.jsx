import { useEffect, useState } from "react";
import { useUser } from '@clerk/clerk-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import WishlistItem from "../components/WishlistItem";
import { 
  useGetWishlistQuery, 
  useClearWishlistMutation,
  useAddToCartMutation 
} from '../lib/api';
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  ShoppingBag,
  ArrowLeft,
  Loader2,
  X,
  LogIn
} from "lucide-react";

function WishlistPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  // 🔧 FIX: Only call API when user is signed in
  const { 
    data: wishlistData, 
    isLoading, 
    error,
    refetch 
  } = useGetWishlistQuery(undefined, {
    skip: !isSignedIn // Skip API call if user not signed in
  });
  
  const [clearWishlist, { isLoading: isClearing }] = useClearWishlistMutation();
  const [addToCart] = useAddToCartMutation();

  // 🔧 FIX: Extract data from API response
  const wishlistItems = wishlistData?.items || [];
  const totalItems = wishlistData?.totalItems || 0;
  
  // Calculate total value
  const totalValue = wishlistItems.reduce((total, item) => {
    const price = parseFloat(item.finalPrice || item.price) || 0;
    return total + price;
  }, 0);

  // Handle clear wishlist
  const handleClearWishlist = async () => {
    try {
      await clearWishlist().unwrap();
      setShowClearConfirm(false);
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
    }
  };

  // Handle add all to cart
  const handleAddAllToCart = async () => {
    const availableItems = wishlistItems.filter(item => item.inStock);
    
    try {
      // Add all available items to cart
      for (const item of availableItems) {
        const productId = item.productId?._id || item.productId;
        await addToCart({
          productId: productId,
          quantity: 1
        }).unwrap();
      }
      
      // Clear wishlist after successful cart additions
      await clearWishlist().unwrap();
    } catch (error) {
      console.error('Failed to add items to cart:', error);
    }
  };

  // 🔧 NEW: Loading state for Clerk
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // 🔧 NEW: Unauthenticated user state
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <span className="text-gray-900">Wishlist</span>
          </div>

          {/* Login Required State */}
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogIn className="h-12 w-12 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Sign in to view your wishlist
              </h2>
              <p className="text-gray-600 mb-8">
                Create an account or sign in to save your favorite items and access them anywhere.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="px-8">
                  <Link to="/sign-in">
                    <LogIn className="h-5 w-5 mr-2" />
                    Sign In
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="px-8">
                  <Link to="/shop">
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state for signed in users
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  // 🔧 FIXED: Better error handling for signed in users
  if (error && !error.status === 401) { // Don't show error for auth issues
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to load wishlist
          </h2>
          <p className="text-gray-600 mb-4">
            Something went wrong. Please try again.
          </p>
          <Button onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Empty wishlist state for signed in users
  if (totalItems === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <span className="text-gray-900">Wishlist</span>
          </div>

          {/* Empty state for signed in users */}
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-12 w-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Your wishlist is empty
              </h2>
              <p className="text-gray-600 mb-8">
                Start browsing and add items you love to your wishlist. 
                They'll appear here for easy access later!
              </p>
              <Button asChild size="lg" className="px-8">
                <Link to="/shop">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Rest of the component remains the same...
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Header & Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
              <Link to="/" className="hover:text-blue-600">Home</Link>
              <span>/</span>
              <span className="text-gray-900">Wishlist</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              My Wishlist
              <Badge variant="secondary" className="ml-3">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </Badge>
            </h1>
            <p className="text-gray-600 mt-1">
              Total value: ${totalValue.toFixed(2)}
            </p>
          </div>
          
          <Button variant="outline" asChild>
            <Link to="/shop">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button
            onClick={handleAddAllToCart}
            disabled={wishlistItems.every(item => !item.inStock)}
            className="flex-1 sm:flex-initial"
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
            Clear Wishlist
          </Button>
        </div>

        {/* Clear confirmation dialog */}
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
                    disabled={isClearing}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isClearing ? 'Clearing...' : 'Clear All'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wishlist Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item, index) => {
            const productId = item.productId?._id || item.productId;
            return (
              <WishlistItem
                key={`${productId}-${index}`}
                item={item}
              />
            );
          })}
        </div>

        {/* Wishlist Summary */}
        {totalItems > 0 && (
          <Card className="mt-8 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900">Wishlist Summary</h3>
                <p className="text-gray-600">
                  {totalItems} items • Total value: ${totalValue.toFixed(2)}
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowClearConfirm(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
                <Button onClick={handleAddAllToCart}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add All to Cart
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default WishlistPage;