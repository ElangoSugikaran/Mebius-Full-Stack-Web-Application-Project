// 🔧 FIXED: COD Order Success Page - Enhanced navigation and parameter handling
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Package, 
  Truck, 
  ArrowRight,
  Home,
  ShoppingBag,
  Banknote,
  AlertCircle
} from 'lucide-react';
import { clearCart } from '@/lib/features/cartSlice';

const OrderSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  
  // 🔧 FIX 1: Enhanced loading state management
  const [isLoading, setIsLoading] = useState(true);
  const [redirectTimer, setRedirectTimer] = useState(null);
  
  // 🔧 FIX 2: Multiple ways to get order data
  const orderId = searchParams.get('orderId') || searchParams.get('id');
  const paymentMethod = searchParams.get('paymentMethod') || searchParams.get('method');
  const orderStatus = searchParams.get('status') || searchParams.get('orderStatus');
  const orderType = searchParams.get('orderType') || searchParams.get('type');
  const totalAmount = searchParams.get('totalAmount') || searchParams.get('amount') || searchParams.get('total');
  const sessionId = searchParams.get('session_id'); // From Stripe
  
  // Get order data from navigation state (if passed from checkout)
  const navigationState = location.state;
  const stateOrderData = navigationState?.orderData;
  
  console.log("🎉 Order Success Page Debug Info:", {
    orderId, 
    paymentMethod, 
    orderStatus,
    orderType,
    totalAmount,
    sessionId,
    navigationState,
    fullURL: window.location.href,
    searchString: window.location.search
  });
  
  // 🔧 FIX 3: Better loading logic with multiple fallbacks
  useEffect(() => {
    const initializeComponent = () => {
      console.log("🔄 Initializing Order Success Page...");
      
      // Give time for URL parameters to be fully parsed
      const loadingTimeout = setTimeout(() => {
        setIsLoading(false);
        
        // 🔧 FIX 4: Enhanced validation - check multiple sources
        const hasOrderId = orderId || stateOrderData?.orderId;
        const hasSessionId = sessionId; // Stripe payment success
        const isCODOrder = paymentMethod === 'COD' || orderType === 'cod' || stateOrderData?.paymentMethod === 'COD';
        
        console.log("✅ Order validation check:", {
          hasOrderId: !!hasOrderId,
          hasSessionId: !!hasSessionId,
          isCODOrder,
          shouldShowSuccess: hasOrderId || hasSessionId || isCODOrder
        });
        
        // Only redirect if we have NO indication this is a successful order
        if (!hasOrderId && !hasSessionId && !isCODOrder) {
          console.log("❌ No valid order indicators found, starting redirect timer");
          
          const timer = setTimeout(() => {
            console.log("🔄 Redirecting to shop after timeout");
            navigate('/shop', { replace: true });
          }, 3000); // 3 second delay before redirect
          
          setRedirectTimer(timer);
        } else {
          console.log("✅ Valid order found, displaying success page");
        }
      }, 800); // Reduced from 1000ms for better UX
      
      return () => {
        clearTimeout(loadingTimeout);
        if (redirectTimer) {
          clearTimeout(redirectTimer);
        }
      };
    };
    
    return initializeComponent();
  }, [orderId, sessionId, paymentMethod, orderType, navigate, stateOrderData]);

  // Clear cart when component mounts for successful orders
  useEffect(() => {
    const shouldClearCart = orderId || sessionId || (paymentMethod === 'COD');
    
    if (shouldClearCart) {
      console.log("🧹 Clearing cart after successful order");
      dispatch(clearCart());
    }
  }, [orderId, sessionId, paymentMethod, dispatch]);

  // 🔧 FIX 5: Enhanced data processing with fallbacks
  const isCODOrder = paymentMethod === 'COD' || orderType === 'cod' || stateOrderData?.paymentMethod === 'COD';
  const displayOrderId = orderId || stateOrderData?.orderId || sessionId || 'PENDING';
  const displayStatus = orderStatus || stateOrderData?.status || (sessionId ? 'paid' : 'confirmed');
  const orderTotal = totalAmount || stateOrderData?.totalAmount || '0.00';
  const formattedTotal = typeof orderTotal === 'string' 
    ? orderTotal 
    : parseFloat(orderTotal || 0).toFixed(2);

  // 🔧 FIX 6: Improved loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold mb-2">Confirming Your Order...</h2>
          <p className="text-gray-600">
            Please wait while we process your order information.
          </p>
        </Card>
      </div>
    );
  }

  // 🔧 FIX 7: Enhanced error state with auto-redirect info
  const hasAnyOrderIndicator = orderId || sessionId || (paymentMethod === 'COD') || stateOrderData;
  
  if (!hasAnyOrderIndicator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Order Information Not Available</h2>
          <p className="text-gray-600 mb-4">
            We couldn't find your order details. You'll be redirected automatically, or you can:
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => {
                if (redirectTimer) clearTimeout(redirectTimer);
                navigate('/orders');
              }} 
              variant="outline" 
              className="w-full"
            >
              Check My Orders
            </Button>
            <Button 
              onClick={() => {
                if (redirectTimer) clearTimeout(redirectTimer);
                navigate('/shop');
              }} 
              className="w-full"
            >
              Continue Shopping
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              variant="ghost" 
              className="w-full text-sm"
            >
              Refresh Page
            </Button>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Redirecting to shop in 3 seconds...
          </div>
        </Card>
      </div>
    );
  }

  // 🔧 SUCCESS DISPLAY - Enhanced with better fallbacks
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-16">
        
        {/* 🎉 Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="h-12 w-12 text-green-600 animate-bounce" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isCODOrder ? 'COD Order Confirmed!' : 'Order Confirmed!'} 🎉
          </h1>
          
          <p className="text-lg text-gray-600">
            {isCODOrder 
              ? 'Your Cash on Delivery order has been successfully placed and confirmed!'
              : sessionId 
                ? 'Your payment was successful and your order is confirmed!'
                : 'Your order has been successfully placed and confirmed!'
            }
          </p>
        </div>

        {/* 📋 Order Information Card */}
        <Card className="p-8 mb-8">
          <div className="text-center space-y-6">
            
            {/* Order Number */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Order Number
              </h2>
              <div className="bg-gray-100 px-4 py-2 rounded-lg inline-block">
                <span className="font-mono font-bold text-lg">
                  #{displayOrderId.slice(-8).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <div>
              <Badge variant="outline" className="px-4 py-2 text-sm font-medium bg-green-50 border-green-200 text-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                {isCODOrder ? 'COD Order Confirmed' : sessionId ? 'Payment Successful' : 'Order Confirmed'}
              </Badge>
            </div>

            {/* Order Amount */}
            {(isCODOrder && formattedTotal !== '0.00') && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 text-orange-700 mb-2">
                  <Banknote className="h-5 w-5" />
                  <span className="font-semibold">Amount to Pay on Delivery</span>
                </div>
                <div className="text-2xl font-bold text-orange-800">
                  ${formattedTotal}
                </div>
                <p className="text-sm text-orange-600 mt-1">
                  Please have exact amount ready
                </p>
              </div>
            )}

            {/* Payment Method Info */}
            <div className="border-t border-gray-200 pt-6">
              {isCODOrder ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-2 text-orange-600">
                    <Banknote className="h-5 w-5" />
                    <span className="font-semibold">Cash on Delivery</span>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-700">
                        <p className="font-semibold mb-1">Important COD Information:</p>
                        <ul className="space-y-1 text-left">
                          <li>• Payment will be collected upon delivery</li>
                          <li>• Please have exact amount ready{formattedTotal !== '0.00' ? ` ($${formattedTotal})` : ''}</li>
                          <li>• Our delivery partner will confirm the amount</li>
                          <li>• No additional charges for COD service</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Payment Successful</span>
                  </div>
                  <p className="text-gray-600">
                    Your payment has been processed successfully and your order is confirmed.
                  </p>
                </div>
              )}
            </div>

            {/* Delivery Timeline */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                {isCODOrder ? 'Your COD Order Journey' : 'What happens next?'}
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4 text-left">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Order Confirmed ✅</p>
                    <p className="text-sm text-gray-600">Your order is confirmed and processing has started</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-left">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Preparing for Shipment</p>
                    <p className="text-sm text-gray-600">We'll pack your items carefully for delivery</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-left">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Truck className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{isCODOrder ? 'COD Delivery' : 'Delivery'}</p>
                    <p className="text-sm text-gray-600">
                      {isCODOrder 
                        ? `Free COD delivery in 5-7 business days${formattedTotal !== '0.00' ? ` • Pay $${formattedTotal} on delivery` : ''}`
                        : 'Free standard delivery in 5-7 business days'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/orders">
            <Button size="lg" className="w-full sm:w-auto">
              <Package className="h-4 w-4 mr-2" />
              {isCODOrder ? 'Track My COD Order' : 'View My Orders'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          
          <Link to="/shop">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Confirmation Notice */}
        <div className="text-center mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-700">
            ✅ Your order confirmation has been sent to your email. 
            You'll receive tracking details once your order ships.
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link 
            to="/" 
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center justify-center space-x-1"
          >
            <Home className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;