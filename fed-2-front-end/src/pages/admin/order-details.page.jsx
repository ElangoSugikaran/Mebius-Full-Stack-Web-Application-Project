// File: src/pages/admin/OrderDetailPage.jsx
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { useGetOrderByIdQuery, useUpdateOrderStatusMutation } from "@/lib/api";
// Line 24 - Add AlertTriangle and Mail to the imports
import { 
  ArrowLeft, 
  ShoppingCart, 
  User, 
  MapPin, 
  CreditCard, 
  Package, 
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
  Calendar,
  DollarSign,
  Phone,
  Mail,        // Add this
  Banknote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: apiResponse, isLoading, error, refetch } = useGetOrderByIdQuery(id);
  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  const order = apiResponse?.order || null;

  console.log('🔍 Admin Order Detail Debug:', {
    id,
    apiResponse,
    order,
    isLoading,
    error
  });

 // 🔧 REPLACE the handlePaymentStatusUpdate function in OrderDetailPage.jsx

  const handlePaymentStatusUpdate = async (newPaymentStatus) => {
    if (!id || id === 'undefined' || id === 'null' || id === '') {
      console.error('❌ Invalid order ID:', id);
      toast.error('Invalid order ID. Please navigate back and try again.', {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    if (!newPaymentStatus) {
      console.error('❌ Missing payment status:', newPaymentStatus);
      toast.error('Payment status is required.', {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }
    
    try {
      console.log('💰 Admin updating payment status:', { 
        orderId: id, 
        newPaymentStatus,
        currentOrder: order
      });
      
      // 🔧 FIXED: Use paymentStatus parameter specifically
      const result = await updateOrderStatus({ 
        orderId: id.toString(),
        paymentStatus: newPaymentStatus  // 🔧 This triggers payment endpoint
      }).unwrap();
      
      console.log('✅ Payment status update successful:', result);
      
      toast.success(`Payment status updated to ${newPaymentStatus}!`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      refetch();
      
    } catch (error) {
      console.error('❌ Failed to update payment status:', error);
      
      let errorMessage = 'Failed to update payment status. Please try again.';
      
      if (error.status === 404) {
        errorMessage = 'Order not found. It may have been deleted.';
      } else if (error.status === 400) {
        errorMessage = 'Invalid payment status update request.';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again in a moment.';
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      }
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  // 🔧 Enhanced order status update handler
  const handleOrderStatusUpdate = async (newStatus) => {
    if (!id || id === 'undefined' || id === 'null' || id === '') {
      console.error('❌ Invalid order ID from URL params:', id);
      toast.error('Invalid order ID. Please navigate back and try again.', {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    if (!newStatus) {
      console.error('❌ Missing new status:', newStatus);
      toast.error('Status is required.', {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }
    
    try {
      console.log('🔄 Admin updating order status:', { 
        orderId: id, 
        newStatus,
        orderIdType: typeof id,
        orderExists: !!order
      });
      
      // 🔧 FIXED: Send parameters in the exact format expected by API
      const result = await updateOrderStatus({ 
        orderId: id.toString(),
        orderStatus: newStatus,
        status: newStatus
      }).unwrap();
      
      console.log('✅ Order status update successful:', result);
      
      toast.success(`Order status updated to ${newStatus}!`, {
        position: "top-right",
        autoClose: 3000,
      });
      
      refetch();
      
    } catch (error) {
      console.error('❌ Failed to update order status:', error);
      
      let errorMessage = 'Failed to update order status. Please try again.';
      
      if (error.status === 404) {
        errorMessage = 'Order not found. It may have been deleted.';
      } else if (error.status === 400) {
        errorMessage = 'Invalid status update request.';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again in a moment.';
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      }
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  // 🎨 Status badge styling
  const getOrderStatusBadge = (status) => {
    const variants = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      CONFIRMED: 'bg-purple-100 text-purple-800 border-purple-200',
      SHIPPED: 'bg-blue-100 text-blue-800 border-blue-200',
      FULFILLED: 'bg-green-100 text-green-800 border-green-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200'
    };
    
    const icons = {
      PENDING: <Clock className="h-4 w-4 mr-2" />,
      CONFIRMED: <CheckCircle className="h-4 w-4 mr-2" />,
      SHIPPED: <Truck className="h-4 w-4 mr-2" />,
      FULFILLED: <CheckCircle className="h-4 w-4 mr-2" />,
      CANCELLED: <XCircle className="h-4 w-4 mr-2" />
    };

    return (
      <Badge 
        variant="outline" 
        className={`${variants[status]} font-medium flex items-center text-base px-3 py-1`}
      >
        {icons[status]}
        {status}
      </Badge>
    );
  };

  // 🎨 Payment status badge styling
  const getPaymentStatusBadge = (status) => {
    const variants = {
      PENDING: 'bg-orange-100 text-orange-800 border-orange-200',
      PAID: 'bg-green-100 text-green-800 border-green-200',
      REFUNDED: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    const icons = {
      PENDING: <Clock className="h-4 w-4 mr-2" />,
      PAID: <CheckCircle className="h-4 w-4 mr-2" />,
      REFUNDED: <XCircle className="h-4 w-4 mr-2" />
    };

    return (
      <Badge 
        variant="outline" 
        className={`${variants[status]} font-medium flex items-center text-base px-3 py-1`}
      >
        {icons[status]}
        {status}
      </Badge>
    );
  };

  // 💰 Calculate order totals with enhanced safety checks
  const calculateOrderTotals = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      return { subtotal: 0, savings: 0, total: 0 };
    }

    const subtotal = items.reduce((total, item) => {
      let price = 0;
      
      if (item.productId && typeof item.productId === 'object' && item.productId.price) {
        const discount = item.productId.discount || 0;
        price = discount > 0 
          ? item.productId.price * (1 - discount / 100)
          : item.productId.price;
      } else if (item.price) {
        price = item.price;
      }
      
      return total + (price * (item.quantity || 0));
    }, 0);

    const savings = items.reduce((total, item) => {
      if (item.productId && typeof item.productId === 'object' && item.productId.price && item.productId.discount > 0) {
        const savingsPerItem = (item.productId.price * item.productId.discount / 100) * item.quantity;
        return total + savingsPerItem;
      }
      return total;
    }, 0);

    return { subtotal, savings, total: subtotal };
  };

  // ✅ Enhanced loading state
  if (isLoading) {
    return (
      <div className="px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/admin/admin-orders" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <ShoppingCart className="mr-3 h-8 w-8 text-blue-600" />
                Order Details
              </h1>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600">Loading order details...</span>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Enhanced error state
  if (error) {
    console.error('Order detail error:', error);
    return (
      <div className="px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/admin/admin-orders" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <ShoppingCart className="mr-3 h-8 w-8 text-blue-600" />
                Order Details
              </h1>
            </div>
          </div>
        </div>
        
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Order</h2>
            <p className="text-red-600 mb-4">
              {error?.data?.message || error?.message || 'Failed to load order details'}
            </p>
            <div className="space-x-3">
              <Button onClick={() => refetch()} variant="outline">
                Try Again
              </Button>
              <Link to="/admin/orders">
                <Button>Back to Orders</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Enhanced not found state
  if (!order) {
    return (
      <div className="px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/admin/admin-orders" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <ShoppingCart className="mr-3 h-8 w-8 text-blue-600" />
                Order Details
              </h1>
            </div>
          </div>
        </div>
        
        <div className="text-center py-12">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-4">
              The order you're looking for doesn't exist or may have been deleted.
            </p>
            <Link to="/admin/admin-orders">
              <Button>Back to Orders</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const hasAnyItems = order.items && Array.isArray(order.items) && order.items.length > 0;
  
  if (!hasAnyItems) {
    return (
      <div className="px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/admin/admin-orders" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <ShoppingCart className="mr-3 h-8 w-8 text-blue-600" />
                Order Details
              </h1>
            </div>
          </div>
        </div>
        
        <div className="text-center py-12">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">No Items in Order</h2>
            <p className="text-yellow-700 mb-4">
              This order doesn't contain any items.
            </p>
            <Link to="/admin/admin-orders">
              <Button>Back to Orders</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const orderTotals = calculateOrderTotals(order.items);
  const orderNumber = order._id.slice(-8).toUpperCase();

  return (
    <div className="px-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/admin/orders" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <ShoppingCart className="mr-3 h-8 w-8 text-blue-600" />
                Order #{orderNumber}
              </h1>
              <p className="text-gray-600 mt-1">
                Order placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
          
          {/* Status Update Actions */}
          <div className="flex items-center space-x-3">
            {/* Order Status Selector */}
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-gray-500 font-medium">Order Status</label>
              <Select
                value={order.orderStatus}
                onValueChange={handleOrderStatusUpdate}
                disabled={isUpdating}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="FULFILLED">Fulfilled</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 🔧 NEW: Payment Status Selector */}
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-gray-500 font-medium">Payment Status</label>
              <Select
                value={order.paymentStatus}
                onValueChange={handlePaymentStatusUpdate}
                disabled={isUpdating}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Order Information */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Order Status & Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Order Status & Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Order Status</label>
                  <div className="mt-2">
                    {getOrderStatusBadge(order.orderStatus)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Method</label>
                  <div className="mt-2">
                    <Badge variant="outline" className="font-medium flex items-center">
                      {order.paymentMethod === 'COD' ? (
                        <>
                          <Banknote className="h-4 w-4 mr-2" />
                          Cash on Delivery
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Credit Card
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Status</label>
                  <div className="mt-2">
                    {getPaymentStatusBadge(order.paymentStatus)}
                  </div>
                  {/* 🔧 NEW: Special indicator for COD */}
                  {order.paymentMethod === 'COD' && order.paymentStatus === 'PENDING' && (
                    <p className="text-xs text-amber-600 mt-1">
                      💡 Mark as PAID when payment is received on delivery
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Order Items ({order.items.reduce((total, item) => total + (item.quantity || 0), 0)} items)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => {
                  const hasProductData = item.productId && typeof item.productId === 'object';
                  
                  if (!hasProductData && !item.price) {
                    return (
                      <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg bg-red-50 border-red-200">
                        <div className="h-16 w-16 rounded-md bg-red-100 flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="h-8 w-8 text-red-500" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-red-800">
                            Product Data Missing
                          </h4>
                          <p className="text-sm text-red-600">
                            Product information is not available. Quantity: {item.quantity || 0}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-red-800">
                            Data Unavailable
                          </p>
                        </div>
                      </div>
                    );
                  }

                  let price = 0;
                  let originalPrice = 0;
                  let discount = 0;
                  let productName = 'Unknown Product';
                  let productImage = null;

                  if (hasProductData) {
                    originalPrice = item.productId.price || 0;
                    discount = item.productId.discount || 0;
                    price = discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice;
                    productName = item.productId.name || 'Unknown Product';
                    productImage = item.productId.image;
                  } else {
                    price = item.price || 0;
                    originalPrice = item.price || 0;
                  }
                  
                  return (
                    <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {productImage ? (
                          <img 
                            src={productImage} 
                            alt={productName}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <Package className="h-8 w-8 text-gray-400" style={{display: productImage ? 'none' : 'flex'}} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {productName}
                        </h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-500">
                            Qty: {item.quantity || 0}
                          </span>
                          {discount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {discount}% OFF
                            </Badge>
                          )}
                          {!hasProductData && (
                            <Badge variant="outline" className="text-xs text-yellow-600">
                              Price from Order
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {discount > 0 && (
                          <p className="text-sm text-gray-500 line-through">
                            ${(originalPrice * (item.quantity || 0)).toFixed(2)}
                          </p>
                        )}
                        <p className="font-semibold text-gray-900">
                          ${(price * (item.quantity || 0)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
                
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.addressId ? (
                <div className="space-y-4">
                  {/* Name with location icon */}
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <p className="font-medium text-gray-900">
                      {order.addressId.firstName} {order.addressId.lastName}
                    </p>
                  </div>

                  {/* Address lines & city grouped */}
                  <div className="space-y-1 text-gray-700">
                    <p>{order.addressId.line1}</p>
                    {order.addressId.line2 && <p>{order.addressId.line2}</p>}
                    <p>{order.addressId.city}</p>
                  </div>
                  
                  {/* Phone with icon aligned */}
                  {order.addressId.phone && (
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{order.addressId.phone}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-yellow-700">Address information not available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Order ID</span>
                    <span className="font-medium">#{orderNumber}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Customer ID</span>
                    <span className="font-medium text-xs">{order.userId}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Order Date</span>
                    <span className="font-medium">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <hr className="border-gray-200" />

                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${orderTotals.subtotal.toFixed(2)}</span>
                  </div>
                  
                  {orderTotals.savings > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>You saved</span>
                      <span>-${orderTotals.savings.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  
                  <hr className="border-gray-200" />
                  
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>${orderTotals.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Quick Payment Actions for COD */}
                {order.paymentMethod === 'COD' && (
                  <div className="pt-4 space-y-3 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900">COD Payment Actions</h4>
                    
                    {order.paymentStatus === 'PENDING' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="default"
                             className="w-full"
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Paid
                              </>
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Payment Received</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to mark this COD order as PAID? This action confirms that payment has been received upon delivery.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handlePaymentStatusUpdate('PAID')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Confirm Payment
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    {order.paymentStatus === 'PAID' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="w-full border-red-200 text-red-700 hover:bg-red-50"
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 mr-2" />
                                Issue Refund
                              </>
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Issue Refund</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to issue a refund for this order? This will change the payment status to REFUNDED and cannot be easily undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handlePaymentStatusUpdate('REFUNDED')}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Issue Refund
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    {order.paymentStatus === 'REFUNDED' && (
                      <div className="text-center py-2">
                        <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
                          <XCircle className="h-4 w-4 mr-2" />
                          Refund Issued
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

               {/* Customer Information */}
                {/* Enhanced Customer Information - Replace lines 623-654 */}
                <div className="pt-4 space-y-3 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Customer Information
                  </h4>
                  
                  <div className="space-y-3">
                    {order.userInfo && !order.userInfo.isClerkError ? (
                      <>
                        {/* Customer Name & Avatar */}
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          {order.userInfo.imageUrl ? (
                            <img 
                              src={order.userInfo.imageUrl} 
                              alt={order.userInfo.fullName}
                              className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 truncate">
                              {order.userInfo.fullName}
                            </h5>
                            {order.userInfo.email && order.userInfo.email !== 'No email available' && (
                              <p className="text-sm text-gray-600 truncate flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {order.userInfo.email}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Additional User Details */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Customer ID:</span>
                            <span className="font-mono text-gray-800 text-xs">
                              {order.userId.slice(-12).toUpperCase()}
                            </span>
                          </div>
                          
                          {order.userInfo.createdAt && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Member since:</span>
                              <span className="text-gray-800">
                                {new Date(order.userInfo.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          )}

                          {order.userInfo.lastSignInAt && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Last active:</span>
                              <span className="text-gray-800">
                                {new Date(order.userInfo.lastSignInAt).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Full ID Expandable */}
                        <details className="text-xs">
                          <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                            Show full customer ID
                          </summary>
                          <div className="mt-2 p-2 bg-gray-50 rounded font-mono text-gray-800 break-all border">
                            {order.userId}
                          </div>
                        </details>
                      </>
                    ) : (
                      <>
                        {/* Fallback for missing user info */}
                        <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-orange-800">
                              {order.userInfo?.isClerkError ? 'User Info Error' : 'Unknown Customer'}
                            </h5>
                            <p className="text-sm text-orange-600">
                              {order.userInfo?.isClerkError 
                                ? 'Unable to fetch customer details from Clerk'
                                : 'Customer information not available'
                              }
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Customer ID:</span>
                            <span className="font-mono text-gray-800 text-xs">
                              {(order.userId || '').slice(-12).toUpperCase() || 'Unknown'}
                            </span>
                          </div>
                        </div>

                        <details className="text-xs">
                          <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                            Show full customer ID
                          </summary>
                          <div className="mt-2 p-2 bg-gray-50 rounded font-mono text-gray-800 break-all border">
                            {order.userId || 'Not available'}
                          </div>
                        </details>
                      </>
                    )}
                    
                    <div className="text-xs text-gray-500 italic border-t border-gray-200 pt-2">
                      💡 Customer details are managed through Clerk authentication
                    </div>
                  </div>
                </div>

                {/* Order Actions */}
                <div className="pt-4 space-y-3 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900">Quick Actions</h4>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {order.orderStatus === 'PENDING' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="w-full border-green-200 text-green-700 hover:bg-green-50"
                            disabled={isUpdating}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirm Order
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Order</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to confirm this order? This will change the status to CONFIRMED and notify the customer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleOrderStatusUpdate('CONFIRMED')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Confirm Order
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    {order.orderStatus === 'CONFIRMED' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                            disabled={isUpdating}
                          >
                            <Truck className="h-4 w-4 mr-2" />
                            Mark as Shipped
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Mark as Shipped</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to mark this order as SHIPPED? This will update the tracking status and notify the customer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleOrderStatusUpdate('SHIPPED')}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Mark as Shipped
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    {order.orderStatus === 'SHIPPED' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="w-full border-green-200 text-green-700 hover:bg-green-50"
                            disabled={isUpdating}
                          >
                            <Package className="h-4 w-4 mr-2" />
                            Mark as Fulfilled
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Mark as Fulfilled</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to mark this order as FULFILLED? This indicates the order has been successfully delivered to the customer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleOrderStatusUpdate('FULFILLED')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Mark as Fulfilled
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    {/* Cancel Order - Available for PENDING and CONFIRMED orders */}
                    {(order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED') && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="w-full border-red-200 text-red-700 hover:bg-red-50"
                            disabled={isUpdating}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel Order
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel this order? This action cannot be undone and the customer will be notified.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep Order</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleOrderStatusUpdate('CANCELLED')}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Cancel Order
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>

                {/* Order Timeline */}
                <div className="pt-4 space-y-3 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Order Timeline
                  </h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Order Placed</span>
                      <span className="font-medium">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {order.updatedAt !== order.createdAt && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Last Updated</span>
                        <span className="font-medium">
                          {new Date(order.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Current Status</span>
                      <span className="font-medium text-blue-600">
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;