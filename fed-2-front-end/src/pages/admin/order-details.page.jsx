// File: src/pages/admin/OrderDetailPage.jsx
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { useGetOrderByIdQuery, useUpdateOrderStatusMutation } from "@/lib/api";
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
  Mail,
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

  const order = apiResponse?.order || apiResponse?.data || apiResponse || null;

  console.log('🔍 Admin Order Detail Debug:', {
    id,
    apiResponse,
    order,
    orderUserInfo: order?.userInfo,
    isLoading,
    error
  });

  // 🔧 Enhanced customer info display function
  const renderCustomerInfo = (order) => {
    console.log('🎨 Rendering customer info:', {
      hasOrder: !!order,
      hasUserInfo: !!order?.userInfo,
      userInfo: order?.userInfo,
      isClerkError: order?.userInfo?.isClerkError
    });

    // If we have proper user info from Clerk
    if (order?.userInfo && !order.userInfo.isClerkError) {
      console.log('✅ Rendering with Clerk user info');
      return (
        <div className="space-y-4">
          {/* Customer Header with Avatar */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            {/* User Avatar */}
            {order.userInfo.imageUrl ? (
              <img 
                src={order.userInfo.imageUrl} 
                alt={order.userInfo.fullName || 'User'}
                className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"
              style={{display: order.userInfo.imageUrl ? 'none' : 'flex'}}
            >
              <User className="h-6 w-6 text-blue-600" />
            </div>
            
            {/* User Name and Basic Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {order.userInfo.fullName || 
                 `${order.userInfo.firstName || ''} ${order.userInfo.lastName || ''}`.trim() || 
                 'Unknown User'}
              </h3>
              
              {order.userInfo.email && 
               order.userInfo.email !== 'No email available' && 
               order.userInfo.email !== 'Error fetching email' && (
                <div className="flex items-center text-gray-600 mt-1">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="text-sm truncate">{order.userInfo.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Customer ID</label>
              <p className="text-sm font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded mt-1">
                {(order.userId || '').slice(-12).toUpperCase() || 'Unknown'}
              </p>
            </div>
            
            {order.userInfo.createdAt && (
              <div>
                <label className="text-sm font-medium text-gray-500">Member Since</label>
                <p className="text-sm text-gray-800 mt-1">
                  {new Date(order.userInfo.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
            
            {order.userInfo.lastSignInAt && (
              <div>
                <label className="text-sm font-medium text-gray-500">Last Active</label>
                <p className="text-sm text-gray-800 mt-1">
                  {new Date(order.userInfo.lastSignInAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
            
            {order.userInfo.username && (
              <div>
                <label className="text-sm font-medium text-gray-500">Username</label>
                <p className="text-sm text-gray-800 mt-1">@{order.userInfo.username}</p>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    // If we have Clerk error
    if (order?.userInfo?.isClerkError) {
      console.log('⚠️ Rendering with Clerk error');
      return (
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-orange-800">
                Clerk API Error
              </h3>
              <p className="text-sm text-orange-600 mt-1">
                {order.userInfo.errorReason || 'Unable to fetch customer details from Clerk'}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Customer ID</label>
            <p className="text-sm font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded mt-1">
              {(order.userId || '').slice(-12).toUpperCase() || 'Unknown'}
            </p>
          </div>
        </div>
      );
    }
    
    // Fallback: No user info or fallback to address
    console.log('🔄 Rendering fallback customer info');
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <User className="h-6 w-6 text-gray-400" />
          </div>
          
          <div className="flex-1">
            {/* Try to get name from shipping address if available */}
            {order?.addressId?.firstName && order?.addressId?.lastName ? (
              <h3 className="text-lg font-semibold text-gray-700">
                {order.addressId.firstName} {order.addressId.lastName}
              </h3>
            ) : (
              <h3 className="text-lg font-semibold text-gray-600">
                Unknown Customer
              </h3>
            )}
            
            <p className="text-sm text-gray-500 mt-1">
              Customer information not available
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Customer ID</label>
            <p className="text-sm font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded mt-1">
              {(order?.userId || '').slice(-12).toUpperCase() || 'Unknown'}
            </p>
          </div>
          
          {/* Phone from address if available */}
          {order?.addressId?.phone && (
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <div className="flex items-center mt-1">
                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-800">{order.addressId.phone}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 🔧 Payment status update handler
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
      
      const result = await updateOrderStatus({ 
        orderId: id.toString(),
        paymentStatus: newPaymentStatus
      }).unwrap();
      
      console.log('✅ Payment status update successful:', result);
      
      toast.success(`Payment status updated to ${newPaymentStatus}!`, {
        position: "top-right",
        autoClose: 3000,
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
              <Link to="/admin/admin-orders">
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
            <Link to="/admin/admin-orders" className="text-gray-600 hover:text-gray-900">
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

            {/* Payment Status Selector */}
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
          
          {/* 🔧 FIXED: Customer Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderCustomerInfo(order)}
              
              {/* Debug Info - Remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-xs bg-gray-100 p-3 rounded">
                  <summary className="cursor-pointer text-gray-600 font-medium">
                    🐛 Debug: User Info Data
                  </summary>
                  <pre className="mt-2 text-xs overflow-auto whitespace-pre-wrap">
                    {JSON.stringify({
                      orderId: order._id,
                      userId: order.userId,
                      hasUserInfo: !!order.userInfo,
                      userInfo: order.userInfo,
                      addressInfo: order.addressId ? {
                        firstName: order.addressId.firstName,
                        lastName: order.addressId.lastName,
                        phone: order.addressId.phone
                      } : null
                    }, null, 2)}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>

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
                <ShoppingCart className="mr-2 h-5 w-5" />
                Order Items ({order.items?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => {
                  // 🔧 Enhanced item data extraction with better safety checks
                  const product = item.productId && typeof item.productId === 'object' ? item.productId : null;
                  const productName = product?.name || item.name || `Product ${index + 1}`;
                  const productImage = product?.images?.[0] || product?.image || item.image || null;
                  const originalPrice = product?.price || item.originalPrice || item.price || 0;
                  const discount = product?.discount || item.discount || 0;
                  const finalPrice = discount > 0 
                    ? originalPrice * (1 - discount / 100) 
                    : originalPrice;
                  const quantity = item.quantity || 0;
                  const subtotal = finalPrice * quantity;
                  const savings = discount > 0 ? (originalPrice - finalPrice) * quantity : 0;

                  console.log('🛍️ Rendering item:', {
                    index,
                    item,
                    product,
                    productName,
                    originalPrice,
                    finalPrice,
                    discount,
                    quantity,
                    subtotal
                  });

                  return (
                    <div key={item._id || index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start space-x-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          {productImage ? (
                            <img 
                              src={productImage} 
                              alt={productName}
                              className="w-20 h-20 object-cover rounded-lg border-2 border-white shadow-sm"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center"
                            style={{display: productImage ? 'none' : 'flex'}}
                          >
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 text-lg truncate">
                                {productName}
                              </h3>
                              
                              {/* Product ID for debugging */}
                              {(product?._id || item.productId) && (
                                <p className="text-xs text-gray-500 font-mono mt-1">
                                  ID: {(product?._id || item.productId || '').toString().slice(-12)}
                                </p>
                              )}
                              
                              {/* Category or Description if available */}
                              {product?.category && (
                                <p className="text-sm text-gray-600 mt-1">
                                  Category: {product.category}
                                </p>
                              )}
                            </div>

                            {/* Price and Quantity */}
                            <div className="text-right flex-shrink-0 ml-4">
                              <div className="space-y-1">
                                {/* Quantity */}
                                <p className="text-sm text-gray-600">
                                  Qty: <span className="font-semibold">{quantity}</span>
                                </p>
                                
                                {/* Price Display */}
                                <div className="space-y-1">
                                  {discount > 0 ? (
                                    <>
                                      <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-500 line-through">
                                          Rs. {originalPrice.toLocaleString()}
                                        </span>
                                        <Badge variant="outline" className="bg-red-50 text-red-700 text-xs">
                                          -{discount}%
                                        </Badge>
                                      </div>
                                      <p className="font-semibold text-green-700">
                                        Rs. {finalPrice.toLocaleString()}
                                      </p>
                                    </>
                                  ) : (
                                    <p className="font-semibold text-gray-900">
                                      Rs. {finalPrice.toLocaleString()}
                                    </p>
                                  )}
                                </div>
                                
                                {/* Item Subtotal */}
                                <div className="pt-2 border-t border-gray-200">
                                  <p className="font-bold text-blue-600">
                                    Rs. {subtotal.toLocaleString()}
                                  </p>
                                  {savings > 0 && (
                                    <p className="text-xs text-green-600">
                                      Saved Rs. {savings.toLocaleString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Order ID & Date */}
                <div className="pb-4 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Order ID</span>
                    <span className="font-mono text-sm font-semibold">#{orderNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Order Date</span>
                    <span className="text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Financial Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({order.items?.length || 0} items)</span>
                    <span>Rs. {orderTotals.subtotal.toLocaleString()}</span>
                  </div>
                  
                  {orderTotals.savings > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Total Savings</span>
                      <span>-Rs. {orderTotals.savings.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {/* Shipping (if applicable) */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  
                  <hr className="border-gray-200" />
                  
                  {/* Total */}
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">Rs. {orderTotals.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {order.addressId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Recipient Name */}
                  {(order.addressId.firstName || order.addressId.lastName) && (
                    <div>
                      <p className="font-semibold text-gray-900">
                        {`${order.addressId.firstName || ''} ${order.addressId.lastName || ''}`.trim()}
                      </p>
                    </div>
                  )}
                  
                  {/* Address Lines */}
                  <div className="text-gray-700 space-y-1">
                    {order.addressId.addressLine1 && (
                      <p>{order.addressId.addressLine1}</p>
                    )}
                    {order.addressId.addressLine2 && (
                      <p>{order.addressId.addressLine2}</p>
                    )}
                    
                    {/* City, State, Postal Code */}
                    <div className="space-y-1">
                      {order.addressId.city && (
                        <p>{order.addressId.city}</p>
                      )}
                      {order.addressId.state && (
                        <p>{order.addressId.state}</p>
                      )}
                      {order.addressId.postalCode && (
                        <p>{order.addressId.postalCode}</p>
                      )}
                      {order.addressId.country && (
                        <p className="font-medium">{order.addressId.country}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Contact Info */}
                  {order.addressId.phone && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        <span className="text-sm">{order.addressId.phone}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Order Placed */}
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Order Placed</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Current Status */}
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                    order.orderStatus === 'CANCELLED' ? 'bg-red-500' : 
                    order.orderStatus === 'FULFILLED' ? 'bg-green-500' :
                    'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Current Status</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getOrderStatusBadge(order.orderStatus)}
                    </div>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                    order.paymentStatus === 'PAID' ? 'bg-green-500' : 
                    order.paymentStatus === 'REFUNDED' ? 'bg-gray-500' :
                    'bg-yellow-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Payment Status</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </div>
                  </div>
                </div>

                {/* Last Updated */}
                {order.updatedAt && order.updatedAt !== order.createdAt && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Last Updated</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Admin Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Cancel Order */}
                {order.orderStatus !== 'CANCELLED' && order.orderStatus !== 'FULFILLED' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel Order
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to cancel this order? This action cannot be undone.
                          The customer will be notified of the cancellation.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>No, Keep Order</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleOrderStatusUpdate('CANCELLED')}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Yes, Cancel Order
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {/* Mark as Fulfilled */}
                {order.orderStatus !== 'FULFILLED' && order.orderStatus !== 'CANCELLED' && (
                  <Button 
                    variant="outline" 
                    className="w-full text-green-600 border-green-200 hover:bg-green-50"
                    onClick={() => handleOrderStatusUpdate('FULFILLED')}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Mark as Fulfilled
                  </Button>
                )}

                {/* Refresh Data */}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => refetch()}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Clock className="w-4 h-4 mr-2" />
                  )}
                  Refresh Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Debug Information - Development Only */}
          {process.env.NODE_ENV === 'development' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-yellow-600">
                  🐛 Debug Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <details className="text-xs">
                  <summary className="cursor-pointer font-medium text-gray-600 mb-2">
                    Click to view raw order data
                  </summary>
                  <pre className="bg-gray-100 p-3 rounded overflow-auto text-xs whitespace-pre-wrap max-h-64">
                    {JSON.stringify({
                      orderId: id,
                      orderExists: !!order,
                      orderStructure: {
                        _id: order?._id,
                        userId: order?.userId,
                        orderStatus: order?.orderStatus,
                        paymentStatus: order?.paymentStatus,
                        paymentMethod: order?.paymentMethod,
                        hasItems: !!order?.items?.length,
                        itemsCount: order?.items?.length,
                        hasUserInfo: !!order?.userInfo,
                        userInfoStructure: order?.userInfo ? Object.keys(order.userInfo) : null,
                        hasAddress: !!order?.addressId,
                        addressStructure: order?.addressId ? Object.keys(order.addressId) : null,
                        createdAt: order?.createdAt,
                        updatedAt: order?.updatedAt
                      },
                      apiResponse: typeof apiResponse,
                      calculatedTotals: orderTotals
                    }, null, 2)}
                  </pre>
                </details>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;