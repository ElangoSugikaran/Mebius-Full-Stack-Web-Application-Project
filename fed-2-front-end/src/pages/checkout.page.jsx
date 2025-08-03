// import { useSelector } from 'react-redux';
// import { Navigate } from 'react-router';
// import CartItem from '@/components/CartItem';
// import ShippingAddressForm from '@/components/ShippingAddressForm';


// const CheckoutPage = () => {

//   // Get cart items from Redux store
//   const cart = useSelector((state) => state.cart.cartItems);

//   if (cart.length === 0) {
//     return <Navigate to="/" />;
//   } 
//   // If cart is empty, redirect to home page
//   // This ensures that the user cannot access the checkout page without items in the cart
//   return (
//     <main className="px-16 min-h-screen py-8">
//       <h2 className="text-4xl font-bold">Checkout Page</h2>
//       <div className="mt-4">
//         <h3 className="text-3xl font-semibold">Order Details</h3>
//         <div className="mt-2 grid grid-cols-4 gap-x-4">
//           {cart.map((item, index) => (
//             <CartItem key={index} item={item} />
//           ))}
//         </div>
//       </div>
//       <div className="mt-4">
//         <h3 className="text-3xl font-semibold">Enter Shipping Address</h3>
//         <div className="mt-2 w-1/2">
//           <ShippingAddressForm />
//         </div>
//       </div>
//     </main>
//   )
// }

// export default CheckoutPage

// pages/CheckoutPage.jsx - Enhanced checkout page with better UI
import { useSelector } from 'react-redux';
import { Navigate, Link } from 'react-router';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CartItem from '@/components/CartItem';
import ShippingAddressForm from '@/components/ShippingAddressForm';
import { ArrowLeft, CreditCard, Truck, MapPin, Package } from 'lucide-react';

const CheckoutPage = () => {
  // 📝 LEARNING: Get cart items from Redux store
  const cart = useSelector((state) => state.cart.cartItems);

  // 📝 LEARNING: Calculate order summary (same logic as CartPage)
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

  const shipping = orderSummary.subtotal > 75 ? 0 : 9.99;
  const tax = orderSummary.subtotal * 0.08;
  const total = orderSummary.subtotal + shipping + tax;

  // 📝 LEARNING: Redirect if cart is empty
  if (cart.length === 0) {
    return <Navigate to="/shop" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* 📱 HEADER & BREADCRUMB */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link to="/cart" className="hover:text-blue-600">Cart</Link>
            <span>/</span>
            <span className="text-gray-900">Checkout</span>
          </div>
          
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <Button variant="outline" asChild>
              <Link to="/cart">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cart
              </Link>
            </Button>
          </div>
        </div>

        {/* 📊 PROGRESS STEPS */}
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
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">Payment</span>
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
          
          {/* 📋 CHECKOUT FORM */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 🚚 SHIPPING ADDRESS */}
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
              
              <ShippingAddressForm />
            </Card>

            {/* 🚛 DELIVERY OPTIONS */}
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
                <div className="border-2 border-blue-500 bg-blue-50 rounded-lg p-4 cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Standard Delivery</h3>
                    <Badge variant="secondary">Selected</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">5-7 business days</p>
                  <p className="font-bold text-blue-600">
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </p>
                </div>

                <div className="border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-gray-400">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Express Delivery</h3>
                    <Badge variant="outline">Available</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">2-3 business days</p>
                  <p className="font-bold text-gray-900">$15.99</p>
                </div>
              </div>
            </Card>

            {/* 💳 PAYMENT METHOD */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
                  <p className="text-sm text-gray-600">All transactions are secure and encrypted</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-blue-500 bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <input type="radio" name="payment" className="text-blue-600" defaultChecked />
                    <label className="font-medium text-gray-900">Credit/Debit Card</label>
                    <div className="flex space-x-2 ml-auto">
                      <img src="/api/placeholder/32/20" alt="Visa" className="h-5" />
                      <img src="/api/placeholder/32/20" alt="Mastercard" className="h-5" />
                      <img src="/api/placeholder/32/20" alt="American Express" className="h-5" />
                    </div>
                  </div>
                </div>

                <div className="border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <input type="radio" name="payment" className="text-blue-600" />
                    <label className="font-medium text-gray-900">PayPal</label>
                    <img src="/api/placeholder/60/20" alt="PayPal" className="h-5 ml-auto" />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* 📦 ORDER SUMMARY */}
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

              {/* 📱 COMPACT CART ITEMS */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cart.map((item, index) => (
                  <CartItem 
                    key={`${item.product._id}-${index}`}
                    item={item} 
                    viewMode="compact"
                  />
                ))}
              </div>

              {/* 💰 PRICE BREAKDOWN */}
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
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-medium">FREE</span>
                    ) : (
                      `${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                
                <hr className="border-gray-200" />
                
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* 🛒 PLACE ORDER BUTTON */}
              <Button size="lg" className="w-full mt-6">
                Place Order • ${total.toFixed(2)}
              </Button>
              
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500 mb-2">
                  By placing your order, you agree to our Terms of Service and Privacy Policy
                </p>
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                  <span>🔒 Secure checkout</span>
                  <span>•</span>
                  <span>SSL encrypted</span>
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