// 🔍 Order Details Page - Detailed view of a specific order
import React, { useEffect }  from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetCustomerOrderByIdQuery, useCancelOrderMutation } from '@/lib/api'; 
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle, 
  ArrowLeft,
  MapPin,
  CreditCard,       
  Banknote,
  Calendar,
  User,
  Phone,
  Mail,
  ShoppingCart,
  RefreshCw,
  MapPinHouse
} from 'lucide-react';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { 
    data, 
    isLoading, 
    isError, 
    error,
    refetch,
    isFetching
  } = useGetCustomerOrderByIdQuery(id); 

  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const order = data?.order || data; 

  const getStatusConfig = (status) => {
    const configs = {
      'PENDING': { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        label: 'Pending',
        description: 'Your order is being processed'
      },
      'CONFIRMED': { 
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: CheckCircle,
        label: 'Confirmed',
        description: 'Your order has been confirmed and is being prepared'
      },
      'SHIPPED': { 
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: Truck,
        label: 'Shipped',
        description: 'Your order is on its way to you'
      },
      'FULFILLED': { 
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        label: 'Delivered',
        description: 'Your order has been successfully delivered'
      },
      'CANCELLED': { 
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
        label: 'Cancelled',
        description: 'This order has been cancelled'
      }
    };
    return configs[status] || configs['PENDING'];
  };

  // 📅 Format date helper
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };


  // 🔧 ADD this function inside OrderDetailsPage component (after other handlers)
  const handleCancelOrder = async () => {
    // 🔧 Confirmation dialog
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?\n\n" +
      "This action cannot be undone."
    );
    
    if (!confirmCancel) return;

    try {
      console.log("🔄 Cancelling order:", order._id);
      
      // 🔧 Call the cancel order mutation
      const result = await cancelOrder(order._id).unwrap();
      console.log("✅ Order cancelled successfully:", result);
      
      // 🔧 Show success message
      alert("Order cancelled successfully!");
      
      // 🔧 Refresh the order data to show updated status
      refetch();
      
    } catch (error) {
      console.error("❌ Failed to cancel order:", error);
      
      // 🔧 Show error message
      const errorMessage = error?.data?.message || error?.message || 'Failed to cancel order';
      alert(`Error: ${errorMessage}`);
    }
  };

  

  // 🖼️ Get product image with fallback
  const getProductImage = (item) => {
    // Try multiple image sources
    const imageUrl = 
      item.productId?.images?.[0] || 
      item.productId?.image || 
      item.productId?.thumbnail ||
      item.image ||
      null;
    
    return imageUrl;
  };

  // 🔄 Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  // ❌ Error state
  if (isError || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order not found</h2>
          <p className="text-gray-600 mb-4">
            {error?.data?.message || error?.message || 'The order you are looking for does not exist or you do not have permission to view it.'}
          </p>
          <Button onClick={() => navigate('/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Orders
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.orderStatus);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* 📍 Header & Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
            <button onClick={() => navigate('/')} className="hover:text-blue-600" type="button">
              Home
            </button>
            <span>/</span>
            <button onClick={() => navigate('/orders')} className="hover:text-blue-600" type="button">
              My Orders
            </button>
            <span>/</span>
            <span className="text-gray-900">Order Details</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <StatusIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Order #{order._id?.slice(-8)?.toUpperCase() || 'N/A'}
                </h1>
                <p className="text-gray-600">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/orders')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 📋 Order Information */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 📦 Order Status */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Order Status</h2>
                <Badge className={`${statusConfig.color} px-4 py-2`}>
                  <StatusIcon className="h-4 w-4 mr-2" />
                  {statusConfig.label}
                </Badge>
              </div>
              <p className="text-gray-600">{statusConfig.description}</p>
              
              {/* 📊 Progress Timeline */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm">
                  {['PENDING', 'CONFIRMED', 'SHIPPED', 'FULFILLED'].map((status, index) => {
                    const isActive = ['PENDING', 'CONFIRMED', 'SHIPPED', 'FULFILLED'].indexOf(order.orderStatus) >= index;
                    const isCurrent = order.orderStatus === status;
                    
                    return (
                      <div key={status} className="flex-1 relative">
                        <div className={`w-3 h-3 rounded-full mx-auto ${
                          isActive ? 'bg-blue-600' : 'bg-gray-300'
                        } ${isCurrent ? 'ring-4 ring-blue-200' : ''}`}></div>
                        <p className={`mt-2 text-center ${
                          isActive ? 'text-blue-600 font-medium' : 'text-gray-500'
                        }`}>
                          {status}
                        </p>
                        {index < 3 && (
                          <div className={`absolute top-1.5 left-1/2 w-full h-0.5 ${
                            ['PENDING', 'CONFIRMED', 'SHIPPED'].indexOf(order.orderStatus) > index ? 'bg-blue-600' : 'bg-gray-300'
                          }`}></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* 🛍️ Order Items */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items?.map((item, index) => {
                  const productImage = getProductImage(item);
                  
                  return (
                    <div key={`${item.productId?._id || item.productId || index}`} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      {/* Product Image - Enhanced */}
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {productImage ? (
                          <img 
                            src={productImage} 
                            alt={item.productId?.name || item.productName || 'Product'} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback when image fails to load
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center ${productImage ? 'hidden' : 'flex'}`}>
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      </div>
                      
                      {/* Product Info - Enhanced */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">
                          {item.productId?.name || item.productName || 'Unknown Product'}
                        </h3>
                        {item.productId?.description && (
                          <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                            {item.productId.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Package className="h-4 w-4 mr-1" />
                            Qty: {item.quantity || 0}
                          </span>
                          <span>•</span>
                          <span>${(item.price || 0).toFixed(2)} each</span>
                        </div>
                      </div>
                      
                      {/* Item Total - Enhanced */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-xl font-bold text-gray-900">
                          ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Total
                        </p>
                      </div>
                    </div>
                  );
                }) || (
                  <p className="text-gray-500">No items found in this order</p>
                )}
              </div>
            </Card>

            {/* 🚚 Shipping Address - Enhanced */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <MapPin className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>
              </div>
              
              {order.addressId ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-3">
                      <MapPinHouse className="h-4 w-4 text-gray-600" />
                    {/* Address Lines */}
                    <div className="text-gray-700 space-y-1 pl-6">
                      {order.addressId.line1 && (
                        <p>{order.addressId.line1}</p>
                      )}
                      {order.addressId.line2 && (
                        <p>{order.addressId.line2}</p>
                      )}
                      {/* Fallback for generic address field */}
                      {!order.addressId.line1 && order.addressId.line2 && (
                        <p>{order.addressId.address}</p>
                      )}
                      
                      {/* City, State, Postal Code */}
                      <p>
                        {[
                          order.addressId.city,
                        ].filter(Boolean).join(', ')}
                      </p>
                      
                    </div>
                    
                    {/* Contact Information */}
                    {(order.addressId.phone || order.addressId.email) && (
                      <div className="border-t border-gray-200 pt-3 mt-3">
                        {order.addressId.phone && (
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{order.addressId.phone}</span>
                          </div>
                        )}
                        {order.addressId.email && (
                          <div className="flex items-center space-x-2 text-gray-600 mt-1">
                            <Mail className="h-4 w-4" />
                            <span>{order.addressId.email}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <p className="text-red-600">Address information not available</p>
                </div>
              )}
            </Card>
          </div>

          {/* 💰 Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              
              {/* 💳 Payment Method */}
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-2">
                  {order.paymentMethod === 'COD' ? (
                    <Banknote className="h-5 w-5 text-orange-600" />
                  ) : (
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  )}
                  <span className="font-medium text-gray-900">
                    {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
                  </span>
                </div>
                <Badge 
                  variant="outline" 
                  className={order.paymentStatus === 'PAID' ? 'text-green-600 border-green-600' : 'text-orange-600 border-orange-600'}
                >
                  {order.paymentStatus === 'PAID' ? 'Paid' : 'Pending Payment'}
                </Badge>
              </div>

              {/* 💵 Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({order.items?.length || 0} items)</span>
                  <span>${(order.totalAmount || 0).toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                
                <hr className="border-gray-200" />
                
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>${(order.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* 📅 Order Timeline */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-medium text-gray-900 mb-3">Order Timeline</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Ordered: {formatDate(order.createdAt)}</span>
                  </div>
                  {order.updatedAt !== order.createdAt && (
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Last updated: {formatDate(order.updatedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 🔘 Action Buttons */}
              {/* 🔘 Action Buttons - Updated with Cancel Option */}
              <div className="mt-6 space-y-3">
                {/* Cancel Order Button - Only for specific conditions */}
                {(order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED') && 
                order.orderStatus !== 'CANCELLED' && (
                  <Button 
                    variant="outline" 
                    className="w-full border-red-300 text-red-600 hover:bg-red-50" 
                    onClick={handleCancelOrder}
                    disabled={isCancelling}
                    type="button"
                  >
                    {isCancelling ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Order
                      </>
                    )}
                  </Button>
                )}
                
                <Link to="/shop" className="block">
                  <Button variant="outline" className="w-full">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;