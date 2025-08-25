import React from 'react';
import PaymentOrderItem from '@/components/PaymentOrderItem';
import { useSelector } from "react-redux";
import { Navigate } from "react-router";
import { useSearchParams } from "react-router";
import PaymentForm from "@/components/PaymentForm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  CreditCard, 
  ArrowLeft, 
  Package,
  DollarSign,
  CheckCircle,
  Shield,
  Clock,
  Truck
} from 'lucide-react';

function PaymentPage() {
  const cart = useSelector((state) => state.cart.cartItems);
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  // Calculate totals
  const subtotal = cart.reduce(
    (acc, item) => acc + (item.product.finalPrice || item.product.price) * item.quantity,
    0
  );
  const tax = 0; // Tax-free
  const shipping = 0; // Free shipping
  const total = subtotal + tax + shipping;

  if (!orderId) {
    console.error("❌ No orderId provided in URL parameters");
    return <Navigate to="/checkout" replace />;
  }

  if (cart.length === 0) {
    console.warn("⚠️ Cart is empty, redirecting to shop");
    return <Navigate to="/shop" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Simple Header */}
        <div className="mb-8">
          <button 
            onClick={() => window.history.back()} 
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-4 text-sm"
            type="button"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Checkout
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Order</h1>
            <p className="text-gray-600">
              Order: <span className="font-semibold text-blue-600">#{orderId}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Order Items */}
          <div className="space-y-6">
            {/* Your Items */}
            <Card className="p-6 shadow-lg border-0">
              <div className="flex items-center mb-6">
                <Package className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Your Items</h2>
                <Badge className="ml-auto bg-blue-100 text-blue-800">
                  {cart.length} item{cart.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              {/* UPDATED: Changed from individual div wrappers to clean list */}
              <div className="max-h-80 overflow-y-auto"> {/* Reduced height for better space usage */}
                {cart.map((item, index) => (
                  <PaymentOrderItem key={index} item={item} />  
                ))}
              </div>
            </Card>
            {/* Security Info */}
            <Card className="p-6 bg-green-50 border-green-200 shadow-lg">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-green-600 mr-3" />
                <h3 className="font-semibold text-green-900">Safe & Secure</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-green-700">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>SSL Encrypted</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>Protected Info</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Side - Payment */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="p-6 shadow-lg border-0 sticky top-6">
              <div className="flex items-center mb-6">
                <DollarSign className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Order Total</h3>
              </div>
              
              {/* Price Breakdown */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Tax</span>
                  <div className="flex items-center">
                    <span className="font-medium">${tax.toFixed(2)}</span>
                    <Badge className="ml-2 text-xs bg-green-100 text-green-800">
                      FREE
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between py-2">
                  <div className="flex items-center">
                    <Truck className="h-4 w-4 mr-2 text-gray-600" />
                    <span className="text-gray-600">Shipping</span>
                    <Badge className="ml-2 text-xs bg-green-100 text-green-800">
                      FREE
                    </Badge>
                  </div>
                  <span className="font-medium">${shipping.toFixed(2)}</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-blue-600">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center text-blue-800">
                  <Clock className="h-5 w-5 mr-2" />
                  <div>
                    <p className="font-medium text-sm">Fast Delivery</p>
                    <p className="text-xs">3-5 business days</p>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Method
                </h4>
                <PaymentForm orderId={orderId} total={total} />
              </div>
            </Card>

            {/* Help Card */}
            <Card className="p-6 bg-gray-50 shadow-lg border-0">
              <h4 className="font-semibold text-gray-900 mb-3">Need Help?</h4>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>✨ Questions about your order?</p>
                <p>💳 All major cards accepted</p>
                <p>📦 30-day return policy</p>
              </div>
              <Button 
                variant="outline" 
                className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                Contact Support
              </Button>
            </Card>
          </div>
        </div>

        {/* Simple Progress Bar */}
        <div className="mt-12 py-8">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-green-600">Cart ✓</span>
              <span className="text-xs font-medium text-green-600">Checkout ✓</span>
              <span className="text-xs font-medium text-blue-600">Payment</span>
              <span className="text-xs font-medium text-gray-400">Done</span>
            </div>
            <div className="flex">
              <div className="flex-1 h-2 bg-green-200 rounded-l"></div>
              <div className="flex-1 h-2 bg-green-200"></div>
              <div className="flex-1 h-2 bg-blue-200"></div>
              <div className="flex-1 h-2 bg-gray-200 rounded-r"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;