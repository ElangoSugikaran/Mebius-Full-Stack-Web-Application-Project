// 🔧 FIXED: Enhanced checkout page with proper size/color handling
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CartItem from '@/components/CartItem';
import ShippingAddressForm from '@/components/ShippingAddressForm';
import { ArrowLeft, CreditCard, Truck, MapPin, Package, Banknote } from 'lucide-react';
import { clearCart } from '@/lib/features/cartSlice';
import { useCreateOrderMutation, useClearCartMutation } from '@/lib/api';

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // RTK Query hook
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [clearCartMutation] = useClearCartMutation();
  
  // Get cart items from Redux store
  const cart = useSelector((state) => state.cart.cartItems);
  
  // State for payment method and form validation
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [shippingAddress, setShippingAddress] = useState(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  // Calculate order summary
  const orderSummary = {
    subtotal: cart.reduce((total, item) => {
      const price = item.product.discount > 0 
        ? item.product.price * (1 - item.product.discount / 100)
        : item.product.price;
      return total + (price * item.quantity);
    }, 0),
    itemCount: cart.reduce((total, item) => total + item.quantity, 0),
    savings: cart.reduce((total, item) => {
      if (item.product.discount > 0) {
        const savings = (item.product.price * item.product.discount / 100) * item.quantity;
        return total + savings;
      }
      return total;
    }, 0)
  };

  const total = orderSummary.subtotal;

  // Redirect if cart is empty
  if (cart.length === 0) {
    return <Navigate to="/shop" replace />;
  }

  // Handle shipping address form submission
  const handleShippingAddressSubmit = (addressData) => {
    console.log("📍 Shipping address received:", addressData);
    setShippingAddress(addressData);
  };

  // 🔧 FIXED: Proper size/color handling in order creation
  const handlePlaceOrder = async () => {
    if (!shippingAddress) {
      alert("Please fill in your shipping address first!");
      return;
    }

    setIsProcessingOrder(true);

    try {
      console.log("🚀 Creating order with payment method:", paymentMethod);
      console.log("📦 Cart items:", cart);

      // 🔧 CRITICAL FIX: Properly extract size and color from cart items
      const orderData = {
        items: cart.map(item => {
          const product = item.product || item;
          
          // Calculate the correct price
          const itemPrice = product.discount > 0 
            ? product.price * (1 - product.discount / 100)
            : product.price;

          const orderItem = {
            productId: product._id || product.id,
            quantity: item.quantity,
            price: itemPrice
          };

          // 🔧 CRITICAL: Include size and color if they exist in the cart item
          if (item.size && item.size.trim() !== '') {
            orderItem.size = item.size.trim();
          }
          
          if (item.color && item.color.trim() !== '') {
            orderItem.color = item.color.trim();
          }

          console.log(`📦 Order item prepared:`, {
            productName: product.name,
            productId: orderItem.productId,
            quantity: orderItem.quantity,
            size: orderItem.size || 'N/A',
            color: orderItem.color || 'N/A',
            price: orderItem.price
          });

          return orderItem;
        }),
        shippingAddress,
        paymentMethod,
        totalAmount: total,
        orderStatus: paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING',
        paymentStatus: paymentMethod === 'COD' ? 'COD_PENDING' : 'PENDING'
      };

      console.log("📦 Complete order data being sent:", orderData);

      const result = await createOrder(orderData).unwrap();
      console.log("✅ Order created successfully:", result);

      if (paymentMethod === 'COD') {
        // Clear both Redux and server cart
        try {
          await clearCartMutation().unwrap();
          console.log("✅ Server cart cleared");
        } catch (cartError) {
          console.warn("⚠️ Failed to clear server cart:", cartError);
        }
        
        dispatch(clearCart());
        console.log("✅ Redux cart cleared");
        
        const orderId = result.order?._id || result.orderId || result._id;
        
        if (orderId) {
          console.log("🎉 COD Order successful, navigating with orderId:", orderId);
          
          const successURL = `/order-success?orderId=${orderId}&paymentMethod=COD&status=confirmed&orderType=cod&totalAmount=${total}&timestamp=${Date.now()}`;
          
          navigate(successURL, { 
            replace: true,
            state: {
              orderData: {
                orderId,
                paymentMethod: 'COD',
                status: 'confirmed',
                totalAmount: total
              }
            }
          });
          
          // Fallback navigation
          setTimeout(() => {
            if (window.location.pathname !== '/order-success') {
              console.log("🔄 Fallback: Using window.location for navigation");
              window.location.href = successURL;
            }
          }, 100);
          
        } else {
          console.error("❌ No orderId found in response:", result);
          alert("Order created successfully! Redirecting to orders page.");
          navigate('/orders', { replace: true });
        }
        
      } else if (paymentMethod === 'CREDIT_CARD') {
        const orderId = result.order?._id || result.orderId || result._id;
        console.log("💳 Redirecting to payment page with orderId:", orderId);
        
        if (orderId) {
          navigate(`/payment?orderId=${orderId}`);
        } else {
          console.error("❌ No orderId found for payment:", result);
          alert("Order created but payment setup failed. Please contact support.");
        }
      }

    } catch (error) {
      console.error('❌ Order creation failed:', error);
      
      // 🔧 IMPROVED: Better error message extraction
      let errorMessage = 'Unknown error occurred';
      
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Show user-friendly error messages
      if (errorMessage.includes('Size is required')) {
        errorMessage = 'Some items in your cart require size selection. Please check your cart and ensure all required options are selected.';
      } else if (errorMessage.includes('Color is required')) {
        errorMessage = 'Some items in your cart require color selection. Please check your cart and ensure all required options are selected.';
      } else if (errorMessage.includes('Insufficient stock')) {
        errorMessage = 'Some items in your cart are out of stock. Please update quantities or remove unavailable items.';
      }
      
      alert(`Order creation failed: ${errorMessage}`);
    } finally {
      setIsProcessingOrder(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* HEADER & BREADCRUMB */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
            <button onClick={() => navigate('/')} className="hover:text-blue-600">Home</button>
            <span>/</span>
            <button onClick={() => navigate('/shop/cart')} className="hover:text-blue-600">Cart</button>
            <span>/</span>
            <span className="text-gray-900">Checkout</span>
          </div>
          
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <Button variant="outline" onClick={() => navigate('/shop/cart')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Button>
          </div>
        </div>

        {/* 🔧 NEW: Cart Items Validation Alert */}
        {cart.some(item => {
          const product = item.product || item;
          const needsSize = product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0;
          const needsColor = product.colors && Array.isArray(product.colors) && product.colors.length > 0;
          return (needsSize && !item.size) || (needsColor && !item.color);
        }) && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <Package className="h-4 w-4 text-amber-600" />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-amber-800 mb-1">
                  Missing Product Options
                </h3>
                <p className="text-sm text-amber-700 mb-3">
                  Some items in your cart require size or color selection before checkout.
                </p>
                <Button variant="outline" size="sm" onClick={() => navigate('/shop/cart')}>
                  Update Cart Items
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* PROGRESS STEPS */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 md:space-x-8">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600">Shipping</span>
            </div>
            <div className="flex-1 h-px bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600">Payment</span>
            </div>
            <div className="flex-1 h-px bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">Review</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CHECKOUT FORM */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* SHIPPING ADDRESS */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>
                  <p className="text-sm text-gray-600">Where should we deliver your order?</p>
                </div>
              </div>
              
              <ShippingAddressForm onSubmit={handleShippingAddressSubmit} />
            </Card>

            {/* DELIVERY OPTIONS */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Truck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Delivery Options</h2>
                  <p className="text-sm text-gray-600">Choose your preferred delivery method</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-blue-500 bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Standard Delivery</h3>
                    <Badge variant="secondary">Selected</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">5-7 business days</p>
                  <p className="font-bold text-green-600">FREE</p>
                </div>

                <div className="border border-gray-300 rounded-lg p-4 opacity-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Express Delivery</h3>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">2-3 business days</p>
                  <p className="font-bold text-gray-900">Not Available</p>
                </div>
              </div>
            </Card>

            {/* PAYMENT METHOD */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
                  <p className="text-sm text-gray-600">Choose your preferred payment option</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Online Payment Option */}
                <div 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    paymentMethod === 'CREDIT_CARD' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setPaymentMethod('CREDIT_CARD')}
                >
                  <div className="flex items-center space-x-3">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="CREDIT_CARD"
                      checked={paymentMethod === 'CREDIT_CARD'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-blue-600" 
                    />
                    <CreditCard className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <label className="font-medium text-gray-900 cursor-pointer">
                        Online Payment (Credit/Debit Card)
                      </label>
                      <p className="text-sm text-gray-600">Secure payment via Stripe</p>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>
                      <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">MC</div>
                    </div>
                  </div>
                </div>

                {/* COD Payment Option */}
                <div 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    paymentMethod === 'COD' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setPaymentMethod('COD')}
                >
                  <div className="flex items-center space-x-3">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-blue-600" 
                    />
                    <Banknote className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <label className="font-medium text-gray-900 cursor-pointer">
                        Cash on Delivery (COD)
                      </label>
                      <p className="text-sm text-gray-600">Pay when your order arrives</p>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Available
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* ORDER SUMMARY */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Package className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
                  <p className="text-sm text-gray-600">{orderSummary.itemCount} items</p>
                </div>
              </div>

              {/* COMPACT CART ITEMS */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cart.map((item, index) => (
                  <CartItem 
                    key={`${item.product._id}-${item.size || 'no-size'}-${item.color || 'no-color'}-${index}`}
                    item={item} 
                    viewMode="compact"
                  />
                ))}
              </div>

              {/* PRICE BREAKDOWN */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${orderSummary.subtotal.toFixed(2)}</span>
                </div>
                
                {orderSummary.savings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>You saved</span>
                    <span>-${orderSummary.savings.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                
                <hr className="border-gray-200" />
                
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* 🔧 IMPROVED: Place Order Button with validation checks */}
              <Button 
                size="lg" 
                className="w-full mt-6" 
                onClick={handlePlaceOrder}
                disabled={
                  isCreatingOrder || 
                  isProcessingOrder || 
                  !shippingAddress ||
                  cart.some(item => {
                    const product = item.product || item;
                    const needsSize = product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0;
                    const needsColor = product.colors && Array.isArray(product.colors) && product.colors.length > 0;
                    return (needsSize && !item.size) || (needsColor && !item.color);
                  })
                }
              >
                {isCreatingOrder || isProcessingOrder ? (
                  'Processing...'
                ) : paymentMethod === 'COD' ? (
                  `Place COD Order • $${total.toFixed(2)}`
                ) : (
                  `Proceed to Payment • $${total.toFixed(2)}`
                )}
              </Button>
              
              {!shippingAddress && (
                <p className="text-sm text-red-600 mt-2 text-center">
                  Please fill in your shipping address to continue
                </p>
              )}
              
              {cart.some(item => {
                const product = item.product || item;
                const needsSize = product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0;
                const needsColor = product.colors && Array.isArray(product.colors) && product.colors.length > 0;
                return (needsSize && !item.size) || (needsColor && !item.color);
              }) && (
                <p className="text-sm text-red-600 mt-2 text-center">
                  Some items need size/color selection
                </p>
              )}
              
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500 mb-2">
                  By placing your order, you agree to our Terms of Service and Privacy Policy
                </p>
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                  <span>🔒 Secure checkout</span>
                  {paymentMethod === 'CREDIT_CARD' && (
                    <>
                      <span>•</span>
                      <span>SSL encrypted</span>
                    </>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;