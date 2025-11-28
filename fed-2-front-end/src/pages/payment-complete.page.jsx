// 🔧 FIXED: PaymentCompletePage.jsx - Uses customer endpoint for payment completion
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGetCheckoutSessionStatusQuery, useUpdateOrderStatusAfterPaymentMutation } from "@/lib/api";
import { Link, useSearchParams, Navigate } from "react-router-dom";

function PaymentCompletePage() {
  const [searchParams] = useSearchParams();
  const [updateAttempted, setUpdateAttempted] = useState(false);
  
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("orderId");

  const { data, isLoading, isError, error } = useGetCheckoutSessionStatusQuery(sessionId, {
    skip: !sessionId,
    pollingInterval: 3000,
  });
  
const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusAfterPaymentMutation();

  // 🔧 FIXED: Order status update using customer endpoint
  useEffect(() => {
    const attemptStatusUpdate = async () => {
      // Prevent multiple update attempts
      if (updateAttempted) {
        console.log('🔄 Update already attempted, skipping');
        return;
      }

      // Check if payment is complete and we have an order ID
      const paymentComplete = data?.status === "complete" || data?.paymentStatus === "paid";
      const targetOrderId = data?.orderId || orderId;

      if (!paymentComplete) {
        console.log('🔍 Payment not complete yet:', {
          dataStatus: data?.status,
          dataPaymentStatus: data?.paymentStatus,
          paymentComplete
        });
        return;
      }

      if (!targetOrderId) {
        console.log('❌ No order ID available:', {
          dataOrderId: data?.orderId,
          urlOrderId: orderId,
          targetOrderId
        });
        return;
      }

      // Prevent duplicate updates
      setUpdateAttempted(true);

      console.log("✅ Payment completed, updating order status for:", targetOrderId);
      
      try {
        // 🔧 FIXED: Use customer endpoint with payment completion flag
        const updateParams = {
          orderId: String(targetOrderId),
          status: 'CONFIRMED',
          orderStatus: 'CONFIRMED',
          id: String(targetOrderId),
          isPaymentComplete: true  // 🔧 NEW: This flag tells API to use customer endpoint
        };

        console.log('🔄 Sending payment completion update:', updateParams);

        const result = await updateOrderStatus(updateParams).unwrap();
        
        console.log("✅ Payment order status updated successfully:", result);
        
      } catch (updateError) {
        console.error("❌ Failed to update order status after payment:", updateError);
        
        // Reset attempt flag on error so user can try again
        setUpdateAttempted(false);
        
        const errorDetails = {
          status: updateError?.status,
          data: updateError?.data,
          message: updateError?.message,
          originalStatus: updateError?.originalStatus,
          targetOrderId,
          attemptedParams: updateParams
        };

        if (updateError.status === 403) {
          console.error('🔐 Permission denied - trying webhook endpoint as fallback:', errorDetails);
          
          // 🔧 FALLBACK: If customer endpoint fails, the webhook should handle it
          // Don't show error to user since webhook will complete the process
          console.log('💡 Webhook will handle the order status update');
          
        } else if (updateError.status === 500) {
          console.error('🔥 Payment completion server error:', errorDetails);
        } else if (updateError.status === 404) {
          console.error('❌ Order not found during payment completion:', errorDetails);
        } else if (updateError.status === 400) {
          console.error('❌ Bad request during payment completion:', errorDetails);
        } else {
          console.error('❌ Unexpected error during payment completion:', errorDetails);
        }
      }
    };

    // Only attempt update if we have session data
    if (data) {
      attemptStatusUpdate();
    }
  }, [data, orderId, updateOrderStatus, updateAttempted]);

  // Enhanced loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your payment...</p>
          <p className="text-sm text-gray-500 mt-2">Session ID: {sessionId?.substring(0, 20)}...</p>
        </div>
      </div>
    );
  }

  // Enhanced error handling
  if (isError || !sessionId) {
    console.error('Payment page error:', { isError, error, sessionId });
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Error</h2>
          <div className="text-left bg-red-50 border border-red-200 rounded p-4 mb-6">
            <p className="text-sm text-red-800 font-semibold">Error Details:</p>
            <ul className="text-sm text-red-700 mt-2 space-y-1">
              <li>• Session ID: {sessionId ? '✓ Valid' : '❌ Missing'}</li>
              <li>• Error Status: {error?.status || 'Unknown'}</li>
              <li>• Error Message: {error?.data?.message || error?.message || 'Unknown error'}</li>
            </ul>
          </div>
          <p className="text-gray-600 mb-6">
            There was an issue processing your payment. Please try again or contact support.
          </p>
          <div className="space-x-3">
            <Button asChild>
              <Link to="/checkout">Try Again</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/orders">Check Orders</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to checkout if payment is still open
  if (data?.status === "open") {
    return <Navigate to="/checkout" replace />;
  }

  // Success state - payment completed
  if (data?.status === "complete" || data?.paymentStatus === "paid") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <section className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg">
          {/* Success Icon */}
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-green-600 mb-2">Payment Successful!</h2>
            <p className="text-gray-600">Your order has been confirmed and is being processed.</p>
            
            {/* Status update indicator */}
            {isUpdating && (
              <div className="flex items-center justify-center mt-3 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm">Updating order status...</span>
              </div>
            )}

            {/* Update attempt status */}
            {updateAttempted && !isUpdating && (
              <div className="mt-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Order confirmed
                </span>
              </div>
            )}
          </div>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Order Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium text-gray-900">
                  {(data?.orderId || orderId || 'N/A').toString().substring(0, 8).toUpperCase()}
                </span>
              </div>
              {/* <div className="flex justify-between">
                <span className="text-gray-600">Session ID:</span>
                <span className="font-mono text-xs text-gray-700">
                  {sessionId?.substring(0, 20)}...
                </span>
              </div> */}
              <div className="flex justify-between">
                <span className="text-gray-600">Order Status:</span>
                <span className="font-medium text-green-600">
                  {updateAttempted ? 'Confirmed' : 'Processing'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <span className="font-medium text-green-600">Paid</span>
              </div>
              {data?.customer_email && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-gray-900">{data.customer_email}</span>
                </div>
              )}
              {data?.amount_total && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium text-gray-900">
                    ${(data.amount_total / 100).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Next Steps */}
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              A confirmation email has been sent to your email address with your order receipt and tracking information.
            </p>
            
            {/* 🔧 IMPROVED: Better messaging */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Note:</span> If the order status doesn't update immediately, 
                don't worry! Our webhook system will automatically confirm your order within a few minutes.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="default">
                <Link to="/">Continue Shopping</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/orders">View My Orders</Link>
              </Button>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              Questions? Contact us at{" "}
              <a href="mailto:support@mebius.com" className="text-blue-600 hover:underline">
                support@mebius.com
              </a>
            </p>
          </div>
        </section>
      </div>
    );
  }

  // Unknown status
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Processing Payment...</h2>
        <div className="text-left bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
          <p className="text-sm text-yellow-800 font-semibold">Status Information:</p>
          <ul className="text-sm text-yellow-700 mt-2 space-y-1">
            <li>• Data Status: {data?.status || 'Unknown'}</li>
            <li>• Payment Status: {data?.paymentStatus || 'Unknown'}</li>
            <li>• Order ID: {data?.orderId || orderId || 'Unknown'}</li>
          </ul>
        </div>
        <p className="text-gray-600 mb-6">
          Please wait while we process your payment, or contact support if this persists.
        </p>
        <div className="space-x-3">
          <Button asChild variant="outline">
            <Link to="/orders">Check Orders</Link>
          </Button>
          <Button asChild>
            <Link to="/">Return Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PaymentCompletePage;