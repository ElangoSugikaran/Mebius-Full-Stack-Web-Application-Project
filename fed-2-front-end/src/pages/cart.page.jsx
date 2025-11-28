// Fixed CartPage.jsx - Correct calculations matching CartItem.jsx
import { useEffect, useState } from "react";
import { useUser } from '@clerk/clerk-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import CartItem from "@/components/CartItem";
import { ShoppingBag, ArrowLeft, Truck, Shield, RotateCcw, LogIn, Loader2 } from "lucide-react";
import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation
} from "@/lib/api";
import {
  syncCartFromServer,
  updateCartItemQuantity,
  removeFromCart as removeFromCartAction,
  clearCart
} from "@/lib/features/cartSlice";

const CartPage = () => {
  const { isSignedIn, isLoaded } = useUser();
  const dispatch = useDispatch();
  const [useLocalCart, setUseLocalCart] = useState(false);

  // RTK Query hooks - only call when signed in
  const {
    data: serverCart,
    isLoading,
    error,
    refetch
  } = useGetCartQuery(undefined, {
    skip: !isSignedIn,
    refetchOnMountOrArgChange: true,
    refetchOnReconnect: true
  });

  const [updateCartItem, { isLoading: isUpdating }] = useUpdateCartItemMutation();
  const [removeFromCart, { isLoading: isRemoving }] = useRemoveFromCartMutation();
  const [clearCartMutation, { isLoading: isClearing }] = useClearCartMutation();

  // Get local cart from Redux store
  const localCart = useSelector((state) => state.cart.cartItems || []);

  // Determine which cart data to use
  const cart = useLocalCart || error || !isSignedIn ? localCart : (serverCart?.items || localCart);

  // Handle server connection and cart synchronization
  useEffect(() => {
    if (!isSignedIn) return;

    if (error) {
      console.warn('⚠️ Server cart not available, using local cart only:', error);
      setUseLocalCart(true);
    } else if (serverCart) {
      console.log('✅ Using server cart data');
      if (serverCart.items && Array.isArray(serverCart.items)) {
        dispatch(syncCartFromServer(serverCart));
      }
      setUseLocalCart(false);
    }
  }, [serverCart, error, dispatch, isSignedIn]);

  // 🔧 FIXED: Calculate cart summary with EXACT same logic as CartItem.jsx
  const calculateCartSummary = () => {
    let subtotal = 0;
    let itemCount = 0;
    let totalSavings = 0;
    let originalTotal = 0;

    cart.forEach((item) => {
      try {
        // Extract product data (handle both formats)
        const product = (() => {
          if (item?.productId && typeof item.productId === 'object') {
            return item.productId;
          }
          if (item?.name && item?.price) {
            return item;
          }
          if (item?.product) {
            return item.product;
          }
          return item || {};
        })();

        // Safe property extraction
        const originalPrice = parseFloat(product.price) || 0;
        const discount = parseFloat(product.discount) || 0;
        const quantity = parseInt(item.quantity) || 1;

        // EXACT SAME CALCULATION AS CartItem.jsx
        const discountedPrice = discount > 0
          ? originalPrice * (1 - discount / 100)
          : originalPrice;

        // Calculate totals
        const itemTotal = discountedPrice * quantity;
        const itemOriginalTotal = originalPrice * quantity;
        const itemSavings = itemOriginalTotal - itemTotal;

        subtotal += itemTotal;
        originalTotal += itemOriginalTotal;
        totalSavings += itemSavings;
        itemCount += quantity;

      } catch (err) {
        console.error('Error calculating item in summary:', err, item);
      }
    });

    return {
      subtotal: subtotal,
      itemCount: itemCount,
      savings: totalSavings,
      originalTotal: originalTotal
    };
  };

  const cartSummary = calculateCartSummary();

  // Handle quantity updates with proper error handling
  const handleUpdateQuantity = async (productId, newQuantity, size, color) => {
    if (newQuantity < 1) {
      console.warn('Invalid quantity:', newQuantity);
      return;
    }

    try {
      dispatch(updateCartItemQuantity({
        productId,
        quantity: newQuantity,
        size,
        color
      }));

      if (isSignedIn && !useLocalCart && !error) {
        await updateCartItem({
          productId,
          quantity: newQuantity,
          size: size || undefined,
          color: color || undefined
        }).unwrap();

        console.log('✅ Server cart updated successfully');
      }
    } catch (serverError) {
      console.warn('⚠️ Server update failed, using local update only:', serverError);
      if (isSignedIn) {
        setUseLocalCart(true);
      }
    }
  };

  // Handle item removal with proper error handling
  const handleRemoveItem = async (productId, size, color) => {
    if (!productId) {
      console.error('No product ID provided for removal');
      return;
    }

    try {
      dispatch(removeFromCartAction({
        productId,
        size,
        color
      }));

      if (isSignedIn && !useLocalCart && !error) {
        await removeFromCart({
          productId,
          size: size || undefined,
          color: color || undefined
        }).unwrap();

        console.log('✅ Item removed from server cart');
      }
    } catch (serverError) {
      console.warn('⚠️ Server removal failed, using local removal only:', serverError);
      if (isSignedIn) {
        setUseLocalCart(true);
      }
    }
  };

  // Handle cart clearing
  const handleClearCart = async () => {
    try {
      dispatch(clearCart());

      if (isSignedIn && !useLocalCart && !error) {
        await clearCartMutation().unwrap();
        console.log('✅ Server cart cleared');
      }
    } catch (serverError) {
      console.warn('⚠️ Server clear failed, local cart cleared:', serverError);
      if (isSignedIn) {
        setUseLocalCart(true);
      }
    }
  };

  // Loading state for Clerk
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

  // Unauthenticated user state
  if (!isSignedIn) {
    if (localCart.length > 0) {
      // Allow guests to manage local cart
    } else {
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
              <Link to="/" className="hover:text-blue-600">Home</Link>
              <span>/</span>
              <span className="text-gray-900">Cart</span>
            </div>

            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <LogIn className="h-12 w-12 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Sign in to view your cart
                </h2>
                <p className="text-gray-600 mb-8">
                  Create an account or sign in to save your cart and access it anywhere.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="px-8">
                    <Link to="/sign-in">
                      <LogIn className="h-5 w-5 mr-2" />
                      Sign In
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // Loading state
  if (isLoading && isSignedIn && !useLocalCart && localCart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setUseLocalCart(true)}
          >
            Use Local Cart
          </Button>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <span className="text-gray-900">Cart</span>
          </div>

          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-12 w-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-8">
                Looks like you haven't added anything to your cart yet. Start shopping to find amazing products!
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header & Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
              <Link to="/" className="hover:text-blue-600">Home</Link>
              <span>/</span>
              <span className="text-gray-900">Cart</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Shopping Cart
              <Badge variant="secondary" className="ml-3">
                {cartSummary.itemCount} {cartSummary.itemCount === 1 ? 'item' : 'items'}
              </Badge>
            </h1>

            {/* Cart Status Indicator */}
            {!isSignedIn && (
              <div className="flex items-center space-x-2 mt-2">
                <p className="text-sm text-amber-600">
                  ⚠️ Guest cart (sign in to save permanently)
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link to="/sign-in">Sign In</Link>
                </Button>
              </div>
            )}

            {useLocalCart && isSignedIn && (
              <div className="flex items-center space-x-2 mt-2">
                <p className="text-sm text-amber-600">
                  ⚠️ Using local cart (server unavailable)
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setUseLocalCart(false);
                    refetch();
                  }}
                  disabled={isLoading}
                >
                  Retry Server
                </Button>
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link to="/shop">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>

            {cart.length > 0 && (
              <Button
                variant="outline"
                onClick={handleClearCart}
                disabled={isClearing}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {isClearing ? "Clearing..." : "Clear Cart"}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Cart Items</h2>

              <div className="space-y-6">
                {cart.map((item, index) => {
                  const product = item.product || item;
                  const uniqueKey = `${product._id || product.id || index}-${item.size || ''}-${item.color || ''}-${index}`;

                  return (
                    <div key={uniqueKey}>
                      <CartItem
                        item={item}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemoveItem={handleRemoveItem}
                        isUpdating={isUpdating}
                        isRemoving={isRemoving}
                      />
                      {index < cart.length - 1 && <hr className="my-6 border-gray-200" />}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Shipping Info */}
            <Card className="p-6 mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Shipping & Returns</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Truck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Free Shipping</p>
                    <p className="text-gray-600">On all orders</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Secure Payment</p>
                    <p className="text-gray-600">100% protected</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <RotateCcw className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Easy Returns</p>
                    <p className="text-gray-600">30-day policy</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Order Summary - FIXED with correct calculations */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4">

                {/* Show original total if there are savings */}
                {cartSummary.savings > 0 && (
                  <div className="flex justify-between text-gray-500 text-sm">
                    <span>Original Price</span>
                    <span className="line-through">${cartSummary.originalTotal.toFixed(2)}</span>
                  </div>
                )}

                {/* Show discount/savings */}
                {cartSummary.savings > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount Savings</span>
                    <span>-${cartSummary.savings.toFixed(2)}</span>
                  </div>
                )}

                {/* Subtotal - This is the price AFTER discounts */}
                <div className="flex justify-between text-gray-900 font-medium">
                  <span>Subtotal ({cartSummary.itemCount} {cartSummary.itemCount === 1 ? 'item' : 'items'})</span>
                  <span>${cartSummary.subtotal.toFixed(2)}</span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>

                {/* Tax info */}
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Taxes</span>
                  <span>Calculated at checkout</span>
                </div>

                <hr className="border-gray-200" />

                {/* Total - Same as subtotal (discounted price) + FREE shipping */}
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>${cartSummary.subtotal.toFixed(2)}</span>
                </div>

                {/* Savings Badge */}
                {cartSummary.savings > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-800 text-sm font-medium text-center">
                      🎉 You're saving ${cartSummary.savings.toFixed(2)} on this order!
                    </p>
                  </div>
                )}
              </div>

              {/* Checkout Button */}
              {isSignedIn ? (
                <Button
                  asChild
                  size="lg"
                  className="w-full mt-6"
                  disabled={cart.length === 0}
                >
                  <Link to="/checkout">
                    Proceed to Checkout
                  </Link>
                </Button>
              ) : (
                <div className="mt-6 space-y-3">
                  <Button
                    asChild
                    size="lg"
                    className="w-full"
                    disabled={cart.length === 0}
                  >
                    <Link to="/sign-in">
                      <LogIn className="h-5 w-5 mr-2" />
                      Sign In to Checkout
                    </Link>
                  </Button>
                  <p className="text-xs text-center text-gray-500">
                    Your cart will be saved after signing in
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-500 text-center mt-3">
                Taxes and final total calculated at checkout
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;